import React from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

interface CaptchaWidgetProps {
  onValidChange: (valid: boolean, token?: string) => void;
}

export function CaptchaWidget({ onValidChange }: CaptchaWidgetProps) {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || ''; // Production Cloudflare key

  return (
    <div className="space-y-3">
      <label className="block text-xs font-cyber font-semibold text-cyan-400 tracking-widest uppercase">
        CAPTCHA Verification
      </label>

      <div className="min-h-[65px] flex items-center justify-center bg-[#0d1b2e] border border-cyan-500/20 rounded-lg p-1 overflow-hidden">
        <Turnstile
          siteKey={siteKey}
          onSuccess={(token) => onValidChange(true, token)}
          onError={() => onValidChange(false)}
          onExpire={() => onValidChange(false)}
          options={{
            theme: 'dark',
            size: 'flexible'
          }}
        />
      </div>
    </div>
  );
}
