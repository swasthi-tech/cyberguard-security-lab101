import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { Button, Input, Alert } from '../components/ui';
import { CaptchaWidget } from '../components/auth/CaptchaWidget';
import { CyberBackground } from '../components/security';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [captchaValid, setCaptchaValid] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; captcha?: string }>({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!form.email) errs.email = 'Email or username required';
    if (!form.password) errs.password = 'Password required';
    if (!captchaValid) errs.captcha = 'Please complete the CAPTCHA';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const ok = await login(form.email, form.password);
      if (ok) navigate('/two-fa');
      else setAlert({ type: 'error', msg: 'Invalid credentials. Please try again.' });
    } catch {
      setAlert({ type: 'error', msg: 'Login failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] relative flex items-center justify-center px-4 py-12">
      <CyberBackground />

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-cyan-500/10 border border-cyan-500/30 animate-float">
              <Shield size={36} className="text-cyan-400" style={{ filter: 'drop-shadow(0 0 12px rgba(0,245,255,0.8))' }} />
            </div>
          </div>
          <h1 className="font-cyber text-3xl font-black text-white tracking-wide">SECURE LOGIN</h1>
          <p className="text-slate-400 text-sm mt-2">CyberGuard Security Lab</p>
        </div>

        <div className="glass-card p-8 border border-cyan-500/20 shadow-[0_0_40px_rgba(0,245,255,0.08)]">
          {/* Demo hint */}
          <div className="mb-5 px-4 py-3 rounded-lg bg-cyan-500/5 border border-cyan-500/15">
            <p className="text-xs text-cyan-400 font-mono text-center">
              ⚡ Demo mode — enter any email and password to sign in
            </p>
          </div>

          {alert && (
            <div className="mb-5"><Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} /></div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Input
              id="email"
              label="Email / Username"
              type="email"
              placeholder="alex@example.com"
              value={form.email}
              onChange={update('email')}
              error={errors.email}
              icon={<Mail size={16} />}
              autoComplete="email"
              required
            />

            <Input
              id="password"
              label="Password"
              type={showPw ? 'text' : 'password'}
              placeholder="Your password"
              value={form.password}
              onChange={update('password')}
              error={errors.password}
              icon={<Lock size={16} />}
              rightElement={
                <button type="button" onClick={() => setShowPw(!showPw)} className="text-slate-400 hover:text-cyan-400 transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              autoComplete="current-password"
              required
            />

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border border-cyan-500/30 bg-slate-800 checked:bg-cyan-500 cursor-pointer"
                />
                <span className="text-xs text-slate-400 font-cyber">Remember Me</span>
              </label>
              <Link to="/forgot-password" className="text-xs text-cyan-400 hover:text-cyan-300 font-cyber transition-colors">
                Forgot Password?
              </Link>
            </div>

            {/* CAPTCHA */}
            <div className="pt-2 border-t border-slate-700/50">
              <CaptchaWidget onValidChange={setCaptchaValid} />
              {errors.captcha && <p className="mt-1.5 text-xs text-red-400 font-mono">{errors.captcha}</p>}
            </div>

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
