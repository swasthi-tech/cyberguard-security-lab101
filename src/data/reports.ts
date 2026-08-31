import type { Report } from '../types';

export const reports: Report[] = [
  {
    id: 'RPT-2026-001',
    scanDate: '2026-08-30',
    tool: 'Website Scanner',
    target: 'https://example.com',
    securityScore: 72,
    riskLevel: 'MEDIUM',
    findings: [
      'Missing Content-Security-Policy header',
      'X-Frame-Options not set',
      'Weak TLS configuration detected',
      'Cookie without HttpOnly flag',
    ],
    recommendations: [
      'Add Content-Security-Policy header to prevent XSS attacks',
      'Set X-Frame-Options: DENY to prevent clickjacking',
      'Upgrade to TLS 1.3 for stronger encryption',
      'Enable HttpOnly flag on all cookies',
    ],
  },
  {
    id: 'RPT-2026-002',
    scanDate: '2026-08-30',
    tool: 'Port Scanner',
    target: 'demo-server.local',
    securityScore: 85,
    riskLevel: 'LOW',
    findings: [
      'Port 22 (SSH) open — verify access is restricted',
      'Port 3306 (MySQL) open — database exposure risk',
    ],
    recommendations: [
      'Restrict SSH access to specific IP addresses',
      'Move MySQL behind a firewall, do not expose publicly',
    ],
  },
  {
    id: 'RPT-2026-003',
    scanDate: '2026-08-29',
    tool: 'Phishing Detector',
    target: 'http://paypa1-secure.com',
    securityScore: 12,
    riskLevel: 'HIGH',
    findings: [
      'Domain closely resembles paypal.com (typosquatting)',
      'No valid HTTPS certificate',
      'Contains suspicious login form',
      'Redirects to unrelated domain',
    ],
    recommendations: [
      'Avoid visiting this website',
      'Report to Google Safe Browsing',
      'Warn organization members',
    ],
  },
];
