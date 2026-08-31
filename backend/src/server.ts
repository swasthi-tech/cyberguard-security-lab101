import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import { z } from 'zod';
import { getDb, initDB } from './db.js';
import { encrypt, decrypt, generateToken, requireAuth, verifyToken } from './auth.js';
import { generateCaptcha, verifyCaptcha } from './captcha.js';
import { generateAndSendOTP, verifyOTP, hasVerifiedOTP } from './otp.js';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
const allowedOrigins = [
  'http://localhost:5173',
  'https://swasthi-tech.github.io'
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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
    secure: true, // Must be true for SameSite='none'
    sameSite: 'none', // Required for cross-domain auth
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
};

// =====================================
// CAPTCHA ROUTES
// =====================================

const captchaLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }); // 50 captchas per 15 min

app.post('/api/captcha/generate', captchaLimiter, async (req, res) => {
  try {
    const data = await generateCaptcha();
    res.json(data);
  } catch (error) {
    console.error('CAPTCHA generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =====================================
// OTP ROUTES
// =====================================

const otpLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }); // 5 OTPs per 15 min

app.post('/api/auth/send-email-otp', otpLimiter, async (req, res) => {
  try {
    let { email, purpose } = req.body;
    if (email) email = email.trim().toLowerCase();
    
    if (!email || !purpose) {
      return res.status(400).json({ error: 'Email and purpose are required' });
    }

    // Basic anti-spam: check if they already requested one in the last 60 seconds
    const db = await getDb();
    const recent = await db.get(
      "SELECT id FROM otps WHERE email = ? AND purpose = ? AND datetime(createdAt) > datetime('now', '-1 minute')",
      [email, purpose]
    );

    if (recent) {
      return res.status(429).json({ error: 'Please wait 60 seconds before requesting another code.' });
    }

    await generateAndSendOTP(email, purpose);
    res.json({ success: true, message: 'OTP sent' });
  } catch (error: any) {
    console.error('OTP generation error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/api/auth/verify-email-otp', async (req, res) => {
  try {
    let { email, otp, purpose } = req.body;
    if (email) email = email.trim().toLowerCase();

    if (!email || !otp || !purpose) {
      return res.status(400).json({ error: 'Email, OTP, and purpose are required' });
    }

    const isValid = await verifyOTP(email, otp, purpose);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    res.json({ success: true, message: 'Email verified' });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =====================================
// AUTH ROUTES
// =====================================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    let { email, password, captchaId, captchaAnswer, otp } = req.body;
    if (email) email = email.trim().toLowerCase();
    if (!email || !password || !otp) return res.status(400).json({ error: 'Missing fields' });

    // Validate CAPTCHA first
    if (!(await verifyCaptcha(captchaId, captchaAnswer))) {
      return res.status(400).json({ error: 'Invalid CAPTCHA' });
    }

    // Verify OTP inline to ensure atomic registration
    const isOtpValid = await verifyOTP(email, otp, 'registration');
    if (!isOtpValid) {
      // It might have already been verified in a previous step, check if they have a recently verified one
      const alreadyVerified = await hasVerifiedOTP(email, 'registration');
      if (!alreadyVerified) {
        return res.status(400).json({ error: 'Invalid, expired, or unverified OTP' });
      }
    }

    const db = await getDb();
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) return res.status(400).json({ error: 'User exists' });

    const id = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);
    
    await db.run('INSERT INTO users (id, email, passwordHash) VALUES (?, ?, ?)', [id, email, passwordHash]);
    
    const token = generateToken({ userId: id, _2faVerified: true }); // No 2FA on registration
    setCookie(res, token);
    res.json({ success: true });
  } catch (error) {
    console.error('Registration error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    let { email, password } = req.body;
    if (email) email = email.trim().toLowerCase();

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
  } catch (error) {
    console.error('Login error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Internal server error' });
  }
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

app.post('/api/auth/forgot-password', async (req, res) => {
  let { email } = req.body;
  if (email) email = email.trim().toLowerCase();

  const db = await getDb();
  const user = await db.get('SELECT id FROM users WHERE email = ?', [email]);
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    const hash = await bcrypt.hash(token, 10);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15).toISOString(); // 15 mins
    await db.run('UPDATE users SET resetTokenHash = ?, resetTokenExpiresAt = ? WHERE id = ?', [hash, expiresAt, user.id]);
    
    console.log('\n--- MOCK EMAIL ---');
    console.log(`To: ${email}`);
    console.log(`Subject: Password Reset Request`);
    console.log(`Body: Click here to reset your password: http://localhost:5173/reset-password?token=${token}&email=${encodeURIComponent(email)}`);
    console.log('------------------\n');
  }
  
  // Generic response to avoid email enumeration
  res.json({ success: true, message: 'If that email is registered, a password reset link has been sent.' });
});

app.post('/api/auth/reset-password', async (req, res) => {
  let { email, token, newPassword } = req.body;
  if (email) email = email.trim().toLowerCase();
  const db = await getDb();
  const user = await db.get('SELECT id, resetTokenHash, resetTokenExpiresAt FROM users WHERE email = ?', [email]);
  
  if (!user || !user.resetTokenHash || !user.resetTokenExpiresAt) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }

  if (new Date(user.resetTokenExpiresAt) < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }

  const isValid = await bcrypt.compare(token, user.resetTokenHash);
  if (!isValid) return res.status(400).json({ error: 'Invalid or expired token' });

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.run('UPDATE users SET passwordHash = ?, resetTokenHash = NULL, resetTokenExpiresAt = NULL WHERE id = ?', [passwordHash, user.id]);

  res.json({ success: true });
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

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err instanceof Error ? err.message : err);
  process.exit(1);
});
