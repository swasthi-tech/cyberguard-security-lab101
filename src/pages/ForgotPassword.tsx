import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, ArrowLeft } from 'lucide-react';
import { Button, Input, Alert } from '../components/ui';
import { CyberBackground } from '../components/security';
import { fetchAuthApi } from '../lib/api';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setAlert({ type: 'error', msg: 'Email is required' });
      return;
    }


    setLoading(true);
    setAlert(null);
    try {
      const res = await fetchAuthApi('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setAlert({ type: 'error', msg: data.error || 'Failed to request password reset' });
      }
    } catch {
      setAlert({ type: 'error', msg: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] relative flex items-center justify-center px-4 py-12">
      <CyberBackground />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-cyan-500/10 border border-cyan-500/30 animate-float">
              <Shield size={36} className="text-cyan-400" style={{ filter: 'drop-shadow(0 0 12px rgba(0,245,255,0.8))' }} />
            </div>
          </div>
          <h1 className="font-cyber text-3xl font-black text-white tracking-wide">RESET PASSWORD</h1>
          <p className="text-slate-400 text-sm mt-2">CyberGuard Security Lab</p>
        </div>

        <div className="glass-card p-8 border border-cyan-500/20 shadow-[0_0_40px_rgba(0,245,255,0.08)]">
          {alert && (
            <div className="mb-5"><Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} /></div>
          )}

          {submitted ? (
            <div className="text-center space-y-4">
              <div className="inline-block p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-2">
                <Mail size={32} className="text-emerald-400" />
              </div>
              <h2 className="text-lg font-cyber font-semibold text-white">Check Your Email</h2>
              <p className="text-slate-400 text-sm">
                If an account exists for that email, we have sent password reset instructions.
              </p>
              <Button variant="outline" className="w-full mt-6" onClick={() => navigate('/login')}>
                Return to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <p className="text-slate-400 text-sm text-center mb-4">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <Input
                id="email"
                label="Email Address"
                type="email"
                placeholder="alex@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                icon={<Mail size={16} />}
                autoComplete="email"
                required
              />



              <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              <div className="text-center mt-6">
                <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors">
                  <ArrowLeft size={16} /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
