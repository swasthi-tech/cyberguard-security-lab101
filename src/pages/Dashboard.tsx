import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, AlertTriangle, Activity, Lock, TrendingUp,
  Network, Globe, Link2, Fish, Flame, Bug, Globe2, ChevronRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StatCard, Badge } from '../components/ui';

const weeklyData = [
  { day: 'MON', scans: 18, threats: 2, safe: 14, suspicious: 2 },
  { day: 'TUE', scans: 24, threats: 5, safe: 17, suspicious: 2 },
  { day: 'WED', scans: 31, threats: 3, safe: 26, suspicious: 2 },
  { day: 'THU', scans: 15, threats: 1, safe: 13, suspicious: 1 },
  { day: 'FRI', scans: 42, threats: 8, safe: 29, suspicious: 5 },
  { day: 'SAT', scans: 11, threats: 0, safe: 10, suspicious: 1 },
  { day: 'SUN', scans: 24, threats: 3, safe: 19, suspicious: 2 },
];

const recentThreats = [
  { type: 'Phishing URL', target: 'paypa1-login.com', time: '14 min ago', level: 'high' as const },
  { type: 'Open Port Risk', target: 'demo-host.local:3306', time: '1 hr ago', level: 'medium' as const },
  { type: 'URL Suspicious', target: 'bit.ly/3xABcD', time: '2 hr ago', level: 'medium' as const },
  { type: 'Malware Signature', target: 'suspicious_demo.exe', time: '4 hr ago', level: 'high' as const },
];

const tools = [
  { icon: <Network size={20} />, label: 'Port Scanner', path: '/tools/port-scanner', color: '#00f5ff' },
  { icon: <Globe size={20} />, label: 'IP Info', path: '/tools/ip-information', color: '#3b82f6' },
  { icon: <Link2 size={20} />, label: 'URL Safety', path: '/tools/url-safety', color: '#8b5cf6' },
  { icon: <Fish size={20} />, label: 'Phishing', path: '/tools/phishing-detector', color: '#f59e0b' },
  { icon: <Flame size={20} />, label: 'Firewall', path: '/tools/firewall', color: '#ef4444' },
  { icon: <Bug size={20} />, label: 'Malware', path: '/tools/malware-scanner', color: '#10b981' },
  { icon: <Globe2 size={20} />, label: 'Web Scanner', path: '/tools/website-scanner', color: '#ec4899' },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const [counter, setCounter] = useState({ scans: 0, threats: 0, score: 0 });

  useEffect(() => {
    const target = { scans: 24, threats: 3, score: 94 };
    let frame: number;
    let start: number | null = null;
    const duration = 1500;
    const tick = (time: number) => {
      if (!start) start = time;
      const elapsed = time - start;
      const p = Math.min(elapsed / duration, 1);
      setCounter({
        scans: Math.round(target.scans * p),
        threats: Math.round(target.threats * p),
        score: Math.round(target.score * p),
      });
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="font-cyber text-2xl font-bold text-white">Security Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Real-time security operations overview</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="System Status"
          value="ONLINE"
          icon={<Activity size={20} />}
          color="green"
          sub="● All systems operational"
        />
        <StatCard
          label="Threat Level"
          value="LOW"
          icon={<Shield size={20} />}
          color="cyan"
          sub="No active threats"
        />
        <StatCard
          label="Scans Today"
          value={counter.scans}
          icon={<TrendingUp size={20} />}
          color="blue"
          sub="↑ 18% from yesterday"
        />
        <StatCard
          label="Threats Detected"
          value={counter.threats}
          icon={<AlertTriangle size={20} />}
          color="orange"
          sub="All resolved"
        />
      </div>

      {/* Security Score Bar */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-cyber text-xs font-semibold text-slate-400 tracking-widest uppercase">Security Score</p>
            <p className="font-cyber text-4xl font-black text-cyan-400 mt-1">{counter.score}<span className="text-xl text-slate-500">%</span></p>
          </div>
          <Lock size={32} className="text-cyan-400/40" />
        </div>
        <div className="h-3 rounded-full bg-slate-700/50 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${counter.score}%`,
              background: 'linear-gradient(90deg, #00f5ff, #3b82f6)',
              boxShadow: '0 0 12px rgba(0,245,255,0.5)',
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs font-cyber text-slate-500">
          <span>CRITICAL</span>
          <span>MODERATE</span>
          <span>GOOD</span>
          <span>EXCELLENT</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly Chart */}
        <div className="lg:col-span-2 glass-card p-5">
          <h3 className="font-cyber text-sm font-bold text-white tracking-wide mb-5">Weekly Security Activity</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="gradScans" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00f5ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradThreats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Orbitron' }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#0d1b2e', border: '1px solid #00f5ff30', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#00f5ff', fontFamily: 'Orbitron' }}
              />
              <Area type="monotone" dataKey="scans" stroke="#00f5ff" fill="url(#gradScans)" strokeWidth={2} name="Scans" />
              <Area type="monotone" dataKey="threats" stroke="#ef4444" fill="url(#gradThreats)" strokeWidth={2} name="Threats" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Threats */}
        <div className="glass-card p-5">
          <h3 className="font-cyber text-sm font-bold text-white tracking-wide mb-4">Recent Threats</h3>
          <div className="space-y-3">
            {recentThreats.map((t, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${t.level === 'high' ? 'bg-red-400' : 'bg-yellow-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-200">{t.type}</p>
                  <p className="text-xs text-slate-500 font-mono truncate">{t.target}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={t.level}>{t.level.toUpperCase()}</Badge>
                  <span className="text-[10px] text-slate-600 font-mono">{t.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Tools Grid */}
      <div className="glass-card p-5">
        <h3 className="font-cyber text-sm font-bold text-white tracking-wide mb-4">Security Tools</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {tools.map(tool => (
            <button
              key={tool.path}
              onClick={() => navigate(tool.path)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-transparent hover:border-opacity-30 transition-all duration-300 hover:-translate-y-1 group"
              style={{ '--t-color': tool.color } as React.CSSProperties}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = `${tool.color}40`;
                (e.currentTarget as HTMLElement).style.background = `${tool.color}08`;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 15px ${tool.color}20`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = '';
                (e.currentTarget as HTMLElement).style.background = '';
                (e.currentTarget as HTMLElement).style.boxShadow = '';
              }}
            >
              <div className="p-2.5 rounded-lg" style={{ background: `${tool.color}15` }}>
                <span style={{ color: tool.color }}>{tool.icon}</span>
              </div>
              <span className="font-cyber text-[10px] font-semibold text-slate-400 group-hover:text-slate-200 transition-colors text-center tracking-wide">
                {tool.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
