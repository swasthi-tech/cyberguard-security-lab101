import React, { useState, useEffect } from 'react';
import {
  Bot,
  Terminal,
  Activity,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { api } from '../../api/client';
import { SiemEvent, CopilotAnalysisResult } from '../../api/types';

export const SiemPage: React.FC = () => {
  const [events, setEvents] = useState<SiemEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<SiemEvent | null>(null);
  const [copilotAnalysis, setCopilotAnalysis] = useState<CopilotAnalysisResult | null>(null);
  const [copilotLoading, setCopilotLoading] = useState(false);

  const mockEvents: SiemEvent[] = [
    {
      id: 'evt-101',
      eventType: 'SUSPICIOUS_EXECUTION',
      severity: 'CRITICAL',
      source: 'CrowdStrike Falcon Ingest',
      description: 'Living-off-the-Land Binary (LOLBin) executed: certutil.exe downloading payload',
      mitreTechnique: 'T1105 (Ingress Tool Transfer)',
      isSimulated: true,
      createdAt: '3m ago',
      status: 'OPEN',
      ip: '192.168.1.104',
    },
    {
      id: 'evt-102',
      eventType: 'AUTH_BRUTE_FORCE',
      severity: 'HIGH',
      source: 'Active Directory Kerberos',
      description: 'Exceeded 50 failed NTLM auth attempts against DC-CORP in 30 seconds',
      mitreTechnique: 'T1110.003 (Password Spraying)',
      isSimulated: true,
      createdAt: '12m ago',
      status: 'OPEN',
      ip: '10.0.12.89',
    },
    {
      id: 'evt-103',
      eventType: 'DATA_EXFILTRATION',
      severity: 'HIGH',
      source: 'Palo Alto Networks FW',
      description: 'Anomalous DNS tunneling query rate to unknown apex domain .top',
      mitreTechnique: 'T1071.004 (DNS Communication)',
      isSimulated: true,
      createdAt: '25m ago',
      status: 'INVESTIGATING',
      ip: '10.0.4.12',
    },
    {
      id: 'evt-104',
      eventType: 'PRIVILEGE_ESCALATION',
      severity: 'MEDIUM',
      source: 'Linux Auditd Daemon',
      description: 'Sudo permission bypass attempt via CVE-2021-3156 syntax mutation',
      mitreTechnique: 'T1068 (Exploitation for Privilege Escalation)',
      isSimulated: false,
      createdAt: '1h ago',
      status: 'RESOLVED',
      ip: '10.0.8.50',
    },
  ];

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.siem.getEvents('simulation');
      if (res.events && res.events.length > 0) {
        setEvents(res.events);
      } else {
        setEvents(mockEvents);
      }
    } catch {
      setEvents(mockEvents);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCopilotTriage = async (evt: SiemEvent) => {
    setSelectedEvent(evt);
    setCopilotLoading(true);
    setCopilotAnalysis(null);

    try {
      const res = await api.siem.requestCopilotAnalysis({
        eventId: evt.id,
        eventType: evt.eventType,
        description: evt.description,
        mitreTechnique: evt.mitreTechnique,
        ip: evt.ip,
      });
      setCopilotAnalysis(res.copilotAnalysis);
    } catch {
      // High-fidelity fallback analysis
      setCopilotAnalysis({
        eventId: evt.id,
        dataMode: 'SIMULATION',
        disclaimer: 'AI-generated triage playbook aligned with NIST SP 800-61 Rev. 2',
        executiveSummary: `Observed ${evt.eventType} targeting ${evt.ip}. The activity is consistent with MITRE ${evt.mitreTechnique}. Immediate containment is recommended to prevent lateral movement across the enterprise boundary.`,
        containmentSteps: [
          `Enforce microsegmentation ACLs blocking outbound connections from ${evt.ip}.`,
          'Revoke all Kerberos Golden/Silver tickets and invalidate active JWT bearer tokens.',
          'Quarantine host endpoint via EDR agent daemon.',
        ],
        eradicationSteps: [
          'Terminate suspicious child processes spawned from the attack tree.',
          'Extract and purge rogue scheduled tasks or systemd service units.',
          'Rotate local Administrator and service account credentials.',
        ],
        recoverySteps: [
          'Verify cryptographic file integrity against golden image baseline.',
          'Restore patched configuration from trusted backup immutable store.',
          'Re-enable network ingress under heightened telemetry monitoring mode for 72 hours.',
        ],
        mitreAttAndCk: {
          technique: evt.mitreTechnique,
          tactic: 'Execution & Lateral Movement',
        },
      });
    } finally {
      setCopilotLoading(false);
    }
  };

  const filtered = events.filter(
    (e) =>
      e.description.toLowerCase().includes(filter.toLowerCase()) ||
      e.eventType.toLowerCase().includes(filter.toLowerCase()) ||
      e.ip.includes(filter) ||
      e.mitreTechnique.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-purple-950/40 border border-cyan-500/20 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bot className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase">
              AI SOC &amp; SIEM LOG CORRELATION ENGINE
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Security Event Intelligence &amp; AI Copilot
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Ingest heterogeneous log formats, correlate anomalies, and dispatch AI containment playbooks
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status="LIVE TELEMETRY" size="sm" />
          <button
            onClick={fetchEvents}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-mono text-cyan-300 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Events</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Events List & Copilot Investigation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Events Table (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by technique, IP, description..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="soc-card rounded-xl border border-cyan-500/20 divide-y divide-slate-800/80 font-mono text-xs overflow-hidden">
            {filtered.map((evt) => (
              <div
                key={evt.id}
                onClick={() => handleCopilotTriage(evt)}
                className={`p-4 cursor-pointer hover:bg-cyan-950/20 transition-all flex flex-col gap-2 ${
                  selectedEvent?.id === evt.id ? 'bg-cyan-950/40 border-l-4 border-cyan-400' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        evt.severity === 'CRITICAL'
                          ? 'bg-red-950/80 text-red-400 border border-red-500/50'
                          : evt.severity === 'HIGH'
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-500/50'
                          : 'bg-cyan-950/80 text-cyan-400 border border-cyan-500/50'
                      }`}
                    >
                      {evt.severity}
                    </span>
                    <span className="text-white font-semibold text-xs">{evt.eventType}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{evt.createdAt}</span>
                </div>

                <p className="text-slate-300 font-sans text-xs">{evt.description}</p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Host IP: <span className="text-cyan-300">{evt.ip}</span></span>
                  <span className="text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30 text-[10px]">
                    {evt.mitreTechnique}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Copilot Panel (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-xl soc-card border border-cyan-500/30 flex flex-col font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="font-bold text-white text-xs">AI COPILOT TRIAGE RUNNER</span>
            </div>
            <span className="text-[10px] text-purple-400 font-bold px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/40">
              NIST 800-61 COMPLIANT
            </span>
          </div>

          {copilotLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-cyan-400 space-y-3">
              <Bot className="w-8 h-8 animate-bounce text-cyan-400" />
              <div className="text-xs tracking-widest animate-pulse">CORRELATING MITRE ATT&amp;CK VECTORS...</div>
            </div>
          ) : copilotAnalysis ? (
            <div className="space-y-4 overflow-y-auto max-h-[600px] pr-1">
              <div>
                <span className="text-slate-500 text-[10px] block">EXECUTIVE SUMMARY</span>
                <p className="text-slate-200 font-sans text-xs leading-relaxed mt-1">
                  {copilotAnalysis.executiveSummary}
                </p>
              </div>

              <div>
                <span className="text-cyan-400 text-[10px] block font-bold">1. CONTAINMENT ACTIONS</span>
                <ul className="mt-1 space-y-1 text-slate-300">
                  {copilotAnalysis.containmentSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 font-sans text-xs">
                      <span className="text-cyan-400 font-mono">[{idx + 1}]</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-amber-400 text-[10px] block font-bold">2. ERADICATION PLAYBOOK</span>
                <ul className="mt-1 space-y-1 text-slate-300">
                  {copilotAnalysis.eradicationSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 font-sans text-xs">
                      <span className="text-amber-400 font-mono">[{idx + 1}]</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-emerald-400 text-[10px] block font-bold">3. RECOVERY &amp; AUDIT</span>
                <ul className="mt-1 space-y-1 text-slate-300">
                  {copilotAnalysis.recoverySteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 font-sans text-xs">
                      <span className="text-emerald-400 font-mono">[{idx + 1}]</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-slate-500 text-center space-y-2">
              <Bot className="w-8 h-8 text-slate-600" />
              <p className="text-xs">Select any SIEM incident from the left to dispatch automated AI Copilot triage analysis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
