// Types for CyberGuard Security Lab

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
  lastLogin: string;
  twoFAEnabled: boolean;
  securityScore: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  needsTwoFA: boolean;
}

// Password strength types
export type StrengthLevel = 'EASY' | 'NORMAL' | 'MEDIUM' | 'OK' | 'SATISFIED' | 'GOOD' | 'EXCELLENT';

export interface PasswordStrength {
  score: number;
  level: StrengthLevel;
  requirements: {
    minLength: boolean;
    hasAlpha: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

// Scan types
export type ScanStatus = 'idle' | 'scanning' | 'complete' | 'error';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'CLEAN' | 'SAFE' | 'SUSPICIOUS' | 'DANGEROUS';

export interface PortScanResult {
  port: number;
  protocol: 'TCP' | 'UDP';
  service: string;
  status: 'OPEN' | 'CLOSED' | 'FILTERED';
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface IPInfo {
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  isp: string;
  asn: string;
  organization: string;
  timezone: string;
  latitude: number;
  longitude: number;
  riskScore: number;
  reputationScore: number;
  isVPN: boolean;
  isProxy: boolean;
  isTor: boolean;
}

export interface URLSafetyResult {
  url: string;
  score: number;
  verdict: 'SAFE' | 'CAUTION' | 'SUSPICIOUS' | 'DANGEROUS';
  checks: {
    httpsEnabled: boolean;
    domainStructure: boolean;
    urlLength: boolean;
    suspiciousChars: boolean;
    suspiciousKeywords: boolean;
    redirectIndicators: boolean;
    certificateIndicator: boolean;
    reputationIndicator: boolean;
  };
}

export interface PhishingResult {
  url: string;
  probability: number;
  verdict: 'LOW RISK' | 'MEDIUM RISK' | 'HIGH RISK';
  indicators: {
    name: string;
    detected: boolean;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
  }[];
}

export interface FirewallPacket {
  id: string;
  protocol: 'TCP' | 'UDP' | 'HTTP' | 'HTTPS';
  srcIP: string;
  dstPort: number;
  action: 'ALLOW' | 'DENY';
  size: number;
  timestamp: string;
}

export interface FirewallRule {
  id: string;
  protocol: string;
  port: number;
  action: 'ALLOW' | 'DENY';
}

export interface MalwareScanResult {
  fileName: string;
  fileSize: string;
  fileType: string;
  hash: string;
  status: 'CLEAN' | 'SUSPICIOUS' | 'THREAT DETECTED';
  threats: string[];
  scanTime: number;
  signaturesChecked: number;
}

export interface WebsiteScanResult {
  url: string;
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  checks: {
    name: string;
    status: 'pass' | 'fail' | 'warn';
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
    description: string;
  }[];
}

// History & Reports
export interface ScanHistoryEntry {
  id: string;
  date: string;
  tool: string;
  target: string;
  result: string;
  risk: RiskLevel;
  duration: string;
}

export interface Report {
  id: string;
  scanDate: string;
  tool: string;
  target: string;
  securityScore: number;
  riskLevel: RiskLevel;
  findings: string[];
  recommendations: string[];
}

// Analytics
export interface DailyStat {
  day: string;
  scans: number;
  threats: number;
  safe: number;
  suspicious: number;
}

export interface DashboardStats {
  systemStatus: 'OPERATIONAL' | 'DEGRADED' | 'DOWN';
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  scansToday: number;
  threatsDetected: number;
  securityScore: number;
}
