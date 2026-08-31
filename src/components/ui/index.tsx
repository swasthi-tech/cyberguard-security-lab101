import React from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Info, Zap } from 'lucide-react';

// ─── Button ───────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', loading, icon, children, className = '', disabled, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1';
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };
  const variants = {
    primary: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold hover:shadow-[0_0_25px_rgba(0,245,255,0.5)] hover:-translate-y-0.5 focus:ring-cyan-500',
    outline: 'border border-cyan-500/40 text-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/15 hover:border-cyan-500/70 hover:shadow-[0_0_15px_rgba(0,245,255,0.2)] focus:ring-cyan-500',
    danger: 'border border-red-500/40 text-red-400 bg-red-500/5 hover:bg-red-500/15 hover:border-red-500 focus:ring-red-500',
    ghost: 'text-slate-400 hover:text-white hover:bg-white/5 focus:ring-slate-500',
    success: 'bg-gradient-to-r from-emerald-500 to-green-400 text-black font-bold hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] focus:ring-emerald-500',
  };
  const fontStyle = variant === 'primary' || variant === 'success' ? 'font-cyber uppercase tracking-wider' : 'font-cyber uppercase tracking-wide';
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${fontStyle} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader /> : icon}
      {children}
    </button>
  );
}

function Loader() {
  return (
    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glowColor?: 'cyan' | 'blue' | 'purple' | 'green' | 'red' | 'orange';
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, glowColor, onClick }: CardProps) {
  const glowMap: Record<string, string> = {
    cyan: 'hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(0,245,255,0.15)]',
    blue: 'hover:border-blue-400/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]',
    purple: 'hover:border-purple-400/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]',
    green: 'hover:border-emerald-400/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]',
    red: 'hover:border-red-400/50 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]',
    orange: 'hover:border-orange-400/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]',
  };
  return (
    <div
      onClick={onClick}
      className={`glass-card ${hover ? `${glowColor ? glowMap[glowColor] : glowMap.cyan} hover:-translate-y-1 transition-all duration-300 cursor-pointer` : ''} ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────
type BadgeVariant = 'safe' | 'warning' | 'danger' | 'info' | 'sim' | 'low' | 'medium' | 'high' | 'critical';

export function Badge({ variant, children, className = '' }: { variant: BadgeVariant; children: React.ReactNode; className?: string }) {
  const styles: Record<BadgeVariant, string> = {
    safe: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
    danger: 'bg-red-500/15 text-red-400 border border-red-500/30',
    info: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    sim: 'bg-orange-500/10 text-orange-400 border border-orange-500/30',
    low: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    medium: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
    high: 'bg-red-500/15 text-red-400 border border-red-500/30',
    critical: 'bg-red-600/20 text-red-300 border border-red-600/40',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-cyber font-semibold tracking-wide ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}

// ─── Input ───────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export function Input({ label, error, icon, rightElement, className = '', id, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-cyber font-semibold text-cyan-400 tracking-widest mb-2 uppercase">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
        <input
          id={id}
          className={`cyber-input ${icon ? 'pl-10' : ''} ${rightElement ? 'pr-10' : ''} ${error ? 'border-red-500/60 focus:border-red-500' : ''} ${className}`}
          {...props}
        />
        {rightElement && <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</span>}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-400 font-mono">{error}</p>}
    </div>
  );
}

// ─── Alert/Toast ─────────────────────────────────────────────────────────────
type AlertType = 'success' | 'error' | 'warning' | 'info';

export function Alert({ type, message, onClose }: { type: AlertType; message: string; onClose?: () => void }) {
  const styles: Record<AlertType, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
    success: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', icon: <CheckCircle size={16} /> },
    error: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', icon: <XCircle size={16} /> },
    warning: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', icon: <AlertTriangle size={16} /> },
    info: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', icon: <Info size={16} /> },
  };
  const s = styles[type];
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${s.bg} ${s.border} ${s.text}`}>
      {s.icon}
      <span className="text-sm font-medium">{message}</span>
      {onClose && <button onClick={onClose} className="ml-auto opacity-60 hover:opacity-100"><XCircle size={14} /></button>}
    </div>
  );
}

// ─── Section Header ──────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, icon }: { title: string; subtitle?: string; icon?: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        {icon && <span className="text-cyan-400">{icon}</span>}
        <h1 className="font-cyber text-2xl font-bold text-white tracking-wide">{title}</h1>
      </div>
      {subtitle && <p className="text-slate-400 text-sm ml-1">{subtitle}</p>}
    </div>
  );
}

// ─── Simulation Banner ───────────────────────────────────────────────────────
export function SimBanner({ message }: { message?: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-cyber tracking-wide">
      <Zap size={14} />
      <span>⚡ SIMULATION MODE</span>
      <span className="text-orange-300 font-normal ml-1">
        — {message || 'No real operations are performed. Educational demo only.'}
      </span>
    </div>
  );
}

// ─── Loading Spinner ─────────────────────────────────────────────────────────
export function Spinner({ size = 24, color = '#00f5ff' }: { size?: number; color?: string }) {
  return (
    <svg
      className="animate-spin"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeOpacity="0.2" strokeWidth="3" />
      <path d="M12 2 A10 10 0 0 1 22 12" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon, color = 'cyan', sub }: {
  label: string; value: string | number; icon: React.ReactNode; color?: string; sub?: string;
}) {
  const colorMap: Record<string, string> = {
    cyan: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5',
    blue: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
    green: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    red: 'text-red-400 border-red-500/20 bg-red-500/5',
    orange: 'text-orange-400 border-orange-500/20 bg-orange-500/5',
    purple: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
  };
  return (
    <div className={`glass-card p-5 border ${colorMap[color]} rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-cyber font-semibold tracking-widest text-slate-400 uppercase mb-2">{label}</p>
          <p className={`text-3xl font-cyber font-bold ${colorMap[color].split(' ')[0]}`}>{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
        <div className={`p-3 rounded-lg border ${colorMap[color]}`}>{icon}</div>
      </div>
    </div>
  );
}

// ─── Shield Icon (Animated) ──────────────────────────────────────────────────
export function AnimatedShield({ size = 80, color = '#00f5ff', className = '' }: { size?: number; color?: string; className?: string }) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full animate-pulse"
        style={{ background: `radial-gradient(circle, ${color}22 0%, transparent 70%)` }}
      />
      <Shield size={size} color={color} strokeWidth={1.5} className="relative z-10 drop-shadow-[0_0_10px_rgba(0,245,255,0.6)]" />
    </div>
  );
}
