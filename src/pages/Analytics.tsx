import React from 'react';
import { BarChart3 } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { SectionHeader } from '../components/ui';

const weeklyData = [
  { day: 'MON', scans: 18, threats: 2, safe: 14, suspicious: 2 },
  { day: 'TUE', scans: 24, threats: 5, safe: 17, suspicious: 2 },
  { day: 'WED', scans: 31, threats: 3, safe: 26, suspicious: 2 },
  { day: 'THU', scans: 15, threats: 1, safe: 13, suspicious: 1 },
  { day: 'FRI', scans: 42, threats: 8, safe: 29, suspicious: 5 },
  { day: 'SAT', scans: 11, threats: 0, safe: 10, suspicious: 1 },
  { day: 'SUN', scans: 24, threats: 3, safe: 19, suspicious: 2 },
];

const toolUsage = [
  { tool: 'Port Scanner', count: 45 },
  { tool: 'URL Safety', count: 62 },
  { tool: 'IP Info', count: 38 },
  { tool: 'Phishing', count: 29 },
  { tool: 'Firewall', count: 18 },
  { tool: 'Malware', count: 22 },
  { tool: 'Web Scanner', count: 31 },
];

const resultsDist = [
  { name: 'Safe', value: 120, color: '#10b981' },
  { name: 'Suspicious', value: 28, color: '#f59e0b' },
  { name: 'Threats', value: 15, color: '#ef4444' },
  { name: 'Clean', value: 82, color: '#3b82f6' },
];

const TOOLTIP_STYLE = {
  contentStyle: { background: '#0d1b2e', border: '1px solid #00f5ff30', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#00f5ff', fontFamily: 'Orbitron' },
};

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Security Analytics" icon={<BarChart3 size={22} />} subtitle="Comprehensive security activity analytics and trends" />

      {/* Weekly Activity */}
      <div className="glass-card p-5">
        <h3 className="font-cyber text-sm font-bold text-white mb-5 tracking-wide">Weekly Security Activity</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={weeklyData}>
            <defs>
              <linearGradient id="gradScans2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00f5ff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradSafe" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradThreats2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Orbitron' }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'Orbitron' }} />
            <Area type="monotone" dataKey="scans" stroke="#00f5ff" fill="url(#gradScans2)" strokeWidth={2} name="Total Scans" />
            <Area type="monotone" dataKey="safe" stroke="#10b981" fill="url(#gradSafe)" strokeWidth={2} name="Safe" />
            <Area type="monotone" dataKey="threats" stroke="#ef4444" fill="url(#gradThreats2)" strokeWidth={2} name="Threats" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tool Usage */}
        <div className="glass-card p-5">
          <h3 className="font-cyber text-sm font-bold text-white mb-5">Tool Usage Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={toolUsage} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis type="category" dataKey="tool" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'Orbitron' }} width={90} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="count" fill="#00f5ff" radius={[0, 4, 4, 0]} opacity={0.8} name="Scans" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Results Distribution Pie */}
        <div className="glass-card p-5">
          <h3 className="font-cyber text-sm font-bold text-white mb-5">Results Distribution</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="60%" height={200}>
              <PieChart>
                <Pie data={resultsDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {resultsDist.map((entry, i) => (
                    <Cell key={i} fill={entry.color} style={{ filter: `drop-shadow(0 0 4px ${entry.color}80)` }} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0d1b2e', border: '1px solid #00f5ff30', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {resultsDist.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-xs text-slate-400">{item.name}</span>
                  <span className="text-xs font-cyber font-bold text-slate-200 ml-auto pl-4">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Blocked Traffic */}
      <div className="glass-card p-5">
        <h3 className="font-cyber text-sm font-bold text-white mb-5">Firewall Blocked Traffic (Daily)</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Orbitron' }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Bar dataKey="threats" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.8} name="Blocked/Threats" />
            <Bar dataKey="suspicious" fill="#f59e0b" radius={[4, 4, 0, 0]} opacity={0.8} name="Suspicious" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
