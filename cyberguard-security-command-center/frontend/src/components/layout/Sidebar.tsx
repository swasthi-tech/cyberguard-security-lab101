import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Shield,
  Bot,
  Network,
  Cloud,
  Users,
  Crosshair,
  FileText,
  ClipboardList,
  Settings,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
  { path: '/tools/edr-xdr', label: 'EDR / XDR', icon: Shield },
  { path: '/tools/ai-soc-siem', label: 'AI SOC / SIEM', icon: Bot },
  { path: '/tools/zero-trust', label: 'Zero Trust', icon: Network },
  { path: '/tools/cloud-security', label: 'Cloud Security', icon: Cloud },
  { path: '/tools/iam', label: 'IAM', icon: Users },
  { path: '/tools/threat-intelligence', label: 'Threat Intelligence', icon: Crosshair },
  { path: '/reports', label: 'Security Reports', icon: FileText },
  { path: '/audit-logs', label: 'Audit Logs', icon: ClipboardList },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#050a1a] border-r border-cyan-500/20 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.25)]">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold tracking-widest text-white">CYBERGUARD</div>
              <div className="text-[10px] font-mono tracking-wider text-cyan-400">SOC PLATFORM</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-mono tracking-wider transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-cyan-300 border-l-2 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.15)] font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Operational Telemetry Banner in Footer */}
        <div className="p-3 border-t border-cyan-500/15 bg-[#030714]">
          <div className="flex items-center justify-between text-[11px] font-mono mb-1">
            <span className="text-slate-400">SOC TELEMETRY</span>
            <span className="text-emerald-400 flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE
            </span>
          </div>
          <p className="text-[10px] font-mono text-slate-500">
            Node: DEF-GATE-01 (TLS 1.3)
          </p>
        </div>
      </aside>
    </>
  );
};
