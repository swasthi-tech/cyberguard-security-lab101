import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { AuditService } from '../services/audit.service.js';

export const edrRouter = Router();

edrRouter.use(authenticate);

// Educational simulation sandbox fixtures
const SIMULATED_ENDPOINTS = [
  {
    id: 'sim-ep-01',
    hostname: 'SEC-HQ-WIN11-042',
    ipAddress: '10.240.12.84',
    os: 'Windows 11 Enterprise (23H2)',
    agentVersion: 'v4.18.2-defensive',
    status: 'CRITICAL',
    riskScore: 89,
    lastSeenAt: new Date().toISOString(),
    criticalAlertsCount: 3,
    isSimulated: true,
    suspiciousProcesses: [
      { pid: 4892, name: 'powershell.exe', cmd: 'powershell -enc JABhID0...', parentPid: 1024, user: 'SYSTEM', status: 'FLAGGED' },
      { pid: 5120, name: 'rundll32.exe', cmd: 'rundll32.exe C:\\temp\\svc.dll,Entry', parentPid: 4892, user: 'SYSTEM', status: 'BLOCKED' },
    ],
  },
  {
    id: 'sim-ep-02',
    hostname: 'PROD-K8S-NODE-03',
    ipAddress: '10.240.45.19',
    os: 'Ubuntu 22.04 LTS (Kernel 5.15)',
    agentVersion: 'v4.18.2-defensive',
    status: 'AT_RISK',
    riskScore: 62,
    lastSeenAt: new Date().toISOString(),
    criticalAlertsCount: 1,
    isSimulated: true,
    suspiciousProcesses: [
      { pid: 14209, name: 'curl', cmd: 'curl -s http://169.254.169.254/latest/meta-data/', parentPid: 840, user: 'www-data', status: 'INSPECTED' },
    ],
  },
  {
    id: 'sim-ep-03',
    hostname: 'FINANCE-MACBOOK-09',
    ipAddress: '10.240.88.112',
    os: 'macOS Sonoma 14.5 (ARM64)',
    agentVersion: 'v4.18.1-defensive',
    status: 'PROTECTED',
    riskScore: 12,
    lastSeenAt: new Date().toISOString(),
    criticalAlertsCount: 0,
    isSimulated: true,
    suspiciousProcesses: [],
  },
  {
    id: 'sim-ep-04',
    hostname: 'DEV-SRV-POSTGRES-01',
    ipAddress: '10.240.60.15',
    os: 'Red Hat Enterprise Linux 9.2',
    agentVersion: 'v4.18.2-defensive',
    status: 'MONITORING',
    riskScore: 24,
    lastSeenAt: new Date().toISOString(),
    criticalAlertsCount: 0,
    isSimulated: true,
    suspiciousProcesses: [],
  },
];

/**
 * GET /api/edr/telemetry
 */
edrRouter.get('/telemetry', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const mode = req.query.mode as string;
  const isSimulation = mode === 'simulation';

  // Check live endpoints in database
  let liveEndpoints: any[] = [];
  try {
    liveEndpoints = await prisma.endpoint.findMany({
      where: { isSimulated: false },
      orderBy: { riskScore: 'desc' },
    });
  } catch {
    // Database might not have live endpoints yet
  }

  const liveConnected = liveEndpoints.length > 0;

  if (!liveConnected && !isSimulation) {
    res.json({
      telemetryConnected: false,
      statusLabel: 'NOT CONNECTED',
      statusMessage: 'Endpoint telemetry service not connected',
      endpoints: [],
      metrics: {
        totalEndpoints: 0,
        onlineEndpoints: 0,
        offlineEndpoints: 0,
        criticalAlerts: 0,
        protectedEndpoints: 0,
      },
      supportedIntegrations: ['CrowdStrike Falcon API', 'Microsoft Defender for Endpoint', 'SentinelOne', 'Wazuh EDR Agent'],
    });
    return;
  }

  const endpoints = isSimulation ? SIMULATED_ENDPOINTS : liveEndpoints;

  const totalEndpoints = endpoints.length;
  const onlineEndpoints = endpoints.filter((e) => e.status !== 'OFFLINE').length;
  const offlineEndpoints = endpoints.filter((e) => e.status === 'OFFLINE').length;
  const criticalAlerts = endpoints.reduce((acc, e) => acc + (e.criticalAlertsCount || 0), 0);
  const protectedEndpoints = endpoints.filter((e) => e.status === 'PROTECTED').length;

  res.json({
    telemetryConnected: liveConnected,
    isSimulation,
    statusLabel: isSimulation ? 'SIMULATION MODE' : 'LIVE',
    statusMessage: isSimulation 
      ? 'Running in Educational Sandbox Simulation Mode. Telemetry is synthetically simulated for training.'
      : 'Live Endpoint Telemetry Stream Connected',
    endpoints,
    metrics: {
      totalEndpoints,
      onlineEndpoints,
      offlineEndpoints,
      criticalAlerts,
      protectedEndpoints,
    },
  });
});

/**
 * POST /api/edr/isolate
 * Simulates host network isolation containment action
 */
edrRouter.post('/isolate', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { endpointId, hostname } = req.body;

  await AuditService.log({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    action: 'EDR_HOST_ISOLATE_TRIGGERED',
    entityType: 'Endpoint',
    entityId: endpointId || hostname,
    ipAddress: req.ip || '127.0.0.1',
    userAgent: req.headers['user-agent'] || 'Unknown',
    details: { endpointId, hostname, action: 'NETWORK_ISOLATION' },
  });

  res.json({
    success: true,
    message: `Host isolation request queued for ${hostname || endpointId}. Egress firewall rules applied to defensive containment policy.`,
  });
});
