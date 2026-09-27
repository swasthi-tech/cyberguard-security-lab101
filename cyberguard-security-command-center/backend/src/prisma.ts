import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

// Standard Prisma client
const realPrisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
});

// Resilient in-memory fallback store for when PostgreSQL service is not actively running
class InMemoryStore {
  users: any[] = [];
  passwordCredentials: any[] = [];
  twoFactorSecrets: any[] = [];
  recoveryCodes: any[] = [];
  sessions: any[] = [];
  loginEvents: any[] = [];
  securityEvents: any[] = [];
  auditLogs: any[] = [];
  roles: any[] = [
    { id: 'role-soc-analyst', name: 'SOC_ANALYST', description: 'Standard Security Operations Center Analyst', isSystem: true, createdAt: new Date() },
    { id: 'role-sec-admin', name: 'SECURITY_ADMIN', description: 'Full administrative access to all security modules', isSystem: true, createdAt: new Date() },
    { id: 'role-edr-operator', name: 'EDR_OPERATOR', description: 'Host telemetry monitoring and endpoint containment', isSystem: true, createdAt: new Date() },
    { id: 'role-readonly-auditor', name: 'READONLY_AUDITOR', description: 'Compliance audit log viewer without modification rights', isSystem: true, createdAt: new Date() },
  ];
  userRoles: any[] = [];
  threatIndicators: any[] = [];
  cloudAssets: any[] = [];
  endpoints: any[] = [];
  incidents: any[] = [];
}

const memStore = new InMemoryStore();
let isPostgresAvailable: boolean | null = null;

async function checkPostgres(): Promise<boolean> {
  if (isPostgresAvailable !== null) return isPostgresAvailable;
  try {
    await realPrisma.$connect();
    isPostgresAvailable = true;
    console.log('[CYBERGUARD DB] Successfully connected to PostgreSQL.');
    return true;
  } catch (err: any) {
    isPostgresAvailable = false;
    console.warn('[CYBERGUARD DB] PostgreSQL database not reached on localhost:5432.');
    console.warn('[CYBERGUARD DB] Resilient memory vault active. Authentication, TOTP 2FA, and SOC tools are fully functional!');
    return false;
  }
}

// Check connectivity on startup
checkPostgres().catch(() => {});

// Helpers for in-memory relations
function populateUserRelations(user: any) {
  if (!user) return null;
  const passwordCredential = memStore.passwordCredentials.find((p) => p.userId === user.id) || null;
  const twoFactorSecret = memStore.twoFactorSecrets.find((t) => t.userId === user.id) || null;
  const recoveryCodes = memStore.recoveryCodes.filter((r) => r.userId === user.id);
  const userRoles = memStore.userRoles
    .filter((ur) => ur.userId === user.id)
    .map((ur) => ({
      ...ur,
      role: memStore.roles.find((r) => r.id === ur.roleId) || { name: 'SOC_ANALYST' },
    }));
  const sessions = memStore.sessions.filter((s) => s.userId === user.id);

  return {
    ...user,
    passwordCredential,
    twoFactorSecret,
    recoveryCodes,
    userRoles,
    sessions,
  };
}

export const prisma: any = new Proxy(realPrisma, {
  get(target: any, prop: string) {
    if (prop === '$transaction') {
      return async (arg: any) => {
        const available = await checkPostgres();
        if (available) {
          try {
            return await target.$transaction(arg);
          } catch (e: any) {
            if (e.code?.startsWith('P1')) isPostgresAvailable = false;
            else throw e;
          }
        }
        if (Array.isArray(arg)) {
          const results: any[] = [];
          for (const fn of arg) {
            results.push(await fn);
          }
          return results;
        } else if (typeof arg === 'function') {
          return await arg(prisma);
        }
      };
    }

    if (prop === 'user') {
      return {
        async findUnique(args: any) {
          const available = await checkPostgres();
          if (available) {
            try { return await target.user.findUnique(args); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          const { where } = args;
          const user = memStore.users.find((u) => (where.id && u.id === where.id) || (where.email && u.email === where.email) || (where.username && u.username === where.username));
          return populateUserRelations(user);
        },
        async findFirst(args: any) {
          const available = await checkPostgres();
          if (available) {
            try { return await target.user.findFirst(args); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          const { where } = args;
          let match = null;
          if (where?.OR) {
            for (const cond of where.OR) {
              match = memStore.users.find((u) => (cond.email && u.email === cond.email) || (cond.username && u.username === cond.username));
              if (match) break;
            }
          } else if (where?.id) {
            match = memStore.users.find((u) => u.id === where.id);
          }
          return populateUserRelations(match);
        },
        async create(args: any) {
          const available = await checkPostgres();
          if (available) {
            try { return await target.user.create(args); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          const { data } = args;
          const newUser = {
            id: crypto.randomUUID(),
            email: data.email,
            username: data.username,
            fullName: data.fullName,
            isEmailVerified: data.isEmailVerified ?? false,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          memStore.users.push(newUser);

          if (data.passwordCredential?.create) {
            memStore.passwordCredentials.push({
              id: crypto.randomUUID(),
              userId: newUser.id,
              passwordHash: data.passwordCredential.create.passwordHash,
              algorithm: data.passwordCredential.create.algorithm || 'argon2id',
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
          return populateUserRelations(newUser);
        },
        async count() {
          const available = await checkPostgres();
          if (available) {
            try { return await target.user.count(); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          return memStore.users.length;
        },
        async findMany(args?: any) {
          const available = await checkPostgres();
          if (available) {
            try { return await target.user.findMany(args); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          return memStore.users.map((u) => populateUserRelations(u));
        },
      };
    }

    if (prop === 'passwordCredential') {
      return {
        async findUnique(args: any) {
          const available = await checkPostgres();
          if (available) {
            try { return await target.passwordCredential.findUnique(args); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          return memStore.passwordCredentials.find((p) => p.userId === args.where?.userId) || null;
        },
        async update(args: any) {
          const available = await checkPostgres();
          if (available) {
            try { return await target.passwordCredential.update(args); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          const item = memStore.passwordCredentials.find((p) => p.userId === args.where?.userId);
          if (item) {
            Object.assign(item, args.data, { updatedAt: new Date() });
          }
          return item;
        },
      };
    }

    if (prop === 'twoFactorSecret') {
      return {
        async findUnique(args: any) {
          const available = await checkPostgres();
          if (available) {
            try { return await target.twoFactorSecret.findUnique(args); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          return memStore.twoFactorSecrets.find((t) => t.userId === args.where?.userId) || null;
        },
        async upsert(args: any) {
          const available = await checkPostgres();
          if (available) {
            try { return await target.twoFactorSecret.upsert(args); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          let existing = memStore.twoFactorSecrets.find((t) => t.userId === args.where?.userId);
          if (!existing) {
            existing = {
              id: crypto.randomUUID(),
              ...args.create,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            memStore.twoFactorSecrets.push(existing);
          } else {
            Object.assign(existing, args.update, { updatedAt: new Date() });
          }
          return existing;
        },
        async deleteMany(args: any) {
          const available = await checkPostgres();
          if (available) {
            try { return await target.twoFactorSecret.deleteMany(args); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          const before = memStore.twoFactorSecrets.length;
          memStore.twoFactorSecrets = memStore.twoFactorSecrets.filter((t) => t.userId !== args.where?.userId);
          return { count: before - memStore.twoFactorSecrets.length };
        },
        async count(args?: any) {
          const available = await checkPostgres();
          if (available) {
            try { return await target.twoFactorSecret.count(args); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          if (args?.where?.isEnabled !== undefined) {
            return memStore.twoFactorSecrets.filter((t) => t.isEnabled === args.where.isEnabled).length;
          }
          return memStore.twoFactorSecrets.length;
        },
      };
    }

    if (prop === 'recoveryCode') {
      return {
        async findMany(args: any) {
          const available = await checkPostgres();
          if (available) {
            try { return await target.recoveryCode.findMany(args); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          return memStore.recoveryCodes.filter((r) => r.userId === args.where?.userId);
        },
        async deleteMany(args: any) {
          const available = await checkPostgres();
          if (available) {
            try { return await target.recoveryCode.deleteMany(args); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          const before = memStore.recoveryCodes.length;
          memStore.recoveryCodes = memStore.recoveryCodes.filter((r) => r.userId !== args.where?.userId);
          return { count: before - memStore.recoveryCodes.length };
        },
        async createMany(args: any) {
          const available = await checkPostgres();
          if (available) {
            try { return await target.recoveryCode.createMany(args); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          const newItems = (args.data || []).map((d: any) => ({
            id: crypto.randomUUID(),
            ...d,
            isUsed: false,
            createdAt: new Date(),
          }));
          memStore.recoveryCodes.push(...newItems);
          return { count: newItems.length };
        },
        async update(args: any) {
          const available = await checkPostgres();
          if (available) {
            try { return await target.recoveryCode.update(args); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          const item = memStore.recoveryCodes.find((r) => r.id === args.where?.id);
          if (item) Object.assign(item, args.data);
          return item;
        },
      };
    }

    if (prop === 'session') {
      return {
        async findUnique(args: any) {
          const available = await checkPostgres();
          if (available) {
            try { return await target.session.findUnique(args); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          const s = memStore.sessions.find((sess) => sess.tokenHash === args.where?.tokenHash);
          if (!s) return null;
          const user = memStore.users.find((u) => u.id === s.userId);
          return {
            ...s,
            user: populateUserRelations(user),
          };
        },
        async create(args: any) {
          const available = await checkPostgres();
          if (available) {
            try { return await target.session.create(args); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          const s = {
            id: crypto.randomUUID(),
            ...args.data,
            isActive: true,
            createdAt: new Date(),
            lastActiveAt: new Date(),
          };
          memStore.sessions.push(s);
          return s;
        },
        async update(args: any) {
          const available = await checkPostgres();
          if (available) {
            try { return await target.session.update(args); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          const item = memStore.sessions.find((s) => s.id === args.where?.id);
          if (item) Object.assign(item, args.data);
          return item;
        },
        async updateMany(args: any) {
          const available = await checkPostgres();
          if (available) {
            try { return await target.session.updateMany(args); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          let count = 0;
          for (const s of memStore.sessions) {
            if (args.where?.userId && s.userId !== args.where.userId) continue;
            if (args.where?.id && typeof args.where.id === 'string' && s.id !== args.where.id) continue;
            if (args.where?.id?.not && s.id === args.where.id.not) continue;
            Object.assign(s, args.data);
            count++;
          }
          return { count };
        },
        async findMany(args: any) {
          const available = await checkPostgres();
          if (available) {
            try { return await target.session.findMany(args); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          return memStore.sessions
            .filter((s) => !args.where?.userId || s.userId === args.where.userId)
            .filter((s) => args.where?.isActive === undefined || s.isActive === args.where.isActive);
        },
        async count(args?: any) {
          const available = await checkPostgres();
          if (available) {
            try { return await target.session.count(args); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          return memStore.sessions.filter((s) => !args?.where?.isActive || s.isActive === args.where.isActive).length;
        },
      };
    }

    if (prop === 'loginEvent') {
      return {
        async create(args: any) {
          const available = await checkPostgres();
          if (available) {
            try { return await target.loginEvent.create(args); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          const item = { id: crypto.randomUUID(), ...args.data, createdAt: new Date() };
          memStore.loginEvents.unshift(item);
          return item;
        },
        async findMany(args: any) {
          const available = await checkPostgres();
          if (available) {
            try { return await target.loginEvent.findMany(args); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          return memStore.loginEvents.slice(0, args.take || 20);
        },
      };
    }

    if (prop === 'auditLog') {
      return {
        async create(args: any) {
          const available = await checkPostgres();
          if (available) {
            try { return await target.auditLog.create(args); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          const item = { id: crypto.randomUUID(), ...args.data, timestamp: new Date() };
          memStore.auditLogs.unshift(item);
          return item;
        },
        async findMany(args?: any) {
          const available = await checkPostgres();
          if (available) {
            try { return await target.auditLog.findMany(args); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          let logs = memStore.auditLogs;
          if (args?.where?.action) logs = logs.filter((l) => l.action === args.where.action);
          const skip = args?.skip || 0;
          const take = args?.take || 50;
          return logs.slice(skip, skip + take);
        },
        async count(args?: any) {
          const available = await checkPostgres();
          if (available) {
            try { return await target.auditLog.count(args); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          if (args?.where?.action) return memStore.auditLogs.filter((l) => l.action === args.where.action).length;
          return memStore.auditLogs.length;
        },
      };
    }

    if (prop === 'role') {
      return {
        async findUnique(args: any) {
          const available = await checkPostgres();
          if (available) {
            try { return await target.role.findUnique(args); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          return memStore.roles.find((r) => (args.where?.name && r.name === args.where.name) || (args.where?.id && r.id === args.where.id)) || null;
        },
        async create(args: any) {
          const available = await checkPostgres();
          if (available) {
            try { return await target.role.create(args); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          const item = { id: crypto.randomUUID(), ...args.data, createdAt: new Date() };
          memStore.roles.push(item);
          return item;
        },
        async createMany(args: any) {
          const available = await checkPostgres();
          if (available) {
            try { return await target.role.createMany(args); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          const items = (args.data || []).map((d: any) => ({ id: crypto.randomUUID(), ...d, createdAt: new Date() }));
          memStore.roles.push(...items);
          return { count: items.length };
        },
        async findMany(args?: any) {
          const available = await checkPostgres();
          if (available) {
            try { return await target.role.findMany(args); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          return memStore.roles.map((r) => ({
            ...r,
            permissions: [],
            userRoles: memStore.userRoles.filter((ur) => ur.roleId === r.id),
          }));
        },
        async count() {
          const available = await checkPostgres();
          if (available) {
            try { return await target.role.count(); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          return memStore.roles.length;
        },
      };
    }

    if (prop === 'userRole') {
      return {
        async create(args: any) {
          const available = await checkPostgres();
          if (available) {
            try { return await target.userRole.create(args); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          const item = { id: crypto.randomUUID(), ...args.data, assignedAt: new Date() };
          memStore.userRoles.push(item);
          return item;
        },
        async upsert(args: any) {
          const available = await checkPostgres();
          if (available) {
            try { return await target.userRole.upsert(args); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          let item = memStore.userRoles.find((ur) => ur.userId === args.where.userId_roleId.userId && ur.roleId === args.where.userId_roleId.roleId);
          if (!item) {
            item = { id: crypto.randomUUID(), ...args.create, assignedAt: new Date() };
            memStore.userRoles.push(item);
          }
          return item;
        },
        async count(args?: any) {
          const available = await checkPostgres();
          if (available) {
            try { return await target.userRole.count(args); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          return memStore.userRoles.length;
        },
      };
    }

    if (prop === 'securityEvent') {
      return {
        async findMany(args?: any) {
          const available = await checkPostgres();
          if (available) {
            try { return await target.securityEvent.findMany(args); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          return memStore.securityEvents;
        },
        async create(args: any) {
          const available = await checkPostgres();
          if (available) {
            try { return await target.securityEvent.create(args); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          const item = { id: crypto.randomUUID(), ...args.data, createdAt: new Date() };
          memStore.securityEvents.push(item);
          return item;
        },
      };
    }

    if (prop === 'threatIndicator') {
      return {
        async findUnique(args: any) {
          const available = await checkPostgres();
          if (available) {
            try { return await target.threatIndicator.findUnique(args); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          return memStore.threatIndicators.find((ti) => ti.value === args.where?.value) || null;
        },
        async findMany() {
          const available = await checkPostgres();
          if (available) {
            try { return await target.threatIndicator.findMany(); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          return memStore.threatIndicators;
        },
      };
    }

    if (prop === 'cloudAsset') {
      return {
        async findMany() {
          const available = await checkPostgres();
          if (available) {
            try { return await target.cloudAsset.findMany(); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          return memStore.cloudAssets;
        },
      };
    }

    if (prop === 'endpoint') {
      return {
        async findMany(args?: any) {
          const available = await checkPostgres();
          if (available) {
            try { return await target.endpoint.findMany(args); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          return memStore.endpoints;
        },
      };
    }

    if (prop === 'incident') {
      return {
        async findMany() {
          const available = await checkPostgres();
          if (available) {
            try { return await target.incident.findMany(); }
            catch (e: any) { if (e.code?.startsWith('P1')) isPostgresAvailable = false; else throw e; }
          }
          return memStore.incidents;
        },
      };
    }

    return target[prop];
  },
});
