import * as Sentry from '@sentry/react';
import { ErrorInfo } from 'react';
import { env } from '../config/env';

const SENTRY_DSN = env.VITE_SENTRY_DSN;

// Only initialize Sentry in production and if DSN is provided
if (env.PROD && SENTRY_DSN) {
  try {
    // Create a custom integration to avoid type issues
    const sentryIntegrations: Parameters<typeof Sentry.init>[0]['integrations'] = [];

    // Add BrowserTracing if available
    if (Sentry.browserTracingIntegration) {
      sentryIntegrations.push(
        Sentry.browserTracingIntegration({
          // Configure tracing for specific routes if needed
          // routingInstrumentation: customRoutingInstrumentation,
        })
      );
    }


    // Add Replay if available
    if (Sentry.replayIntegration) {
      sentryIntegrations.push(
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
          maskAllInputs: false,
          networkDetailAllowUrls: [window.location.origin],
          networkCaptureBodies: true,
        })
      );
    }

    Sentry.init({
      dsn: SENTRY_DSN,
      // Performance Monitoring
      tracesSampleRate: 0.2, // Sample 20% of transactions for performance monitoring
      // Session Replay
      replaysSessionSampleRate: 0.1, // 10% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
      // Add all integrations
      integrations: sentryIntegrations,
      // Release and environment
      release: `taskflow-ai@${env.VITE_APP_VERSION || '0.0.0'}`,
      environment: env.MODE,
      // Additional configuration
      normalizeDepth: 5, // How deep to serialize the error objects
      sendDefaultPii: false, // Don't send personal data
      // Ignore specific errors
      beforeSend(event) {
        // Ignore specific errors
        if (event.exception?.values?.[0]?.value?.includes('ChunkLoadError')) {
          return null;
        }
        return event;
      },
    });

    // Set user context if available
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        Sentry.setUser({
          id: user.id,
          email: user.email,
          username: user.username,
        });
      } catch (e) {
        console.error('Failed to parse user data for Sentry', e);
      }
    }
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
  }
}

// Export Sentry and custom error handling utilities
export { Sentry };

export const captureException = (
  error: Error,
  context?: Record<string, unknown>,
  errorInfo?: ErrorInfo
) => {
  if (env.PROD && SENTRY_DSN) {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setExtras(context);
      }
      if (errorInfo) {
        scope.setExtras({ componentStack: errorInfo.componentStack });
      }
      Sentry.captureException(error);
    });
  }
  console.error('Captured error:', error, context);
};

export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' | 'debug' = 'info') => {
  if (env.PROD && SENTRY_DSN) {
    Sentry.captureMessage(message, level);
  }
  console[level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'log'](message);
};
