// Simple CAPTCHA generator — swap this module for a real provider (reCAPTCHA, hCaptcha) in production
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';

export function generateCaptchaText(length = 6): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return result;
}

export function validateCaptcha(input: string, captchaText: string): boolean {
  return input.trim().toLowerCase() === captchaText.trim().toLowerCase();
}

// Generate random noise lines for the CAPTCHA canvas
export function generateNoiseLines(count = 5): Array<{ x1: number; y1: number; x2: number; y2: number; color: string }> {
  return Array.from({ length: count }, () => ({
    x1: Math.random() * 200,
    y1: Math.random() * 60,
    x2: Math.random() * 200,
    y2: Math.random() * 60,
    color: `rgba(${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(Math.random() * 150 + 50)}, ${Math.floor(Math.random() * 200 + 55)}, 0.4)`,
  }));
}
