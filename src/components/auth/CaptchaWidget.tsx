import React, { useEffect, useRef, useState } from 'react';
import { generateCaptchaText, generateNoiseLines, validateCaptcha } from '../../utils/captchaUtils';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';

interface CaptchaWidgetProps {
  onValidChange: (valid: boolean) => void;
}

export function CaptchaWidget({ onValidChange }: CaptchaWidgetProps) {
  const [captchaText, setCaptchaText] = useState(() => generateCaptchaText(6));
  const [noiseLines, setNoiseLines] = useState(() => generateNoiseLines(6));
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    drawCaptcha();
  }, [captchaText, noiseLines]);

  const drawCaptcha = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 200, 60);

    // Background
    const grad = ctx.createLinearGradient(0, 0, 200, 60);
    grad.addColorStop(0, '#0d1b2e');
    grad.addColorStop(1, '#1e3a5f33');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 200, 60);

    // Noise lines
    noiseLines.forEach(line => {
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
      ctx.strokeStyle = line.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Noise dots
    for (let i = 0; i < 30; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 200, Math.random() * 60, 1, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 245, 255, ${Math.random() * 0.3})`;
      ctx.fill();
    }

    // Captcha characters with distortion
    const colors = ['#00f5ff', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];
    captchaText.split('').forEach((char, i) => {
      ctx.save();
      ctx.font = `bold ${28 + Math.floor(Math.random() * 8)}px "Orbitron", monospace`;
      ctx.fillStyle = colors[i % colors.length];
      ctx.shadowBlur = 6;
      ctx.shadowColor = colors[i % colors.length];
      const x = 18 + i * 28;
      const y = 38 + (Math.random() - 0.5) * 8;
      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.3);
      ctx.fillText(char, 0, 0);
      ctx.restore();
    });

    // Border
    ctx.strokeStyle = '#00f5ff22';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, 200, 60);
  };

  const refresh = () => {
    const newText = generateCaptchaText(6);
    setCaptchaText(newText);
    setNoiseLines(generateNoiseLines(6));
    setInput('');
    setStatus('idle');
    onValidChange(false);
  };

  const handleInput = (value: string) => {
    setInput(value);
    if (value.length === captchaText.length) {
      const isValid = validateCaptcha(value, captchaText);
      setStatus(isValid ? 'valid' : 'invalid');
      onValidChange(isValid);
    } else {
      setStatus('idle');
      onValidChange(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-cyber font-semibold text-cyan-400 tracking-widest uppercase">
        CAPTCHA Verification
      </label>

      {/* Canvas */}
      <div className="flex items-center gap-2">
        <div className="rounded-lg overflow-hidden border border-cyan-500/20">
          <canvas ref={canvasRef} width={200} height={60} />
        </div>
        <button
          type="button"
          onClick={refresh}
          className="p-2 rounded-lg border border-slate-600 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-all"
          aria-label="Refresh CAPTCHA"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={e => handleInput(e.target.value)}
          placeholder="Enter characters above"
          maxLength={6}
          autoComplete="off"
          spellCheck={false}
          className={`cyber-input pr-10 font-mono text-center tracking-[0.4em] text-lg ${
            status === 'valid' ? 'border-emerald-500/60' : status === 'invalid' ? 'border-red-500/60' : ''
          }`}
          aria-label="CAPTCHA input"
        />
        {status !== 'idle' && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {status === 'valid'
              ? <CheckCircle size={18} className="text-emerald-400" />
              : <XCircle size={18} className="text-red-400" />
            }
          </span>
        )}
      </div>

      {status === 'invalid' && (
        <p className="text-xs text-red-400 font-mono">
          ✕ Incorrect — please try again or{' '}
          <button type="button" onClick={refresh} className="underline text-cyan-400">refresh</button>
        </p>
      )}
      {status === 'valid' && <p className="text-xs text-emerald-400 font-mono">✓ CAPTCHA verified</p>}

      <p className="text-xs text-slate-500 font-mono">
        ⚙ Demo CAPTCHA — replace with reCAPTCHA/hCaptcha in production
      </p>
    </div>
  );
}
