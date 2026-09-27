import { Router, Request, Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '../prisma.js';
import { AuthService } from '../services/auth.service.js';
import { CaptchaService } from '../services/captcha.service.js';
import { TotpService } from '../services/totp.service.js';
import { AuditService } from '../services/audit.service.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { loginLimiter, registerLimiter, twoFactorLimiter } from '../middleware/rateLimit.js';
import { validateBody } from '../middleware/validation.js';
import { ENV } from '../config/env.js';

export const authRouter = Router();

// Pending 2FA setups cache (userId -> { secret, plainRecoveryCodes, hashedRecoveryCodes, expiresAt })
const PENDING_2FA = new Map<string, {
  secret: string;
  plainRecoveryCodes: string[];
  hashedRecoveryCodes: string[];
  expiresAt: number;
}>();

// Pending 2FA login challenges cache (tempToken -> { userId, expiresAt })
const PENDING_LOGIN_2FA = new Map<string, {
  userId: string;
  expiresAt: number;
}>();

/**
 * GET /api/auth/captcha
 * Generates fresh server-side high-contrast SVG CAPTCHA challenge
 */
authRouter.get('/captcha', (_req: Request, res: Response) => {
  const challenge = CaptchaService.generate();
  res.json({
    svg: challenge.svg,
    challengeToken: challenge.challengeToken,
  });
});

/**
 * POST /api/auth/register
 */
const registerSchema = z.object({
  fullName: z.string().min(2).max(100),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_.-]+$/, 'Username must be alphanumeric with . _ -'),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
  captchaResponse: z.string().min(1, 'CAPTCHA response is required'),
  challengeToken: z.string().min(1, 'CAPTCHA challenge token is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

authRouter.post('/register', registerLimiter, validateBody(registerSchema), async (req: Request, res: Response): Promise<void> => {
  const { fullName, username, email, password, captchaResponse, challengeToken } = req.body;
  const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown';

  // 1. Server-side CAPTCHA validation
  const captchaCheck = CaptchaService.validate(captchaResponse, challengeToken);
  if (!captchaCheck.valid) {
    res.status(400).json({ error: captchaCheck.reason || 'Invalid CAPTCHA' });
    return;
  }

  // 2. Strict password strength validation
  const strength = AuthService.checkPasswordStrength(password);
  if (!strength.isValid) {
    res.status(400).json({
      error: 'Password does not meet enterprise security requirements.',
      details: strength.feedback,
      analysis: strength,
    });
    return;
  }

  // 3. Unique email and username check
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() },
      ],
    },
  });

  if (existingUser) {
    res.status(409).json({
      error: existingUser.email === email.toLowerCase()
        ? 'An account with this email address already exists.'
        : 'This username is already taken.',
    });
    return;
  }

  // 4. Hash password with Argon2id
  const passwordHash = await AuthService.hashPassword(password);

  // 5. Create user and role in database
  const user = await prisma.user.create({
    data: {
      fullName,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      isEmailVerified: true, // For sandbox/dev environment, set to true with verification readiness
      passwordCredential: {
        create: {
          passwordHash,
          algorithm: 'argon2id',
        },
      },
    },
  });

  // Ensure default role exists
  let defaultRole = await prisma.role.findUnique({ where: { name: 'SOC_ANALYST' } });
  if (!defaultRole) {
    defaultRole = await prisma.role.create({
      data: {
        name: 'SOC_ANALYST',
        description: 'Standard Security Operations Center Analyst',
        isSystem: true,
      },
    });
  }

  await prisma.userRole.create({
    data: {
      userId: user.id,
      roleId: defaultRole.id,
    },
  });

  // 6. Audit log
  await AuditService.log({
    actorId: user.id,
    actorEmail: user.email,
    action: 'USER_REGISTERED',
    entityType: 'User',
    entityId: user.id,
    ipAddress,
    userAgent,
    details: { username: user.username },
  });

  res.status(201).json({
    message: 'User account created successfully. You may now sign in.',
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
    },
  });
});

/**
 * POST /api/auth/login
 */
const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
  captchaResponse: z.string().min(1, 'CAPTCHA response is required'),
  challengeToken: z.string().min(1, 'CAPTCHA challenge token is required'),
});

authRouter.post('/login', loginLimiter, validateBody(loginSchema), async (req: Request, res: Response): Promise<void> => {
  const { identifier, password, captchaResponse, challengeToken } = req.body;
  const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown';

  // 1. Validate CAPTCHA
  const captchaCheck = CaptchaService.validate(captchaResponse, challengeToken);
  if (!captchaCheck.valid) {
    res.status(400).json({ error: captchaCheck.reason || 'Invalid CAPTCHA' });
    return;
  }

  // 2. Find user
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier.toLowerCase() },
        { username: identifier.toLowerCase() },
      ],
    },
    include: {
      passwordCredential: true,
      twoFactorSecret: true,
      userRoles: { include: { role: true } },
    },
  });

  if (!user || !user.passwordCredential) {
    await prisma.loginEvent.create({
      data: {
        email: identifier,
        ipAddress,
        userAgent,
        status: 'FAILED',
        failureReason: 'Invalid credentials',
      },
    });

    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({ error: 'This security account is deactivated. Contact the SOC Administrator.' });
    return;
  }

  // 3. Verify Argon2id password hash
  const isPasswordCorrect = await AuthService.verifyPassword(password, user.passwordCredential.passwordHash);
  if (!isPasswordCorrect) {
    await prisma.loginEvent.create({
      data: {
        userId: user.id,
        email: user.email,
        ipAddress,
        userAgent,
        status: 'FAILED',
        failureReason: 'Incorrect password',
      },
    });

    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  // 4. Check if 2FA is enabled
  if (user.twoFactorSecret?.isEnabled) {
    const tempToken = crypto.randomBytes(32).toString('hex');
    PENDING_LOGIN_2FA.set(tempToken, {
      userId: user.id,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    });

    await prisma.loginEvent.create({
      data: {
        userId: user.id,
        email: user.email,
        ipAddress,
        userAgent,
        status: 'CHALLENGED_2FA',
      },
    });

    res.json({
      require2FA: true,
      tempToken,
      message: 'Primary credentials verified. Please supply your 2FA TOTP code.',
    });
    return;
  }

  // 5. Issue session
  const rawToken = AuthService.generateSessionToken();
  const tokenHash = AuthService.hashSessionToken(rawToken);
  const expiresAt = new Date(Date.now() + ENV.SESSION_MAX_AGE_MS);

  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash,
      ipAddress,
      userAgent,
      expiresAt,
    },
  });

  await prisma.loginEvent.create({
    data: {
      userId: user.id,
      email: user.email,
      ipAddress,
      userAgent,
      status: 'SUCCESS',
    },
  });

  await AuditService.log({
    actorId: user.id,
    actorEmail: user.email,
    action: 'USER_LOGIN',
    entityType: 'Session',
    ipAddress,
    userAgent,
    details: { method: 'PASSWORD' },
  });

  const isProd = ENV.NODE_ENV === 'production';
  res.cookie(ENV.COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: ENV.SESSION_MAX_AGE_MS,
    path: '/',
  });

  res.json({
    message: 'Authentication successful.',
    token: rawToken,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      roles: user.userRoles.map((ur) => ur.role.name),
      twoFactorEnabled: false,
    },
  });
});

/**
 * POST /api/auth/verify-2fa
 */
const verify2FaSchema = z.object({
  tempToken: z.string().min(1, 'Temporary verification token required'),
  code: z.string().min(1, '2FA code or recovery code required'),
});

authRouter.post('/verify-2fa', twoFactorLimiter, validateBody(verify2FaSchema), async (req: Request, res: Response): Promise<void> => {
  const { tempToken, code } = req.body;
  const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown';

  const pending = PENDING_LOGIN_2FA.get(tempToken);
  if (!pending || Date.now() > pending.expiresAt) {
    PENDING_LOGIN_2FA.delete(tempToken);
    res.status(401).json({ error: '2FA session expired. Please log in again.' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: pending.userId },
    include: {
      twoFactorSecret: true,
      recoveryCodes: true,
      userRoles: { include: { role: true } },
    },
  });

  if (!user || !user.twoFactorSecret || !user.twoFactorSecret.isEnabled) {
    res.status(400).json({ error: '2FA configuration invalid or missing.' });
    return;
  }

  const decryptedSecret = TotpService.decryptSecret(
    user.twoFactorSecret.secretEncrypted,
    user.twoFactorSecret.iv,
    user.twoFactorSecret.authTag
  );

  let verified = false;
  let usedRecoveryCode = false;

  // Check TOTP 6-digit code
  if (/^\d{6}$/.test(code.trim())) {
    verified = TotpService.verifyToken(code.trim(), decryptedSecret);
  }

  // If not verified and code is in recovery code format (e.g. XXXX-XXXX), check recovery codes
  if (!verified && code.includes('-')) {
    const hashedAttempt = TotpService.hashRecoveryCode(code);
    const recoveryMatch = user.recoveryCodes.find((rc) => !rc.isUsed && rc.codeHash === hashedAttempt);
    if (recoveryMatch) {
      verified = true;
      usedRecoveryCode = true;
      await prisma.recoveryCode.update({
        where: { id: recoveryMatch.id },
        data: { isUsed: true, usedAt: new Date() },
      });
    }
  }

  if (!verified) {
    res.status(401).json({ error: 'Invalid 2FA verification code or recovery code.' });
    return;
  }

  // Invalidate temp token
  PENDING_LOGIN_2FA.delete(tempToken);

  // Issue real session
  const rawToken = AuthService.generateSessionToken();
  const tokenHash = AuthService.hashSessionToken(rawToken);
  const expiresAt = new Date(Date.now() + ENV.SESSION_MAX_AGE_MS);

  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash,
      ipAddress,
      userAgent,
      expiresAt,
    },
  });

  await prisma.loginEvent.create({
    data: {
      userId: user.id,
      email: user.email,
      ipAddress,
      userAgent,
      status: 'SUCCESS',
    },
  });

  await AuditService.log({
    actorId: user.id,
    actorEmail: user.email,
    action: usedRecoveryCode ? '2FA_LOGIN_RECOVERY_CODE' : '2FA_LOGIN_TOTP',
    entityType: 'Session',
    ipAddress,
    userAgent,
    details: { usedRecoveryCode },
  });

  const isProd2FA = ENV.NODE_ENV === 'production';
  res.cookie(ENV.COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: isProd2FA,
    sameSite: isProd2FA ? 'none' : 'lax',
    maxAge: ENV.SESSION_MAX_AGE_MS,
    path: '/',
  });

  res.json({
    message: '2FA authentication verified successfully.',
    token: rawToken,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      roles: user.userRoles.map((ur) => ur.role.name),
      twoFactorEnabled: true,
    },
  });
});

/**
 * POST /api/auth/setup-2fa
 * Initializes TOTP generation with QR code and recovery codes
 */
authRouter.post('/setup-2fa', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = req.user!;
  const secret = TotpService.generateSecret();
  const { otpauthUrl, qrDataUrl } = await TotpService.generateQrCode(user.email, secret);
  const { plainCodes, hashedCodes } = TotpService.generateRecoveryCodes();

  // Cache pending setup for 10 minutes
  PENDING_2FA.set(user.id, {
    secret,
    plainRecoveryCodes: plainCodes,
    hashedRecoveryCodes: hashedCodes,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });

  res.json({
    secret,
    otpauthUrl,
    qrDataUrl,
    recoveryCodes: plainCodes,
    message: 'Scan the QR code with your authenticator app (Google Authenticator, Authy, Microsoft Authenticator) and verify with a 6-digit code.',
  });
});

/**
 * POST /api/auth/confirm-2fa
 * Confirms setup with mathematical TOTP check
 */
const confirm2FaSchema = z.object({
  code: z.string().length(6, 'Must be a 6-digit code'),
});

authRouter.post('/confirm-2fa', authenticate, validateBody(confirm2FaSchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = req.user!;
  const { code } = req.body;
  const pending = PENDING_2FA.get(user.id);

  if (!pending || Date.now() > pending.expiresAt) {
    res.status(400).json({ error: '2FA setup session expired. Please generate a new QR code.' });
    return;
  }

  // Mathematically verify code with pending secret
  const isValid = TotpService.verifyToken(code, pending.secret);
  if (!isValid) {
    res.status(400).json({ error: 'Invalid 6-digit code. Please check your authenticator app clock and try again.' });
    return;
  }

  // Encrypt secret with AES-256-GCM
  const { encrypted, iv, authTag } = TotpService.encryptSecret(pending.secret);

  // Save to DB
  await prisma.$transaction(async (tx) => {
    await tx.twoFactorSecret.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        secretEncrypted: encrypted,
        iv,
        authTag,
        isEnabled: true,
        confirmedAt: new Date(),
      },
      update: {
        secretEncrypted: encrypted,
        iv,
        authTag,
        isEnabled: true,
        confirmedAt: new Date(),
      },
    });

    // Delete existing unused recovery codes and insert new ones
    await tx.recoveryCode.deleteMany({ where: { userId: user.id } });
    await tx.recoveryCode.createMany({
      data: pending.hashedRecoveryCodes.map((codeHash) => ({
        userId: user.id,
        codeHash,
      })),
    });
  });

  PENDING_2FA.delete(user.id);

  await AuditService.log({
    actorId: user.id,
    actorEmail: user.email,
    action: '2FA_ENABLED',
    entityType: 'TwoFactorSecret',
    ipAddress: req.ip || '127.0.0.1',
    userAgent: req.headers['user-agent'] || 'Unknown',
  });

  res.json({
    message: 'Two-factor authentication successfully enabled on your account.',
    twoFactorEnabled: true,
  });
});

/**
 * POST /api/auth/disable-2fa
 */
const disable2FaSchema = z.object({
  password: z.string().min(1),
});

authRouter.post('/disable-2fa', authenticate, validateBody(disable2FaSchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = req.user!;
  const { password } = req.body;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { passwordCredential: true },
  });

  if (!dbUser || !dbUser.passwordCredential) {
    res.status(400).json({ error: 'User credential missing' });
    return;
  }

  const valid = await AuthService.verifyPassword(password, dbUser.passwordCredential.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Incorrect password confirmation.' });
    return;
  }

  await prisma.$transaction([
    prisma.twoFactorSecret.deleteMany({ where: { userId: user.id } }),
    prisma.recoveryCode.deleteMany({ where: { userId: user.id } }),
  ]);

  await AuditService.log({
    actorId: user.id,
    actorEmail: user.email,
    action: '2FA_DISABLED',
    entityType: 'TwoFactorSecret',
    ipAddress: req.ip || '127.0.0.1',
    userAgent: req.headers['user-agent'] || 'Unknown',
  });

  res.json({ message: 'Two-factor authentication disabled.' });
});

/**
 * GET /api/auth/me
 */
authRouter.get('/me', authenticate, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

/**
 * POST /api/auth/logout
 */
authRouter.post('/logout', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (req.sessionId) {
    await prisma.session.update({
      where: { id: req.sessionId },
      data: { isActive: false },
    });
  }

  await AuditService.log({
    actorId: req.user?.id,
    actorEmail: req.user?.email || 'Unknown',
    action: 'USER_LOGOUT',
    entityType: 'Session',
    ipAddress: req.ip || '127.0.0.1',
    userAgent: req.headers['user-agent'] || 'Unknown',
  });

  const isProdLogout = ENV.NODE_ENV === 'production';
  res.clearCookie(ENV.COOKIE_NAME, {
    httpOnly: true,
    secure: isProdLogout,
    sameSite: isProdLogout ? 'none' : 'lax',
    path: '/',
  });
  res.json({ message: 'Signed out successfully.' });
});

/**
 * Password Strength Evaluation helper endpoint
 */
authRouter.post('/password-strength', (req: Request, res: Response) => {
  const { password } = req.body;
  if (typeof password !== 'string') {
    res.status(400).json({ error: 'Password string required' });
    return;
  }
  const analysis = AuthService.checkPasswordStrength(password);
  res.json(analysis);
});
