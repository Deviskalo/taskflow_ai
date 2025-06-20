import { PluginOption } from 'vite';

/**
 * Vite plugin to add security headers in development mode
 */
export function securityHeaders(): PluginOption {
  return {
    name: 'add-security-headers',
    configureServer(server) {
      return () => {
        server.middlewares.use((_req, res, next) => {
          // Security Headers
          const csp = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob:",
            "font-src 'self'",
            "connect-src 'self' ws://localhost:* https://*.supabase.co",
            "frame-src 'self'",
            "media-src 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
            "block-all-mixed-content",
          ].join('; ');

          const headers = {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
            'Content-Security-Policy': csp,
          };

          // Set headers
          Object.entries(headers).forEach(([key, value]) => {
            res.setHeader(key, value);
          });

          next();
        });
      };
    },
  };
}
