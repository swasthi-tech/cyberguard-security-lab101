import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import { z } from 'zod';
import { getDb } from './db.js';
import { encrypt, decrypt, generateToken, requireAuth, verifyToken } from './auth.js';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());
app.use(cookieParser());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

// Make sure otplib uses standard SHA-1 with 30s step
authenticator.options = { window: 1 };

const setCookie = (res: express.Response, token: string) => {
  res.cookie('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // Must be lax/none if frontend and backend on different ports
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
};

// =====================================
// AUTH ROUTES
// =====================================

// Stub register
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  
  const db = await getDb();
  const existing = await db.get('SELECT id FROM users WHERE email = ?', [email]);
  if (existing) return res.status(400).json({ error: 'User exists' });

  const id = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(password, 10);
  
  await db.run('INSERT INTO users (id, email, passwordHash) VALUES (?, ?, ?)', [id, email, passwordHash]);
  
  const token = generateToken({ userId: id, _2faVerified: true }); // No 2FA on registration
  setCookie(res, token);
  res.json({ success: true });
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const db = await getDb();
  
  const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (user.twoFactorEnabled) {
    const tempToken = generateToken({ userId: user.id, _2faVerified: false }, '15m');
    setCookie(res, tempToken);
    return res.json({ requires2FA: true });
  }

  const token = generateToken({ userId: user.id, _2faVerified: true });
  setCookie(res, token);
  res.json({ requires2FA: false });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('session');
  res.json({ success: true });
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  const user = (req as any).user;
  if (!user._2faVerified) return res.status(403).json({ error: '2FA required' });
  
  const db = await getDb();
  const dbUser = await db.get('SELECT id, email, twoFactorEnabled FROM users WHERE id = ?', [user.userId]);
  if (!dbUser) return res.status(404).json({ error: 'Not found' });
  
  res.json({ user: dbUser });
});

// =====================================
// 2FA ROUTES
// =====================================

app.post('/api/2fa/setup', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const db = await getDb();
  const dbUser = await db.get('SELECT email, twoFactorEnabled FROM users WHERE id = ?', [user.userId]);
  
  if (dbUser.twoFactorEnabled) {
    return res.status(400).json({ error: '2FA is already enabled' });
  }

  const secret = authenticator.generateSecret();
  const encryptedTotpSecret = encrypt(secret);
  
  await db.run('UPDATE users SET encryptedTotpSecret = ? WHERE id = ?', [encryptedTotpSecret, user.userId]);
  
  const otpauth = authenticator.keyuri(dbUser.email, 'CyberGuard Security Lab', secret);
  const qrCodeUrl = await qrcode.toDataURL(otpauth);

  res.json({ setupKey: secret, qrCodeUrl });
});

app.post('/api/2fa/verify-setup', requireAuth, async (req, res) => {
  const { code } = req.body;
  const user = (req as any).user;
  const db = await getDb();
  
  const dbUser = await db.get('SELECT encryptedTotpSecret FROM users WHERE id = ?', [user.userId]);
  if (!dbUser.encryptedTotpSecret) return res.status(400).json({ error: 'Setup not initiated' });

  const secret = decrypt(dbUser.encryptedTotpSecret);
  const isValid = authenticator.verify({ token: code, secret });

  if (!isValid) return res.status(400).json({ error: 'Invalid code' });

  // Generate recovery codes
  const recoveryCodes = Array.from({ length: 10 }, () => crypto.randomBytes(4).toString('hex'));
  const recoveryCodeHashes = await Promise.all(recoveryCodes.map(c => bcrypt.hash(c, 10)));
  
  await db.run('UPDATE users SET twoFactorEnabled = 1, recoveryCodeHashes = ? WHERE id = ?', [
    JSON.stringify(recoveryCodeHashes),
    user.userId
  ]);

  res.json({ success: true, recoveryCodes });
});

app.post('/api/2fa/verify-login', requireAuth, async (req, res) => {
  const { code } = req.body;
  const user = (req as any).user;
  const db = await getDb();
  
  const dbUser = await db.get('SELECT encryptedTotpSecret, recoveryCodeHashes FROM users WHERE id = ?', [user.userId]);
  if (!dbUser.encryptedTotpSecret) return res.status(400).json({ error: '2FA not enabled' });

  const secret = decrypt(dbUser.encryptedTotpSecret);
  const isValid = authenticator.verify({ token: code, secret });

  if (!isValid) {
    // Check recovery codes
    const hashes: string[] = JSON.parse(dbUser.recoveryCodeHashes || '[]');
    let matchedIndex = -1;
    for (let i = 0; i < hashes.length; i++) {
      if (await bcrypt.compare(code, hashes[i])) {
        matchedIndex = i;
        break;
      }
    }
    
    if (matchedIndex === -1) return res.status(400).json({ error: 'Invalid code' });
    
    // Consume recovery code
    hashes.splice(matchedIndex, 1);
    await db.run('UPDATE users SET recoveryCodeHashes = ? WHERE id = ?', [JSON.stringify(hashes), user.userId]);
  }

  const token = generateToken({ userId: user.userId, _2faVerified: true });
  setCookie(res, token);
  res.json({ success: true });
});

app.post('/api/2fa/disable', requireAuth, async (req, res) => {
  const { password } = req.body;
  const user = (req as any).user;
  const db = await getDb();
  
  const dbUser = await db.get('SELECT passwordHash FROM users WHERE id = ?', [user.userId]);
  if (!dbUser || !(await bcrypt.compare(password, dbUser.passwordHash))) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  await db.run('UPDATE users SET twoFactorEnabled = 0, encryptedTotpSecret = NULL, recoveryCodeHashes = NULL WHERE id = ?', [user.userId]);
  res.json({ success: true });
});

app.post('/api/2fa/regenerate-recovery-codes', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const db = await getDb();
  
  const dbUser = await db.get('SELECT twoFactorEnabled FROM users WHERE id = ?', [user.userId]);
  if (!dbUser.twoFactorEnabled) return res.status(400).json({ error: '2FA not enabled' });

  const recoveryCodes = Array.from({ length: 10 }, () => crypto.randomBytes(4).toString('hex'));
  const recoveryCodeHashes = await Promise.all(recoveryCodes.map(c => bcrypt.hash(c, 10)));
  
  await db.run('UPDATE users SET recoveryCodeHashes = ? WHERE id = ?', [
    JSON.stringify(recoveryCodeHashes),
    user.userId
  ]);

  res.json({ success: true, recoveryCodes });
});

// =====================================
// EXISTING TOOL ROUTES (MOCKED)
// =====================================
app.get('/api/ip/:ip', (req, res) => {
  res.json({ ip: req.params.ip, country: 'United States', city: 'Mountain View', riskScore: 5 });
});
app.post('/api/url-safety', (req, res) => res.json({ url: req.body.url, safe: true, score: 95, threats: [] }));
app.post('/api/phishing', (req, res) => res.json({ url: req.body.url, probability: 0.1, isPhishing: false }));
app.post('/api/malware', (req, res) => res.json({ hash: req.body.hash, clean: true, detections: [] }));

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
