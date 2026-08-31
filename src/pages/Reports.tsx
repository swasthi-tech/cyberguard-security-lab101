import React, { useState } from 'react';
import { FileText, Eye, Download, Printer, ChevronDown, ChevronUp } from 'lucide-react';
import { SectionHeader, Badge } from '../components/ui';
import { reports } from '../data/reports';

const RISK_BADGE: Record<string, any> = {
  LOW: 'low', MEDIUM: 'medium', HIGH: 'high', CRITICAL: 'critical',
};

const SCORE_COLOR = (s: number) => s >= 80 ? '#10b981' : s >= 60 ? '#f59e0b' : '#ef4444';

export function ReportsPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <SectionHeader title="Security Reports" icon={<FileText size={22} />} subtitle={`${reports.length} security reports generated`} />

      <div className="space-y-4">
        {reports.map(report => (
          <div key={report.id} className="glass-card overflow-hidden">
            {/* Header Row */}
            <div
              className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-cyan-500/5 transition-colors"
              onClick={() => setExpanded(expanded === report.id ? null : report.id)}
            >
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-cyber text-sm font-bold text-cyan-400">{report.id}</p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{report.scanDate} · {report.tool}</p>
                </div>
                <Badge variant={RISK_BADGE[report.riskLevel]}>{report.riskLevel}</Badge>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-slate-500 font-cyber tracking-wide">SECURITY SCORE</p>
                  <p className="font-cyber text-xl font-black" style={{ color: SCORE_COLOR(report.securityScore) }}>
                    {report.securityScore}/100
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                    title="Download Report"
                    onClick={e => { e.stopPropagation(); alert('Download report feature — connect to backend to generate PDF reports.'); }}
                  >
                    <Download size={16} />
                  </button>
                  <button
                    className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                    title="Print Report"
                    onClick={e => { e.stopPropagation(); window.print(); }}
                  >
                    <Printer size={16} />
                  </button>
                  {expanded === report.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expanded === report.id && (
              <div className="px-6 pb-6 border-t border-slate-700/40 animate-fade-in-up">
                <div className="grid md:grid-cols-2 gap-6 mt-4">
                  {/* Findings */}
                  <div>
                    <h4 className="font-cyber text-xs font-bold text-red-400 tracking-widest uppercase mb-3">Findings</h4>
                    <ul className="space-y-2">
                      {report.findings.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <span className="text-red-400 mt-0.5 flex-shrink-0">⚠</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Recommendations */}
                  <div>
                    <h4 className="font-cyber text-xs font-bold text-emerald-400 tracking-widest uppercase mb-3">Recommendations</h4>
                    <ul className="space-y-2">
                      {report.recommendations.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-700/30 flex items-center gap-3">
                  <span className="text-xs text-slate-500 font-mono">Target: {report.target}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
