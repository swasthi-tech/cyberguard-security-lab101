import React, { useState } from 'react';
import { History, Search, ChevronLeft, ChevronRight, Trash2, Eye } from 'lucide-react';
import { SectionHeader, Badge } from '../components/ui';
import { scanHistory } from '../data/scanHistory';

const RISK_BADGE: Record<string, any> = {
  LOW: 'low', MEDIUM: 'medium', HIGH: 'high', CRITICAL: 'critical', SAFE: 'safe', CLEAN: 'safe', SUSPICIOUS: 'warning',
};

const PAGE_SIZE = 8;

export function HistoryPage() {
  const [search, setSearch] = useState('');
  const [filterTool, setFilterTool] = useState('All');
  const [sortKey, setSortKey] = useState<'date' | 'tool' | 'risk'>('date');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(scanHistory);

  const tools = ['All', ...Array.from(new Set(scanHistory.map(s => s.tool)))];

  const filtered = data
    .filter(s =>
      (filterTool === 'All' || s.tool === filterTool) &&
      (s.target.toLowerCase().includes(search.toLowerCase()) ||
        s.tool.toLowerCase().includes(search.toLowerCase()) ||
        s.id.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortKey === 'date') return b.date.localeCompare(a.date);
      if (sortKey === 'tool') return a.tool.localeCompare(b.tool);
      return 0;
    });

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const deleteEntry = (id: string) => setData(prev => prev.filter(s => s.id !== id));

  return (
    <div className="space-y-6">
      <SectionHeader title="Scan History" icon={<History size={22} />} subtitle={`${data.length} total scans recorded`} />

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="cyber-input pl-9 text-sm"
            placeholder="Search scans..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="cyber-input text-sm w-auto min-w-36"
          value={filterTool}
          onChange={e => { setFilterTool(e.target.value); setPage(1); }}
        >
          {tools.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          className="cyber-input text-sm w-auto min-w-36"
          value={sortKey}
          onChange={e => setSortKey(e.target.value as any)}
        >
          <option value="date">Sort: Date</option>
          <option value="tool">Sort: Tool</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="cyber-table">
            <thead>
              <tr>
                <th>SCAN ID</th>
                <th>DATE</th>
                <th>TOOL</th>
                <th>TARGET</th>
                <th>RESULT</th>
                <th>RISK</th>
                <th>DURATION</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(entry => (
                <tr key={entry.id}>
                  <td><span className="font-mono-cyber text-xs text-cyan-400">{entry.id}</span></td>
                  <td><span className="font-mono text-xs text-slate-500">{entry.date}</span></td>
                  <td><span className="font-cyber text-xs">{entry.tool}</span></td>
                  <td><span className="font-mono text-xs truncate max-w-[140px] block">{entry.target}</span></td>
                  <td><span className="text-xs text-slate-300">{entry.result}</span></td>
                  <td><Badge variant={RISK_BADGE[entry.risk] || 'info'}>{entry.risk}</Badge></td>
                  <td><span className="font-mono text-xs text-slate-500">{entry.duration}</span></td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <button
                        className="p-1.5 rounded text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                        title="View details"
                        onClick={() => alert(`Scan: ${entry.id}\nTool: ${entry.tool}\nTarget: ${entry.target}\nResult: ${entry.result}`)}
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete"
                        onClick={() => deleteEntry(entry.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {paged.length === 0 && (
            <div className="py-12 text-center">
              <p className="font-cyber text-sm text-slate-600">No scan records found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pageCount > 1 && (
          <div className="px-5 py-3 border-t border-cyan-500/10 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">{filtered.length} results · Page {page} of {pageCount}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded border border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                disabled={page === pageCount}
                className="p-1.5 rounded border border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
