import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  Lock,
  Terminal,
  Activity,
  Server,
  Cloud,
  Network,
  Cpu,
  Eye,
  CheckCircle2,
  ArrowRight,
  Zap,
  Globe,
  Radio,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { CyberShieldHolo } from '../components/common/CyberShieldHolo';
import { ThreatRadar } from '../components/common/ThreatRadar';
import { WorldMapRadar } from '../components/common/WorldMapRadar';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#040816] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-purple-600/10 blur-[110px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6 text-left"
            >
              {/* Threat Intelligence Indicator Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.2)]">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>CYBERGUARD DEFENSE CORE v2.4</span>
                <span className="text-slate-500">|</span>
                <span className="text-emerald-400 font-semibold">SOC ACTIVE</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Defend. Detect.{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                  Respond.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
                Unified security intelligence for modern digital environments. Seamlessly aggregate
                endpoint telemetry, correlate SIEM events with AI Copilot triage, and enforce
                Zero-Trust perimeter isolation across hybrid multi-cloud infrastructure.
              </p>

              {/* CTA Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4 font-mono text-xs">
                <Link
                  to="/register"
                  className="px-6 py-3.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.7)] transition-all flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>Create Secure Account</span>
                </Link>

                <Link
                  to="/dashboard"
                  className="px-6 py-3.5 rounded-lg bg-slate-900/90 hover:bg-slate-800/90 border border-cyan-500/40 text-cyan-300 hover:border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.15)] transition-all flex items-center gap-2"
                >
                  <Terminal className="w-4 h-4" />
                  <span>Explore Security Platform</span>
                </Link>

                <Link
                  to="/login"
                  className="px-4 py-3.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  Sign In &rarr;
                </Link>
              </div>

              {/* Key Security Pillars Checklist */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono text-slate-400 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Argon2id Vault Hashing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>RFC 6238 TOTP 2FA</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>MITRE ATT&amp;CK Matrix</span>
                </div>
              </div>
            </motion.div>

            {/* Right Graphic: Hologram Shield & Live Radar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-5 flex flex-col items-center justify-center relative"
            >
              <div className="relative w-full max-w-md p-6 soc-card cyber-border-glow">
                {/* Header Tag */}
                <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20 text-xs font-mono">
                  <span className="text-cyan-400 flex items-center gap-1.5 font-bold">
                    <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                    HOLOGRAM POSTURE VIEW
                  </span>
                  <span className="text-emerald-400">ISOLATION READY</span>
                </div>

                {/* Animated Cyber Shield Hologram */}
                <div className="my-6">
                  <CyberShieldHolo />
                </div>

                {/* Live SOC Status Meter */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-cyan-500/20 text-xs font-mono">
                  <div className="bg-[#050a18] p-2.5 rounded border border-slate-700/60">
                    <span className="text-slate-400 block text-[10px]">INGRESS LATENCY</span>
                    <span className="text-cyan-300 font-bold text-sm">1.8 ms (TLS 1.3)</span>
                  </div>
                  <div className="bg-[#050a18] p-2.5 rounded border border-slate-700/60">
                    <span className="text-slate-400 block text-[10px]">THREAT CONTAINMENT</span>
                    <span className="text-emerald-400 font-bold text-sm">ACTIVE (0 BYPASS)</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Global Telemetry Vectors Section */}
      <section className="py-16 bg-[#030612] border-y border-cyan-500/20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-xs font-mono tracking-widest text-cyan-400 uppercase">
              GLOBAL DEFENSE TOPOLOGY
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Unified Security Perimeter Operations
            </p>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Cross-correlated threat intelligence streaming from distributed sensor arrays, cloud endpoints, and edge gateways.
            </p>
          </div>

          {/* World Vector Map */}
          <WorldMapRadar />
        </div>
      </section>

      {/* Security Modules Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-xs font-mono tracking-widest text-cyan-400 uppercase">
            ENTERPRISE SOC ARCHITECTURE
          </h2>
          <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Built for Elite Security Operations
          </p>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 font-mono">
            Zero speculation. Zero synthetic claims. High-assurance defensive posture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* EDR / XDR */}
          <div className="soc-card p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white font-mono">EDR / XDR Operations</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Host-level telemetry monitoring, process tree examination, anomalous parent-child relationship detection, and instant network quarantine isolation.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 mt-6 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500">ROUTE: /tools/edr-xdr</span>
              <Link to="/tools/edr-xdr" className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                <span>INSPECT</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* AI SOC / SIEM Copilot */}
          <div className="soc-card p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white font-mono">AI SOC Analyst Copilot</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Real-time incident event correlation mapped against MITRE ATT&amp;CK matrix. Copilot defensive assistant provides containment and eradication workflows.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 mt-6 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500">ROUTE: /tools/ai-soc-siem</span>
              <Link to="/tools/ai-soc-siem" className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                <span>INSPECT</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Zero Trust */}
          <div className="soc-card p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Network className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white font-mono">Zero Trust Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Continuous authentication pipeline: User &rarr; Identity &rarr; Device &rarr; Policy &rarr; App &rarr; Resource. Dynamic policy simulator with contextual risk scoring.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 mt-6 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500">ROUTE: /tools/zero-trust</span>
              <Link to="/tools/zero-trust" className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                <span>INSPECT</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Cloud Posture */}
          <div className="soc-card p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Cloud className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white font-mono">Multi-Cloud CSPM</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cross-cloud posture assessment across AWS, Azure, and GCP. Audits misconfigurations, publicly exposed buckets, and CIS compliance findings without storing static keys.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 mt-6 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500">ROUTE: /tools/cloud-security</span>
              <Link to="/tools/cloud-security" className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                <span>INSPECT</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* IAM & Verification */}
          <div className="soc-card p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white font-mono">IAM &amp; Access Governance</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Role-based access matrix (RBAC), MFA coverage metrics, privileged account inspection, active session revocation, and immutable audit trails.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 mt-6 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500">ROUTE: /tools/iam</span>
              <Link to="/tools/iam" className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                <span>INSPECT</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Threat Intelligence */}
          <div className="soc-card p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white font-mono">Threat Intelligence</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Defensive IOC inspection for IP addresses, domain reputation, and SHA-256 binary hashes. Strictly truthful telemetry states without fabricated ratings.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 mt-6 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500">ROUTE: /tools/threat-intelligence</span>
              <Link to="/tools/threat-intelligence" className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                <span>INSPECT</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-cyan-500/20 bg-[#030612] py-10 font-mono text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-200 font-bold">CYBERGUARD SECURITY COMMAND CENTER</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <Link to="/register" className="hover:text-cyan-400">Register</Link>
            <Link to="/login" className="hover:text-cyan-400">Login</Link>
            <Link to="/verify-2fa" className="hover:text-cyan-400">Verify 2FA</Link>
            <Link to="/forgot-password" className="hover:text-cyan-400">Forgot Password</Link>
            <Link to="/settings" className="hover:text-cyan-400">Security Vault</Link>
          </div>
          <p className="text-slate-500 text-[10px]">
            &copy; 2026 CYBERGUARD SOC. Defensive Cybersecurity Operations Platform.
          </p>
        </div>
      </footer>
    </div>
  );
};
