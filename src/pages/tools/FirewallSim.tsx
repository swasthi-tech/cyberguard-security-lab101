import React, { useState, useEffect, useRef } from 'react';
import { Flame, Plus, Trash2, Play, Pause } from 'lucide-react';
import { Button, SimBanner, SectionHeader, StatCard } from '../../components/ui';
import type { FirewallRule, FirewallPacket } from '../../types';

const DEFAULT_RULES: FirewallRule[] = [
  { id: '1', protocol: 'TCP', port: 443, action: 'ALLOW' },
  { id: '2', protocol: 'TCP', port: 80, action: 'ALLOW' },
  { id: '3', protocol: 'TCP', port: 22, action: 'DENY' },
  { id: '4', protocol: 'UDP', port: 53, action: 'ALLOW' },
  { id: '5', protocol: 'TCP', port: 3306, action: 'DENY' },
];

const PROTOCOLS = ['TCP', 'UDP', 'HTTP', 'HTTPS'];

function generatePacket(rules: FirewallRule[]): FirewallPacket {
  const protocols = ['TCP', 'UDP', 'HTTP', 'HTTPS'] as const;
  const commonPorts = [80, 443, 22, 3306, 53, 8080, 3389, 25, 110, 21];
  const proto = protocols[Math.floor(Math.random() * protocols.length)];
  const port = commonPorts[Math.floor(Math.random() * commonPorts.length)];
  const srcIP = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

  const matchedRule = rules.find(r => r.protocol === proto && r.port === port);
  const action = matchedRule ? matchedRule.action : (Math.random() > 0.3 ? 'ALLOW' : 'DENY');

  return {
    id: Math.random().toString(36).substr(2),
    protocol: proto,
    srcIP,
    dstPort: port,
    action,
    size: Math.floor(Math.random() * 1400 + 60),
    timestamp: new Date().toLocaleTimeString(),
  };
}

export function FirewallSimPage() {
  const [rules, setRules] = useState<FirewallRule[]>(DEFAULT_RULES);
  const [packets, setPackets] = useState<FirewallPacket[]>([]);
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState({ inspected: 0, allowed: 0, blocked: 0, threats: 0 });
  const [newRule, setNewRule] = useState({ protocol: 'TCP', port: '', action: 'ALLOW' as 'ALLOW' | 'DENY' });
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        const pkt = generatePacket(rules);
        setPackets(prev => [pkt, ...prev].slice(0, 20));
        setStats(prev => ({
          inspected: prev.inspected + 1,
          allowed: prev.allowed + (pkt.action === 'ALLOW' ? 1 : 0),
          blocked: prev.blocked + (pkt.action === 'DENY' ? 1 : 0),
          threats: prev.threats + (pkt.action === 'DENY' && [22, 3306, 3389, 21].includes(pkt.dstPort) ? 1 : 0),
        }));
      }, 800);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, rules]);

  const addRule = () => {
    if (!newRule.port) return;
    setRules(prev => [...prev, { id: Math.random().toString(36).substr(2), protocol: newRule.protocol, port: Number(newRule.port), action: newRule.action }]);
    setNewRule({ protocol: 'TCP', port: '', action: 'ALLOW' });
  };

  const deleteRule = (id: string) => setRules(prev => prev.filter(r => r.id !== id));

  const actionColor = (a: string) => a === 'ALLOW' ? '#10b981' : '#ef4444';

  return (
    <div className="space-y-6">
      <SectionHeader title="Firewall Simulator" icon={<Flame size={22} />} subtitle="Visual educational simulation of firewall rule processing and packet filtering" />
      <SimBanner message="This is a purely visual simulation for education. No real network traffic is affected." />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Inspected" value={stats.inspected} icon={<Flame size={20} />} color="cyan" />
        <StatCard label="Allowed" value={stats.allowed} icon={<Flame size={20} />} color="green" />
        <StatCard label="Blocked" value={stats.blocked} icon={<Flame size={20} />} color="red" />
        <StatCard label="Threats Sim." value={stats.threats} icon={<Flame size={20} />} color="orange" />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Firewall Topology */}
        <div className="lg:col-span-2 space-y-4">
          {/* Visual */}
          <div className="glass-card p-5">
            <p className="font-cyber text-xs text-cyan-400 tracking-widest uppercase text-center mb-4">Network Topology</p>
            <div className="flex flex-col items-center gap-2 py-4">
              {/* Internet */}
              <div className="w-32 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-center">
                <p className="font-cyber text-xs text-slate-300">INTERNET</p>
                <p className="text-[10px] text-slate-500 font-mono">External Traffic</p>
              </div>
              <div className="flex items-center gap-1">
                {packets.slice(0, 5).map(p => (
                  <div
                    key={p.id}
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ background: actionColor(p.action), boxShadow: `0 0 4px ${actionColor(p.action)}`, animationDelay: `${Math.random() * 0.5}s` }}
                  />
                ))}
                <div className="w-px h-10 bg-gradient-to-b from-slate-500 to-cyan-500/50 mx-2" />
              </div>
              {/* Firewall */}
              <div className="w-40 py-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-center">
                <Flame size={16} className="mx-auto text-cyan-400 mb-1" />
                <p className="font-cyber text-xs text-cyan-400">FIREWALL</p>
                <p className="text-[10px] text-slate-500">Rule Engine Active</p>
              </div>
              <div className="w-px h-10 bg-gradient-to-b from-emerald-500/50 to-slate-500" />
              {/* Protected */}
              <div className="w-40 py-2 rounded-lg bg-emerald-500/8 border border-emerald-500/20 text-center">
                <p className="font-cyber text-xs text-emerald-400">PROTECTED NETWORK</p>
                <p className="text-[10px] text-slate-500 font-mono">Internal Systems</p>
              </div>
            </div>
          </div>

          {/* Rules */}
          <div className="glass-card p-5">
            <h3 className="font-cyber text-sm font-bold text-white mb-4">Firewall Rules</h3>
            <div className="space-y-2 mb-4">
              {rules.map(rule => (
                <div key={rule.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${rule.action === 'ALLOW' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    <span className="font-mono text-xs text-slate-400">{rule.protocol} : {rule.port}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-cyber text-xs font-bold ${rule.action === 'ALLOW' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {rule.action}
                    </span>
                    <button onClick={() => deleteRule(rule.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add rule */}
            <div className="flex gap-2">
              <select
                className="cyber-input flex-1 text-xs"
                value={newRule.protocol}
                onChange={e => setNewRule(p => ({ ...p, protocol: e.target.value }))}
              >
                {PROTOCOLS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <input
                className="cyber-input w-20 text-xs text-center"
                placeholder="Port"
                value={newRule.port}
                onChange={e => setNewRule(p => ({ ...p, port: e.target.value }))}
                type="number"
              />
              <select
                className="cyber-input flex-1 text-xs"
                value={newRule.action}
                onChange={e => setNewRule(p => ({ ...p, action: e.target.value as 'ALLOW' | 'DENY' }))}
              >
                <option value="ALLOW">ALLOW</option>
                <option value="DENY">DENY</option>
              </select>
              <button onClick={addRule} className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-colors">
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Start/Stop */}
          <Button
            variant={running ? 'danger' : 'primary'}
            size="lg"
            className="w-full"
            onClick={() => setRunning(!running)}
            icon={running ? <Pause size={16} /> : <Play size={16} />}
          >
            {running ? 'Pause Simulation' : 'Start Simulation'}
          </Button>
        </div>

        {/* Packet Log */}
        <div className="lg:col-span-3 glass-card overflow-hidden">
          <div className="px-5 py-3 border-b border-cyan-500/10">
            <h3 className="font-cyber text-sm font-bold text-white">Live Packet Log</h3>
            {running && <span className="text-xs text-emerald-400 font-mono animate-pulse">● LIVE</span>}
          </div>
          <div className="overflow-x-auto">
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>TIME</th>
                  <th>SRC IP</th>
                  <th>PROTO</th>
                  <th>PORT</th>
                  <th>SIZE</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {packets.map(p => (
                  <tr key={p.id} className="animate-fade-in-up">
                    <td className="font-mono text-[11px] text-slate-500">{p.timestamp}</td>
                    <td className="font-mono text-[11px] text-slate-400">{p.srcIP}</td>
                    <td className="font-mono-cyber text-[11px]" style={{ color: '#00f5ff' }}>{p.protocol}</td>
                    <td className="font-mono font-bold text-slate-300">{p.dstPort}</td>
                    <td className="font-mono text-[11px] text-slate-500">{p.size}B</td>
                    <td>
                      <span
                        className="font-cyber text-xs font-bold px-2 py-0.5 rounded"
                        style={{ color: actionColor(p.action), background: `${actionColor(p.action)}15` }}
                      >
                        {p.action}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {packets.length === 0 && (
              <div className="py-12 text-center">
                <p className="font-cyber text-sm text-slate-600">Start the simulation to see packet flow</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
