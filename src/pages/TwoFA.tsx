import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Smartphone, Key, CheckCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button, Alert } from '../components/ui';
import { OTPInput } from '../components/auth/OTPInput';
import { CyberBackground } from '../components/security';
import { useAuth } from '../hooks/useAuth';
import { fetchAuthApi } from '../lib/api';

export function TwoFAPage() {
  const navigate = useNavigate();
  const { verifyTwoFA, isAuthenticated, user, needsTwoFA, checkSession } = useAuth();

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tab, setTab] = useState<'qr' | 'key'>('qr');
  
  // Setup state
  const [isSetupFlow, setIsSetupFlow] = useState(false);
  const [setupKey, setSetupKey] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [showRecovery, setShowRecovery] = useState(false);

  useEffect(() => {
    // Determine flow based on auth state
    if (isAuthenticated && user?.twoFactorEnabled) {
      navigate('/dashboard'); // Already setup and authenticated
    } else if (isAuthenticated && user && !user.twoFactorEnabled) {
      setIsSetupFlow(true);
      initSetup();
    } else if (!isAuthenticated && !needsTwoFA) {
      navigate('/login');
    }
  }, [isAuthenticated, user, needsTwoFA]);

  const initSetup = async () => {
    try {
      const res = await fetchAuthApi('/api/2fa/setup', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSetupKey(data.setupKey);
        setQrCodeUrl(data.qrCodeUrl);
      } else {
        setError('Failed to initiate 2FA setup. Please try again.');
      }
    } catch (e) {
      setError('Service unavailable');
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter all 6 digits'); return; }
    setLoading(true);
    setError('');
    
    try {
      if (isSetupFlow) {
        // Setup Verification
        const res = await fetchAuthApi('/api/2fa/verify-setup', {
          method: 'POST',
          body: JSON.stringify({ code })
        });
        if (res.ok) {
          const data = await res.json();
          setRecoveryCodes(data.recoveryCodes);
          setShowRecovery(true);
          await checkSession();
        } else {
          setError('Invalid verification code. Try again.');
          setOtp(Array(6).fill(''));
        }
      } else {
        // Login Verification
        const ok = await verifyTwoFA(code);
        if (ok) {
          setSuccess(true);
          setTimeout(() => navigate('/dashboard'), 1500);
        } else {
          setError('Invalid verification code or recovery code. Try again.');
          setOtp(Array(6).fill(''));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (showRecovery) {
    return (
      <div className="min-h-screen bg-[#020817] relative flex items-center justify-center px-4 py-12">
        <CyberBackground />
        <div className="relative z-10 w-full max-w-md">
          <div className="glass-card p-8 border border-emerald-500/30">
            <div className="text-center mb-6">
              <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
              <h2 className="font-cyber text-xl font-bold text-emerald-400">2FA ENABLED</h2>
              <p className="text-slate-400 text-sm mt-2">Save these recovery codes in a secure place. They are only shown once.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {recoveryCodes.map((code, i) => (
                <div key={i} className="p-2 bg-slate-900 border border-slate-700 rounded text-center">
                  <code className="text-cyan-400 font-mono text-xs">{code}</code>
                </div>
              ))}
            </div>
            <Button variant="primary" className="w-full" onClick={() => navigate('/dashboard')}>
              I have saved them. Continue
            </Button>
          </div>
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
              <Smartphone size={36} className="text-cyan-400" style={{ filter: 'drop-shadow(0 0 12px rgba(0,245,255,0.8))' }} />
            </div>
          </div>
          <h1 className="font-cyber text-2xl font-black text-white tracking-wide">
            {isSetupFlow ? 'SET UP 2FA' : 'SECURE YOUR ACCOUNT'}
          </h1>
          <p className="text-slate-400 text-sm mt-2">Two-Step Verification</p>
        </div>

        <div className="glass-card p-8 border border-cyan-500/20 shadow-[0_0_40px_rgba(0,245,255,0.08)]">
          {isSetupFlow && (
            <>
              <div className="flex gap-1 mb-6 p-1 rounded-lg bg-slate-800/50">
                <button
                  onClick={() => setTab('qr')}
                  className={`flex-1 py-2 rounded-lg text-xs font-cyber font-semibold tracking-wide transition-all ${
                    tab === 'qr' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  SCAN QR CODE
                </button>
                <button
                  onClick={() => setTab('key')}
                  className={`flex-1 py-2 rounded-lg text-xs font-cyber font-semibold tracking-wide transition-all ${
                    tab === 'key' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  ENTER SETUP KEY
                </button>
              </div>

              {tab === 'qr' && (
                <div className="flex flex-col items-center mb-6">
                  <div className="p-4 rounded-xl bg-white border-4 border-cyan-500/30 shadow-[0_0_20px_rgba(0,245,255,0.2)]">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="QR Code" width="140" height="140" />
                    ) : (
                      <div className="w-[140px] h-[140px] flex items-center justify-center">
                        <RefreshCw className="animate-spin text-slate-400" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-mono text-center mt-3">
                    Scan with Google Authenticator / Authy
                  </p>
                </div>
              )}

              {tab === 'key' && (
                <div className="mb-6">
                  <label className="block text-xs font-cyber text-cyan-400 tracking-widest mb-2 uppercase">Setup Key</label>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-slate-800/70 border border-cyan-500/20">
                    <Key size={14} className="text-cyan-400 flex-shrink-0" />
                    <code className="font-mono-cyber text-sm text-cyan-300 tracking-widest">{setupKey || 'Loading...'}</code>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 font-mono">Enter this key in your authenticator app</p>
                </div>
              )}
            </>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-cyber font-semibold text-slate-300 tracking-widest text-center mb-4 uppercase">
                Enter 6-Digit Verification Code
              </label>

              {success ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <CheckCircle size={48} className="text-emerald-400" style={{ filter: 'drop-shadow(0 0 12px #10b981)' }} />
                  <p className="font-cyber text-emerald-400 text-sm tracking-widest">VERIFIED! Redirecting...</p>
                </div>
              ) : (
                <OTPInput value={otp} onChange={setOtp} disabled={loading || success} />
              )}
            </div>

            {error && <Alert type="error" message={error} />}

            {!success && (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleVerify}
                loading={loading}
                disabled={otp.join('').length < 6}
              >
                Verify Code
              </Button>
            )}
            
            {!success && !isSetupFlow && (
               <p className="text-xs text-center text-slate-500 font-mono mt-4">
                 Lost your device? You can enter a recovery code above.
               </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

