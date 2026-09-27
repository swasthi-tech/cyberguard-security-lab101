import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV === 'development';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 100 : 6, // 100 in development to avoid lockouts during testing
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many login attempts from this IP address. Account access locked for 15 minutes.',
  },
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDev ? 100 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Registration rate limit exceeded. Please try again in an hour.',
  },
});

export const twoFactorLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many 2FA verification attempts. Verification temporarily locked for 10 minutes.',
  },
});

export const generalApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'API rate limit exceeded. Slow down requests.',
  },
});
