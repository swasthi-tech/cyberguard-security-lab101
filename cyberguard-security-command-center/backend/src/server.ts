import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ENV } from './config/env.js';
import { generalApiLimiter } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import { authRouter } from './routes/auth.routes.js';
import { usersRouter } from './routes/users.routes.js';
import { iamRouter } from './routes/iam.routes.js';
import { edrRouter } from './routes/edr.routes.js';
import { siemRouter } from './routes/siem.routes.js';
import { zeroTrustRouter } from './routes/zeroTrust.routes.js';
import { cloudRouter } from './routes/cloud.routes.js';
import { threatIntelRouter } from './routes/threatIntel.routes.js';
import { auditRouter } from './routes/audit.routes.js';

const app = express();

// Trust reverse proxy (for rate limiting behind nginx / load balancers)
app.set('trust proxy', 1);

// Security Headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        scriptSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Cross-Origin Resource Sharing with strict allowlist
const allowedOrigins = [
  ENV.CORS_ORIGIN,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CYBERGUARD CORS policy.`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsers and cookie parser
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// General API rate limiter
app.use('/api', generalApiLimiter);

// System Health & Diagnostics endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'OPERATIONAL',
    system: 'CYBERGUARD Security Command Center API',
    version: '2.4.0-enterprise',
    timestamp: new Date().toISOString(),
    environment: ENV.NODE_ENV,
  });
});

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/iam', iamRouter);
app.use('/api/edr', edrRouter);
app.use('/api/siem', siemRouter);
app.use('/api/zero-trust', zeroTrustRouter);
app.use('/api/cloud', cloudRouter);
app.use('/api/threat-intel', threatIntelRouter);
app.use('/api/audit', auditRouter);

// Centralized error handling
app.use(errorHandler);

const PORT = ENV.PORT;
app.listen(PORT, () => {
  console.log(`[CYBERGUARD SOC API] Listening securely on port ${PORT} [${ENV.NODE_ENV}]`);
  console.log(`[CORS ALLOWED] ${allowedOrigins.join(', ')}`);
});

export default app;
