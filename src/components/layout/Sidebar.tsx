import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Shield, LayoutDashboard, Wrench, History, FileText,
  BarChart3, User, Settings, HelpCircle, LogOut,
  ChevronLeft, ChevronRight, Network, Globe, Link2,
  Fish, Flame, Bug, Globe2, Menu, X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  children?: { label: string; icon: React.ReactNode; path: string }[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
  {
    label: 'Security Tools', icon: <Wrench size={18} />, path: '/tools',
    children: [
      { label: 'Port Scanner', icon: <Network size={15} />, path: '/tools/port-scanner' },
      { label: 'IP Information', icon: <Globe size={15} />, path: '/tools/ip-information' },
      { label: 'URL Safety', icon: <Link2 size={15} />, path: '/tools/url-safety' },
      { label: 'Phishing Detector', icon: <Fish size={15} />, path: '/tools/phishing-detector' },
      { label: 'Firewall Sim', icon: <Flame size={15} />, path: '/tools/firewall' },
      { label: 'Malware Scanner', icon: <Bug size={15} />, path: '/tools/malware-scanner' },
      { label: 'Website Scanner', icon: <Globe2 size={15} />, path: '/tools/website-scanner' },
    ],
  },
  { label: 'Scan History', icon: <History size={18} />, path: '/history' },
  { label: 'Reports', icon: <FileText size={18} />, path: '/reports' },
  { label: 'Analytics', icon: <BarChart3 size={18} />, path: '/analytics' },
  { label: 'Profile', icon: <User size={18} />, path: '/profile' },
  { label: 'Settings', icon: <Settings size={18} />, path: '/settings' },
  { label: 'Help', icon: <HelpCircle size={18} />, path: '/help' },
];

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobile = false, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(true);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`flex flex-col h-full bg-[#080e1d] border-r border-cyan-500/15 transition-all duration-300 ${
        mobile ? 'w-72' : collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-cyan-500/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <Shield size={22} className="text-cyan-400" style={{ filter: 'drop-shadow(0 0 6px rgba(0,245,255,0.7))' }} />
          </div>
          {(!collapsed || mobile) && (
            <div>
              <div className="font-cyber text-sm font-bold text-white tracking-wider leading-tight">CYBERGUARD</div>
              <div className="font-cyber text-[10px] text-cyan-400/70 tracking-widest">SECURITY LAB</div>
            </div>
          )}
        </div>
        {mobile ? (
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1"><X size={20} /></button>
        ) : (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-500 hover:text-cyan-400 transition-colors p-1"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        {navItems.map(item => {
          if (item.children) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => setToolsOpen(!toolsOpen)}
                  className={`w-full flex items-center ${collapsed && !mobile ? 'justify-center' : 'justify-between'} gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/5 transition-all duration-200 group`}
                >
                  <div className="flex items-center gap-3">
                    <span className="group-hover:drop-shadow-[0_0_4px_rgba(0,245,255,0.7)]">{item.icon}</span>
                    {(!collapsed || mobile) && <span className="font-cyber text-xs font-semibold tracking-wide">{item.label}</span>}
                  </div>
                  {(!collapsed || mobile) && (
                    <ChevronRight size={13} className={`transition-transform ${toolsOpen ? 'rotate-90' : ''}`} />
                  )}
                </button>
                {(toolsOpen || mobile) && (!collapsed || mobile) && (
                  <div className="ml-4 mt-0.5 space-y-0.5 border-l border-cyan-500/10 pl-3">
                    {item.children.map(child => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
                            isActive
                              ? 'text-cyan-400 bg-cyan-500/10'
                              : 'text-slate-500 hover:text-slate-300 hover:bg-white/3'
                          }`
                        }
                      >
                        {child.icon}
                        <span>{child.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center ${collapsed && !mobile ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg font-cyber text-xs font-semibold tracking-wide transition-all duration-200 group ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_10px_rgba(0,245,255,0.1)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/4'
                }`
              }
              title={collapsed && !mobile ? item.label : undefined}
            >
              <span className="group-hover:drop-shadow-[0_0_4px_rgba(0,245,255,0.6)] transition-all">{item.icon}</span>
              {(!collapsed || mobile) && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-cyan-500/10 p-3 space-y-2">
        {(!collapsed || mobile) && user && (
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-cyber font-bold text-white">
              {user.fullName.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-semibold text-white">{user.fullName}</p>
              <p className="text-[10px] text-slate-500">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${collapsed && !mobile ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 font-cyber text-xs font-semibold tracking-wide transition-all duration-200`}
        >
          <LogOut size={16} />
          {(!collapsed || mobile) && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

// ─── Dashboard Header ─────────────────────────────────────────────────────────
interface HeaderProps { onMenuClick: () => void; }

export function DashboardHeader({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  return (
    <header className="h-14 bg-[#080e1d]/80 backdrop-blur-md border-b border-cyan-500/10 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-slate-400 hover:text-cyan-400 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="font-cyber text-sm font-bold text-white tracking-wider hidden sm:block">
            SECURITY OPERATIONS CENTER
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-cyber text-[10px] text-emerald-400 tracking-widest">ALL SYSTEMS OPERATIONAL</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-xs font-cyber text-emerald-400">SECURITY SCORE:</span>
          <span className="text-xs font-cyber font-bold text-emerald-400">{user?.securityScore}%</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-cyber font-bold text-white cursor-pointer">
          {user?.fullName?.charAt(0) ?? 'U'}
        </div>
      </div>
    </header>
  );
}
