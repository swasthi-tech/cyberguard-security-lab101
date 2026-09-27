import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma.js';
import { AuthService } from '../services/auth.service.js';
import { ENV } from '../config/env.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  roles: string[];
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  sessionId?: string;
}

export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies[ENV.COOKIE_NAME] || req.headers.authorization?.replace(/^Bearer\s+/i, '');

  if (!token) {
    res.status(401).json({ error: 'Authentication required. No session token provided.' });
    return;
  }

  const tokenHash = AuthService.hashSessionToken(token);

  try {
    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            twoFactorSecret: true,
            userRoles: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    });

    if (!session || !session.isActive || session.expiresAt < new Date()) {
      res.clearCookie(ENV.COOKIE_NAME);
      res.status(401).json({ error: 'Session expired or invalidated. Please sign in again.' });
      return;
    }

    // Update lastActiveAt periodically (throttle to once every 5 minutes)
    if (Date.now() - session.lastActiveAt.getTime() > 5 * 60 * 1000) {
      await prisma.session.update({
        where: { id: session.id },
        data: { lastActiveAt: new Date() },
      });
    }

    req.sessionId = session.id;
    req.user = {
      id: session.user.id,
      email: session.user.email,
      username: session.user.username,
      fullName: session.user.fullName,
      isEmailVerified: session.user.isEmailVerified,
      twoFactorEnabled: !!session.user.twoFactorSecret?.isEnabled,
      roles: session.user.userRoles.map((ur) => ur.role.name),
    };

    next();
  } catch (err) {
    console.error('[AUTH MIDDLEWARE ERROR]', err);
    res.status(500).json({ error: 'Internal security authentication check failure.' });
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const hasRole = req.user.roles.some((r) => allowedRoles.includes(r));
    if (!hasRole && !req.user.roles.includes('SECURITY_ADMIN')) {
      res.status(403).json({ error: 'Forbidden: Insufficient privileges for this security resource.' });
      return;
    }

    next();
  };
}
