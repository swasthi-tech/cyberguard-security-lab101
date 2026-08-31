import React, { useState, useEffect, useRef } from 'react';
import { Network, Play, RotateCcw } from 'lucide-react';
import { Button, SimBanner, Badge, SectionHeader } from '../../components/ui';
import { RadarScanner } from '../../components/security';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DEMO_RESULTS = [
  { port: 22, protocol: 'TCP', service: 'SSH', status: 'OPEN', risk: 'MEDIUM' },
  { port: 53, protocol: 'UDP', service: 'DNS', status: 'OPEN', risk: 'LOW' },
  { port: 80, protocol: 'TCP', service: 'HTTP', status: 'OPEN', risk: 'LOW' },
  { port: 443, protocol: 'TCP', service: 'HTTPS', status: 'OPEN', risk: 'LOW' },
  { port: 3306, protocol: 'TCP', service: 'MySQL', status: 'OPEN', risk: 'HIGH' },
  { port: 8080, protocol: 'TCP', service: 'HTTP-Alt', status: 'FILTERED', risk: 'LOW' },
  { port: 3389, protocol: 'TCP', service: 'RDP', status: 'CLOSED', risk: 'LOW' },
  { port: 21, protocol: 'TCP', service: 'FTP', status: 'CLOSED', risk: 'LOW' },
  { port: 25, protocol: 'TCP', service: 'SMTP', status: 'FILTERED', risk: 'MEDIUM' },
  { port: 110, protocol: 'TCP', service: 'POP3', status: 'CLOSED', risk: 'LOW' },
];

const SCAN_MODES = ['Quick', 'Standard', 'Deep Simulation'];

function generateTrafficData(tick: number) {
  return Array.from({ length: 20 }, (_, i) => ({
    t: i,
    pkts: i === tick % 20 ? Math.floor(Math.random() * 60 + 20) : Math.floor(Math.random() * 20),
  }));
}

export function PortScannerPage() {
  const [target, setTarget] = useState('example.com');
  const [mode, setMode] = useState('Standard');
  const [portFrom, setPortFrom] = useState('1');
  const [portTo, setPortTo] = useState('1024');
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPort, setCurrentPort] = useState(0);
  const [results, setResults] = useState<typeof DEMO_RESULTS>([]);
  const [trafficData, setTrafficData] = useState<{ t: number; pkts: number }[]>([]);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const tickRef = useRef(0);

  const startScan = () => {
    if (scanning) return;
    setScanning(true);
    setProgress(0);
    setResults([]);
    setDone(false);
    setCurrentPort(1);
    tickRef.current = 0;

    const duration = mode === 'Quick' ? 3000 : mode === 'Standard' ? 6000 : 10000;
    const steps = DEMO_RESULTS.length;
    let step = 0;

    intervalRef.current = setInterval(() => {
      tickRef.current++;
      const pct = Math.min(Math.round((tickRef.current / (duration / 200)) * 100), 99);
      setProgress(pct);
      setCurrentPort(Math.floor(Math.random() * 1024));
      setTrafficData(generateTrafficData(tickRef.current));

      const revealAt = Math.floor((tickRef.current / (duration / 200)) * steps);
      if (revealAt > step) {
        setResults(DEMO_RESULTS.slice(0, revealAt));
        step = revealAt;
      }

      if (tickRef.current >= duration / 200) {
        clearInterval(intervalRef.current);
        setProgress(100);
        setResults(DEMO_RESULTS);
        setScanning(false);
        setDone(true);
      }
    }, 200);
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    setScanning(false);
    setProgress(0);
    setResults([]);
    setDone(false);
    setCurrentPort(0);
    setTrafficData([]);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const riskBadge = (risk: string) => {
    if (risk === 'HIGH') return <Badge variant="high">HIGH</Badge>;
    if (risk === 'MEDIUM') return <Badge variant="medium">MEDIUM</Badge>;
    return <Badge variant="low">LOW</Badge>;
  };

  const statusColor = (s: string) => s === 'OPEN' ? 'text-emerald-400' : s === 'FILTERED' ? 'text-yellow-400' : 'text-slate-500';

  return (
    <div className="space-y-6 max-w-5xl">
      <SectionHeader title="Network Port Scanner" icon={<Network size={22} />} subtitle="Simulate TCP/UDP port scanning with radar visualization" />
      <SimBanner message="No real network scanning is performed. All results are simulated demo data." />

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Config Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-5 space-y-4">
            <div>
              <label className="block text-xs font-cyber text-cyan-400 tracking-widest uppercase mb-2">Target</label>
              <input
                className="cyber-input"
                value={target}
                onChange={e => setTarget(e.target.value)}
                placeholder="example.com or 192.168.1.1"
                disabled={scanning}
              />
            </div>

            <div>
              <label className="block text-xs font-cyber text-cyan-400 tracking-widest uppercase mb-2">Scan Mode</label>
              <div className="flex flex-col gap-2">
                {SCAN_MODES.map(m => (
                  <label key={m} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="mode"
                      value={m}
                      checked={mode === m}
                      onChange={() => setMode(m)}
                      disabled={scanning}
                      className="accent-cyan-500"
                    />
                    <span className="text-sm text-slate-300 font-cyber">{m}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-cyber text-cyan-400 tracking-widest uppercase mb-2">Port Range</label>
              <div className="flex items-center gap-2">
                <input className="cyber-input text-center" value={portFrom} onChange={e => setPortFrom(e.target.value)} disabled={scanning} placeholder="1" />
                <span className="text-slate-500">—</span>
                <input className="cyber-input text-center" value={portTo} onChange={e => setPortTo(e.target.value)} disabled={scanning} placeholder="1024" />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="primary" size="md" className="flex-1" onClick={startScan} disabled={scanning} icon={<Play size={14} />}>
                {scanning ? 'Scanning...' : 'Start Simulated Scan'}
              </Button>
              {(scanning || done) && (
                <Button variant="ghost" size="md" onClick={reset} icon={<RotateCcw size={14} />} title="Reset" />
              )}
            </div>
          </div>

          {/* Radar */}
          <div className="glass-card p-5 flex flex-col items-center">
            <p className="text-xs font-cyber text-cyan-400 tracking-widest uppercase mb-4">Radar Scanner</p>
            <RadarScanner size={180} scanning={scanning} />
            {scanning && (
              <div className="mt-4 text-center">
                <p className="font-cyber text-lg font-bold text-cyan-400">{progress}%</p>
                <p className="font-mono text-xs text-slate-500 mt-1">Probing port: {currentPort}</p>
              </div>
            )}
            {done && <p className="font-cyber text-sm text-emerald-400 mt-4">✓ SCAN COMPLETE</p>}
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-3 space-y-4">
          {/* Progress */}
          {(scanning || done) && (
            <div className="glass-card p-4">
              <div className="flex justify-between mb-2">
                <span className="text-xs font-cyber text-slate-400 tracking-widest">SCAN PROGRESS</span>
                <span className="text-xs font-cyber font-bold text-cyan-400">{progress}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#00f5ff,#3b82f6)', boxShadow: '0 0 8px rgba(0,245,255,0.5)' }}
                />
              </div>
            </div>
          )}

          {/* Traffic Graph */}
          {scanning && trafficData.length > 0 && (
            <div className="glass-card p-4">
              <p className="text-xs font-cyber text-cyan-400 tracking-widest uppercase mb-3">Network Activity</p>
              <ResponsiveContainer width="100%" height={100}>
                <AreaChart data={trafficData}>
                  <defs>
                    <linearGradient id="pktsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#00f5ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="pkts" stroke="#00f5ff" fill="url(#pktsGrad)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Results Table */}
          {results.length > 0 && (
            <div className="glass-card overflow-hidden">
              <div className="px-5 py-3 border-b border-cyan-500/10">
                <h3 className="font-cyber text-sm font-bold text-white">Scan Results</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{results.filter(r => r.status === 'OPEN').length} open ports found</p>
              </div>
              <div className="overflow-x-auto">
                <table className="cyber-table">
                  <thead>
                    <tr>
                      <th>PORT</th>
                      <th>PROTO</th>
                      <th>SERVICE</th>
                      <th>STATUS</th>
                      <th>RISK</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr key={i}>
                        <td className="font-mono-cyber font-bold text-cyan-400">{r.port}</td>
                        <td className="font-mono text-slate-400">{r.protocol}</td>
                        <td className="text-slate-300">{r.service}</td>
                        <td className={`font-cyber text-xs font-bold ${statusColor(r.status)}`}>{r.status}</td>
                        <td>{riskBadge(r.risk)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!scanning && !done && (
            <div className="glass-card p-12 flex flex-col items-center gap-3 text-center">
              <Network size={40} className="text-slate-600" />
              <p className="font-cyber text-sm text-slate-500">Configure scan parameters and click Start</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
