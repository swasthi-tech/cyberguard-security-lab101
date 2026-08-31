import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, User, Mail, Lock, Eye, EyeOff, AtSign } from 'lucide-react';
import { Button, Input, Alert } from '../components/ui';
import { CaptchaWidget } from '../components/auth/CaptchaWidget';
import type { CaptchaWidgetRef } from '../components/auth/CaptchaWidget';
import { PasswordStrengthMeter } from '../components/auth/PasswordStrengthMeter';
import { CyberBackground } from '../components/security';
import { useAuth } from '../hooks/useAuth';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const captchaRef = React.useRef<CaptchaWidgetRef>(null);
  const [captchaId, setCaptchaId] = useState<string>('');
  const [captchaAnswer, setCaptchaAnswer] = useState<string>('');
  const [errors, setErrors] = useState<Partial<typeof form & { captcha: string }>>({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs: typeof errors = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.username.trim() || form.username.length < 3) errs.username = 'Username must be at least 3 characters';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Valid email required';
    if (!form.password || form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!captchaId || !captchaAnswer) errs.captcha = 'Please complete the CAPTCHA.';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await register({ ...form, captchaId, captchaAnswer });
      navigate('/two-fa');
    } catch {
      setAlert({ type: 'error', msg: 'Registration failed. Please try again.' });
      captchaRef.current?.refresh();
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = form.confirmPassword && form.password === form.confirmPassword;
  const passwordMismatch = form.confirmPassword && form.password !== form.confirmPassword;

  return (
    <div className="min-h-screen bg-[#020817] relative flex items-center justify-center px-4 py-12">
      <CyberBackground />

      <div className="relative z-10 w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-cyan-500/10 border border-cyan-500/30 animate-float">
              <Shield size={36} className="text-cyan-400" style={{ filter: 'drop-shadow(0 0 12px rgba(0,245,255,0.8))' }} />
            </div>
          </div>
          <h1 className="font-cyber text-3xl font-black text-white tracking-wide">CREATE ACCOUNT</h1>
          <p className="text-slate-400 text-sm mt-2">Join CyberGuard Security Lab</p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-8 border border-cyan-500/20 shadow-[0_0_40px_rgba(0,245,255,0.08)]">
          {alert && (
            <div className="mb-5">
              <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Full Name */}
            <Input
              id="fullName"
              label="Full Name"
              type="text"
              placeholder="Alex Carter"
              value={form.fullName}
              onChange={update('fullName')}
              error={errors.fullName}
              icon={<User size={16} />}
              autoComplete="name"
              required
            />

            {/* Username */}
            <Input
              id="username"
              label="Username"
              type="text"
              placeholder="alexcarter"
              value={form.username}
              onChange={update('username')}
              error={errors.username}
              icon={<AtSign size={16} />}
              autoComplete="username"
              required
            />

            {/* Email */}
            <Input
              id="email"
              label="Email Address"
              type="email"
              placeholder="alex@example.com"
              value={form.email}
              onChange={update('email')}
              error={errors.email}
              icon={<Mail size={16} />}
              autoComplete="email"
              required
            />

            {/* Password */}
            <div>
              <Input
                id="password"
                label="Password"
                type={showPw ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={form.password}
                onChange={update('password')}
                error={errors.password}
                icon={<Lock size={16} />}
                rightElement={
                  <button type="button" onClick={() => setShowPw(!showPw)} className="text-slate-400 hover:text-cyan-400 transition-colors">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                autoComplete="new-password"
                required
              />
              <PasswordStrengthMeter password={form.password} />
            </div>

            {/* Confirm Password */}
            <div>
              <Input
                id="confirmPassword"
                label="Confirm Password"
                type={showCpw ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={update('confirmPassword')}
                error={errors.confirmPassword}
                icon={<Lock size={16} />}
                rightElement={
                  <button type="button" onClick={() => setShowCpw(!showCpw)} className="text-slate-400 hover:text-cyan-400 transition-colors">
                    {showCpw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                autoComplete="new-password"
                required
              />
              {form.confirmPassword && (
                <p className={`mt-1.5 text-xs font-mono ${passwordsMatch ? 'text-emerald-400' : 'text-red-400'}`}>
                  {passwordsMatch ? '✓ Passwords match' : '✕ Passwords do not match'}
                </p>
              )}
            </div>

            {/* CAPTCHA */}
            <div className="pt-2 border-t border-slate-700/50">
              <CaptchaWidget 
                ref={captchaRef}
                onValidChange={(valid, id, answer) => {
                  setCaptchaId(id || '');
                  setCaptchaAnswer(answer || '');
                  setErrors(prev => ({ ...prev, captcha: '' }));
                }} 
                error={errors.captcha}
              />
            </div>

            {/* 2FA Notice */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/15">
              <Shield size={14} className="text-cyan-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-slate-400">
                After registration, you'll set up <span className="text-cyan-400">Two-Factor Authentication</span> for additional security.
              </p>
            </div>

            {/* Submit */}
            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
              {loading ? 'Creating Account...' : 'Create Secure Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
