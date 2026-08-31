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

function analyzePhishing(url: string): { probability: number; verdict: PhishingVerdict; indicators: { key: string; detected: boolean; severity: 'LOW' | 'MEDIUM' | 'HIGH' }[] } {
  const lower = url.toLowerCase();
  const domain = lower.split('/')[2] || '';

  const checks: Record<string, boolean> = {
    domainSimilarity: /(paypa1|g00gle|micros0ft|amazonn|appleid-verify|faceb00k)/.test(domain),
    httpsStatus: !lower.startsWith('https://'),
    suspiciousKeywords: /(verify|secure|update|login|signin|account|bank|credential)/.test(lower) && !/(google|microsoft|apple|amazon)\.com/.test(domain),
    loginPageIndicators: /(login|signin|auth|verify|password|credential)/.test(lower),
    redirectIndicators: lower.includes('redirect') || lower.includes('url=http'),
    domainReputation: /(\.xyz|\.tk|\.gq|\.ml|\.cf|\.ga)$/.test(domain) || /(\d{1,3}\.){3}\d{1,3}/.test(domain),
    externalLinkIndicators: (url.match(/\//g) || []).length > 6,
  };

  const detected = Object.values(checks).filter(Boolean).length;
  let probability = Math.round((detected / 7) * 100);
  if (/(google|github|microsoft|cloudflare)\.com/.test(domain)) probability = Math.max(0, probability - 30);
  probability = Math.min(100, probability);

  let verdict: PhishingVerdict = 'LOW RISK';
  if (probability >= 60) verdict = 'HIGH RISK';
  else if (probability >= 30) verdict = 'MEDIUM RISK';

  const severityMap: Record<string, 'LOW' | 'MEDIUM' | 'HIGH'> = {
    domainSimilarity: 'HIGH',
    httpsStatus: 'MEDIUM',
    suspiciousKeywords: 'MEDIUM',
    loginPageIndicators: 'HIGH',
    redirectIndicators: 'MEDIUM',
    domainReputation: 'HIGH',
    externalLinkIndicators: 'LOW',
  };

  return {
    probability,
    verdict,
    indicators: INDICATORS.map(ind => ({
      key: ind.key,
      detected: checks[ind.key],
      severity: severityMap[ind.key],
    })),
  };
}

const VERDICT_CONFIG: Record<PhishingVerdict, { color: string; bg: string; border: string }> = {
  'LOW RISK': { color: '#10b981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  'MEDIUM RISK': { color: '#f59e0b', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  'HIGH RISK': { color: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

export function PhishingDetectorPage() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<ReturnType<typeof analyzePhishing> | null>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!url) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1300));
    setResult(analyzePhishing(url));
    setLoading(false);
  };

  const cfg = result ? VERDICT_CONFIG[result.verdict] : null;

  const SeverityDot = ({ sev }: { sev: string }) => {
    const colors: Record<string, string> = { HIGH: 'bg-red-400', MEDIUM: 'bg-yellow-400', LOW: 'bg-emerald-400' };
    return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colors[sev]}`} />;
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <SectionHeader title="Phishing Website Detector" icon={<Fish size={22} />} subtitle="Analyze websites for phishing indicators and social engineering patterns" />
      <SimBanner message="Phishing analysis is simulated. Real detection requires ML models and threat-intel APIs." />

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
            Analyze
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

      {!result && !loading && (
        <div className="glass-card p-12 flex flex-col items-center gap-3 text-center">
          <Fish size={40} className="text-slate-600" />
          <p className="font-cyber text-sm text-slate-500">Enter a website URL to check for phishing indicators</p>
        </div>
      )}
    </div>
  );
}
