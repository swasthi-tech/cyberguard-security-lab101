import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, User as UserIcon, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { api } from '../../api/client';
import { PasswordStrengthMeter, evaluatePassword } from '../../components/common/PasswordStrengthMeter';
import { CaptchaChallenge } from '../../components/common/CaptchaChallenge';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captchaResponse, setCaptchaResponse] = useState('');
  const [challengeToken, setChallengeToken] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client preliminary checks
    if (!fullName || !username || !email || !password || !confirmPassword) {
      setError('All registration fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const strength = evaluatePassword(password);
    if (strength.score < 5 || password.length < 8) {
      setError('Password does not satisfy enterprise complexity requirements.');
      return;
    }

    if (!captchaResponse) {
      setError('Please solve the security verification CAPTCHA.');
      return;
    }

    try {
      setLoading(true);
      await api.auth.register({
        fullName,
        username,
        email,
        password,
        confirmPassword,
        captchaResponse,
        challengeToken,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { state: { registeredEmail: email } });
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040816] flex flex-col items-center justify-center p-4 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background glow */}
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

      {/* Registration Card */}
      <div className="w-full max-w-lg soc-card p-6 sm:p-8 relative z-10">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-white font-mono">CREATE SECURE ACCOUNT</h2>
          <p className="text-xs text-slate-400 mt-1">
            Zero Trust IAM Provisioning for Authorized Personnel
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-500/40 text-red-300 text-xs font-mono flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>Account provisioned successfully with Argon2id credentials. Redirecting to login...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          {/* Full Name & Username */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">FULL NAME</label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Mercer"
                  required
                  className="w-full pl-8 pr-3 py-2 bg-slate-900/90 border border-slate-700 rounded focus:border-cyan-400 focus:outline-none text-slate-100 placeholder:text-slate-500"
                />
                <UserIcon className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">USERNAME</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="alex_sec"
                  required
                  className="w-full pl-8 pr-3 py-2 bg-slate-900/90 border border-slate-700 rounded focus:border-cyan-400 focus:outline-none text-slate-100 placeholder:text-slate-500"
                />
                <span className="text-slate-500 font-mono text-xs absolute left-2.5 top-2.5">@</span>
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-slate-300 mb-1">ENTERPRISE EMAIL</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@organization.corp"
                required
                className="w-full pl-8 pr-3 py-2 bg-slate-900/90 border border-slate-700 rounded focus:border-cyan-400 focus:outline-none text-slate-100 placeholder:text-slate-500"
              />
              <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-slate-300 mb-1">SECURITY PASSPHRASE</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-8 pr-3 py-2 bg-slate-900/90 border border-slate-700 rounded focus:border-cyan-400 focus:outline-none text-slate-100 placeholder:text-slate-500"
              />
              <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
            </div>

            {/* Password Strength Meter */}
            <PasswordStrengthMeter password={password} />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-slate-300 mb-1">CONFIRM PASSPHRASE</label>
            <div className="relative">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-8 pr-3 py-2 bg-slate-900/90 border border-slate-700 rounded focus:border-cyan-400 focus:outline-none text-slate-100 placeholder:text-slate-500"
              />
              <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
            </div>
          </div>

          {/* Real Server-Side CAPTCHA System */}
          <CaptchaChallenge
            value={captchaResponse}
            onChange={setCaptchaResponse}
            onChallengeToken={setChallengeToken}
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 mt-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold tracking-wider shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>ENCRYPTING CREDENTIALS...</span>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span>PROVISION ACCOUNT</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs font-mono text-slate-400">
          Already have an authorized profile?{' '}
          <Link to="/login" className="text-cyan-400 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
