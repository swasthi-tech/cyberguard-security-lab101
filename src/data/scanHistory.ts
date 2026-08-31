import type { ScanHistoryEntry } from '../types';

export const scanHistory: ScanHistoryEntry[] = [
  { id: 'SCN-001', date: '2026-08-30 21:45', tool: 'Port Scanner', target: 'example.com', result: '12 open ports', risk: 'MEDIUM', duration: '3.2s' },
  { id: 'SCN-002', date: '2026-08-30 21:32', tool: 'URL Safety', target: 'https://secure-bank.com', result: 'SAFE', risk: 'LOW', duration: '0.8s' },
  { id: 'SCN-003', date: '2026-08-30 20:15', tool: 'IP Information', target: '8.8.8.8', result: 'Google DNS', risk: 'LOW', duration: '1.1s' },
  { id: 'SCN-004', date: '2026-08-30 19:55', tool: 'Phishing Detector', target: 'http://paypa1.com', result: 'HIGH RISK', risk: 'HIGH', duration: '2.1s' },
  { id: 'SCN-005', date: '2026-08-30 18:30', tool: 'Malware Scanner', target: 'document.pdf', result: 'CLEAN', risk: 'LOW', duration: '5.4s' },
  { id: 'SCN-006', date: '2026-08-30 17:22', tool: 'Website Scanner', target: 'https://mysite.dev', result: 'Grade: B', risk: 'MEDIUM', duration: '8.7s' },
  { id: 'SCN-007', date: '2026-08-30 16:00', tool: 'Firewall Sim', target: 'Internal Network', result: '45 blocked', risk: 'MEDIUM', duration: '60s' },
  { id: 'SCN-008', date: '2026-08-29 22:10', tool: 'URL Safety', target: 'http://malicious.xyz', result: 'DANGEROUS', risk: 'CRITICAL', duration: '1.3s' },
  { id: 'SCN-009', date: '2026-08-29 20:05', tool: 'Port Scanner', target: '192.168.1.1', result: '4 open ports', risk: 'LOW', duration: '2.8s' },
  { id: 'SCN-010', date: '2026-08-29 15:45', tool: 'IP Information', target: '1.1.1.1', result: 'Cloudflare DNS', risk: 'LOW', duration: '0.9s' },
  { id: 'SCN-011', date: '2026-08-28 11:30', tool: 'Phishing Detector', target: 'https://google.com', result: 'LOW RISK', risk: 'LOW', duration: '1.9s' },
  { id: 'SCN-012', date: '2026-08-28 09:00', tool: 'Website Scanner', target: 'https://github.com', result: 'Grade: A+', risk: 'LOW', duration: '7.2s' },
];
