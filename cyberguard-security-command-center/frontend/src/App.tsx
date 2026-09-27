import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';

// Public Auth & Landing Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { Verify2FAPage } from './pages/auth/Verify2FAPage';
import { Setup2FAPage } from './pages/auth/Setup2FAPage';

// Protected SOC & Tool Pages
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { EdrPage } from './pages/dashboard/EdrPage';
import { SiemPage } from './pages/dashboard/SiemPage';
import { ZeroTrustPage } from './pages/dashboard/ZeroTrustPage';
import { CloudSecurityPage } from './pages/dashboard/CloudSecurityPage';
import { IamPage } from './pages/dashboard/IamPage';
import { ThreatIntelPage } from './pages/dashboard/ThreatIntelPage';
import { ReportsPage } from './pages/dashboard/ReportsPage';
import { AuditLogsPage } from './pages/dashboard/AuditLogsPage';
import { SettingsPage } from './pages/dashboard/SettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <Routes>
          {/* Public Landing & Marketing */}
          <Route path="/" element={<LandingPage />} />

          {/* Authentication & 2FA Flow */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-2fa" element={<Verify2FAPage />} />
          <Route path="/setup-2fa" element={<Setup2FAPage />} />

          {/* Authenticated SOC Command Center & Tools */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tools/edr-xdr" element={<EdrPage />} />
            <Route path="/tools/ai-soc-siem" element={<SiemPage />} />
            <Route path="/tools/zero-trust" element={<ZeroTrustPage />} />
            <Route path="/tools/cloud-security" element={<CloudSecurityPage />} />
            <Route path="/tools/iam" element={<IamPage />} />
            <Route path="/tools/threat-intelligence" element={<ThreatIntelPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
