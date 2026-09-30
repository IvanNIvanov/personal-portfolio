import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import fs from 'fs';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure data and uploads directories exist
const DATA_DIR = resolve(__dirname, 'data');
const UPLOADS_DIR = resolve(DATA_DIR, 'uploads');
const PORTFOLIO_FILE = resolve(DATA_DIR, 'portfolio.json');
const AUTH_FILE = resolve(DATA_DIR, 'admin-auth.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Helper to hash password
function hashPassword(pwd: string): string {
  return crypto.createHash('sha256').update(pwd + '_ivanov_salt_2026').digest('hex');
}

// Initialize Auth if not present
if (!fs.existsSync(AUTH_FILE)) {
  const initialAuth = {
    passwordHash: hashPassword('ivanov2026'), // Default password
    updatedAt: new Date().toISOString()
  };
  fs.writeFileSync(AUTH_FILE, JSON.stringify(initialAuth, null, 2), 'utf-8');
}

// Generate simple session token
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Active admin sessions in memory with expiry
const activeTokens = new Map<string, number>();

async function startServer() {
  const app = express();
  
  // Middleware with high body limits for file & image uploads
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Static uploads route
  app.use('/api/uploads', express.static(UPLOADS_DIR));

  // --- Auth Middleware Helper ---
  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Неоторизиран достъп (Missing token)' });
    }
    const token = authHeader.split(' ')[1];
    const expiry = activeTokens.get(token);
    if (!expiry || Date.now() > expiry) {
      activeTokens.delete(token);
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    // Refresh token expiry (extend by 24h)
    activeTokens.set(token, Date.now() + 24 * 60 * 60 * 1000);
    next();
  };

  // --- Admin Auth Routes ---
  app.post('/api/admin/login', (req, res) => {
    try {
      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ success: false, message: 'Please enter a password.' });
      }

      let currentAuth = { passwordHash: hashPassword('ivanov2026') };
      if (fs.existsSync(AUTH_FILE)) {
        try {
          currentAuth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));
        } catch {
          // fallback
        }
      }

      const inputHash = hashPassword(password);
      if (inputHash !== currentAuth.passwordHash) {
        return res.status(401).json({ success: false, message: 'Invalid password! Please try again.' });
      }

      const token = generateToken();
      // Valid for 7 days
      activeTokens.set(token, Date.now() + 7 * 24 * 60 * 60 * 1000);

      return res.json({ success: true, token, message: 'Login successful!' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post('/api/admin/verify', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.json({ valid: false });
    }
    const token = authHeader.split(' ')[1];
    const expiry = activeTokens.get(token);
    if (!expiry || Date.now() > expiry) {
      activeTokens.delete(token);
      return res.json({ valid: false });
    }
    return res.json({ valid: true });
  });

  app.post('/api/admin/change-password', requireAdmin, (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
      }

      let currentAuth: { passwordHash: string; updatedAt?: string } = { passwordHash: hashPassword('ivanov2026') };
      if (fs.existsSync(AUTH_FILE)) {
        currentAuth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));
      }

      if (hashPassword(currentPassword) !== currentAuth.passwordHash) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
      }

      currentAuth.passwordHash = hashPassword(newPassword);
      currentAuth.updatedAt = new Date().toISOString();
      fs.writeFileSync(AUTH_FILE, JSON.stringify(currentAuth, null, 2), 'utf-8');

      return res.json({ success: true, message: 'Password changed successfully!' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // --- Portfolio Content Routes ---
  app.get('/api/portfolio', (req, res) => {
    try {
      if (fs.existsSync(PORTFOLIO_FILE)) {
        const raw = fs.readFileSync(PORTFOLIO_FILE, 'utf-8');
        return res.json(JSON.parse(raw));
      }
      // If not yet saved to file, return null to let client use default
      return res.json(null);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to read portfolio file', details: err.message });
    }
  });

  app.put('/api/portfolio', requireAdmin, (req, res) => {
    try {
      const data = req.body;
      if (!data) {
        return res.status(400).json({ success: false, message: 'No data provided' });
      }
      fs.writeFileSync(PORTFOLIO_FILE, JSON.stringify(data, null, 2), 'utf-8');
      return res.json({ success: true, message: 'Changes saved successfully!' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to save portfolio', details: err.message });
    }
  });

  // --- File Upload Endpoint (Images, CV PDF) ---
  app.post('/api/upload', requireAdmin, (req, res) => {
    try {
      const { fileData, fileName, fileType } = req.body;
      if (!fileData || !fileName) {
        return res.status(400).json({ success: false, message: 'Missing file data or name' });
      }

      // Extract base64 safely without fragile regex
      const commaIdx = fileData.indexOf(',');
      const base64Str = commaIdx !== -1 ? fileData.substring(commaIdx + 1) : fileData;
      const buffer = Buffer.from(base64Str, 'base64');

      if (buffer.length === 0) {
        return res.status(400).json({ success: false, message: 'File buffer is empty or corrupted' });
      }

      // Extract MIME type if provided in header part
      let mimeType = 'application/octet-stream';
      if (commaIdx !== -1) {
        const headerPart = fileData.substring(0, commaIdx);
        const mimeMatch = headerPart.match(/data:([^;]+)/);
        if (mimeMatch) {
          mimeType = mimeMatch[1];
        }
      }

      // Fallback mime type from extension
      const ext = fileName.toLowerCase().split('.').pop() || '';
      if (ext === 'pdf') mimeType = 'application/pdf';
      else if (ext === 'docx') mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      else if (ext === 'doc') mimeType = 'application/msword';
      else if (['jpg', 'jpeg'].includes(ext)) mimeType = 'image/jpeg';
      else if (ext === 'png') mimeType = 'image/png';
      else if (ext === 'webp') mimeType = 'image/webp';

      // Sanitize filename
      const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const uniqueName = `${fileType || 'file'}_${Date.now()}_${cleanName}`;
      const filePath = resolve(UPLOADS_DIR, uniqueName);

      fs.writeFileSync(filePath, buffer);

      let fileUrl = `/api/uploads/${uniqueName}`;

      // If it's a CV, update the current cv file and set fileUrl to /api/cv
      if (fileType === 'cv') {
        const cvCurrent = resolve(UPLOADS_DIR, 'current_cv.pdf');
        fs.writeFileSync(cvCurrent, buffer);
        fileUrl = '/api/cv';

        // Also save metadata
        const metaPath = resolve(DATA_DIR, 'cv-meta.json');
        fs.writeFileSync(metaPath, JSON.stringify({ fileName: cleanName, mimeType, updatedAt: new Date().toISOString() }, null, 2));
      }

      return res.json({
        success: true,
        fileUrl,
        fileName: cleanName,
        mimeType,
        sizeBytes: buffer.length
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // --- Download CV Endpoint ---
  app.get('/api/cv', (req, res) => {
    try {
      const cvCurrent = resolve(UPLOADS_DIR, 'current_cv.pdf');
      
      let customFileName = 'Ivan_Ivanov_CV.pdf';
      let mimeType = 'application/pdf';

      if (fs.existsSync(PORTFOLIO_FILE)) {
        try {
          const portData = JSON.parse(fs.readFileSync(PORTFOLIO_FILE, 'utf-8'));
          if (portData?.hero?.cvFileName) {
            customFileName = portData.hero.cvFileName;
          }
        } catch {
          // ignore
        }
      }

      const metaPath = resolve(DATA_DIR, 'cv-meta.json');
      if (fs.existsSync(metaPath)) {
        try {
          const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
          if (meta.fileName) customFileName = meta.fileName;
          if (meta.mimeType) mimeType = meta.mimeType;
        } catch {
          // ignore
        }
      }

      if (fs.existsSync(cvCurrent)) {
        const fileBuffer = fs.readFileSync(cvCurrent);
        const cleanAsciiName = customFileName.replace(/[^a-zA-Z0-9._-]/g, '_');

        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Length', fileBuffer.length.toString());
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${cleanAsciiName}"; filename*=UTF-8''${encodeURIComponent(customFileName)}`
        );
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        return res.end(fileBuffer);
      }

      // Check for any cv_*.pdf file in uploads
      const files = fs.readdirSync(UPLOADS_DIR).filter(f => f.startsWith('cv_') && (f.endsWith('.pdf') || f.endsWith('.docx') || f.endsWith('.doc')));
      if (files.length > 0) {
        const latest = resolve(UPLOADS_DIR, files[files.length - 1]);
        const fileBuffer = fs.readFileSync(latest);
        const cleanAsciiName = customFileName.replace(/[^a-zA-Z0-9._-]/g, '_');

        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Length', fileBuffer.length.toString());
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${cleanAsciiName}"; filename*=UTF-8''${encodeURIComponent(customFileName)}`
        );
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

        return res.end(fileBuffer);
      }

      // If no file exists, return 404 rather than an HTML redirect
      return res.status(404).json({ error: 'CV file not found. Please upload a CV in the Admin panel.' });
    } catch (err: any) {
      return res.status(500).json({ error: 'Error downloading CV', details: err.message });
    }
  });

  // Legacy contact proxy
  app.post('/api/contact', async (req, res) => {
    try {
      const params = new URLSearchParams();
      params.append('name', req.body.name || '');
      params.append('email', req.body.email || '');
      params.append('subject', req.body.subject || '');
      params.append('message', req.body.message || '');
      params.append('_captcha', 'false');
      params.append('_subject', `Portfolio Inquiry: ${req.body.subject}`);

      await axios.post(
        'https://formsubmit.co/eng.IvanIvanov@outlook.com',
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        }
      );

      res.status(200).json({ success: true, message: 'Message proxied successfully' });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send message via proxy.',
        details: error.response?.data || error.message
      });
    }
  });

  // Vite Integration
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, port: 3000 },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(resolve(__dirname, 'dist/index.html'));
    });
  }

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer();
