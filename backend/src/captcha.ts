export async function verifyCaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.CAPTCHA_SECRET_KEY;
  if (!secretKey) {
    console.warn('CAPTCHA_SECRET_KEY is not set. Bypassing CAPTCHA verification for development.');
    return true; // Bypass if no key is configured
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
