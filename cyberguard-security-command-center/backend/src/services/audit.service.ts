import { prisma } from '../prisma.js';

export interface AuditLogEntry {
  actorId?: string | null;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  ipAddress: string;
  userAgent: string;
  details?: Record<string, any> | string;
}

export class AuditService {
  /**
   * Logs an immutable security audit trail event
   */
  public static async log(entry: AuditLogEntry): Promise<void> {
    try {
      const detailsStr = typeof entry.details === 'object' 
        ? JSON.stringify(entry.details) 
        : (entry.details || null);

      await prisma.auditLog.create({
        data: {
          actorId: entry.actorId || null,
          actorEmail: entry.actorEmail,
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId || null,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          details: detailsStr,
        },
      });
    } catch (err) {
      console.error('[AUDIT LOG ERROR]', err);
    }
  }
}
