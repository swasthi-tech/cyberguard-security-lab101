import React, { useState } from 'react';
import { Menu, Bell, Shield, User as UserIcon, LogOut, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { useNavigate } from 'react-router-dom';

interface TopbarProps {
  onToggleSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = [
    { id: 1, title: 'Session Verified via MFA', time: '10m ago', type: 'info' },
    { id: 2, title: 'Firewall Egress Rule Updated', time: '1h ago', type: 'info' },
    { id: 3, title: 'EDR Policy Active: Containment Mode', time: '3h ago', type: 'warning' },
  ];

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  const isMfaActive = user?.twoFactorEnabled;

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#040816]/90 backdrop-blur-md border-b border-cyan-500/20 px-4 sm:px-6 flex items-center justify-between">
      {/* Mobile Menu Toggle & System Indicator */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* System Status */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900/80 border border-slate-700/80 font-mono text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-medium">DEFENSE CORE:</span>
          <span className="text-emerald-400 font-bold">OPERATIONAL</span>
        </div>
      </div>

      {/* Right Controls: Security Status, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Security Status Badge */}
        <StatusBadge
          status={isMfaActive ? 'SECURE' : 'ACTION REQUIRED'}
          size="sm"
        />

        {/* Current Session Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950/40 border border-cyan-500/30 text-[11px] font-mono text-cyan-300">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span>SESSION: ACTIVE</span>
        </div>

        {/* Notification Center */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 transition-colors relative"
            title="Notification Center"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-[#091129] border border-cyan-500/30 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.6)] p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700 text-xs font-mono text-cyan-400 font-bold">
                <span>SECURITY NOTIFICATIONS</span>
                <span className="text-[10px] text-slate-400">3 UNREAD</span>
              </div>
              <div className="divide-y divide-slate-800 mt-2">
                {notifications.map((n) => (
                  <div key={n.id} className="py-2 text-xs">
                    <p className="text-slate-200 font-medium">{n.title}</p>
                    <span className="text-[10px] font-mono text-slate-500">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800/60 transition-all border border-transparent hover:border-cyan-500/30"
          >
            <div className="w-7 h-7 rounded bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center font-bold text-xs text-white">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="hidden sm:block text-left text-xs font-mono">
              <div className="text-slate-200 font-semibold truncate max-w-[120px]">
                {user?.username || 'Operator'}
              </div>
              <div className="text-[10px] text-cyan-400 truncate">
                {user?.roles?.[0] || 'ANALYST'}
              </div>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#091129] border border-cyan-500/30 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.6)] p-2 z-50 text-xs font-mono">
              <div className="px-3 py-2 border-b border-slate-800">
                <div className="text-slate-200 font-bold">{user?.fullName}</div>
                <div className="text-[11px] text-slate-400">{user?.email}</div>
              </div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/settings');
                }}
                className="w-full text-left px-3 py-2 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-300 transition-colors flex items-center gap-2 mt-1"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Security Settings & 2FA</span>
              </button>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2 rounded hover:bg-red-950/40 text-red-400 transition-colors flex items-center gap-2 mt-1 border-t border-slate-800/80"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
