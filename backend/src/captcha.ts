import svgCaptcha from 'svg-captcha';
import crypto from 'crypto';
import { getDb } from './db.js';

export async function generateCaptcha() {
  const captcha = svgCaptcha.create({
    size: 6,
    ignoreChars: '0o1iLl',
    noise: 3,
    color: true,
    background: '#0d1b2e'
  });

  const id = crypto.randomUUID();
  // Using a secure hash (SHA-256) instead of bcrypt for speed since it's just a captcha
  // We add a pepper/salt by combining the ID with the answer to prevent rainbow table attacks
  const answerHash = crypto.createHash('sha256').update(captcha.text.toLowerCase() + id).digest('hex');
  
  // 5 minutes from now
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const db = await getDb();
  await db.run('INSERT INTO captchas (id, answerHash, expiresAt) VALUES (?, ?, ?)', [id, answerHash, expiresAt]);

  return {
    id,
    image: captcha.data
  };
}

export async function verifyCaptcha(id: string, answer: string): Promise<boolean> {
  if (!id || !answer) return false;

  try {
    const db = await getDb();
    const record = await db.get('SELECT answerHash, expiresAt FROM captchas WHERE id = ?', [id]);
    
    if (!record) return false;

    // Delete it immediately so it can't be reused
    await db.run('DELETE FROM captchas WHERE id = ?', [id]);

    // Check expiration
    if (new Date(record.expiresAt) < new Date()) {
      return false;
    }

    // Verify hash
    const expectedHash = crypto.createHash('sha256').update(answer.trim().toLowerCase() + id).digest('hex');
    
    // Secure timing-safe compare
    const a = Buffer.from(expectedHash);
    const b = Buffer.from(record.answerHash);
    
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch (err) {
    console.error('CAPTCHA verification error:', err);
    return false;
  }
}
