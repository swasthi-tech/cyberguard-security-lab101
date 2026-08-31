import React, { useState } from 'react';
import { Globe2, Search, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button, SimBanner, SectionHeader, Badge } from '../../components/ui';
import { SecurityGauge } from '../../components/security';

type Grade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
type CheckStatus = 'pass' | 'fail' | 'warn';

interface Check {
  name: string;
  status: CheckStatus;
  severity: Severity;
  description: string;
}

function analyzeWebsite(url: string): { score: number; grade: Grade; checks: Check[] } {
  const lower = url.toLowerCase();
  const isHttps = lower.startsWith('https://');
  const domain = lower.split('/')[2] || '';
  const isKnownGood = /(google|github|cloudflare|microsoft)\.com/.test(domain);

  const checks: Check[] = [
    {
      name: 'HTTPS / TLS',
      status: isHttps ? 'pass' : 'fail',
      severity: 'CRITICAL',
      description: isHttps ? 'HTTPS is enabled with valid certificate' : 'HTTPS is not enabled — plaintext transmission',
    },
    {
      name: 'HTTP Strict Transport Security (HSTS)',
      status: isHttps ? (isKnownGood ? 'pass' : 'warn') : 'fail',
      severity: 'HIGH',
      description: isHttps && isKnownGood ? 'HSTS header present' : isHttps ? 'HSTS header not detected (simulated)' : 'Cannot check — HTTPS required',
    },
    {
      name: 'Content Security Policy (CSP)',
      status: isKnownGood ? 'pass' : 'fail',
      severity: 'HIGH',
      description: isKnownGood ? 'CSP header configured' : 'Content-Security-Policy header missing',
    },
    {
      name: 'X-Frame-Options',
      status: isKnownGood ? 'pass' : 'warn',
      severity: 'MEDIUM',
      description: isKnownGood ? 'X-Frame-Options: DENY — clickjacking protected' : 'X-Frame-Options not set',
    },
    {
      name: 'X-Content-Type-Options',
      status: isHttps ? 'pass' : 'fail',
      severity: 'MEDIUM',
      description: isHttps ? 'X-Content-Type-Options: nosniff' : 'Header missing',
    },
    {
      name: 'Cookie Security',
      status: isKnownGood ? 'pass' : 'warn',
      severity: 'MEDIUM',
      description: isKnownGood ? 'Cookies set with HttpOnly and Secure flags' : 'Cookie flags not verified',
    },
    {
      name: 'TLS Configuration',
      status: isHttps ? (isKnownGood ? 'pass' : 'warn') : 'fail',
      severity: 'HIGH',
      description: isHttps && isKnownGood ? 'TLS 1.3 with strong cipher suites' : isHttps ? 'TLS version unverified' : 'No TLS',
    },
    {
      name: 'Security Headers Score',
      status: isKnownGood ? 'pass' : (isHttps ? 'warn' : 'fail'),
      severity: 'INFO',
      description: isKnownGood ? 'All recommended security headers present' : 'Some security headers missing',
    },
  ];

  const passed = checks.filter(c => c.status === 'pass').length;
  const warned = checks.filter(c => c.status === 'warn').length;
  const score = Math.round((passed * 12.5) + (warned * 5));

  let grade: Grade;
  if (score >= 95) grade = 'A+';
  else if (score >= 85) grade = 'A';
  else if (score >= 70) grade = 'B';
  else if (score >= 55) grade = 'C';
  else if (score >= 40) grade = 'D';
  else grade = 'F';

  return { score: Math.min(100, score), grade, checks };
}

const GRADE_COLORS: Record<Grade, string> = {
  'A+': '#00f5ff', 'A': '#10b981', 'B': '#22c55e', 'C': '#f59e0b', 'D': '#f97316', 'F': '#ef4444',
};

const SEVERITY_BADGE: Record<Severity, any> = {
  CRITICAL: 'danger', HIGH: 'high', MEDIUM: 'medium', LOW: 'low', INFO: 'info',
};

export function WebsiteScannerPage() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<ReturnType<typeof analyzeWebsite> | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const scan = async () => {
    if (!url) return;
    setLoading(true);
    setResult(null);
    setProgress(0);

    // Animated progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 100));
      setProgress(i);
    }

    setResult(analyzeWebsite(url));
    setLoading(false);
    setProgress(100);
  };

  const StatusIcon = ({ s }: { s: CheckStatus }) => {
    if (s === 'pass') return <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />;
    if (s === 'warn') return <AlertTriangle size={16} className="text-yellow-400 flex-shrink-0" />;
    return <XCircle size={16} className="text-red-400 flex-shrink-0" />;
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <SectionHeader title="Website Security Scanner" icon={<Globe2 size={22} />} subtitle="Analyze security headers, TLS, and configuration of websites" />
      <SimBanner message="Security checks are simulated heuristically. Production scanning requires actual HTTP header analysis." />

      <div className="glass-card p-5">
        <div className="flex gap-3">
          <input
            className="cyber-input flex-1"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://example.com"
            onKeyDown={e => e.key === 'Enter' && scan()}
          />
          <Button variant="primary" onClick={scan} loading={loading} disabled={!url} icon={<Search size={16} />}>
            Start Security Scan
          </Button>
        </div>
        {loading && (
          <div className="mt-4">
            <div className="flex justify-between mb-1">
              <span className="text-xs font-cyber text-slate-400">SCANNING WEBSITE</span>
              <span className="text-xs font-cyber text-cyan-400 font-bold">{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-200"
                style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#00f5ff,#3b82f6)', boxShadow: '0 0 8px rgba(0,245,255,0.5)' }}
              />
            </div>
          </div>
        )}
      </div>

      {result && (
        <div className="grid md:grid-cols-3 gap-6 animate-fade-in-up">
          {/* Grade + Score */}
          <div className="space-y-4">
            <div className="glass-card p-6 flex flex-col items-center gap-4">
              <p className="font-cyber text-xs text-slate-400 tracking-widest uppercase">Security Score</p>
              <SecurityGauge value={result.score} size={160} color={GRADE_COLORS[result.grade]} />
              <div className="text-center">
                <p className="font-cyber text-xs text-slate-400 tracking-widest mb-1">GRADE</p>
                <p className="font-cyber text-5xl font-black" style={{ color: GRADE_COLORS[result.grade], textShadow: `0 0 20px ${GRADE_COLORS[result.grade]}80` }}>
                  {result.grade}
                </p>
              </div>
            </div>

            {/* Finding Summary */}
            <div className="glass-card p-4">
              <p className="font-cyber text-xs text-slate-400 tracking-widest uppercase mb-3">Findings Summary</p>
              {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'] as Severity[]).map(sev => {
                const count = result.checks.filter(c => c.severity === sev && c.status === 'fail').length;
                if (!count) return null;
                return (
                  <div key={sev} className="flex items-center justify-between py-1.5">
                    <Badge variant={SEVERITY_BADGE[sev]}>{sev}</Badge>
                    <span className="font-cyber text-sm font-bold text-slate-300">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Checks Detail */}
          <div className="md:col-span-2 glass-card overflow-hidden">
            <div className="px-5 py-3 border-b border-cyan-500/10">
              <h3 className="font-cyber text-sm font-bold text-white">Security Check Results</h3>
            </div>
            <div className="divide-y divide-slate-700/30">
              {result.checks.map((check, i) => (
                <div key={i} className="px-5 py-4 flex items-start gap-4 hover:bg-slate-800/20 transition-colors">
                  <StatusIcon s={check.status} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-slate-200">{check.name}</p>
                      <Badge variant={SEVERITY_BADGE[check.severity]}>{check.severity}</Badge>
                    </div>
                    <p className="text-xs text-slate-500">{check.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!result && !loading && (
        <div className="glass-card p-12 flex flex-col items-center gap-3 text-center">
          <Globe2 size={40} className="text-slate-600" />
          <p className="font-cyber text-sm text-slate-500">Enter a website URL to start security scanning</p>
          <p className="text-xs text-slate-600 font-mono">Try: https://github.com or http://example.com</p>
        </div>
      )}
    </div>
  );
}
