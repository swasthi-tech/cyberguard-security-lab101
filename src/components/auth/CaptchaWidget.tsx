import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { RefreshCw } from 'lucide-react';
import { fetchApi } from '../../lib/api';

export interface CaptchaWidgetRef {
  refresh: () => void;
}

interface CaptchaWidgetProps {
  onValidChange: (valid: boolean, id?: string, answer?: string) => void;
  error?: string;
}

export const CaptchaWidget = forwardRef<CaptchaWidgetRef, CaptchaWidgetProps>(({ onValidChange, error }, ref) => {
  const [captchaId, setCaptchaId] = useState('');
  const [captchaImage, setCaptchaImage] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [localError, setLocalError] = useState('');

  const fetchCaptcha = async () => {
    setLoading(true);
    setAnswer('');
    setIsValid(false);
    setLocalError('');
    onValidChange(false);
    try {
      const res = await fetchApi('/api/captcha/generate', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setCaptchaId(data.id);
        setCaptchaImage(data.image);
      }
    } catch (err) {
      console.error('Failed to load CAPTCHA', err);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    refresh: fetchCaptcha
  }));

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAnswer(val);
    setIsValid(false);
    setLocalError('');
    
    if (val.length >= 5) {
      try {
        const res = await fetchApi('/api/captcha/verify', { 
          method: 'POST', 
          body: JSON.stringify({ id: captchaId, answer: val }) 
        });
        if (res.ok) {
          const data = await res.json();
          if (data.valid) {
            setIsValid(true);
            onValidChange(true, captchaId, val);
          } else {
            setLocalError('Incorrect CAPTCHA. Please try again.');
            onValidChange(false);
          }
        }
      } catch (err) {
        setLocalError('Verification failed');
        onValidChange(false);
      }
    } else {
      onValidChange(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-cyber font-semibold text-cyan-400 tracking-widest uppercase">
          CAPTCHA VERIFICATION
        </label>
      </div>

      <div className="bg-[#0d1b2e] border border-cyan-500/20 rounded-lg p-3 space-y-3">
        <div className="flex items-center gap-3">
          <div 
            className="flex-1 h-[65px] bg-slate-900 rounded overflow-hidden flex items-center justify-center border border-slate-700/50"
            dangerouslySetInnerHTML={{ __html: captchaImage || '' }}
          />
          <button
            type="button"
            onClick={fetchCaptcha}
            disabled={loading}
            className="p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh CAPTCHA"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        <div>
          <input
            type="text"
            value={answer}
            onChange={handleChange}
            placeholder="Enter CAPTCHA"
            className={`cyber-input w-full text-center tracking-[0.3em] font-mono text-lg uppercase ${displayError ? 'border-red-500/50 focus:border-red-500' : ''}`}
            maxLength={6}
            autoComplete="off"
            spellCheck="false"
          />
          {displayError && <p className="mt-1.5 text-xs text-red-400 font-mono text-center">✕ {displayError}</p>}
          {isValid && <p className="mt-1.5 text-xs text-emerald-400 font-mono text-center">✓ CAPTCHA VERIFIED</p>}
        </div>
      </div>
    </div>
  );
});
