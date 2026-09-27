import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, KeyRound, AlertCircle, ArrowRight, Smartphone } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export const Verify2FAPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginSuccess, pending2FAToken } = useAuth();

  const tempToken = pending2FAToken || (location.state as any)?.tempToken || '';
  const identifier = (location.state as any)?.identifier || 'User';

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useRecovery, setUseRecovery] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!tempToken) {
      setError('2FA verification session expired. Please sign in again.');
      return;
    }

    if (!code.trim()) {
      setError(useRecovery ? 'Please enter your recovery backup code.' : 'Please enter the 6-digit TOTP code.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.auth.verify2FA({
        tempToken,
        code: code.trim(),
      });

      loginSuccess(res.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Verification failed. Code rejected by cryptographic validator.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040816] flex flex-col items-center justify-center p-4 selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className="absolute w-[500px] h-[300px] bg-cyan-500/10 blur-[130px] pointer-events-none" />

      {/* Brand Header */}
      <Link to="/" className="mb-6 flex items-center gap-3 group relative z-10">
        <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.25)]">
          <Shield className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <span className="text-xs font-mono font-bold tracking-widest text-white">CYBERGUARD</span>
          <span className="text-[10px] font-mono tracking-wider text-cyan-400 block">SECURITY COMMAND CENTER</span>
        </div>
      </Link>

      <div className="w-full max-w-md soc-card p-6 sm:p-8 relative z-10">
        <div className="mb-6 text-center">
          <div className="w-12 h-12 rounded-full bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Smartphone className="w-6 h-6 text-cyan-400" />
          </div>
          <h2 className="text-xl font-bold text-white font-mono">TWO-FACTOR VERIFICATION</h2>
          <p className="text-xs text-slate-400 mt-1">
            RFC 6238 Mathematical Verification for <span className="text-cyan-300 font-mono">{identifier}</span>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-500/40 text-red-300 text-xs font-mono flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300">
                {useRecovery ? 'EMERGENCY RECOVERY CODE' : '6-DIGIT TOTP CODE'}
              </label>
              <button
                type="button"
                onClick={() => {
                  setUseRecovery(!useRecovery);
                  setCode('');
                  setError(null);
                }}
                className="text-[11px] text-cyan-400 hover:underline"
              >
                {useRecovery ? 'Use Authenticator App' : 'Use Recovery Code'}
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={useRecovery ? 'XXXX-XXXX' : '123456'}
                maxLength={useRecovery ? 12 : 6}
                autoFocus
                autoComplete="one-time-code"
                className="w-full pl-9 pr-3 py-3 bg-slate-900/90 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded text-center text-white font-mono text-xl tracking-[0.25em] placeholder:tracking-normal placeholder:text-sm placeholder:text-slate-600 outline-none"
              />
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-4" />
            </div>
            <p className="text-[10px] text-slate-500 mt-1 text-center">
              {useRecovery
                ? 'Enter one of your 10 single-use emergency recovery codes'
                : 'Accepts Google Authenticator, Microsoft Authenticator, Authy, or 1Password'}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold tracking-wider shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>VERIFYING TOTP MATRICES...</span>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span>VERIFY &amp; ACCESS SOC</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs font-mono text-slate-400">
          Session timed out?{' '}
          <Link to="/login" className="text-cyan-400 hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
