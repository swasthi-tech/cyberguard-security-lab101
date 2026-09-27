/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#040816',
          panel: '#081026',
          panelLight: '#0d1a3e',
          card: 'rgba(10, 20, 48, 0.65)',
          border: 'rgba(0, 240, 255, 0.2)',
          borderHover: 'rgba(0, 240, 255, 0.45)',
          cyan: '#00f0ff',
          cyanGlow: '#00e5ff',
          blue: '#3b82f6',
          purple: '#8b5cf6',
          emerald: '#10b981',
          amber: '#f59e0b',
          red: '#ef4444',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'radar-sweep': 'radarSweep 4s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4', filter: 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.4))' },
          '50%': { opacity: '0.9', filter: 'drop-shadow(0 0 16px rgba(0, 240, 255, 0.8))' },
        },
      },
      boxShadow: {
        'cyan-glow': '0 0 15px rgba(0, 240, 255, 0.35)',
        'cyan-glow-lg': '0 0 30px rgba(0, 240, 255, 0.5)',
        'red-glow': '0 0 15px rgba(239, 68, 68, 0.4)',
        'emerald-glow': '0 0 15px rgba(16, 185, 129, 0.4)',
      },
    },
  },
  plugins: [],
}
