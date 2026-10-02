import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { 
  getAllRegistrations, 
  saveRegistration, 
  deleteRegistration,
  saveSession,
  isValidSession,
  removeSession
} from './server/storage.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());
app.use(cookieParser());

// Admin credentials
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'Abokhalil22';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Abokhalil22';

// Middleware to authenticate admin
function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '') || req.cookies?.dxn_admin_session;
  if (token && isValidSession(token)) {
    next();
    return;
  }
  res.status(401).json({ error: 'غير مصرح به - يرجى تسجيل الدخول كمدير' });
}

// Public API: Register applicant
app.post('/api/registration', (req: Request, res: Response) => {
  try {
    const {
      country,
      firstName,
      fatherName,
      lastName,
      birthDay,
      birthMonth,
      birthYear,
      gender,
      nationality,
      identityNumber,
      phone,
      email,
      city,
      address
    } = req.body;

    // Validation
    if (!country || !firstName || !fatherName || !lastName || !birthDay || !birthMonth || !birthYear ||
        !gender || !nationality || !identityNumber || !phone || !email || !city || !address) {
      res.status(400).json({ error: 'جميع الحقول مطلوبة لإتمام التسجيل' });
      return;
    }

    const registration = saveRegistration({
      country: String(country).trim(),
      firstName: String(firstName).trim(),
      fatherName: String(fatherName).trim(),
      lastName: String(lastName).trim(),
      birthDay: String(birthDay).padStart(2, '0'),
      birthMonth: String(birthMonth).padStart(2, '0'),
      birthYear: String(birthYear),
      gender: String(gender).trim(),
      nationality: String(nationality).trim(),
      identityNumber: String(identityNumber).trim(),
      phone: String(phone).trim(),
      email: String(email).trim().toLowerCase(),
      city: String(city).trim(),
      address: String(address).trim()
    });

    res.json({ success: true, registration });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء حفظ طلب التسجيل' });
  }
});

// Admin API: Login
app.post('/api/admin/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = crypto.randomBytes(32).toString('hex');
      saveSession(token);

      res.cookie('dxn_admin_session', token, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        success: true,
        user: ADMIN_USERNAME,
        token
      });
      return;
    }

    res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء تسجيل الدخول' });
  }
});

// Admin API: Check auth status
app.get('/api/admin/check', (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '') || req.cookies?.dxn_admin_session;
  if (token && isValidSession(token)) {
    res.json({ authenticated: true, user: ADMIN_USERNAME });
    return;
  }
  res.json({ authenticated: false });
});

// Admin API: Logout
app.post('/api/admin/logout', (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '') || req.cookies?.dxn_admin_session;
  if (token) {
    removeSession(token);
  }
  res.clearCookie('dxn_admin_session', { sameSite: 'none', secure: true });
  res.json({ success: true });
});

// Admin API: List registrations
app.get('/api/admin/registrations', requireAdmin, (_req: Request, res: Response) => {
  try {
    const registrations = getAllRegistrations();
    res.json({ success: true, registrations });
  } catch (err) {
    console.error('Fetch registrations error:', err);
    res.status(500).json({ error: 'فشل في جلب طلبات التسجيل' });
  }
});

// Admin API: Delete registration
app.delete('/api/admin/registrations/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'معرف طلب التسجيل غير صالح' });
      return;
    }

    const deleted = deleteRegistration(id);
    if (!deleted) {
      res.status(404).json({ error: 'الطلب غير موجود' });
      return;
    }

    res.json({ success: true, id });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'فشل في حذف طلب التسجيل' });
  }
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    // Serve static files from dist
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    // Development mode with Vite dev server middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DXN Registration Portal server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
