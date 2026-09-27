export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  roles: string[];
}

export interface PasswordAnalysis {
  isValid: boolean;
  score: number;
  level: 'EASY' | 'NORMAL' | 'MEDIUM' | 'OK' | 'SATISFIED' | 'GOOD' | 'EXCELLENT';
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
    notCommon: boolean;
    noRepeatedPatterns: boolean;
  };
  feedback: string[];
}

export interface CaptchaResponse {
  svg: string;
  challengeToken: string;
}

export interface Setup2FAResponse {
  secret: string;
  otpauthUrl: string;
  qrDataUrl: string;
  recoveryCodes: string[];
  message: string;
}

export interface ActiveSession {
  id: string;
  ipAddress: string;
  userAgent: string;
  deviceType: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

export interface EndpointData {
  id: string;
  hostname: string;
  ipAddress: string;
  os: string;
  agentVersion: string;
  status: 'PROTECTED' | 'MONITORING' | 'AT_RISK' | 'CRITICAL' | 'OFFLINE';
  riskScore: number;
  lastSeenAt: string;
  criticalAlertsCount: number;
  isSimulated: boolean;
  suspiciousProcesses?: Array<{
    pid: number;
    name: string;
    cmd: string;
    parentPid: number;
    user: string;
    status: string;
  }>;
}

export interface SiemEvent {
  id: string;
  eventType: string;
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source: string;
  description: string;
  mitreTechnique: string;
  isSimulated: boolean;
  createdAt: string;
  status: string;
  ip: string;
}

export interface CopilotAnalysisResult {
  eventId: string;
  dataMode: 'SIMULATION' | 'LIVE DATA';
  disclaimer: string;
  executiveSummary: string;
  containmentSteps: string[];
  eradicationSteps: string[];
  recoverySteps: string[];
  mitreAttAndCk: {
    technique: string;
    tactic: string;
  };
}

export interface CloudAssetData {
  id: string;
  provider: 'AWS' | 'AZURE' | 'GCP';
  assetType: string;
  assetName: string;
  resourceId: string;
  region: string;
  complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT';
  encryptionStatus: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  publiclyAccessible: boolean;
  issue: string;
}

export interface AuditLogItem {
  id: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  ipAddress: string;
  userAgent: string;
  details?: string;
  timestamp: string;
}

export interface IocLookupResult {
  query: string;
  type: 'IP' | 'DOMAIN' | 'URL' | 'HASH' | 'UNKNOWN';
  providerStatus: 'CONFIGURED' | 'NOT_CONFIGURED';
  statusMessage: string;
  foundInLocalFeed: boolean;
  indicator?: {
    value: string;
    threatCategory: string;
    confidenceScore: number;
    reputationStatus: string;
    sourceFeed: string;
    firstSeen: string;
    lastSeen: string;
  };
  defensiveRecommendations: string[];
}
