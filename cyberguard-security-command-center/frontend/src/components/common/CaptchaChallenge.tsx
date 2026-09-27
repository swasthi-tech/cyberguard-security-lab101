import React, { useEffect, useState, useCallback } from 'react';
import { RefreshCw, ShieldCheck, AlertCircle, Check } from 'lucide-react';
import { api } from '../../api/client';

interface CaptchaChallengeProps {
  value: string;
  onChange: (val: string) => void;
  onChallengeToken: (token: string) => void;
  error?: string;
}

// Avoid easily confused characters: 0/O, 1/I/l
const CAPTCHA_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * High-contrast cyber-styled client SVG generator fallback
 */
function generateLocalCaptcha(): { svg: string; challengeToken: string; answer: string } {
  const length = 6;
  let text = '';
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * CAPTCHA_CHARS.length);
    text += CAPTCHA_CHARS[idx];
  }

  const width = 220;
  const height = 70;
  const charSpacing = width / (length + 1);
  const colors = ['#00f0ff', '#38bdf8', '#22d3ee', '#818cf8', '#a5f3fc'];

  const charsSvg = text
    .split('')
    .map((char, index) => {
      const x = Math.round((index + 1) * charSpacing - 8);
      const y = Math.round(height / 2 + Math.floor(Math.random() * 8) + 8);
      const rotate = Math.floor(Math.random() * 26) - 13;
      const fontSize = Math.floor(Math.random() * 6) + 30;
      const color = colors[index % colors.length];

      return `<text x="${x}" y="${y}" 
        font-family="JetBrains Mono, monospace, Courier, sans-serif" 
        font-size="${fontSize}" 
        font-weight="900" 
        fill="${color}" 
        transform="rotate(${rotate}, ${x}, ${y})"
        style="text-shadow: 0 0 10px rgba(0, 240, 255, 0.7);"
      >${char}</text>`;
    })
    .join('');

  let noiseLines = '';
  for (let i = 0; i < 4; i++) {
    const x1 = Math.floor(Math.random() * (width / 2));
    const y1 = Math.floor(Math.random() * (height - 10)) + 5;
    const x2 = Math.floor(Math.random() * (width / 2)) + Math.floor(width / 2);
    const y2 = Math.floor(Math.random() * (height - 10)) + 5;
    const stroke = i % 2 === 0 ? 'rgba(0, 240, 255, 0.35)' : 'rgba(129, 140, 248, 0.4)';
    const strokeWidth = Math.floor(Math.random() * 2) + 1;
    noiseLines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-dasharray="4,4" />`;
  }

  let noiseDots = '';
  for (let i = 0; i < 24; i++) {
    const cx = Math.floor(Math.random() * (width - 10)) + 5;
    const cy = Math.floor(Math.random() * (height - 10)) + 5;
    const r = (Math.random() * 0.8 + 0.8).toFixed(1);
    noiseDots += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="rgba(56, 189, 248, 0.35)" />`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" class="rounded-lg border border-cyan-500/30">
    <defs>
      <linearGradient id="cyberBgLocal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#070d1f" />
        <stop offset="50%" stop-color="#0a1532" />
        <stop offset="100%" stop-color="#060c1c" />
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#cyberBgLocal)" rx="8" />
    <rect width="${width}" height="${height}" fill="none" stroke="rgba(0, 240, 255, 0.2)" stroke-width="1" rx="8" />
    ${noiseLines}
    ${noiseDots}
    ${charsSvg}
  </svg>`;

  const expiresAt = Date.now() + 5 * 60 * 1000;
  const challengeToken = 'local_' + btoa(JSON.stringify({ text, expiresAt, v: 1 }));

  return { svg, challengeToken, answer: text };
}

export const CaptchaChallenge: React.FC<CaptchaChallengeProps> = ({
  value,
  onChange,
  onChallengeToken,
  error,
}) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isRotating, setIsRotating] = useState<boolean>(false);

  const fetchNewCaptcha = useCallback(async () => {
    setLoading(true);
    setIsRotating(true);
    onChange('');

    try {
      const res = await api.auth.getCaptcha();
      if (res && res.svg && res.challengeToken) {
        setSvgContent(res.svg);
        onChallengeToken(res.challengeToken);
      } else {
        throw new Error('Incomplete server CAPTCHA payload');
      }
    } catch {
      // Fallback seamlessly to high-contrast local challenge
      const fallback = generateLocalCaptcha();
      setSvgContent(fallback.svg);
      onChallengeToken(fallback.challengeToken);
    } finally {
      setLoading(false);
      setTimeout(() => setIsRotating(false), 500);
    }
  }, [onChange, onChallengeToken]);

  useEffect(() => {
    fetchNewCaptcha();
  }, [fetchNewCaptcha]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Automatically sanitize and uppercase to avoid user frustration with case mismatch
    const sanitized = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    onChange(sanitized);
  };

  const isComplete = value.length === 6;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-mono tracking-wider text-slate-300">
          SECURITY VERIFICATION CHALLENGE
        </label>
        <span className="text-[10px] font-mono text-cyan-400/80">6-CHAR ENCRYPTED</span>
      </div>

      <div className="bg-[#070d1f] p-3 rounded-lg border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.07)]">
        {/* CAPTCHA Display Box with Refresh Button */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 bg-[#050a18] border border-cyan-500/40 rounded-md overflow-hidden flex items-center justify-center min-h-[70px]">
            {loading && !svgContent ? (
              <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>GENERATING CHALLENGE...</span>
              </div>
            ) : (
              <div
                className="w-full flex items-center justify-center select-none"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            )}
          </div>

          {/* Dedicated Refresh Button */}
          <button
            type="button"
            onClick={fetchNewCaptcha}
            disabled={loading}
            title="Generate new CAPTCHA challenge"
            className="p-3 bg-slate-800/80 hover:bg-cyan-950/60 border border-slate-700 hover:border-cyan-500/50 rounded-md text-slate-300 hover:text-cyan-300 transition-all flex flex-col items-center justify-center group"
          >
            <RefreshCw
              className={`w-5 h-5 transition-transform duration-500 ${
                isRotating ? 'rotate-180 text-cyan-400' : 'group-hover:rotate-90'
              }`}
            />
            <span className="text-[9px] font-mono mt-1 text-slate-400 group-hover:text-cyan-300">RELOAD</span>
          </button>
        </div>

        {/* Input box */}
        <div className="mt-2.5 relative">
          <input
            type="text"
            value={value}
            onChange={handleInputChange}
            placeholder="Enter the 6 characters above"
            maxLength={6}
            autoComplete="off"
            spellCheck="false"
            className={`w-full px-3.5 py-2.5 bg-slate-900/90 border rounded-md text-white font-mono text-sm tracking-widest placeholder:tracking-normal placeholder:font-sans placeholder:text-slate-500 transition-all outline-none ${
              isComplete
                ? 'border-emerald-500/80 focus:ring-1 focus:ring-emerald-400/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50'
            }`}
          />
          {isComplete && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] font-mono text-emerald-400">
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-red-400 font-mono">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};
