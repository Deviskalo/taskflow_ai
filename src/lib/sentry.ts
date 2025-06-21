import * as Sentry from '@sentry/react';
import { ErrorInfo } from 'react';
import { env } from '../config/env';

export interface ReportDialogOptions {
  title?: string;
  subtitle?: string;
  subtitle2?: string;
  labelName?: string;
  labelEmail?: string;
  labelComments?: string;
  labelClose?: string;
  labelSubmit?: string;
  errorText?: string;
  successMessage?: string;
  eventId?: string;
}

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
  if (SENTRY_DSN) {
    Sentry.captureMessage(message, level);
  }
  console[level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'log'](message);
};

/**
 * Show the Sentry report dialog
 */
export const showReportDialog = (options: ReportDialogOptions = {}) => {
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not configured. Report dialog will not be shown.');
    return;
  }

  // Map our custom options to Sentry's expected format
  const dialogOptions: Parameters<typeof Sentry.showReportDialog>[0] = {
    title: options.title || 'Report Feedback',
    subtitle: options.subtitle,
    subtitle2: options.subtitle2,
    labelName: options.labelName || 'Name',
    labelEmail: options.labelEmail || 'Email',
    labelComments: options.labelComments || 'What happened?',
    labelClose: options.labelClose || 'Close',
    labelSubmit: options.labelSubmit || 'Submit',
    errorText: options.errorText || 'Please fill in all required fields',
    successMessage: options.successMessage || 'Thank you for your feedback!',
    eventId: options.eventId,
  };

  Sentry.showReportDialog(dialogOptions);
};
