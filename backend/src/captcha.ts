export async function verifyCaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET || (process.env.NODE_ENV !== 'production' ? '1x0000000000000000000000000000000AA' : '');
  if (!secretKey) {
    console.error('TURNSTILE_SECRET is not set. CAPTCHA verification will fail.');
    return false;
  }
  
  if (!token) return false;

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: secretKey,
        response: token
      })
    });

    const data = await response.json();
    return data.success;
  } catch (err) {
    console.error('CAPTCHA verification error:', err);
    return false;
  }
}
