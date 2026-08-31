import React, { useEffect, useRef, useState } from 'react';

// ─── Security Gauge (Circular) ────────────────────────────────────────────────
interface SecurityGaugeProps {
  value: number; // 0–100
  label?: string;
  size?: number;
  color?: string;
  showScore?: boolean;
}

export function SecurityGauge({ value, label, size = 160, color = '#00f5ff', showScore = true }: SecurityGaugeProps) {
  const [animated, setAnimated] = useState(0);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = ((animated / 100) * circumference * 0.75);
  const offset = circumference * 0.875 - strokeDash;

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  const getColor = (v: number) => {
    if (v >= 80) return '#00f5ff';
    if (v >= 60) return '#22c55e';
    if (v >= 40) return '#f59e0b';
    if (v >= 20) return '#f97316';
    return '#ef4444';
  };

  const c = color || getColor(value);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="10"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeDashoffset={circumference * 0.125}
            strokeLinecap="round"
            transform={`rotate(135 ${size / 2} ${size / 2})`}
          />
          {/* Value arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={c}
            strokeWidth="10"
            strokeDasharray={`${strokeDash} ${circumference - strokeDash}`}
            strokeDashoffset={circumference * 0.125}
            strokeLinecap="round"
            transform={`rotate(135 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dasharray 1s ease', filter: `drop-shadow(0 0 6px ${c})` }}
          />
        </svg>
        {showScore && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-cyber text-3xl font-bold" style={{ color: c }}>{animated}</span>
            <span className="font-cyber text-xs text-slate-400 tracking-widest">/ 100</span>
          </div>
        )}
      </div>
      {label && <p className="font-cyber text-xs text-slate-300 tracking-widest uppercase text-center">{label}</p>}
    </div>
  );
}

// ─── Radar Scanner ────────────────────────────────────────────────────────────
export function RadarScanner({ size = 200, scanning = false, color = '#00f5ff' }: {
  size?: number; scanning?: boolean; color?: string;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid circles */}
        {[0.25, 0.5, 0.75, 1].map((f, i) => (
          <circle key={i} cx={cx} cy={cy} r={r * f} fill="none" stroke={`${color}22`} strokeWidth="1" />
        ))}
        {/* Cross hairs */}
        <line x1={cx} y1={10} x2={cx} y2={size - 10} stroke={`${color}33`} strokeWidth="1" />
        <line x1={10} y1={cy} x2={size - 10} y2={cy} stroke={`${color}33`} strokeWidth="1" />

        {/* Scanning beam */}
        {scanning && (
          <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'radar-spin 2s linear infinite' }}>
            <path
              d={`M ${cx} ${cy} L ${cx + r} ${cy} A ${r} ${r} 0 0 0 ${cx + r * Math.cos(-Math.PI / 3)} ${cy + r * Math.sin(-Math.PI / 3)} Z`}
              fill={`url(#radarGrad)`}
              opacity="0.7"
            />
            <defs>
              <radialGradient id="radarGrad" cx="0%" cy="50%">
                <stop offset="0%" stopColor={color} stopOpacity="0" />
                <stop offset="100%" stopColor={color} stopOpacity="0.4" />
              </radialGradient>
            </defs>
          </g>
        )}

        {/* Dots (simulated targets) */}
        {scanning && [
          { x: cx + r * 0.3, y: cy - r * 0.5 },
          { x: cx - r * 0.6, y: cy + r * 0.2 },
          { x: cx + r * 0.7, y: cy + r * 0.4 },
        ].map((dot, i) => (
          <circle key={i} cx={dot.x} cy={dot.y} r="4" fill={color}
            style={{ filter: `drop-shadow(0 0 4px ${color})`, animation: `pulse-neon ${1 + i * 0.3}s ease-in-out infinite` }}
          />
        ))}
        {/* Center dot */}
        <circle cx={cx} cy={cy} r="4" fill={color} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
      </svg>
    </div>
  );
}

// ─── Progress Ring ────────────────────────────────────────────────────────────
export function ProgressRing({ value, size = 100, strokeWidth = 8, color = '#00f5ff', label }: {
  value: number; size?: number; strokeWidth?: number; color?: string; label?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 4px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-cyber text-sm font-bold" style={{ color }}>{value}%</span>
        </div>
      </div>
      {label && <p className="text-xs text-slate-400 font-cyber tracking-wide">{label}</p>}
    </div>
  );
}

// ─── Network Graph ────────────────────────────────────────────────────────────
export function NetworkGraph({ width = 300, height = 180 }: { width?: number; height?: number }) {
  const nodes = [
    { x: width / 2, y: height / 2, r: 12, color: '#00f5ff', label: 'CORE' },
    { x: width * 0.15, y: height * 0.25, r: 7, color: '#3b82f6', label: 'NODE' },
    { x: width * 0.85, y: height * 0.25, r: 7, color: '#8b5cf6', label: 'NODE' },
    { x: width * 0.15, y: height * 0.75, r: 7, color: '#10b981', label: 'NODE' },
    { x: width * 0.85, y: height * 0.75, r: 7, color: '#f59e0b', label: 'NODE' },
    { x: width * 0.5, y: height * 0.1, r: 5, color: '#00f5ff', label: '' },
    { x: width * 0.5, y: height * 0.9, r: 5, color: '#00f5ff', label: '' },
  ];
  const cx = nodes[0].x;
  const cy = nodes[0].y;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {nodes.slice(1).map((n, i) => (
        <line key={i} x1={cx} y1={cy} x2={n.x} y2={n.y} stroke={`${n.color}44`} strokeWidth="1" strokeDasharray="4 4" />
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={n.r + 4} fill={`${n.color}15`} style={{ animation: `pulse-neon ${1.5 + i * 0.2}s ease-in-out infinite` }} />
          <circle cx={n.x} cy={n.y} r={n.r} fill={`${n.color}33`} stroke={n.color} strokeWidth="1.5" style={{ filter: `drop-shadow(0 0 4px ${n.color})` }} />
          {n.label && <text x={n.x} y={n.y + n.r + 12} textAnchor="middle" fontSize="8" fill={n.color} fontFamily="Orbitron">{n.label}</text>}
        </g>
      ))}
    </svg>
  );
}

// ─── Globe Visualization ──────────────────────────────────────────────────────
interface GlobeProps {
  size?: number;
  marker?: { lat: number; lng: number };
}

export function GlobeVisualization({ size = 200, marker }: GlobeProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;

  // Convert lat/lng to SVG coords on a circle
  const latRad = marker ? (marker.lat * Math.PI) / 180 : 0;
  const lngRad = marker ? (marker.lng * Math.PI) / 180 : 0;
  const mx = cx + r * Math.cos(latRad) * Math.sin(lngRad);
  const my = cy - r * Math.sin(latRad);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <radialGradient id="globeGrad" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#1e3a5f" />
            <stop offset="100%" stopColor="#020817" />
          </radialGradient>
          <radialGradient id="glowGrad" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#00f5ff" stopOpacity="0" />
            <stop offset="100%" stopColor="#00f5ff" stopOpacity="0.15" />
          </radialGradient>
        </defs>
        {/* Globe body */}
        <circle cx={cx} cy={cy} r={r} fill="url(#globeGrad)" stroke="#00f5ff33" strokeWidth="1" />
        {/* Latitude lines */}
        {[-0.6, -0.3, 0, 0.3, 0.6].map((f, i) => {
          const yr = cy + r * f;
          const xr = Math.sqrt(r * r - (r * f) * (r * f));
          return <ellipse key={i} cx={cx} cy={yr} rx={xr} ry={xr * 0.2} fill="none" stroke="#00f5ff22" strokeWidth="0.8" />;
        })}
        {/* Longitude lines */}
        {[0, 60, 120].map((deg, i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={r * 0.4} ry={r}
            fill="none" stroke="#00f5ff22" strokeWidth="0.8"
            transform={`rotate(${deg} ${cx} ${cy})`} />
        ))}
        {/* Glow */}
        <circle cx={cx} cy={cy} r={r} fill="url(#glowGrad)" />
        {/* Marker */}
        {marker && (
          <g>
            <circle cx={mx} cy={my} r={8} fill="#ef444422" stroke="#ef4444" strokeWidth="1.5" style={{ animation: 'pulse-neon 1.5s ease-in-out infinite' }} />
            <circle cx={mx} cy={my} r={4} fill="#ef4444" style={{ filter: 'drop-shadow(0 0 6px #ef4444)' }} />
          </g>
        )}
      </svg>
    </div>
  );
}

// ─── Cyber Particles Background ───────────────────────────────────────────────
export function CyberBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="cyber-grid absolute inset-0 opacity-100" />
      {/* Animated particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-cyan-400/30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `particle-float ${4 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 4}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Firewall Animation ───────────────────────────────────────────────────────
interface Packet {
  id: string;
  protocol: string;
  action: 'ALLOW' | 'DENY';
  progress: number;
}

export function FirewallAnimation({ packets }: { packets: Packet[] }) {
  const svgWidth = 320;
  const svgHeight = 200;

  return (
    <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full">
      {/* Labels */}
      <text x="160" y="15" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="Orbitron">INTERNET</text>
      <text x="160" y="105" textAnchor="middle" fill="#00f5ff" fontSize="10" fontFamily="Orbitron">FIREWALL</text>
      <text x="160" y="190" textAnchor="middle" fill="#10b981" fontSize="10" fontFamily="Orbitron">PROTECTED NETWORK</text>

      {/* Zones */}
      <rect x="10" y="20" width="300" height="60" rx="6" fill="#00f5ff08" stroke="#00f5ff22" strokeWidth="1" />
      <rect x="10" y="110" width="300" height="70" rx="6" fill="#10b98108" stroke="#10b98122" strokeWidth="1" />

      {/* Firewall box */}
      <rect x="80" y="88" width="160" height="24" rx="4" fill="#1e3a5f" stroke="#00f5ff44" strokeWidth="1.5" />
      <text x="160" y="104" textAnchor="middle" fill="#00f5ff" fontSize="9" fontFamily="Orbitron">▌ ACTIVE FIREWALL ▐</text>

      {/* Packets */}
      {packets.map(p => {
        const x = 50 + p.progress * 220;
        const y = 50 + p.progress * 100;
        const color = p.action === 'ALLOW' ? '#10b981' : '#ef4444';
        return (
          <g key={p.id}>
            <circle cx={x} cy={y} r="6" fill={`${color}33`} stroke={color} strokeWidth="1.5"
              style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
            <text x={x + 10} y={y + 4} fill={color} fontSize="7" fontFamily="Share Tech Mono">{p.protocol}</text>
          </g>
        );
      })}
    </svg>
  );
}
