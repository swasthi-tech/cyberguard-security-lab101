import svgCaptcha from 'svg-captcha';
import crypto from 'crypto';

interface CaptchaRecord {
  answerHash: string;
  expiresAt: number;
}

const captchas = new Map<string, CaptchaRecord>();

// Cleanup expired captchas every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, record] of captchas.entries()) {
    if (record.expiresAt < now) {
      captchas.delete(id);
    }
  }
}, 5 * 60 * 1000);

export async function generateCaptcha() {
  const captcha = svgCaptcha.create({
    size: 6,
    ignoreChars: '0o1iLl',
    noise: 3,
    color: true,
    background: '#0d1b2e'
  });

  const id = crypto.randomUUID();
  const answerHash = crypto.createHash('sha256').update(captcha.text.toLowerCase() + id).digest('hex');
  
  // 5 minutes expiration
  const expiresAt = Date.now() + 5 * 60 * 1000;

  captchas.set(id, { answerHash, expiresAt });

  return {
    id,
    image: captcha.data
  };
}

export async function checkCaptcha(id: string, answer: string): Promise<boolean> {
  if (!id || !answer) return false;

  try {
    const record = captchas.get(id);
    if (!record) return false;

    if (record.expiresAt < Date.now()) {
      captchas.delete(id);
      return false;
    }

    const expectedHash = crypto.createHash('sha256').update(answer.trim().toLowerCase() + id).digest('hex');
    
    const a = Buffer.from(expectedHash);
    const b = Buffer.from(record.answerHash);
    
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch (err) {
    console.error('CAPTCHA verification error:', err);
    return false;
  }
}

export async function verifyCaptcha(id: string, answer: string): Promise<boolean> {
  const isValid = await checkCaptcha(id, answer);
  if (isValid) {
    // Consume it immediately
    captchas.delete(id);
  }
  return isValid;
}
