import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Network, Globe, Link2, Fish, Flame, Bug, Globe2,
  ArrowRight, Zap, Lock, Eye, ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui';
import { NetworkGraph, CyberBackground } from '../components/security';

const tools = [
  {
    id: 1,
    label: '01',
    icon: <Globe size={28} />,
    title: 'IP Address Information',
    desc: 'Analyze IP geolocation, ASN, reputation, and risk scores.',
    color: '#3b82f6',
    path: '/tools/ip-information',
  },
  {
    id: 2,
    label: '02',
    icon: <Link2 size={28} />,
    title: 'URL Safety Checker',
    desc: 'Evaluate URL safety with multi-factor indicator analysis.',
    color: '#8b5cf6',
    path: '/tools/url-safety',
  },
  {
    id: 3,
    label: '03',
    icon: <Fish size={28} />,
    title: 'Phishing Detector',
    desc: 'Machine-learning inspired phishing probability analysis.',
    color: '#f59e0b',
    path: '/tools/phishing-detector',
  },
  {
    id: 4,
    label: '04',
    icon: <Flame size={28} />,
    title: 'Firewall Simulator',
    desc: 'Animated firewall rule engine with real-time packet flow.',
    color: '#ef4444',
    path: '/tools/firewall',
  },
  {
    id: 5,
    label: '05',
    icon: <Bug size={28} />,
    title: 'Malware Scanner',
    desc: 'Signature-based educational malware scanning simulation.',
    color: '#10b981',
    path: '/tools/malware-scanner',
  },

];

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020817] relative overflow-hidden">
      <CyberBackground />

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <Shield size={40} className="text-cyan-400" style={{ filter: 'drop-shadow(0 0 15px rgba(0,245,255,0.8))' }} />
          <div>
            <div className="font-cyber text-2xl font-black text-white tracking-wider">CYBERGUARD</div>
            <div className="font-cyber text-sm text-cyan-400/80 tracking-[0.5em]">SECURITY LAB</div>
          </div>
        </div>

        {/* Headline */}
        <h1 className="font-cyber text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
          <span className="text-white">Advanced Security Tools.</span>
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #00f5ff, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            One Intelligent Platform.
          </span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          Explore cybersecurity through interactive security analysis and safe simulation.
          <br className="hidden md:block" />
          Built for education. Designed for professionals.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-16">
          <Button
            variant="primary"
            size="lg"
            icon={<Shield size={18} />}
            onClick={() => navigate('/register')}
          >
            Get Started
          </Button>
          <Button
            variant="outline"
            size="lg"
            icon={<Zap size={18} />}
            onClick={() => navigate('/dashboard')}
          >
            Explore Security Tools
          </Button>
        </div>

        {/* Network Graph visual */}
        <div className="hidden md:block absolute right-12 top-1/2 -translate-y-1/2 opacity-40">
          <NetworkGraph width={300} height={200} />
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-8 justify-center text-center">
          {[
            { label: 'Security Tools', value: '5' },
            { label: 'Threat Signatures', value: '500+' },
            { label: 'Scan Checks', value: '50+' },
            { label: 'Uptime', value: '99.9%' },
          ].map(stat => (
            <div key={stat.label}>
              <div className="font-cyber text-3xl font-black text-neon-cyan">{stat.value}</div>
              <div className="text-xs text-slate-500 font-cyber tracking-widest mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Tools Section */}
      <section className="relative z-10 px-6 md:px-12 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-cyber text-3xl font-bold text-white mb-3">Security Tools Suite</h2>
            <p className="text-slate-400">Five professional-grade cybersecurity applications in one platform</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tools.map(tool => (
              <button
                key={tool.id}
                onClick={() => navigate('/login')}
                className="glass-card p-6 text-left group hover:-translate-y-2 transition-all duration-300 hover:border-opacity-60"
                style={{ '--hover-color': tool.color } as React.CSSProperties}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = `${tool.color}50`;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${tool.color}20`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '';
                  (e.currentTarget as HTMLElement).style.boxShadow = '';
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 rounded-lg" style={{ background: `${tool.color}15`, border: `1px solid ${tool.color}30` }}>
                    <span style={{ color: tool.color, filter: `drop-shadow(0 0 6px ${tool.color}90)` }}>
                      {tool.icon}
                    </span>
                  </div>
                  <span className="font-cyber text-xs font-bold" style={{ color: `${tool.color}60` }}>
                    {tool.label}
                  </span>
                </div>
                <h3 className="font-cyber text-sm font-bold text-white mb-2">{tool.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{tool.desc}</p>
                <div className="flex items-center gap-1 text-xs font-cyber font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: tool.color }}>
                  Launch Tool <ChevronRight size={12} />
                </div>
              </button>
            ))}

            {/* Login CTA card */}
            <button
              onClick={() => navigate('/login')}
              className="glass-card p-6 text-left group hover:-translate-y-2 transition-all duration-300 border-cyan-500/30 hover:border-cyan-400/60 hover:shadow-[0_0_30px_rgba(0,245,255,0.15)] flex flex-col justify-between col-span-1"
            >
              <div>
                <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 inline-block mb-4">
                  <Lock size={28} className="text-cyan-400" />
                </div>
                <h3 className="font-cyber text-sm font-bold text-white mb-2">Access Full Platform</h3>
                <p className="text-xs text-slate-400 leading-relaxed">Sign in to access all tools, analytics, reports, and your security dashboard.</p>
              </div>
              <div className="flex items-center gap-2 mt-6 text-cyan-400 font-cyber text-xs font-bold">
                <Shield size={14} />
                Login / Register
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-cyan-500/10 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield size={16} className="text-cyan-400" />
          <span className="font-cyber text-sm text-cyan-400">CYBERGUARD SECURITY LAB</span>
        </div>
        <p className="text-xs text-slate-600 font-mono">Educational cybersecurity platform. All tools use simulated data.</p>
      </footer>
    </div>
  );
}
