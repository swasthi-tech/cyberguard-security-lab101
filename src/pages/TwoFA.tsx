import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Smartphone, Key, CheckCircle, RefreshCw } from 'lucide-react';
import { Button, Alert } from '../components/ui';
import { OTPInput } from '../components/auth/OTPInput';
import { CyberBackground } from '../components/security';
import { useAuth } from '../hooks/useAuth';

const DEMO_SETUP_KEY = 'CGSL-DEMO-2FA-2026-XXXX';
const COUNTDOWN_SECS = 120;

export function TwoFAPage() {
  const navigate = useNavigate();
  const { verifyTwoFA, isAuthenticated } = useAuth();

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECS);
  const [resent, setResent] = useState(false);
  const [tab, setTab] = useState<'qr' | 'key'>('qr');

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [resent]);

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter all 6 digits'); return; }
    setLoading(true);
    setError('');
    try {
      const ok = await verifyTwoFA(code);
      if (ok) {
        setSuccess(true);
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        setError('Invalid verification code. Try again.');
        setOtp(Array(6).fill(''));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setCountdown(COUNTDOWN_SECS);
    setResent(true);
    setOtp(Array(6).fill(''));
    setError('');
  };

  const mm = String(Math.floor(countdown / 60)).padStart(2, '0');
  const ss = String(countdown % 60).padStart(2, '0');

  return (
    <div className="min-h-screen bg-[#020817] relative flex items-center justify-center px-4 py-12">
      <CyberBackground />

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-cyan-500/10 border border-cyan-500/30 animate-float">
              <Smartphone size={36} className="text-cyan-400" style={{ filter: 'drop-shadow(0 0 12px rgba(0,245,255,0.8))' }} />
            </div>
          </div>
          <h1 className="font-cyber text-2xl font-black text-white tracking-wide">SECURE YOUR ACCOUNT</h1>
          <p className="text-slate-400 text-sm mt-2">Two-Step Verification</p>
        </div>

        <div className="glass-card p-8 border border-cyan-500/20 shadow-[0_0_40px_rgba(0,245,255,0.08)]">
          {/* Demo Notice */}
          <div className="mb-6 px-4 py-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
            <p className="text-xs text-orange-400 font-mono text-center">
              ⚡ DEMO MODE — Enter any 6 digits to continue (real 2FA requires a backend TOTP service)
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 rounded-lg bg-slate-800/50">
            <button
              onClick={() => setTab('qr')}
              className={`flex-1 py-2 rounded-lg text-xs font-cyber font-semibold tracking-wide transition-all ${
                tab === 'qr' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              SCAN QR CODE
            </button>
            <button
              onClick={() => setTab('key')}
              className={`flex-1 py-2 rounded-lg text-xs font-cyber font-semibold tracking-wide transition-all ${
                tab === 'key' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              ENTER SETUP KEY
            </button>
          </div>

          {/* QR Code (simulated) */}
          {tab === 'qr' && (
            <div className="flex flex-col items-center mb-6">
              <div className="p-4 rounded-xl bg-white border-4 border-cyan-500/30 shadow-[0_0_20px_rgba(0,245,255,0.2)]">
                {/* Simulated QR Code using SVG */}
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <rect width="140" height="140" fill="white" />
                  {/* QR pattern simulation */}
                  {Array.from({ length: 14 }).map((_, r) =>
                    Array.from({ length: 14 }).map((_, c) => {
                      const dark = ((r * 13 + c * 7 + r * c) % 3 === 0) ||
                        (r < 4 && c < 4) || (r < 4 && c > 9) || (r > 9 && c < 4);
                      return dark ? (
                        <rect key={`${r}-${c}`} x={c * 10} y={r * 10} width="9" height="9" fill="#020817" />
                      ) : null;
                    })
                  )}
                </svg>
              </div>
              <p className="text-xs text-slate-500 font-mono text-center mt-3">
                Scan with Google Authenticator / Authy
              </p>
            </div>
          )}

          {/* Setup Key */}
          {tab === 'key' && (
            <div className="mb-6">
              <label className="block text-xs font-cyber text-cyan-400 tracking-widest mb-2 uppercase">Setup Key</label>
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-slate-800/70 border border-cyan-500/20">
                <Key size={14} className="text-cyan-400 flex-shrink-0" />
                <code className="font-mono-cyber text-sm text-cyan-300 tracking-widest">{DEMO_SETUP_KEY}</code>
              </div>
              <p className="text-xs text-slate-500 mt-2 font-mono">Enter this key in your authenticator app</p>
            </div>
          )}

          {/* OTP Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-cyber font-semibold text-slate-300 tracking-widest text-center mb-4 uppercase">
                Enter 6-Digit Verification Code
              </label>

              {success ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <CheckCircle size={48} className="text-emerald-400" style={{ filter: 'drop-shadow(0 0 12px #10b981)' }} />
                  <p className="font-cyber text-emerald-400 text-sm tracking-widest">VERIFIED! Redirecting...</p>
                </div>
              ) : (
                <OTPInput value={otp} onChange={setOtp} disabled={loading || success} />
              )}
            </div>

            {error && <Alert type="error" message={error} />}

            {/* Timer */}
            {!success && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs text-slate-500 font-mono">Code expires in:</span>
                <span className={`font-cyber text-sm font-bold ${countdown <= 10 ? 'text-red-400' : 'text-cyan-400'}`}>
                  {mm}:{ss}
                </span>
              </div>
            )}

            {!success && (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleVerify}
                loading={loading}
                disabled={otp.join('').length < 6}
              >
                Verify Code
              </Button>
            )}

            {/* Resend */}
            {!success && (
              <div className="text-center">
                {countdown > 0 ? (
                  <span className="text-xs text-slate-500 font-mono">Resend available in {mm}:{ss}</span>
                ) : (
                  <button
                    onClick={handleResend}
                    className="flex items-center gap-1.5 mx-auto text-xs text-cyan-400 hover:text-cyan-300 font-cyber font-semibold transition-colors"
                  >
                    <RefreshCw size={12} /> Resend Code
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
