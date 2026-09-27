import {
  User,
  PasswordAnalysis,
  CaptchaResponse,
  Setup2FAResponse,
  ActiveSession,
  EndpointData,
  SiemEvent,
  CopilotAnalysisResult,
  CloudAssetData,
  AuditLogItem,
  IocLookupResult,
} from './types';

const isProduction = import.meta.env.PROD;
const DEFAULT_ONLINE_API = 'https://cyberguard-backend-q4vd.onrender.com';
const envApiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;

// Ensure localhost is NEVER used in the production build
let rawApiUrl = envApiUrl;
if (!rawApiUrl || (isProduction && (rawApiUrl.includes('localhost') || rawApiUrl.includes('127.0.0.1')))) {
  rawApiUrl = isProduction ? DEFAULT_ONLINE_API : 'http://localhost:3000';
}

export const API_BASE = (rawApiUrl as string).replace(/\/$/, '');

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const savedToken = typeof localStorage !== 'undefined' ? localStorage.getItem('cyberguard_token') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(savedToken ? { 'Authorization': `Bearer ${savedToken}` } : {}),
    ...(options.headers || {}),
  };

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Ensures HttpOnly cookies are passed
    });
  } catch (_err) {
    throw new Error('Unable to connect to authentication server');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 502 || response.status === 503 || response.status === 504) {
      throw new Error('Unable to connect to authentication server');
    }
    if (response.status === 401) {
      const serverMsg = data?.error || data?.message;
      if (serverMsg && serverMsg.toLowerCase().includes('deactivated')) {
        throw new Error(serverMsg);
      }
      throw new Error('Invalid email or password');
    }
    const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  auth: {
    getCaptcha: () => request<CaptchaResponse>('/api/auth/captcha'),
    checkPasswordStrength: (password: string) =>
      request<PasswordAnalysis>('/api/auth/password-strength', {
        method: 'POST',
        body: JSON.stringify({ password }),
      }),
    register: (body: any) =>
      request<{ message: string; user: User }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    login: async (body: any) => {
      const res = await request<{
        message: string;
        token?: string;
        user?: User;
        require2FA?: boolean;
        tempToken?: string;
      }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (res.token && typeof localStorage !== 'undefined') {
        localStorage.setItem('cyberguard_token', res.token);
      }
      return res;
    },
    verify2FA: async (body: { tempToken: string; code: string }) => {
      const res = await request<{ message: string; token: string; user: User }>('/api/auth/verify-2fa', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (res.token && typeof localStorage !== 'undefined') {
        localStorage.setItem('cyberguard_token', res.token);
      }
      return res;
    },
    setup2FA: () => request<Setup2FAResponse>('/api/auth/setup-2fa', { method: 'POST' }),
    confirm2FA: (code: string) =>
      request<{ message: string; twoFactorEnabled: boolean }>('/api/auth/confirm-2fa', {
        method: 'POST',
        body: JSON.stringify({ code }),
      }),
    disable2FA: (password: string) =>
      request<{ message: string }>('/api/auth/disable-2fa', {
        method: 'POST',
        body: JSON.stringify({ password }),
      }),
    logout: async () => {
      try {
        await request<{ message: string }>('/api/auth/logout', { method: 'POST' });
      } finally {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('cyberguard_token');
        }
      }
    },
    getMe: () => request<{ user: User }>('/api/auth/me'),
  },

  users: {
    getProfile: () =>
      request<{
        user: User;
        securityStatus: 'SECURE' | 'WARNING' | 'ACTION REQUIRED';
        recommendations: string[];
        activeSessionCount: number;
      }>('/api/users/profile'),
    changePassword: (body: any) =>
      request<{ message: string }>('/api/users/change-password', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    getSessions: () => request<{ sessions: ActiveSession[] }>('/api/users/sessions'),
    revokeSession: (id: string) =>
      request<{ message: string }>(`/api/users/sessions/${id}`, { method: 'DELETE' }),
    revokeOtherSessions: () =>
      request<{ message: string }>('/api/users/sessions/revoke-others', { method: 'POST' }),
    getLoginHistory: () => request<{ history: any[] }>('/api/users/login-history'),
    rotateRecoveryCodes: () =>
      request<{ message: string; recoveryCodes: string[] }>('/api/users/rotate-recovery-codes', {
        method: 'POST',
      }),
  },

  iam: {
    getOverview: () =>
      request<{
        totalUsers: number;
        totalRoles: number;
        usersWith2FA: number;
        mfaCoveragePercent: number;
        privilegedUsers: number;
        activeSessions: number;
      }>('/api/iam/overview'),
    getUsers: () => request<{ users: any[] }>('/api/iam/users'),
    getRoles: () => request<{ roles: any[] }>('/api/iam/roles'),
    assignRole: (userId: string, roleName: string) =>
      request<{ message: string }>('/api/iam/assign-role', {
        method: 'POST',
        body: JSON.stringify({ userId, roleName }),
      }),
  },

  edr: {
    getTelemetry: (mode?: string) =>
      request<{
        telemetryConnected: boolean;
        isSimulation?: boolean;
        statusLabel: string;
        statusMessage: string;
        endpoints: EndpointData[];
        metrics: {
          totalEndpoints: number;
          onlineEndpoints: number;
          offlineEndpoints: number;
          criticalAlerts: number;
          protectedEndpoints: number;
        };
        supportedIntegrations?: string[];
      }>(`/api/edr/telemetry${mode ? `?mode=${mode}` : ''}`),
    isolateEndpoint: (endpointId: string, hostname: string) =>
      request<{ success: boolean; message: string }>('/api/edr/isolate', {
        method: 'POST',
        body: JSON.stringify({ endpointId, hostname }),
      }),
  },

  siem: {
    getEvents: (mode?: string) =>
      request<{
        telemetryState: string;
        statusMessage: string;
        events: SiemEvent[];
        stats: {
          total: number;
          critical: number;
          high: number;
          medium: number;
          low: number;
          info: number;
        };
      }>(`/api/siem/events${mode ? `?mode=${mode}` : ''}`),
    requestCopilotAnalysis: (body: any) =>
      request<{ copilotAnalysis: CopilotAnalysisResult }>('/api/siem/copilot-analysis', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },

  zeroTrust: {
    getStatus: () =>
      request<{
        engineStatus: string;
        isSimulation: boolean;
        policyEngineMode: string;
        architecturePipeline: Array<{ step: number; name: string; description: string }>;
        activePolicies: Array<{ id: string; name: string; condition: string; action: string }>;
      }>('/api/zero-trust/status'),
    simulatePolicy: (body: any) =>
      request<{
        simulationLabel: string;
        inputs: any;
        decision: 'ACCESS ALLOWED' | 'CHALLENGE REQUIRED' | 'ACCESS DENIED';
        colorCode: string;
        appliedRules: string[];
        riskFactors: string[];
        calculatedTrustConfidence: number;
      }>('/api/zero-trust/simulate-policy', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },

  cloud: {
    getPosture: (mode?: string) =>
      request<{
        connected: boolean;
        isSimulation?: boolean;
        statusLabel: string;
        statusMessage: string;
        score?: number;
        metrics?: {
          totalAssets: number;
          misconfigurations: number;
          highRisks: number;
          publiclyExposed: number;
          encryptedAssets: number;
        };
        assets: CloudAssetData[];
        providers?: Array<{ name: string; connected: boolean; authMethod: string }>;
        complianceFrameworks?: Array<{ name: string; status: string }>;
        securityNotes?: string[];
      }>(`/api/cloud/posture${mode ? `?mode=${mode}` : ''}`),
  },

  threatIntel: {
    getStatus: () =>
      request<{
        status: string;
        statusLabel: string;
        message: string;
        supportedProtocols: string[];
        defensiveCapabilities: string[];
      }>('/api/threat-intel/status'),
    lookup: (query: string) =>
      request<IocLookupResult>('/api/threat-intel/lookup', {
        method: 'POST',
        body: JSON.stringify({ query }),
      }),
  },

  audit: {
    getLogs: (page = 1, action = 'ALL') =>
      request<{
        logs: AuditLogItem[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
      }>(`/api/audit/logs?page=${page}&action=${action}`),
  },
};
