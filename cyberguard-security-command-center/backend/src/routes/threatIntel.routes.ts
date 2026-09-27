import { Router, Response } from 'express';
import { z } from 'zod';
import { ThreatIntelService } from '../services/threatIntel.service.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';

export const threatIntelRouter = Router();

threatIntelRouter.use(authenticate);

/**
 * GET /api/threat-intel/status
 */
threatIntelRouter.get('/status', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const hasExternalKey = !!(process.env.VIRUSTOTAL_API_KEY || process.env.ABUSEIPDB_API_KEY);

  res.json({
    status: hasExternalKey ? 'ACTIVE' : 'NOT CONFIGURED',
    statusLabel: hasExternalKey ? 'LIVE INTELLIGENCE FEEDS' : 'THREAT INTELLIGENCE PROVIDER NOT CONFIGURED',
    message: hasExternalKey 
      ? 'Connected to upstream threat feeds.' 
      : 'THREAT INTELLIGENCE PROVIDER NOT CONFIGURED. To enable live reputation scores, configure VIRUSTOTAL_API_KEY or ABUSEIPDB_API_KEY in backend environment.',
    supportedProtocols: ['STIX/TAXII 2.1', 'MISP Open Source Feed', 'VirusTotal v3 REST', 'AbuseIPDB APIv2'],
    defensiveCapabilities: [
      'Hash file signature verification (SHA-256 / SHA-1 / MD5)',
      'Autonomous system number (ASN) and IP reputation correlation',
      'Domain DGA (Domain Generation Algorithm) anomaly heuristics',
      'Malicious URI path defensive pattern matching',
    ],
  });
});

/**
 * POST /api/threat-intel/lookup
 * Defensive lookup of IOC string
 */
const lookupSchema = z.object({
  query: z.string().min(2).max(512),
});

threatIntelRouter.post('/lookup', validateBody(lookupSchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { query } = req.body;
  const result = await ThreatIntelService.lookupIoc(query);
  res.json(result);
});
