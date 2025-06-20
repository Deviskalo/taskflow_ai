import type { Request, Response, NextFunction } from 'express';

/**
 * Middleware to set security headers
 * @param _req - Express request object (unused)
 * @param res - Express response object
 * @param next - Express next function
 */
export function securityHeaders(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');

  // Security Headers
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co",
    "frame-src 'self'",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "block-all-mixed-content",
  ].join('; ');

  const headers = {
    'Content-Security-Policy': csp,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };

  // Set headers
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  next();
}
