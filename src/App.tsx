import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Toaster } from 'react-hot-toast';

// Layouts
import { DashboardLayout } from './layouts';

// Pages
import { LandingPage } from './pages/Landing';
import { RegisterPage } from './pages/Register';
import { LoginPage } from './pages/Login';
import { TwoFAPage } from './pages/TwoFA';
import { DashboardPage } from './pages/Dashboard';
import { AnalyticsPage } from './pages/Analytics';
import { HistoryPage } from './pages/History';
import { ReportsPage } from './pages/Reports';
import { ProfilePage } from './pages/Profile';
import { SettingsPage } from './pages/Settings';
import { HelpPage } from './pages/Help';

// Tools

import { IPInfoPage } from './pages/tools/IpInfo';
import { URLSafetyPage } from './pages/tools/UrlSafety';
import { PhishingDetectorPage } from './pages/tools/PhishingDetector';
import { FirewallSimPage } from './pages/tools/FirewallSim';
import { MalwareScannerPage } from './pages/tools/MalwareScanner';


// Protected Route
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/two-fa" element={<TwoFAPage />} />
      <Route path="/forgot-password" element={<LoginPage />} />

      {/* Protected Dashboard */}
      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="help" element={<HelpPage />} />

        {/* Tools */}

        <Route path="tools/ip-information" element={<IPInfoPage />} />
        <Route path="tools/url-safety" element={<URLSafetyPage />} />
        <Route path="tools/phishing-detector" element={<PhishingDetectorPage />} />
        <Route path="tools/firewall" element={<FirewallSimPage />} />
        <Route path="tools/malware-scanner" element={<MalwareScannerPage />} />

      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/cyberguard-security-lab101">
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0d1b2e',
              color: '#e2e8f0',
              border: '1px solid rgba(0, 245, 255, 0.2)',
              borderRadius: 8,
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
