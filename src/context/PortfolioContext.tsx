import React, { createContext, useContext, useState, useEffect } from 'react';
import { PortfolioData } from '../types/portfolio';
import { defaultPortfolioData } from '../data/defaultData';

interface PortfolioContextType {
  data: PortfolioData;
  isLoading: boolean;
  isSaving: boolean;
  saveError: string | null;
  saveSuccess: boolean;
  isAdminLoggedIn: boolean;
  adminToken: string | null;
  loginAdmin: (password: string) => Promise<{ success: boolean; message: string }>;
  logoutAdmin: () => void;
  updatePortfolio: (newData: PortfolioData) => Promise<{ success: boolean; message: string }>;
  uploadFile: (file: File, fileType: 'cv' | 'image') => Promise<{ success: boolean; fileUrl?: string; fileName?: string; message?: string }>;
  resetToDefaults: () => Promise<void>;
  changeAdminPassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'ivanov_portfolio_data_v2';
const TOKEN_STORAGE_KEY = 'ivanov_admin_token';
const ADMIN_PASSWORD_HASH = 'ebf731186ad1cdd62f106c0a52135a54808648d49087449d36b13b5d442b9611'; // sha256("ivanov2026_ivanov_salt_2026")
const PASSWORD_HASH_STORAGE_KEY = 'ivanov_admin_password_hash_v1';

async function computePasswordHash(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '_ivanov_salt_2026');
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<PortfolioData>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // ignore
    }
    return defaultPortfolioData;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  });
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);

  // Initial load from server or static json
  useEffect(() => {
    const fetchData = async () => {
      try {
        let res = await fetch('/api/portfolio');
        if (!res.ok) {
          // Static hosting fallback (e.g. GitHub Pages)
          res = await fetch('./portfolio.json');
        }
        if (res.ok) {
          const serverData = await res.json();
          if (serverData && typeof serverData === 'object' && serverData.about) {
            setData(serverData);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serverData));
          }
        }
      } catch (err) {
        console.warn('Could not load from /api/portfolio, using local state:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Verify token on mount
  useEffect(() => {
    if (!adminToken) {
      setIsAdminLoggedIn(false);
      return;
    }

    if (adminToken.startsWith('client-admin-')) {
      setIsAdminLoggedIn(true);
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch('/api/admin/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`
          }
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const resData = await res.json();
          if (resData.valid) {
            setIsAdminLoggedIn(true);
            return;
          }
        }
        // If static host or server offline, accept token
        setIsAdminLoggedIn(true);
      } catch {
        setIsAdminLoggedIn(true);
      }
    };

    verifyToken();
  }, [adminToken]);

  const loginAdmin = async (password: string) => {
    // 1. Try server backend if available (e.g. local dev / container)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const resData = await res.json();
        if (res.ok && resData.success && resData.token) {
          setAdminToken(resData.token);
          localStorage.setItem(TOKEN_STORAGE_KEY, resData.token);
          setIsAdminLoggedIn(true);
          return { success: true, message: 'Login successful!' };
        }
        if (res.status === 401) {
          return { success: false, message: resData.message || 'Invalid password.' };
        }
      }
    } catch {
      // Backend not reachable, fall through to client-side authentication
    }

    // 2. Client-side authentication fallback (GitHub Pages static host)
    try {
      const computed = await computePasswordHash(password);
      const currentStoredHash = localStorage.getItem(PASSWORD_HASH_STORAGE_KEY) || ADMIN_PASSWORD_HASH;

      if (computed === currentStoredHash) {
        const staticToken = 'client-admin-' + Date.now();
        setAdminToken(staticToken);
        localStorage.setItem(TOKEN_STORAGE_KEY, staticToken);
        setIsAdminLoggedIn(true);
        return { success: true, message: 'Login successful!' };
      }
      return { success: false, message: 'Invalid password. Please check your credentials.' };
    } catch (err: any) {
      return { success: false, message: 'Authentication error: ' + err.message };
    }
  };

  const logoutAdmin = () => {
    setAdminToken(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setIsAdminLoggedIn(false);
  };

  const changeAdminPassword = async (currentPassword: string, newPassword: string) => {
    if (!adminToken) {
      return { success: false, message: 'No active admin session found.' };
    }

    // 1. Try server backend if available
    if (!adminToken.startsWith('client-admin-')) {
      try {
        const res = await fetch('/api/admin/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`
          },
          body: JSON.stringify({ currentPassword, newPassword })
        });
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const resData = await res.json();
          if (res.ok && resData.success) {
            const newHash = await computePasswordHash(newPassword);
            localStorage.setItem(PASSWORD_HASH_STORAGE_KEY, newHash);
            return { success: true, message: resData.message || 'Password changed successfully!' };
          }
          return { success: false, message: resData.message || 'Error changing password.' };
        }
      } catch {
        // Fallback to client-side
      }
    }

    // 2. Client-side password change fallback
    try {
      const computedOld = await computePasswordHash(currentPassword);
      const currentStoredHash = localStorage.getItem(PASSWORD_HASH_STORAGE_KEY) || ADMIN_PASSWORD_HASH;
      if (computedOld !== currentStoredHash) {
        return { success: false, message: 'Current password is incorrect.' };
      }
      const newHash = await computePasswordHash(newPassword);
      localStorage.setItem(PASSWORD_HASH_STORAGE_KEY, newHash);
      return { success: true, message: 'Password changed successfully!' };
    } catch (err: any) {
      return { success: false, message: 'Error changing password: ' + err.message };
    }
  };

  const updatePortfolio = async (newData: PortfolioData) => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // 1. Optimistic & persistent local update
      setData(newData);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));

      // 2. Sync to server backend if available
      if (adminToken && !adminToken.startsWith('client-admin-')) {
        try {
          const res = await fetch('/api/portfolio', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${adminToken}`
            },
            body: JSON.stringify(newData)
          });
          const contentType = res.headers.get('content-type') || '';
          if (res.ok && contentType.includes('application/json')) {
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3500);
            return { success: true, message: 'Changes saved to server and applied live!' };
          }
        } catch {
          // If server fails or static host, localStorage update is already active
        }
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
      return { success: true, message: 'Changes saved and applied live!' };
    } catch (err: any) {
      setSaveError(err.message || 'Error saving changes');
      return { success: false, message: err.message };
    } finally {
      setIsSaving(false);
    }
  };

  const uploadFile = async (file: File, fileType: 'cv' | 'image') => {
    if (!adminToken) {
      return { success: false, message: 'You are not logged in as administrator.' };
    }

    return new Promise<{ success: boolean; fileUrl?: string; fileName?: string; message?: string }>((resolve) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;

          // If connected to server backend, try server upload
          if (!adminToken.startsWith('client-admin-')) {
            try {
              const res = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${adminToken}`
                },
                body: JSON.stringify({
                  fileData: base64Data,
                  fileName: file.name,
                  fileType
                })
              });
              const contentType = res.headers.get('content-type') || '';
              if (contentType.includes('application/json')) {
                const resData = await res.json();
                if (res.ok && resData.success) {
                  return resolve({
                    success: true,
                    fileUrl: resData.fileUrl,
                    fileName: resData.fileName,
                    message: 'File uploaded successfully!'
                  });
                }
              }
            } catch {
              // fallback to base64 Data URL below
            }
          }

          // Static host (GitHub Pages) fallback: Base64 Data URL works directly in the browser!
          resolve({
            success: true,
            fileUrl: base64Data,
            fileName: file.name,
            message: 'File loaded successfully!'
          });
        } catch (err: any) {
          resolve({
            success: false,
            message: 'Upload failed: ' + err.message
          });
        }
      };
      reader.onerror = () => {
        resolve({ success: false, message: 'Failed to read file from your device.' });
      };
      reader.readAsDataURL(file);
    });
  };

  const resetToDefaults = async () => {
    await updatePortfolio(defaultPortfolioData);
  };

  return (
    <PortfolioContext.Provider
      value={{
        data,
        isLoading,
        isSaving,
        saveError,
        saveSuccess,
        isAdminLoggedIn,
        adminToken,
        loginAdmin,
        logoutAdmin,
        updatePortfolio,
        uploadFile,
        resetToDefaults,
        changeAdminPassword
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
