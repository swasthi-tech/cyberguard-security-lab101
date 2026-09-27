import crypto from 'crypto';
import { hash, verify, Algorithm } from '@node-rs/argon2';
import { prisma } from '../prisma.js';
import { ENV } from '../config/env.js';

const COMMON_PASSWORDS = new Set([
  'password', 'password123', 'admin123', '12345678', 'qwerty123',
  'cyberguard', 'welcome123', 'administrator', 'iloveyou', 'sunshine',
  'master123', 'changeme', 'letmein123', 'trustnoone'
]);

export interface PasswordAnalysis {
  isValid: boolean;
  score: number; // 0 - 6
  level: 'EASY' | 'NORMAL' | 'MEDIUM' | 'OK' | 'SATISFIED' | 'GOOD' | 'EXCELLENT';
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
    notCommon: boolean;
    noRepeatedPatterns: boolean;
  };
  feedback: string[];
}

export class AuthService {
  /**
   * Analyzes password strength according to SOC enterprise standards
   */
  public static checkPasswordStrength(password: string): PasswordAnalysis {
    const checks = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
      notCommon: !COMMON_PASSWORDS.has(password.toLowerCase()),
      noRepeatedPatterns: !/(.)\1{3,}/.test(password) && !/(..+)\1{2,}/.test(password),
    };

    const feedback: string[] = [];
    if (!checks.minLength) feedback.push('Must be at least 8 characters long');
    if (!checks.hasUppercase) feedback.push('Include at least one uppercase letter');
    if (!checks.hasLowercase) feedback.push('Include at least one lowercase letter');
    if (!checks.hasNumber) feedback.push('Include at least one number');
    if (!checks.hasSpecial) feedback.push('Include at least one special character');
    if (!checks.notCommon) feedback.push('Password is in the list of common passwords');
    if (!checks.noRepeatedPatterns) feedback.push('Avoid obvious repeated patterns');

    let passedCount = 0;
    if (checks.minLength) passedCount++;
    if (checks.hasUppercase) passedCount++;
    if (checks.hasLowercase) passedCount++;
    if (checks.hasNumber) passedCount++;
    if (checks.hasSpecial) passedCount++;
    if (checks.notCommon) passedCount++;
    if (checks.noRepeatedPatterns) passedCount++;

    // Levels: EASY, NORMAL, MEDIUM, OK, SATISFIED, GOOD, EXCELLENT
    let level: PasswordAnalysis['level'] = 'EASY';
    if (passedCount <= 1) level = 'EASY';
    else if (passedCount === 2) level = 'NORMAL';
    else if (passedCount === 3) level = 'MEDIUM';
    else if (passedCount === 4) level = 'OK';
    else if (passedCount === 5) level = 'SATISFIED';
    else if (passedCount === 6) level = 'GOOD';
    else if (passedCount >= 7 && password.length >= 12) level = 'EXCELLENT';
    else level = 'GOOD';

    const isValid = checks.minLength && checks.hasUppercase && checks.hasLowercase &&
      checks.hasNumber && checks.hasSpecial && checks.notCommon && checks.noRepeatedPatterns;

    return {
      isValid,
      score: passedCount,
      level,
      checks,
      feedback,
    };
  }

  /**
   * Hashes a password using Argon2id with secure OWASP parameters
   */
  public static async hashPassword(password: string): Promise<string> {
    try {
      return await hash(password, {
        algorithm: Algorithm.Argon2id,
        memoryCost: 65536, // 64 MB
        timeCost: 3,
        parallelism: 4,
      });
    } catch {
      // Fallback: scrypt derivation if native addon encounters system issue
      const salt = crypto.randomBytes(16).toString('hex');
      const derived = crypto.scryptSync(password, salt, 64).toString('hex');
      return `scrypt$${salt}$${derived}`;
    }
  }

  /**
   * Verifies password against stored Argon2id hash
   */
  public static async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    try {
      if (storedHash.startsWith('scrypt$')) {
        const parts = storedHash.split('$');
        const salt = parts[1];
        const hashVal = parts[2];
        const derived = crypto.scryptSync(password, salt, 64).toString('hex');
        return crypto.timingSafeEqual(Buffer.from(derived, 'hex'), Buffer.from(hashVal, 'hex'));
      }
      return await verify(storedHash, password);
    } catch {
      return false;
    }
  }

  /**
   * Hashes a session token for secure DB storage
   */
  public static hashSessionToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Creates a cryptographically random 32-byte session token
   */
  public static generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
