import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { ENV } from '../config/env.js';

// Configure TOTP parameters
authenticator.options = {
  step: 30,
  window: 1, // allow +/- 30s time drift
};

export class TotpService {
  /**
   * Encrypts a TOTP secret before persisting to the database using AES-256-GCM
   */
  public static encryptSecret(secret: string): { encrypted: string; iv: string; authTag: string } {
    const key = crypto.createHash('sha256').update(ENV.TOTP_ENCRYPTION_KEY).digest();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(secret, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag,
    };
  }

  /**
   * Decrypts an encrypted TOTP secret
   */
  public static decryptSecret(encrypted: string, ivHex: string, authTagHex: string): string {
    const key = crypto.createHash('sha256').update(ENV.TOTP_ENCRYPTION_KEY).digest();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Generates a new random Base32 TOTP secret
   */
  public static generateSecret(): string {
    return authenticator.generateSecret();
  }

  /**
   * Generates otpauth URI and QR code data URL
   */
  public static async generateQrCode(email: string, secret: string): Promise<{ otpauthUrl: string; qrDataUrl: string }> {
    const serviceName = 'CYBERGUARD SOC';
    const otpauthUrl = authenticator.keyuri(email, serviceName, secret);
    const qrDataUrl = await QRCode.toDataURL(otpauthUrl, {
      errorCorrectionLevel: 'M',
      margin: 2,
      color: {
        dark: '#00f0ff',
        light: '#070d1f',
      },
      width: 256,
    });

    return { otpauthUrl, qrDataUrl };
  }

  /**
   * Generates a set of 10 alphanumeric backup recovery codes (e.g. "A1B2-C3D4")
   * and returns plain codes (for the user to save once) and their SHA-256 hashes
   */
  public static generateRecoveryCodes(): { plainCodes: string[]; hashedCodes: string[] } {
    const plainCodes: string[] = [];
    const hashedCodes: string[] = [];

    for (let i = 0; i < 10; i++) {
      const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
      const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
      const code = `${part1}-${part2}`;
      plainCodes.push(code);

      const hash = crypto.createHash('sha256').update(code).digest('hex');
      hashedCodes.push(hash);
    }

    return { plainCodes, hashedCodes };
  }

  /**
   * Real mathematical TOTP verification using RFC 6238 standards
   * Never accepts arbitrary codes.
   */
  public static verifyToken(token: string, secret: string): boolean {
    if (!token || token.trim().length !== 6) {
      return false;
    }
    // Only digits are valid
    if (!/^\d{6}$/.test(token.trim())) {
      return false;
    }

    try {
      return authenticator.verify({
        token: token.trim(),
        secret,
      });
    } catch {
      return false;
    }
  }

  /**
   * Hashes a recovery code for lookup in database
   */
  public static hashRecoveryCode(code: string): string {
    const clean = code.trim().toUpperCase();
    return crypto.createHash('sha256').update(clean).digest('hex');
  }
}
