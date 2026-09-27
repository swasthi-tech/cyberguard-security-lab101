import React from 'react';
import { Activity, ShieldAlert, WifiOff, AlertTriangle, PlayCircle } from 'lucide-react';

export type SecurityStatusType = 'LIVE' | 'SIMULATION' | 'SIMULATION MODE' | 'NOT CONNECTED' | 'SERVICE OFFLINE' | 'ERROR' | 'SECURE' | 'WARNING' | 'ACTION REQUIRED';

interface StatusBadgeProps {
  status: SecurityStatusType | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', className = '' }) => {
  const norm = status.toUpperCase();

  let styles = 'bg-slate-800 text-slate-300 border-slate-700';
  let icon = <Activity className="w-3.5 h-3.5" />;
  let label = status;

  if (norm.includes('LIVE')) {
    styles = 'bg-emerald-950/70 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.35)]';
    icon = <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />;
    label = 'LIVE TELEMETRY';
  } else if (norm.includes('SIMULATION')) {
    styles = 'bg-cyan-950/70 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(0,240,255,0.35)]';
    icon = <PlayCircle className="w-3.5 h-3.5 text-cyan-400" />;
    label = 'SIMULATION MODE';
  } else if (norm.includes('NOT CONNECTED')) {
    styles = 'bg-amber-950/70 text-amber-400 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.25)]';
    icon = <WifiOff className="w-3.5 h-3.5 text-amber-400" />;
    label = 'NOT CONNECTED';
  } else if (norm.includes('OFFLINE')) {
    styles = 'bg-slate-900/90 text-slate-400 border-slate-700';
    icon = <WifiOff className="w-3.5 h-3.5 text-slate-400" />;
    label = 'SERVICE OFFLINE';
  } else if (norm.includes('ERROR') || norm.includes('CRITICAL')) {
    styles = 'bg-red-950/80 text-red-400 border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.4)]';
    icon = <AlertTriangle className="w-3.5 h-3.5 text-red-400" />;
    label = 'ERROR / CRITICAL';
  } else if (norm.includes('SECURE')) {
    styles = 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40';
    icon = <Activity className="w-3.5 h-3.5 text-emerald-400" />;
    label = 'SECURE';
  } else if (norm.includes('ACTION REQUIRED')) {
    styles = 'bg-red-950/70 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.35)]';
    icon = <ShieldAlert className="w-3.5 h-3.5 text-red-400" />;
    label = 'ACTION REQUIRED';
  } else if (norm.includes('WARNING')) {
    styles = 'bg-amber-950/70 text-amber-400 border-amber-500/40';
    icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
    label = 'WARNING';
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  };

  return (
    <span
      className={`inline-flex items-center font-mono font-semibold tracking-wider rounded border ${sizeClasses[size]} ${styles} ${className}`}
    >
      {icon}
      <span>{label}</span>
    </span>
  );
};
