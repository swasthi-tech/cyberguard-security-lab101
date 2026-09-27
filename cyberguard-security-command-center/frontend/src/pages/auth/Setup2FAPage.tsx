import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Smartphone, QrCode, Copy, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Setup2FAResponse } from '../../api/types';

export const Setup2FAPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [setupData, setSetupData] = useState<Setup2FAResponse | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchSetupData = async () => {
      try {
        setInitLoading(true);
        const data = await api.auth.setup2FA();
        setSetupData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to initialize 2FA provisioning.');
      } finally {
        setInitLoading(false);
      }
    };

    fetchSetupData();
  }, []);

  const handleCopySecret = () => {
    if (!setupData) return;
    navigator.clipboard.writeText(setupData.secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleCopyCodes = () => {
    if (!setupData) return;
    navigator.clipboard.writeText(setupData.recoveryCodes.join('\n'));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const handleConfirm2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (verifyCode.trim().length !== 6) {
      setError('Please enter the 6-digit code from your authenticator app.');
      return;
    }

    try {
      setLoading(true);
      await api.auth.confirm2FA(verifyCode.trim());
      await refreshUser();
      setSuccessMessage('Two-factor authentication successfully activated on your account!');
      setTimeout(() => {
        navigate('/settings');
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to confirm 2FA code. Please ensure your clock is synchronized.');
    } finally {
      setLoading(false);
    }
  };

  if (initLoading) {
    return (
      <div className="min-h-screen bg-[#040816] flex flex-col items-center justify-center font-mono text-cyan-400 text-xs">
        <Shield className="w-8 h-8 animate-pulse mb-3" />
        <span>GENERATING CRYPTOGRAPHIC TOTP PAIR...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040816] flex flex-col items-center justify-center p-4 selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className="absolute w-[600px] h-[350px] bg-cyan-500/10 blur-[140px] pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-6 text-center relative z-10">
        <Link to="/settings" className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-cyan-400 mb-3">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Security Settings</span>
        </Link>
        <h1 className="text-2xl font-bold font-mono text-white">
          Secure your account with two-factor authentication
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Compatible with Google Authenticator, Microsoft Authenticator, Authy, and 1Password
        </p>
      </div>

      <div className="w-full max-w-2xl soc-card p-6 sm:p-8 relative z-10 font-mono text-xs">
        {error && (
          <div className="mb-6 p-3 rounded bg-red-950/50 border border-red-500/40 text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {setupData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Step 1: Scan QR Code */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-cyan-400 font-bold border-b border-cyan-500/20 pb-2">
                <QrCode className="w-4 h-4" />
                <span>STEP 1: SCAN PROVISIONING QR</span>
              </div>

              {/* QR Code Container */}
              <div className="p-3 bg-[#070d1f] rounded-lg border border-cyan-500/30 flex items-center justify-center">
                <img
                  src={setupData.qrDataUrl}
                  alt="2FA QR Code"
                  className="w-48 h-48 rounded border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                />
              </div>

              {/* Manual Entry Key */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  MANUAL ENTRY SECRET (BASE32):
                </label>
                <div className="flex items-center gap-2 bg-slate-900/90 p-2 rounded border border-slate-700">
                  <span className="text-cyan-300 font-bold tracking-wider truncate flex-1 select-all">
                    {setupData.secret}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="p-1 text-slate-400 hover:text-cyan-400"
                    title="Copy Secret"
                  >
                    {copiedSecret ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2: Emergency Recovery Codes & Confirmation */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-cyan-400 font-bold border-b border-cyan-500/20 pb-2">
                <Shield className="w-4 h-4" />
                <span>STEP 2: BACKUP RECOVERY CODES</span>
              </div>

              <p className="text-[11px] text-slate-400">
                Save these 10 single-use recovery codes in an encrypted manager in case you lose device access:
              </p>

              {/* 10 Recovery Codes Grid */}
              <div className="p-3 bg-[#050a18] rounded-lg border border-slate-700 grid grid-cols-2 gap-2 text-[11px] font-mono text-cyan-300 select-all">
                {setupData.recoveryCodes.map((code, idx) => (
                  <div key={idx} className="bg-slate-900/80 px-2 py-1 rounded border border-slate-800 text-center">
                    {code}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleCopyCodes}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-600 flex items-center justify-center gap-1.5"
              >
                {copiedCodes ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCodes ? 'COPIED TO CLIPBOARD' : 'COPY RECOVERY CODES'}</span>
              </button>

              {/* Step 3: Enter 6-digit confirmation code */}
              <form onSubmit={handleConfirm2FA} className="pt-2 border-t border-slate-800 space-y-3">
                <label className="block text-slate-300 font-bold">
                  STEP 3: CONFIRM 6-DIGIT CODE
                </label>
                <input
                  type="text"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  required
                  className="w-full py-2.5 px-3 bg-slate-900 border border-cyan-500/40 focus:border-cyan-400 rounded text-center text-lg tracking-[0.25em] text-white outline-none"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all disabled:opacity-50"
                >
                  {loading ? 'VALIDATING MATHEMATICALLY...' : 'ACTIVATE 2FA PROTECTION'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
