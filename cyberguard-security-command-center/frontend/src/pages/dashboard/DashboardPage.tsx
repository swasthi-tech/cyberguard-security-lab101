import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Activity,
  Bot,
  Network,
  Cloud,
  Users,
  Crosshair,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Terminal,
  ArrowRight,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import { ThreatRadar } from '../../components/common/ThreatRadar';
import { WorldMapRadar } from '../../components/common/WorldMapRadar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    endpointsProtected: 42,
    siemEventsToday: 13840,
    threatsNeutralized: 19,
    mfaCompliance: 96,
  });

  const [recentAlerts, setRecentAlerts] = useState<any[]>([
    {
      id: 'ALT-901',
      severity: 'CRITICAL',
      title: 'Suspicious PowerShell Encoded Command',
      host: 'WIN-FINANCE-04',
      time: '2m ago',
      technique: 'T1059.001',
    },
    {
      id: 'ALT-902',
      severity: 'HIGH',
      title: 'Kerberoasting Ticket Request Anomaly',
      host: 'DC-CORP-01',
      time: '14m ago',
      technique: 'T1558.003',
    },
    {
      id: 'ALT-903',
      severity: 'MEDIUM',
      title: 'Outbound Connection to Uncategorized ASN',
      host: 'WEB-PROXY-02',
      time: '32m ago',
      technique: 'T1071.001',
    },
    {
      id: 'ALT-904',
      severity: 'INFO',
      title: 'Privileged Session Initialized with MFA',
      host: 'ADM-GATE-01',
      time: '45m ago',
      technique: 'T1078.004',
    },
  ]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [edrRes, siemRes] = await Promise.allSettled([
        api.edr.getTelemetry('simulation'),
        api.siem.getEvents('simulation'),
      ]);

      if (edrRes.status === 'fulfilled' && edrRes.value.metrics) {
        setStats((prev) => ({
          ...prev,
          endpointsProtected: edrRes.value.metrics.protectedEndpoints || 42,
        }));
      }

      if (siemRes.status === 'fulfilled' && siemRes.value.events) {
        const events = siemRes.value.events.slice(0, 4);
        if (events.length > 0) {
          setRecentAlerts(
            events.map((e, idx) => ({
              id: `EVT-${e.id.slice(0, 5)}`,
              severity: e.severity,
              title: e.description,
              host: e.ip || `NODE-${idx + 1}`,
              time: 'Just now',
              technique: e.mitreTechnique || 'T1059',
            }))
          );
        }
      }
    } catch {
      // Graceful fallback to rich initial state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-blue-950/40 border border-cyan-500/20 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase">
              CYBERGUARD DEFENSE CORE :: LIVE COMMAND
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Security Operations Command Center
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Operator: <span className="text-cyan-300 font-semibold">{user?.fullName || user?.username || 'SecOps Lead'}</span> | Role: <span className="text-slate-300">{user?.roles?.[0] || 'ADMINISTRATOR'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status="LIVE TELEMETRY" size="sm" />
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-mono text-cyan-300 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Sync SOC</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl soc-card border border-cyan-500/20">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>PROTECTED ENDPOINTS</span>
            <Shield className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white">
            {stats.endpointsProtected}
            <span className="text-xs font-normal text-emerald-400 ml-2 font-mono">100% HEALTH</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <span className="text-cyan-400 font-mono">EDR / XDR</span> agent telemetry active
          </div>
        </div>

        <div className="p-4 rounded-xl soc-card border border-cyan-500/20">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>INGESTED SIEM EVENTS</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-cyan-300">
            {stats.siemEventsToday.toLocaleString()}
            <span className="text-xs font-normal text-slate-400 ml-2 font-mono">/ 24h</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>AI correlation index 99.8%</span>
          </div>
        </div>

        <div className="p-4 rounded-xl soc-card border border-cyan-500/20">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>THREATS CONTAINED</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white">
            {stats.threatsNeutralized}
            <span className="text-xs font-normal text-emerald-400 ml-2 font-mono">0 ACTIVE</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Mean time to isolation: <span className="text-cyan-400 font-mono">1.4s</span>
          </div>
        </div>

        <div className="p-4 rounded-xl soc-card border border-cyan-500/20">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>ZERO TRUST SCORE</span>
            <Network className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            {stats.mfaCompliance}%
            <span className="text-xs font-normal text-cyan-300 ml-2 font-mono">STRICT</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Continuous adaptive policy active
          </div>
        </div>
      </div>

      {/* Main Grid: World Map Telemetry & Live Threat Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Global Threat Map */}
        <div className="lg:col-span-8 p-5 rounded-xl soc-card border border-cyan-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                GLOBAL TELEMETRY & ATTACK VECTOR MESH
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Real-time multi-region edge ingestion & honeypot traffic
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
              6 ACTIVE HUBS
            </span>
          </div>
          <WorldMapRadar />
        </div>

        {/* Threat Radar Display */}
        <div className="lg:col-span-4 p-5 rounded-xl soc-card border border-cyan-500/20 flex flex-col items-center justify-between text-center">
          <div className="w-full flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold font-mono text-white flex items-center gap-1.5">
              <Crosshair className="w-4 h-4 text-cyan-400" />
              THREAT SWEEP
            </h2>
            <span className="text-[10px] font-mono text-emerald-400">360° ACTIVE</span>
          </div>
          <div className="my-2">
            <ThreatRadar size={220} threatCount={5} />
          </div>
          <div className="w-full grid grid-cols-3 gap-2 text-[10px] font-mono pt-3 border-t border-slate-800">
            <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
              <span className="block text-slate-500">BLIPS</span>
              <span className="text-cyan-300 font-bold">5 TRACED</span>
            </div>
            <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
              <span className="block text-slate-500">BAND</span>
              <span className="text-emerald-400 font-bold">CLEAR</span>
            </div>
            <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
              <span className="block text-slate-500">ISOLATION</span>
              <span className="text-cyan-300 font-bold">ARMED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent SOC Incursions & Quick Security Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Incursions & Triage */}
        <div className="lg:col-span-8 p-5 rounded-xl soc-card border border-cyan-500/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                RECENT SECURITY EVENTS &amp; MITRE TRIAGE
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Automated correlation engine events with attack classification
              </p>
            </div>
            <Link
              to="/tools/ai-soc-siem"
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View All SIEM</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80 font-mono text-xs">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold mt-0.5 ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-red-950/80 text-red-400 border border-red-500/40'
                        : alert.severity === 'HIGH'
                        ? 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
                        : alert.severity === 'MEDIUM'
                        ? 'bg-yellow-950/80 text-yellow-300 border border-yellow-500/40'
                        : 'bg-cyan-950/80 text-cyan-400 border border-cyan-500/40'
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <div>
                    <div className="text-slate-100 font-medium">{alert.title}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-1">
                      <span>Target: <span className="text-slate-300">{alert.host}</span></span>
                      <span>•</span>
                      <span>MITRE: <span className="text-cyan-400">{alert.technique}</span></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="text-[10px] text-slate-500">{alert.time}</span>
                  <Link
                    to="/tools/ai-soc-siem"
                    className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-[11px] text-cyan-300 border border-slate-700 hover:border-cyan-500/40 transition-colors"
                  >
                    Investigate
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SOC Quick Launch Grid */}
        <div className="lg:col-span-4 p-5 rounded-xl soc-card border border-cyan-500/20 space-y-3">
          <h2 className="text-sm font-bold font-mono text-white flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            CORE DEFENSE TOOLS
          </h2>

          <Link
            to="/tools/edr-xdr"
            className="block p-3 rounded-lg bg-slate-900/60 hover:bg-cyan-950/30 border border-slate-800 hover:border-cyan-500/30 transition-all group"
          >
            <div className="flex items-center justify-between text-xs font-mono font-semibold text-slate-200 group-hover:text-cyan-300">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                EDR / XDR Endpoint Defense
              </span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-1">
              Active isolation, host behavioral inspection & telemetry
            </p>
          </Link>

          <Link
            to="/tools/ai-soc-siem"
            className="block p-3 rounded-lg bg-slate-900/60 hover:bg-cyan-950/30 border border-slate-800 hover:border-cyan-500/30 transition-all group"
          >
            <div className="flex items-center justify-between text-xs font-mono font-semibold text-slate-200 group-hover:text-cyan-300">
              <span className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                AI SOC / SIEM Triage Copilot
              </span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-1">
              Automated log ingestion & AI incident playbooks
            </p>
          </Link>

          <Link
            to="/tools/zero-trust"
            className="block p-3 rounded-lg bg-slate-900/60 hover:bg-cyan-950/30 border border-slate-800 hover:border-cyan-500/30 transition-all group"
          >
            <div className="flex items-center justify-between text-xs font-mono font-semibold text-slate-200 group-hover:text-cyan-300">
              <span className="flex items-center gap-2">
                <Network className="w-4 h-4 text-cyan-400" />
                Zero Trust Architecture
              </span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-1">
              Continuous contextual trust evaluation simulator
            </p>
          </Link>

          <Link
            to="/tools/threat-intelligence"
            className="block p-3 rounded-lg bg-slate-900/60 hover:bg-cyan-950/30 border border-slate-800 hover:border-cyan-500/30 transition-all group"
          >
            <div className="flex items-center justify-between text-xs font-mono font-semibold text-slate-200 group-hover:text-cyan-300">
              <span className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-cyan-400" />
                IOC Threat Intelligence
              </span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-1">
              Instant IP, domain, and file hash reputation lookup
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};
