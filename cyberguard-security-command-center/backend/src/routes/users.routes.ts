import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { AuthService } from '../services/auth.service.js';
import { TotpService } from '../services/totp.service.js';
import { AuditService } from '../services/audit.service.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';

export const usersRouter = Router();

usersRouter.use(authenticate);

/**
 * GET /api/users/profile
 * Returns detailed security status, 2FA status, and identity info
 */
usersRouter.get('/profile', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      twoFactorSecret: true,
      userRoles: { include: { role: true } },
      sessions: {
        where: { isActive: true },
        orderBy: { lastActiveAt: 'desc' },
      },
    },
  });

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  // Determine security status: SECURE, WARNING, ACTION REQUIRED
  let securityStatus: 'SECURE' | 'WARNING' | 'ACTION REQUIRED' = 'SECURE';
  const recommendations: string[] = [];

  if (!user.twoFactorSecret?.isEnabled) {
    securityStatus = 'ACTION REQUIRED';
    recommendations.push('Enable Two-Factor Authentication (TOTP) to protect privileged access.');
  }

  if (!user.isEmailVerified) {
    if (securityStatus !== 'ACTION REQUIRED') securityStatus = 'WARNING';
    recommendations.push('Verify your enterprise email address.');
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      isEmailVerified: user.isEmailVerified,
      twoFactorEnabled: !!user.twoFactorSecret?.isEnabled,
      roles: user.userRoles.map((ur) => ur.role.name),
      createdAt: user.createdAt,
    },
    securityStatus,
    recommendations,
    activeSessionCount: user.sessions.length,
  });
});

/**
 * POST /api/users/change-password
 */
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
  confirmNewPassword: z.string().min(8),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'New passwords do not match',
  path: ['confirmNewPassword'],
});

usersRouter.post('/change-password', validateBody(changePasswordSchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { currentPassword, newPassword } = req.body;

  const cred = await prisma.passwordCredential.findUnique({
    where: { userId },
  });

  if (!cred) {
    res.status(400).json({ error: 'Password credential record missing' });
    return;
  }

  const valid = await AuthService.verifyPassword(currentPassword, cred.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Current password incorrect' });
    return;
  }

  const strength = AuthService.checkPasswordStrength(newPassword);
  if (!strength.isValid) {
    res.status(400).json({
      error: 'New password does not meet security requirements',
      details: strength.feedback,
    });
    return;
  }

  const newHash = await AuthService.hashPassword(newPassword);

  await prisma.passwordCredential.update({
    where: { userId },
    data: { passwordHash: newHash },
  });

  await AuditService.log({
    actorId: userId,
    actorEmail: req.user!.email,
    action: 'PASSWORD_CHANGED',
    entityType: 'User',
    entityId: userId,
    ipAddress: req.ip || '127.0.0.1',
    userAgent: req.headers['user-agent'] || 'Unknown',
  });

  res.json({ message: 'Password successfully updated.' });
});

/**
 * GET /api/users/sessions
 */
usersRouter.get('/sessions', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;

  const sessions = await prisma.session.findMany({
    where: { userId, isActive: true },
    orderBy: { lastActiveAt: 'desc' },
  });

  res.json({
    sessions: sessions.map((s) => ({
      id: s.id,
      ipAddress: s.ipAddress || 'Unknown',
      userAgent: s.userAgent || 'Unknown',
      deviceType: s.deviceType || 'Desktop/Browser',
      lastActiveAt: s.lastActiveAt,
      isCurrent: s.id === req.sessionId,
    })),
  });
});

/**
 * DELETE /api/users/sessions/:id
 */
usersRouter.delete('/sessions/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  await prisma.session.updateMany({
    where: { id: String(id), userId },
    data: { isActive: false },
  });

  await AuditService.log({
    actorId: userId,
    actorEmail: req.user!.email,
    action: 'SESSION_REVOKED',
    entityType: 'Session',
    entityId: String(id),
    ipAddress: req.ip || '127.0.0.1',
    userAgent: req.headers['user-agent'] || 'Unknown',
  });

  res.json({ message: 'Session revoked successfully.' });
});

/**
 * POST /api/users/sessions/revoke-others
 */
usersRouter.post('/sessions/revoke-others', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const currentSessionId = req.sessionId;

  await prisma.session.updateMany({
    where: {
      userId,
      id: { not: currentSessionId },
    },
    data: { isActive: false },
  });

  await AuditService.log({
    actorId: userId,
    actorEmail: req.user!.email,
    action: 'ALL_OTHER_SESSIONS_REVOKED',
    entityType: 'Session',
    ipAddress: req.ip || '127.0.0.1',
    userAgent: req.headers['user-agent'] || 'Unknown',
  });

  res.json({ message: 'All other active sessions have been terminated.' });
});

/**
 * GET /api/users/login-history
 */
usersRouter.get('/login-history', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;

  const history = await prisma.loginEvent.findMany({
    where: {
      OR: [
        { userId },
        { email: req.user!.email },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  res.json({ history });
});

/**
 * POST /api/users/rotate-recovery-codes
 */
usersRouter.post('/rotate-recovery-codes', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;

  const tf = await prisma.twoFactorSecret.findUnique({
    where: { userId },
  });

  if (!tf || !tf.isEnabled) {
    res.status(400).json({ error: '2FA must be enabled to rotate recovery codes' });
    return;
  }

  const { plainCodes, hashedCodes } = TotpService.generateRecoveryCodes();

  await prisma.$transaction([
    prisma.recoveryCode.deleteMany({ where: { userId } }),
    prisma.recoveryCode.createMany({
      data: hashedCodes.map((codeHash) => ({
        userId,
        codeHash,
      })),
    }),
  ]);

  await AuditService.log({
    actorId: userId,
    actorEmail: req.user!.email,
    action: 'RECOVERY_CODES_ROTATED',
    entityType: 'RecoveryCode',
    ipAddress: req.ip || '127.0.0.1',
    userAgent: req.headers['user-agent'] || 'Unknown',
  });

  res.json({
    message: 'New recovery codes generated. Store them in an encrypted vault.',
    recoveryCodes: plainCodes,
  });
});
