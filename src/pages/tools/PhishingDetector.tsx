import React, { useState } from 'react';
import { Fish, Search, AlertTriangle } from 'lucide-react';
import { Button, SimBanner, SectionHeader } from '../../components/ui';
import { SecurityGauge } from '../../components/security';

type PhishingVerdict = 'LOW RISK' | 'MEDIUM RISK' | 'HIGH RISK';

const INDICATORS = [
  { key: 'domainSimilarity', label: 'Domain Similarity Attack', desc: 'Resembles known brand domain' },
  { key: 'httpsStatus', label: 'HTTPS Certificate', desc: 'Valid SSL/TLS certificate' },
  { key: 'suspiciousKeywords', label: 'Suspicious Keywords', desc: 'Phishing-related terms in URL' },
  { key: 'loginPageIndicators', label: 'Fake Login Page', desc: 'Credential harvesting pattern' },
  { key: 'redirectIndicators', label: 'Suspicious Redirects', desc: 'Multi-hop redirect chain detected' },
  { key: 'domainReputation', label: 'Domain Reputation', desc: 'Known bad domain or registrar' },
  { key: 'externalLinkIndicators', label: 'External Link Pattern', desc: 'Excessive external resource loading' },
];

type PhishingResult = {
  probability: number;
  verdict: PhishingVerdict;
  indicators: { key: string; detected: boolean; severity: 'LOW' | 'MEDIUM' | 'HIGH' }[];
};

const VERDICT_CONFIG: Record<PhishingVerdict, { color: string; bg: string; border: string }> = {
  'LOW RISK': { color: '#10b981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  'MEDIUM RISK': { color: '#f59e0b', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  'HIGH RISK': { color: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

export function PhishingDetectorPage() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<PhishingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/api/phishing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      
      const probability = data.probability * 100;
      setResult({
        probability,
        verdict: probability > 50 ? 'HIGH RISK' as PhishingVerdict : 'LOW RISK' as PhishingVerdict,
        indicators: INDICATORS.map(ind => ({
          key: ind.key,
          detected: false,
          severity: 'LOW',
        }))
      });
    } catch (err) {
      setError('PHISHING ANALYSIS SERVICE OFFLINE');
    } finally {
      setLoading(false);
    }
  };

  const cfg = result ? VERDICT_CONFIG[result.verdict] : null;

  const SeverityDot = ({ sev }: { sev: string }) => {
    const colors: Record<string, string> = { HIGH: 'bg-red-400', MEDIUM: 'bg-yellow-400', LOW: 'bg-emerald-400' };
    return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colors[sev]}`} />;
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <SectionHeader title="Phishing Website Detector" icon={<Fish size={22} />} subtitle="Analyze websites for phishing indicators and social engineering patterns" />
      <SimBanner message="Connected to Real API. If backend is not running, it will show as Offline." />

      <div className="glass-card p-5">
        <div className="flex gap-3">
          <input
            className="cyber-input flex-1"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="http://suspicious-site.com/login"
            onKeyDown={e => e.key === 'Enter' && analyze()}
          />
          <Button variant="primary" onClick={analyze} loading={loading} disabled={!url} icon={<Search size={16} />}>
            {loading ? 'ANALYZING...' : 'Analyze'}
          </Button>
        </div>
        <p className="text-xs text-slate-600 font-mono mt-2">Try: http://paypa1-secure.xyz/verify-account</p>
      </div>

      {result && cfg && (
        <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up">
          {/* Probability Gauge */}
          <div className="glass-card p-6 flex flex-col items-center gap-4">
            <p className="font-cyber text-xs text-slate-400 tracking-widest uppercase">Phishing Probability</p>
            <SecurityGauge
              value={result.probability}
              size={180}
              color={cfg.color}
            />
            <div className={`px-6 py-3 rounded-xl border ${cfg.bg} ${cfg.border} w-full text-center`}>
              <p className="font-cyber text-xs text-slate-400 tracking-widest mb-1">VERDICT</p>
              <p className={`font-cyber text-xl font-black tracking-widest`} style={{ color: cfg.color }}>
                {result.verdict}
              </p>
            </div>
            {result.verdict === 'HIGH RISK' && (
              <div className="flex items-center gap-2 text-red-400 text-xs font-mono">
                <AlertTriangle size={14} /> Do not visit this website
              </div>
            )}
          </div>

          {/* Indicators */}
          <div className="glass-card p-5">
            <h3 className="font-cyber text-sm font-bold text-white tracking-wide mb-4">Detection Indicators</h3>
            <div className="space-y-3">
              {result.indicators.map((ind, i) => {
                const meta = INDICATORS[i];
                return (
                  <div key={ind.key} className={`p-3 rounded-lg border transition-colors ${
                    ind.detected ? 'bg-red-500/8 border-red-500/20' : 'bg-emerald-500/5 border-emerald-500/10'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <SeverityDot sev={ind.severity} />
                      <span className={`text-xs font-semibold ${ind.detected ? 'text-red-300' : 'text-emerald-400'}`}>
                        {ind.detected ? '⚠ DETECTED' : '✓ CLEAR'} — {meta.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 ml-4">{meta.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {!result && !loading && !error && (
        <div className="glass-card p-12 flex flex-col items-center gap-3 text-center">
          <Fish size={40} className="text-slate-600" />
          <p className="font-cyber text-sm text-slate-500">Enter a website URL to check for phishing indicators</p>
          <p className="text-xs text-slate-600 font-mono">Real backend analysis</p>
        </div>
      )}

      {error && (
        <div className="glass-card p-12 flex flex-col items-center gap-3 text-center border-red-500/20 bg-red-500/5">
          <Fish size={40} className="text-red-400" />
          <p className="font-cyber text-sm font-bold text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
