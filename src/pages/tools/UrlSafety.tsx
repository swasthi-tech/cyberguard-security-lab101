import React, { useState } from 'react';
import { Link2, Search, CheckCircle, XCircle } from 'lucide-react';
import { Button, SimBanner, SectionHeader, Badge } from '../../components/ui';
import { SecurityGauge } from '../../components/security';

type Verdict = 'SAFE' | 'CAUTION' | 'SUSPICIOUS' | 'DANGEROUS';

function analyzeURL(url: string): { score: number; verdict: Verdict; checks: Record<string, boolean> } {
  const lower = url.toLowerCase();
  const checks = {
    httpsEnabled: lower.startsWith('https://'),
    domainStructure: !/[^a-z0-9.\-/:?=&_]/.test(lower),
    urlLength: url.length < 100,
    suspiciousChars: !/%[0-9a-f]{2}/.test(lower) && !lower.includes('..'),
    suspiciousKeywords: !/(login|secure|banking|verify|update|account|signin|paypa|googl|micros)/.test(lower) || lower.includes('google.com') || lower.includes('microsoft.com'),
    redirectIndicators: !lower.includes('redirect') && !lower.includes('url=http'),
    certificateIndicator: lower.startsWith('https://'),
    reputationIndicator: !/(\.xyz|\.club|\.top|\.tk|\.gq|\.ml)$/.test(lower.split('/')[2] || ''),
  };

  const passed = Object.values(checks).filter(Boolean).length;
  let score = Math.round((passed / 8) * 100);

  // Known safe domains
  if (/(google\.com|github\.com|microsoft\.com|cloudflare\.com)/.test(lower)) score = Math.min(100, score + 10);

  let verdict: Verdict;
  if (score >= 85) verdict = 'SAFE';
  else if (score >= 65) verdict = 'CAUTION';
  else if (score >= 40) verdict = 'SUSPICIOUS';
  else verdict = 'DANGEROUS';

  return { score, verdict, checks };
}

const VERDICT_STYLES: Record<Verdict, { bg: string; border: string; text: string; color: string }> = {
  SAFE: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', color: '#10b981' },
  CAUTION: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', color: '#f59e0b' },
  SUSPICIOUS: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', color: '#f97316' },
  DANGEROUS: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', color: '#ef4444' },
};

const CHECK_LABELS: Record<string, string> = {
  httpsEnabled: 'HTTPS Enabled',
  domainStructure: 'Valid Domain Structure',
  urlLength: 'URL Length Acceptable',
  suspiciousChars: 'No Suspicious Characters',
  suspiciousKeywords: 'No Suspicious Keywords',
  redirectIndicators: 'No Redirect Indicators',
  certificateIndicator: 'Certificate Indicator',
  reputationIndicator: 'Domain Reputation',
};

export function URLSafetyPage() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<ReturnType<typeof analyzeURL> | null>(null);
  const [loading, setLoading] = useState(false);

  const check = async () => {
    if (!url) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setResult(analyzeURL(url));
    setLoading(false);
  };

  const style = result ? VERDICT_STYLES[result.verdict] : null;

  return (
    <div className="space-y-6 max-w-3xl">
      <SectionHeader title="URL Safety Checker" icon={<Link2 size={22} />} subtitle="Analyze URLs for security indicators and reputation" />
      <SimBanner message="URL analysis is simulated. Real checks require backend threat-intelligence APIs." />

      <div className="glass-card p-5">
        <div className="flex gap-3">
          <input
            className="cyber-input flex-1"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://example.com"
            onKeyDown={e => e.key === 'Enter' && check()}
          />
          <Button variant="primary" onClick={check} loading={loading} disabled={!url} icon={<Search size={16} />}>
            Check URL
          </Button>
        </div>
      </div>

      {result && style && (
        <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up">
          {/* Score Gauge */}
          <div className="glass-card p-6 flex flex-col items-center gap-4">
            <p className="font-cyber text-xs text-slate-400 tracking-widest uppercase">URL Safety Score</p>
            <SecurityGauge value={result.score} size={180} color={style.color} />
            <div className={`px-6 py-3 rounded-xl border ${style.bg} ${style.border}`}>
              <p className={`font-cyber text-xl font-black text-center tracking-widest ${style.text}`}>{result.verdict}</p>
            </div>
          </div>

          {/* Checks */}
          <div className="glass-card p-5 space-y-3">
            <h3 className="font-cyber text-sm font-bold text-white tracking-wide mb-4">Security Indicators</h3>
            {Object.entries(result.checks).map(([key, passed]) => (
              <div key={key} className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0">
                <div className="flex items-center gap-2.5">
                  {passed
                    ? <CheckCircle size={15} className="text-emerald-400 flex-shrink-0" />
                    : <XCircle size={15} className="text-red-400 flex-shrink-0" />
                  }
                  <span className="text-xs text-slate-300">{CHECK_LABELS[key]}</span>
                </div>
                <Badge variant={passed ? 'safe' : 'danger'}>{passed ? 'PASS' : 'FAIL'}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {!result && !loading && (
        <div className="glass-card p-12 flex flex-col items-center gap-3 text-center">
          <Link2 size={40} className="text-slate-600" />
          <p className="font-cyber text-sm text-slate-500">Enter a URL to analyze its safety</p>
          <p className="text-xs text-slate-600 font-mono">Try: https://google.com or http://paypa1.com</p>
        </div>
      )}
    </div>
  );
}
