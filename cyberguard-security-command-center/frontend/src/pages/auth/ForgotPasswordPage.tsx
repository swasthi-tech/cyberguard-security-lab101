import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#040816] flex flex-col items-center justify-center p-4 selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className="w-full max-w-md soc-card p-6 sm:p-8 font-mono text-xs">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 mb-4">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>

        <h2 className="text-xl font-bold text-white mb-2">RECOVER SOC ACCESS</h2>
        <p className="text-slate-400 mb-6">
          Enter your authorized enterprise email. If the identity exists, an encrypted password reset challenge token will be issued.
        </p>

        {submitted ? (
          <div className="p-4 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
              <span>Recovery Challenge Issued</span>
            </div>
            <p className="text-[11px] text-slate-300">
              If an account is associated with <span className="text-cyan-400">{email}</span>, a cryptographic reset token has been dispatched.
            </p>
            <div className="pt-2">
              <Link to="/reset-password" className="text-cyan-400 underline text-xs">
                Proceed to Reset Passphrase &rarr;
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-1">ENTERPRISE EMAIL</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@organization.corp"
                  required
                  className="w-full pl-8 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded focus:border-cyan-400 focus:outline-none text-slate-100"
                />
                <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold tracking-wider transition-all"
            >
              SEND RECOVERY CHALLENGE
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
