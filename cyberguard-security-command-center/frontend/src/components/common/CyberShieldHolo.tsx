import React from 'react';
import { motion } from 'framer-motion';

interface CyberShieldHoloProps {
  className?: string;
}

export const CyberShieldHolo: React.FC<CyberShieldHoloProps> = ({ className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer rotating cyber ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute w-72 h-72 rounded-full border border-dashed border-cyan-500/25 pointer-events-none"
      />

      {/* Counter-rotating segmented ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        className="absolute w-60 h-60 rounded-full border border-cyan-400/20 border-t-cyan-400 border-b-cyan-400 pointer-events-none shadow-[0_0_15px_rgba(0,240,255,0.2)]"
      />

      {/* Glowing backdrop pulse */}
      <div className="absolute w-48 h-48 rounded-full bg-cyan-500/10 blur-2xl animate-pulse" />

      {/* Cyber Shield SVG */}
      <motion.svg
        viewBox="0 0 200 240"
        className="w-52 h-60 relative z-10 drop-shadow-[0_0_25px_rgba(0,240,255,0.4)]"
        initial={{ scale: 0.9, opacity: 0.8 }}
        animate={{ scale: [0.95, 1.02, 0.95], opacity: [0.9, 1, 0.9] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <defs>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="coreGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#050a18" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Outer Shield Shell */}
        <path
          d="M 100 15 L 180 50 L 180 130 C 180 185, 100 225, 100 225 C 100 225, 20 185, 20 130 L 20 50 Z"
          fill="url(#coreGrad)"
          stroke="url(#shieldGrad)"
          strokeWidth="3"
        />

        {/* Inner Shield Facet */}
        <path
          d="M 100 35 L 160 62 L 160 125 C 160 168, 100 200, 100 200 C 100 200, 40 168, 40 125 L 40 62 Z"
          fill="none"
          stroke="#00f0ff"
          strokeWidth="1.5"
          strokeDasharray="6,4"
          opacity="0.7"
        />

        {/* Center Keyhole / Circuit Core */}
        <circle cx="100" cy="110" r="18" fill="#070d1f" stroke="#00f0ff" strokeWidth="2.5" />
        <path
          d="M 96 114 L 104 114 L 107 130 L 93 130 Z"
          fill="#00f0ff"
          opacity="0.85"
        />

        {/* Circuit Nodes */}
        <line x1="100" y1="50" x2="100" y2="92" stroke="#00f0ff" strokeWidth="2" strokeDasharray="3,3" />
        <line x1="100" y1="130" x2="100" y2="175" stroke="#00f0ff" strokeWidth="2" strokeDasharray="3,3" />
        <circle cx="100" cy="50" r="3" fill="#00f0ff" />
        <circle cx="100" cy="175" r="3" fill="#00f0ff" />
      </motion.svg>
    </div>
  );
};
