import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { CaptchaChallenge } from '../../components/common/CaptchaChallenge';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginSuccess, setPending2FAToken } = useAuth();

  const registeredEmail = (location.state as any)?.registeredEmail || '';
  const [identifier, setIdentifier] = useState(registeredEmail);
  const [password, setPassword] = useState('');
  const [captchaResponse, setCaptchaResponse] = useState('');
  const [challengeToken, setChallengeToken] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier || !password) {
      setError('Identifier and password are required.');
      return;
    }

    if (!captchaResponse) {
      setError('Please solve the security verification CAPTCHA.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.auth.login({
        identifier,
        password,
        captchaResponse,
        challengeToken,
      });

      // Check if 2FA is required
      if (res.require2FA && res.tempToken) {
        setPending2FAToken(res.tempToken);
        navigate('/verify-2fa', { state: { tempToken: res.tempToken, identifier } });
        return;
      }

      if (res.user) {
        loginSuccess(res.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials and CAPTCHA.');
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
          <h2 className="text-xl font-bold text-white font-mono">SOC ACCESS PORTAL</h2>
          <p className="text-xs text-slate-400 mt-1">
            Authenticate using verified credentials and challenge verification
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-500/40 text-red-300 text-xs font-mono flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          {/* Identifier: Email or Username */}
          <div>
            <label className="block text-slate-300 mb-1">EMAIL OR USERNAME</label>
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="analyst@organization.corp"
                required
                className="w-full pl-8 pr-3 py-2.5 bg-slate-900/90 border border-slate-700 rounded focus:border-cyan-400 focus:outline-none text-slate-100 placeholder:text-slate-500"
              />
              <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3.5" />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300">PASSPHRASE</label>
              <Link to="/forgot-password" className="text-[11px] text-cyan-400/80 hover:text-cyan-300">
                Forgot Passphrase?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-8 pr-3 py-2.5 bg-slate-900/90 border border-slate-700 rounded focus:border-cyan-400 focus:outline-none text-slate-100 placeholder:text-slate-500"
              />
              <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3.5" />
            </div>
          </div>

          {/* Server-Side CAPTCHA System */}
          <CaptchaChallenge
            value={captchaResponse}
            onChange={setCaptchaResponse}
            onChallengeToken={setChallengeToken}
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold tracking-wider shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>AUTHENTICATING IDENTITY...</span>
            ) : (
              <>
                <span>AUTHENTICATE &amp; SIGN IN</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs font-mono text-slate-400">
          Need operational access?{' '}
          <Link to="/register" className="text-cyan-400 hover:underline">
            Create Secure Account
          </Link>
        </div>
      </div>
    </div>
  );
};
