import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { fetchApi } from '../../lib/api';

interface CaptchaWidgetProps {
  onValidChange: (valid: boolean, id?: string, answer?: string) => void;
}

export function CaptchaWidget({ onValidChange }: CaptchaWidgetProps) {
  const [captchaId, setCaptchaId] = useState('');
  const [captchaImage, setCaptchaImage] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCaptcha = async () => {
    setLoading(true);
    setAnswer('');
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

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAnswer(val);
    if (val.length >= 5) {
      onValidChange(true, captchaId, val);
    } else {
      onValidChange(false);
    }
  };

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
        <input
          type="text"
          value={answer}
          onChange={handleChange}
          placeholder="Enter the characters above"
          className="cyber-input w-full text-center tracking-[0.3em] font-mono text-lg uppercase"
          maxLength={6}
          autoComplete="off"
          spellCheck="false"
        />
      </div>
    </div>
  );
}
