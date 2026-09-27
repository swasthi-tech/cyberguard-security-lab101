import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import { AuditService } from '../services/audit.service.js';

export const iamRouter = Router();

iamRouter.use(authenticate);

/**
 * GET /api/iam/overview
 * Provides high-level IAM telemetry, MFA coverage, user counts, and role metrics
 */
iamRouter.get('/overview', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalRoles, usersWith2FA, privilegedUsers, activeSessions] = await Promise.all([
      prisma.user.count(),
      prisma.role.count(),
      prisma.twoFactorSecret.count({ where: { isEnabled: true } }),
      prisma.userRole.count({
        where: {
          role: {
            name: { in: ['SECURITY_ADMIN', 'SOC_ADMIN', 'INCIDENT_LEAD'] },
          },
        },
      }),
      prisma.session.count({ where: { isActive: true } }),
    ]);

    const mfaCoveragePercent = totalUsers > 0 ? Math.round((usersWith2FA / totalUsers) * 100) : 0;

    res.json({
      totalUsers,
      totalRoles,
      usersWith2FA,
      mfaCoveragePercent,
      privilegedUsers,
      activeSessions,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve IAM overview telemetry.' });
  }
});

/**
 * GET /api/iam/users
 * Returns list of enterprise users, roles, 2FA status, last activity
 */
iamRouter.get('/users', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      username: true,
      fullName: true,
      isEmailVerified: true,
      isActive: true,
      createdAt: true,
      twoFactorSecret: { select: { isEnabled: true, confirmedAt: true } },
      userRoles: {
        select: {
          role: { select: { id: true, name: true, description: true } },
        },
      },
      sessions: {
        where: { isActive: true },
        select: { id: true, ipAddress: true, lastActiveAt: true },
        take: 1,
        orderBy: { lastActiveAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const formatted = users.map((u) => ({
    id: u.id,
    email: u.email,
    username: u.username,
    fullName: u.fullName,
    isEmailVerified: u.isEmailVerified,
    isActive: u.isActive,
    twoFactorEnabled: !!u.twoFactorSecret?.isEnabled,
    roles: u.userRoles.map((ur) => ur.role.name),
    lastActive: u.sessions[0]?.lastActiveAt || u.createdAt,
    lastIp: u.sessions[0]?.ipAddress || 'None',
  }));

  res.json({ users: formatted });
});

/**
 * GET /api/iam/roles
 * Returns roles and their permissions for the User -> Role -> Permission visualization
 */
iamRouter.get('/roles', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  let roles = await prisma.role.findMany({
    include: {
      permissions: {
        include: { permission: true },
      },
      userRoles: true,
    },
  });

  // Seed default roles if empty
  if (roles.length === 0) {
    await prisma.role.createMany({
      data: [
        { name: 'SECURITY_ADMIN', description: 'Full administrative access to all security modules and user management', isSystem: true },
        { name: 'SOC_ANALYST', description: 'Monitoring, incident triage, SIEM investigation, and alert management', isSystem: true },
        { name: 'EDR_OPERATOR', description: 'Host telemetry monitoring and endpoint containment actions', isSystem: true },
        { name: 'READONLY_AUDITOR', description: 'Compliance audit log viewer without modification rights', isSystem: true },
      ],
      skipDuplicates: true,
    });
    roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true },
        },
        userRoles: true,
      },
    });
  }

  const result = roles.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    isSystem: r.isSystem,
    userCount: r.userRoles.length,
    permissions: r.permissions.map((p) => ({
      id: p.permission.id,
      name: p.permission.name,
      module: p.permission.module,
      description: p.permission.description,
    })),
  }));

  res.json({ roles: result });
});

/**
 * POST /api/iam/assign-role
 * Assigns role to user (requires SECURITY_ADMIN)
 */
const assignRoleSchema = z.object({
  userId: z.string().uuid(),
  roleName: z.string(),
});

iamRouter.post('/assign-role', requireRole(['SECURITY_ADMIN']), validateBody(assignRoleSchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { userId, roleName } = req.body;

  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) {
    res.status(404).json({ error: 'Role not found' });
    return;
  }

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId,
        roleId: role.id,
      },
    },
    create: {
      userId,
      roleId: role.id,
      assignedBy: req.user!.email,
    },
    update: {},
  });

  await AuditService.log({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    action: 'IAM_ROLE_ASSIGNED',
    entityType: 'UserRole',
    entityId: `${userId}:${role.id}`,
    ipAddress: req.ip || '127.0.0.1',
    userAgent: req.headers['user-agent'] || 'Unknown',
    details: { targetUserId: userId, assignedRole: roleName },
  });

  res.json({ message: `Role ${roleName} assigned successfully.` });
});
