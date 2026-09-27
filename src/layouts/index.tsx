import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, DashboardHeader } from '../components/layout/Sidebar';
import { CyberBackground } from '../components/security';

export function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#020817] overflow-hidden relative">
      <CyberBackground />

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-shrink-0 relative z-20">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative z-10 h-full">
            <Sidebar mobile onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden relative z-10">
        <DashboardHeader onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#020817] relative flex items-center justify-center px-4 py-8">
      <CyberBackground />
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}
