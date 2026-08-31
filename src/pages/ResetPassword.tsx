import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button, Input, Alert } from '../components/ui';
import { PasswordStrengthMeter } from '../components/auth/PasswordStrengthMeter';
import { CyberBackground } from '../components/security';
import { fetchAuthApi } from '../lib/api';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      setAlert({ type: 'error', msg: 'Invalid password reset link.' });
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !email) return;

    if (form.password.length < 8) {
      setAlert({ type: 'error', msg: 'Password must be at least 8 characters' });
      return;
    }
    if (form.password !== form.confirmPassword) {
      setAlert({ type: 'error', msg: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    setAlert(null);
    try {
      const res = await fetchAuthApi('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, token, newPassword: form.password }),
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setAlert({ type: 'error', msg: data.error || 'Failed to reset password' });
      }
    } catch {
      setAlert({ type: 'error', msg: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = form.confirmPassword && form.password === form.confirmPassword;

  if (success) {
    return (
      <div className="min-h-screen bg-[#020817] relative flex items-center justify-center px-4 py-12">
        <CyberBackground />
        <div className="relative z-10 w-full max-w-md glass-card p-8 text-center space-y-4">
          <div className="inline-block p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-2">
            <CheckCircle size={48} className="text-emerald-400" />
          </div>
          <h2 className="text-2xl font-cyber font-bold text-white">Password Reset Successful</h2>
          <p className="text-slate-400">Your password has been securely updated.</p>
          <Button variant="primary" className="w-full mt-6" onClick={() => navigate('/login')}>
            Proceed to Login
          </Button>
        </div>
      </div>
    );
  }

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
          <h1 className="font-cyber text-3xl font-black text-white tracking-wide">NEW PASSWORD</h1>
        </div>

        <div className="glass-card p-8 border border-cyan-500/20 shadow-[0_0_40px_rgba(0,245,255,0.08)]">
          {alert && <div className="mb-5"><Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} /></div>}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <Input
                id="password"
                label="New Password"
                type={showPw ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                icon={<Lock size={16} />}
                rightElement={
                  <button type="button" onClick={() => setShowPw(!showPw)} className="text-slate-400 hover:text-cyan-400 transition-colors">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                required
                disabled={!token || !email}
              />
              <PasswordStrengthMeter password={form.password} />
            </div>

            <div>
              <Input
                id="confirmPassword"
                label="Confirm New Password"
                type={showCpw ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                icon={<Lock size={16} />}
                rightElement={
                  <button type="button" onClick={() => setShowCpw(!showCpw)} className="text-slate-400 hover:text-cyan-400 transition-colors">
                    {showCpw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                required
                disabled={!token || !email}
              />
              {form.confirmPassword && (
                <p className={`mt-1.5 text-xs font-mono ${passwordsMatch ? 'text-emerald-400' : 'text-red-400'}`}>
                  {passwordsMatch ? '✓ Passwords match' : '✕ Passwords do not match'}
                </p>
              )}
            </div>

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full" disabled={!token || !email}>
              {loading ? 'Updating...' : 'Reset Password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
