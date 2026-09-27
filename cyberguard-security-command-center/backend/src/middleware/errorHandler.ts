import { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Always log full error on server
  console.error(`[SOC SECURITY EXCEPTION] ${req.method} ${req.originalUrl}:`, err);

  const status = typeof err.status === 'number' ? err.status : 500;
  const message = status === 500 && ENV.NODE_ENV === 'production'
    ? 'An internal security exception occurred. Incident has been logged.'
    : err.message || 'Internal Server Error';

  res.status(status).json({
    error: message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    // Never expose stack in production
    ...(ENV.NODE_ENV !== 'production' && err.stack ? { stack: err.stack } : {}),
  });
}
