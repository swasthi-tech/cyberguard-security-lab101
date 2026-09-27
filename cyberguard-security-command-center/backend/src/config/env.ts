import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4000', 10),
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://cyberguard_user:cyberguard_secure_password_2026@localhost:5432/cyberguard_db?schema=public',
  SESSION_SECRET: process.env.SESSION_SECRET || 'cyberguard_ultra_secure_session_secret_32chars_min!',
  TOTP_ENCRYPTION_KEY: process.env.TOTP_ENCRYPTION_KEY || 'cyberguard_totp_aes_key_32bytes_len!!',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  COOKIE_NAME: 'cyberguard_session',
  SESSION_MAX_AGE_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
  CAPTCHA_TTL_MS: 5 * 60 * 1000, // 5 minutes
};
