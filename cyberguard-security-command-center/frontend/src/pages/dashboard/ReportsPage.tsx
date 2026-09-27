import React from 'react';
import { FileText, Download, CheckCircle2, Shield, Calendar, HardDrive } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export const ReportsPage: React.FC = () => {
  const reports = [
    {
      id: 'REP-2026-Q1',
      title: 'Quarterly Executive Cyber Threat & Exposure Assessment',
      type: 'BOARD_EXECUTIVE',
      date: 'March 2026',
      size: '2.4 MB PDF',
      status: 'VERIFIED',
    },
    {
      id: 'REP-SOC-NIST',
      title: 'NIST CSF 2.0 Compliance & Microsegmentation Audit',
      type: 'REGULATORY',
      date: 'February 2026',
      size: '4.1 MB PDF',
      status: 'AUDITED',
    },
    {
      id: 'REP-EDR-INC',
      title: 'Post-Incident Forensic Dossier: Incident INC-8891 Containment',
      type: 'INCIDENT_FORENSIC',
      date: 'January 2026',
      size: '1.2 MB PDF',
      status: 'ARCHIVED',
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="p-5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-blue-950/40 border border-cyan-500/20 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase">
              SECURITY REPORTS &amp; COMPLIANCE AUDITS
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Security Intelligence Reports
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Cryptographically signed audit documentation for executive leadership and compliance auditors
          </p>
        </div>
        <StatusBadge status="SECURE" size="sm" />
      </div>

      <div className="soc-card rounded-xl border border-cyan-500/20 divide-y divide-slate-800/80 font-mono text-xs overflow-hidden">
        {reports.map((rep) => (
          <div key={rep.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 text-cyan-400">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="text-white font-semibold text-xs">{rep.title}</div>
                <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-1">
                  <span>ID: <span className="text-cyan-300">{rep.id}</span></span>
                  <span>•</span>
                  <span>Date: {rep.date}</span>
                  <span>•</span>
                  <span>Size: {rep.size}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => alert(`Downloading cryptographic report dossier: ${rep.title}`)}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 text-[11px] font-bold flex items-center gap-1.5 self-end sm:self-center transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Dossier</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
