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

    const verifyToken = async () => {
      try {
        const res = await fetch('/api/admin/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`
          }
        });
        const resData = await res.json();
        if (resData.valid) {
          setIsAdminLoggedIn(true);
        } else {
          setIsAdminLoggedIn(false);
          setAdminToken(null);
          localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      } catch {
        // If network issue, assume valid if token exists in session
        setIsAdminLoggedIn(true);
      }
    };

    verifyToken();
  }, [adminToken]);

  const loginAdmin = async (password: string) => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const resData = await res.json();
      if (res.ok && resData.success && resData.token) {
        setAdminToken(resData.token);
        localStorage.setItem(TOKEN_STORAGE_KEY, resData.token);
        setIsAdminLoggedIn(true);
        return { success: true, message: 'Login successful!' };
      }
      return { success: false, message: resData.message || 'Invalid password.' };
    } catch (err: any) {
      return { success: false, message: 'Server connection error: ' + err.message };
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

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        return { success: true, message: resData.message || 'Password changed successfully!' };
      }
      return { success: false, message: resData.message || 'Error changing password.' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const updatePortfolio = async (newData: PortfolioData) => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // Optimistic update
      setData(newData);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
      }

      const res = await fetch('/api/portfolio', {
        method: 'PUT',
        headers,
        body: JSON.stringify(newData)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Error saving changes to server');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
      return { success: true, message: 'Changes saved to server and applied live!' };
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

          const resData = await res.json();
          if (res.ok && resData.success) {
            resolve({
              success: true,
              fileUrl: resData.fileUrl,
              fileName: resData.fileName,
              message: 'File uploaded successfully!'
            });
          } else {
            resolve({
              success: false,
              message: resData.message || 'Error uploading file.'
            });
          }
        } catch (err: any) {
          resolve({
            success: false,
            message: 'Upload request failed: ' + err.message
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
