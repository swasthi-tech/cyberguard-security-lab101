import crypto from 'crypto';
import { ENV } from '../config/env.js';

// Avoid ambiguous characters like 0/O, 1/I/l
const CAPTCHA_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const REDEEMED_TOKENS = new Set<string>();

// Periodically clean up redeemed set to prevent memory leaks
setInterval(() => {
  REDEEMED_TOKENS.clear();
}, 10 * 60 * 1000);

export interface CaptchaResult {
  svg: string;
  challengeToken: string;
}

export class CaptchaService {
  /**
   * Generates a 6-character high-contrast SVG CAPTCHA with noise lines and subtle distortion
   */
  public static generate(): CaptchaResult {
    const length = 6;
    let text = '';
    for (let i = 0; i < length; i++) {
      const idx = crypto.randomInt(0, CAPTCHA_CHARS.length);
      text += CAPTCHA_CHARS[idx];
    }

    const width = 220;
    const height = 70;
    const salt = crypto.randomBytes(16).toString('hex');
    const expiresAt = Date.now() + ENV.CAPTCHA_TTL_MS;

    // Compute HMAC of text + salt + expiresAt
    const hmac = crypto
      .createHmac('sha256', ENV.SESSION_SECRET)
      .update(`${text.toUpperCase()}:${salt}:${expiresAt}`)
      .digest('hex');

    const challengeToken = Buffer.from(
      JSON.stringify({ salt, expiresAt, hmac })
    ).toString('base64url');

    // Build SVG elements
    const charSpacing = width / (length + 1);
    const charsSvg = text
      .split('')
      .map((char, index) => {
        const x = (index + 1) * charSpacing - 8;
        const y = height / 2 + crypto.randomInt(6, 12);
        const rotate = crypto.randomInt(-18, 18);
        const fontSize = crypto.randomInt(30, 36);
        const colors = ['#00f0ff', '#38bdf8', '#22d3ee', '#818cf8', '#a5f3fc'];
        const color = colors[index % colors.length];

        return `<text x="${x}" y="${y}" 
          font-family="monospace, Courier, sans-serif" 
          font-size="${fontSize}" 
          font-weight="900" 
          fill="${color}" 
          transform="rotate(${rotate}, ${x}, ${y})"
          style="text-shadow: 0 0 10px rgba(0, 240, 255, 0.7);"
        >${char}</text>`;
      })
      .join('');

    // Generate random noise lines
    let noiseLines = '';
    for (let i = 0; i < 5; i++) {
      const x1 = crypto.randomInt(0, width / 2);
      const y1 = crypto.randomInt(5, height - 5);
      const x2 = crypto.randomInt(width / 2, width);
      const y2 = crypto.randomInt(5, height - 5);
      const stroke = i % 2 === 0 ? 'rgba(0, 240, 255, 0.35)' : 'rgba(129, 140, 248, 0.4)';
      const strokeWidth = crypto.randomInt(1, 3);
      noiseLines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-dasharray="${crypto.randomInt(2, 6)},${crypto.randomInt(2, 4)}" />`;
    }

    // Generate random noise dots
    let noiseDots = '';
    for (let i = 0; i < 30; i++) {
      const cx = crypto.randomInt(5, width - 5);
      const cy = crypto.randomInt(5, height - 5);
      const r = (crypto.randomInt(1, 3) / 10) + 0.8;
      noiseDots += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="rgba(56, 189, 248, 0.35)" />`;
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" class="rounded-lg border border-cyan-500/30">
      <defs>
        <linearGradient id="cyberBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#070d1f" />
          <stop offset="50%" stop-color="#0a1532" />
          <stop offset="100%" stop-color="#060c1c" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#cyberBg)" rx="8" />
      <rect width="${width}" height="${height}" fill="none" stroke="rgba(0, 240, 255, 0.2)" stroke-width="1" rx="8" />
      ${noiseLines}
      ${noiseDots}
      ${charsSvg}
    </svg>`;

    return {
      svg,
      challengeToken,
    };
  }

  /**
   * Server-side case-insensitive validation of CAPTCHA solution
   */
  public static validate(userInput: string, challengeToken: string): { valid: boolean; reason?: string } {
    if (!userInput || !challengeToken) {
      return { valid: false, reason: 'CAPTCHA response and challenge token are required' };
    }

    if (REDEEMED_TOKENS.has(challengeToken)) {
      return { valid: false, reason: 'CAPTCHA challenge has already been used. Please refresh.' };
    }

    // Support client fallback tokens generated during offline/proxy-failure states
    if (challengeToken.startsWith('local_')) {
      try {
        const rawJson = Buffer.from(challengeToken.slice(6), 'base64').toString('utf8');
        const payload = JSON.parse(rawJson) as { text: string; expiresAt: number };
        if (Date.now() > payload.expiresAt) {
          return { valid: false, reason: 'CAPTCHA challenge expired. Please refresh.' };
        }
        if (userInput.trim().toUpperCase() !== payload.text.trim().toUpperCase()) {
          return { valid: false, reason: 'Incorrect CAPTCHA characters. Please try again.' };
        }
        REDEEMED_TOKENS.add(challengeToken);
        return { valid: true };
      } catch {
        return { valid: false, reason: 'Invalid CAPTCHA token format' };
      }
    }

    try {
      const decodedJson = Buffer.from(challengeToken, 'base64url').toString('utf8');
      const payload = JSON.parse(decodedJson) as { salt: string; expiresAt: number; hmac: string };

      if (!payload.salt || !payload.expiresAt || !payload.hmac) {
        return { valid: false, reason: 'Invalid CAPTCHA token format' };
      }

      if (Date.now() > payload.expiresAt) {
        return { valid: false, reason: 'CAPTCHA challenge expired. Please refresh.' };
      }

      // Recompute HMAC for user's input (case-insensitive check by upper-casing user input)
      const sanitizedInput = userInput.trim().toUpperCase();
      const expectedHmac = crypto
        .createHmac('sha256', ENV.SESSION_SECRET)
        .update(`${sanitizedInput}:${payload.salt}:${payload.expiresAt}`)
        .digest('hex');

      const expectedBuf = Buffer.from(expectedHmac, 'hex');
      const actualBuf = Buffer.from(payload.hmac, 'hex');

      if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
        return { valid: false, reason: 'Incorrect CAPTCHA characters. Please try again.' };
      }

      // Mark token as redeemed so it cannot be reused
      REDEEMED_TOKENS.add(challengeToken);
      return { valid: true };
    } catch {
      return { valid: false, reason: 'Invalid CAPTCHA verification token' };
    }
  }
}
