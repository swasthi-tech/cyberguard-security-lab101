import React from 'react';
import { motion } from 'framer-motion';

export const WorldMapRadar: React.FC = () => {
  const nodes = [
    { id: 'us-east', x: 190, y: 110, label: 'US-EAST (HQ)', status: 'ACTIVE', color: '#00f0ff' },
    { id: 'us-west', x: 130, y: 115, label: 'US-WEST', status: 'ACTIVE', color: '#00f0ff' },
    { id: 'eu-west', x: 380, y: 95, label: 'EU-CENTRAL', status: 'ACTIVE', color: '#10b981' },
    { id: 'ap-east', x: 620, y: 135, label: 'AP-EAST', status: 'ACTIVE', color: '#00f0ff' },
    { id: 'sa-east', x: 250, y: 220, label: 'SA-BRAZIL', status: 'MONITORING', color: '#38bdf8' },
    { id: 'anom-01', x: 480, y: 80, label: 'SRC: ASN 14061', status: 'THREAT', color: '#ef4444' },
  ];

  return (
    <div className="relative w-full h-72 bg-[#050a18] rounded-xl border border-cyan-500/25 overflow-hidden flex items-center justify-center p-4">
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f0ff08_1px,transparent_1px),linear-gradient(to_bottom,#00f0ff08_1px,transparent_1px)] bg-[size:24px_24px]" />

      <svg viewBox="0 0 800 320" className="w-full h-full relative z-10 select-none">
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Abstract World Landmass Polygons */}
        <g fill="rgba(15, 30, 65, 0.4)" stroke="rgba(0, 240, 255, 0.18)" strokeWidth="1">
          {/* North America */}
          <polygon points="100,60 220,50 250,90 220,150 170,140 140,180 120,120 80,100" />
          {/* South America */}
          <polygon points="210,170 270,180 290,240 250,290 220,240" />
          {/* Europe */}
          <polygon points="360,60 430,55 450,90 410,120 360,100" />
          {/* Africa */}
          <polygon points="370,130 450,130 470,200 420,260 380,210" />
          {/* Asia */}
          <polygon points="460,50 670,60 700,120 650,180 540,160 480,110" />
          {/* Australia */}
          <polygon points="630,210 710,210 700,260 640,260" />
        </g>

        {/* Telemetry Links & Attack Vectors */}
        <path
          d="M 190 110 Q 285 50 380 95"
          fill="none"
          stroke="rgba(0, 240, 255, 0.4)"
          strokeWidth="1.5"
          strokeDasharray="4,4"
        />
        <path
          d="M 380 95 Q 500 70 620 135"
          fill="none"
          stroke="rgba(0, 240, 255, 0.4)"
          strokeWidth="1.5"
          strokeDasharray="4,4"
        />
        {/* Threat Vector */}
        <motion.path
          d="M 480 80 Q 335 40 190 110"
          fill="none"
          stroke="#ef4444"
          strokeWidth="2"
          strokeDasharray="6,4"
          animate={{ strokeDashoffset: [0, -40] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />

        {/* Dynamic Nodes */}
        {nodes.map((node) => (
          <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
            {/* Pulsing ring */}
            <circle cx="0" cy="0" r="10" fill={node.color} opacity="0.15">
              <animate attributeName="r" values="5;14;5" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0;0.4" dur="2.5s" repeatCount="indefinite" />
            </circle>

            {/* Core dot */}
            <circle cx="0" cy="0" r="4.5" fill={node.color} />
            <circle cx="0" cy="0" r="2" fill="#ffffff" />

            {/* Label */}
            <text
              x="8"
              y="3"
              fill={node.color}
              fontSize="9"
              fontFamily="monospace"
              fontWeight="600"
              className="select-none"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-2.5 right-3 flex items-center gap-3 text-[10px] font-mono bg-slate-900/80 px-2.5 py-1 rounded border border-slate-700/60 backdrop-blur-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="text-slate-300">TELEMETRY NODE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-slate-300">INGRESS THREAT VECTOR</span>
        </div>
      </div>
    </div>
  );
};
