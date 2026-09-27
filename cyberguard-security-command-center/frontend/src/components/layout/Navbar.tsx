import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Terminal, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#040816]/85 border-b border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.25)] group-hover:border-cyan-400 transition-all">
            <Shield className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold tracking-widest text-sm text-white font-mono">
              <span>CYBERGUARD</span>
              <span className="text-[10px] bg-cyan-950/80 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/30">SOC</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider">SECURITY COMMAND CENTER</p>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono tracking-wider text-slate-300">
          <Link to="/tools/edr-xdr" className="hover:text-cyan-400 transition-colors">EDR/XDR</Link>
          <Link to="/tools/ai-soc-siem" className="hover:text-cyan-400 transition-colors">AI SIEM</Link>
          <Link to="/tools/zero-trust" className="hover:text-cyan-400 transition-colors">ZERO TRUST</Link>
          <Link to="/tools/cloud-security" className="hover:text-cyan-400 transition-colors">CLOUD POSTURE</Link>
          <Link to="/tools/threat-intelligence" className="hover:text-cyan-400 transition-colors">THREAT INTEL</Link>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3 font-mono text-xs">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="px-3.5 py-2 rounded-md bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.2)] transition-all flex items-center gap-1.5"
              >
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>COMMAND CENTER</span>
              </Link>
              <button
                onClick={() => logout().then(() => navigate('/login'))}
                className="text-slate-400 hover:text-white px-2.5 py-1.5"
              >
                SIGN OUT
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3.5 py-2 text-slate-300 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                <span>SIGN IN</span>
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-md bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:shadow-[0_0_22px_rgba(0,240,255,0.7)] transition-all flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>CREATE ACCOUNT</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
