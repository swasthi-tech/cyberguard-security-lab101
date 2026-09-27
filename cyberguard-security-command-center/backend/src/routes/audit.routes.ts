import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

export const auditRouter = Router();

auditRouter.use(authenticate);

/**
 * GET /api/audit/logs
 * Read-only querying of immutable security audit logs
 */
auditRouter.get('/logs', requireRole(['SECURITY_ADMIN', 'SOC_ANALYST', 'READONLY_AUDITOR']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const limit = Math.min(parseInt(req.query.limit as string || '50', 10), 100);
  const page = Math.max(parseInt(req.query.page as string || '1', 10), 1);
  const skip = (page - 1) * limit;
  const actionFilter = req.query.action as string;

  try {
    const whereClause: any = {};
    if (actionFilter && actionFilter !== 'ALL') {
      whereClause.action = actionFilter;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: whereClause,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where: whereClause }),
    ]);

    res.json({
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve audit log records.' });
  }
});
