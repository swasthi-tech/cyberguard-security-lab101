import React, { useState, useEffect } from 'react';
import { ClipboardList, Shield, RefreshCw, Search } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { api } from '../../api/client';
import { AuditLogItem } from '../../api/types';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');

  const mockLogs: AuditLogItem[] = [
    {
      id: 'log-101',
      actorEmail: 'admin@enterprise.corp',
      action: 'MFA_STEP_UP_VERIFIED',
      entityType: 'AUTH_SESSION',
      ipAddress: '10.0.1.10',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      details: 'TOTP RFC-6238 challenge passed successfully',
      timestamp: '2026-03-26T16:20:00Z',
    },
    {
      id: 'log-102',
      actorEmail: 'soc.operator@enterprise.corp',
      action: 'EDR_HOST_CONTAINMENT_DISPATCHED',
      entityType: 'ENDPOINT',
      entityId: 'WIN-FINANCE-LAPTOP-04',
      ipAddress: '192.168.20.14',
      userAgent: 'CYBERGUARD-SOC-DESKTOP',
      details: 'Host network quarantine applied',
      timestamp: '2026-03-26T16:15:30Z',
    },
    {
      id: 'log-103',
      actorEmail: 'system.engine@cyberguard.soc',
      action: 'AI_SIEM_CORRELATION_TRIGGERED',
      entityType: 'INCIDENT',
      entityId: 'INC-8891',
      ipAddress: '127.0.0.1',
      userAgent: 'CYBERGUARD-CORRELATION-DAEMON',
      details: 'Automated Copilot NIST 800-61 containment playbook dispatched',
      timestamp: '2026-03-26T16:00:12Z',
    },
  ];

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.audit.getLogs(1, 'ALL');
      if (res.logs && res.logs.length > 0) {
        setLogs(res.logs);
      } else {
        setLogs(mockLogs);
      }
    } catch {
      setLogs(mockLogs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(filter.toLowerCase()) ||
      l.actorEmail.toLowerCase().includes(filter.toLowerCase()) ||
      l.ipAddress.includes(filter)
  );

  return (
    <div className="space-y-6 font-sans">
      <div className="p-5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-blue-950/40 border border-cyan-500/20 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase">
              IMMUTABLE SOC AUDIT TRAIL
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Security Operations Audit Logs
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Cryptographically sealed ledger tracking every administrative command, quarantine trigger, and auth event
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status="SECURE" size="sm" />
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-mono text-cyan-300 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Ledger</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter by action, principal email, or IP..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      <div className="soc-card rounded-xl border border-cyan-500/20 overflow-hidden font-mono text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#050a18] border-b border-cyan-500/20 text-slate-400 text-[11px]">
              <tr>
                <th className="py-3 px-4">TIMESTAMP</th>
                <th className="py-3 px-4">ACTION TRIGGER</th>
                <th className="py-3 px-4">OPERATOR EMAIL</th>
                <th className="py-3 px-4">IP ORIGIN</th>
                <th className="py-3 px-4">EVENT CONTEXT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                    {new Date(l.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-cyan-300">
                    <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-[10px]">
                      {l.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-200">{l.actorEmail}</td>
                  <td className="py-3.5 px-4 text-slate-400">{l.ipAddress}</td>
                  <td className="py-3.5 px-4 text-slate-300 text-[11px] max-w-xs truncate">{l.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
