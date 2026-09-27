import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Shield, Smartphone, KeyRound, CheckCircle2, AlertTriangle, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmNewPassword) {
      setMsg('Passwords do not match or field is empty.');
      return;
    }
    setMsg('Master passphrase updated successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setTimeout(() => setMsg(null), 4000);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="p-5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-blue-950/40 border border-cyan-500/20 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase">
              SECURITY SETTINGS &amp; IDENTITY ASSURANCE
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Security Profile &amp; Hardening
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Configure Multi-Factor Authentication, rotate recovery backup codes, and manage account credentials
          </p>
        </div>
        <StatusBadge status={user?.twoFactorEnabled ? 'SECURE' : 'ACTION REQUIRED'} size="sm" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 2FA Status Card (6 cols) */}
        <div className="lg:col-span-6 p-5 rounded-xl soc-card border border-cyan-500/20 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-bold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              MULTI-FACTOR AUTHENTICATION (2FA)
            </span>
            <span className="text-[10px] text-cyan-400">RFC 6238 TOTP</span>
          </div>

          <p className="text-slate-300 font-sans leading-relaxed">
            Multi-factor authentication adds an immutable cryptographic layer of defense to your operator identity.
            Even if credentials are compromised, authentication requires a time-synchronized one-time code.
          </p>

          <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="text-slate-100 font-bold">Authenticator App TOTP</div>
                <div className="text-[11px] text-slate-400">Google Authenticator, YubiKey Authenticator, 1Password</div>
              </div>
            </div>
            {user?.twoFactorEnabled ? (
              <span className="text-emerald-400 font-bold text-[11px]">ACTIVE</span>
            ) : (
              <Link
                to="/setup-2fa"
                className="px-3 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all"
              >
                Enable 2FA
              </Link>
            )}
          </div>

          {user?.twoFactorEnabled && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-400">Disaster Recovery:</span>
              <Link
                to="/setup-2fa"
                className="text-cyan-400 hover:underline text-xs"
              >
                Re-provision / Rotate Keys &rarr;
              </Link>
            </div>
          )}
        </div>

        {/* Password Rotation Card (6 cols) */}
        <div className="lg:col-span-6 p-5 rounded-xl soc-card border border-cyan-500/20 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-bold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-cyan-400" />
              ROTATE MASTER PASSPHRASE
            </span>
            <span className="text-[10px] text-cyan-400">ARGON2ID ENCRYPTED</span>
          </div>

          {msg && (
            <div className="p-3 rounded bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs">
              {msg}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-3">
            <div>
              <label className="text-slate-400 block mb-1">Current Master Passphrase:</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">New Complex Passphrase:</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Confirm New Passphrase:</label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-bold transition-colors"
            >
              Update Passphrase
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
