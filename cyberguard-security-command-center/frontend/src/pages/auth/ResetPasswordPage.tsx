import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { PasswordStrengthMeter, evaluatePassword } from '../../components/common/PasswordStrengthMeter';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Reset security token is required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passphrases do not match.');
      return;
    }

    const strength = evaluatePassword(password);
    if (strength.score < 5) {
      setError('Passphrase does not meet complexity requirements.');
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#040816] flex flex-col items-center justify-center p-4 selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className="w-full max-w-md soc-card p-6 sm:p-8 font-mono text-xs">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 mb-4">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>

        <h2 className="text-xl font-bold text-white mb-2">UPDATE PASSPHRASE</h2>
        <p className="text-slate-400 mb-6">
          Provide your verification token and define a new high-entropy passphrase.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-950/50 border border-red-500/40 text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-4 rounded bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>Passphrase updated successfully. Redirecting to login...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-1">RESET TOKEN</label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste token or check email link"
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded focus:border-cyan-400 focus:outline-none text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">NEW PASSPHRASE</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded focus:border-cyan-400 focus:outline-none text-slate-100"
              />
              <PasswordStrengthMeter password={password} />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">CONFIRM NEW PASSPHRASE</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded focus:border-cyan-400 focus:outline-none text-slate-100"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold tracking-wider transition-all"
            >
              SAVE NEW PASSPHRASE
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
