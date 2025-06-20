import * as Sentry from "@sentry/react";
import { ErrorInfo } from "react";

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

// Only initialize Sentry in production and if DSN is provided
if (import.meta.env.PROD && SENTRY_DSN) {
  // Create a custom integration to avoid type issues
  const sentryIntegrations: Parameters<typeof Sentry.init>[0]["integrations"] =
    [];

  // Add BrowserTracing if available
  if (Sentry.browserTracingIntegration) {
    sentryIntegrations.push(Sentry.browserTracingIntegration());
  }

  // Add Replay if available
  if (Sentry.replayIntegration) {
    sentryIntegrations.push(
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      })
    );
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of transactions
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
    // Add all integrations
    integrations: sentryIntegrations,
    // Release and environment
    release: `taskflow-ai@${import.meta.env.VITE_APP_VERSION || "0.0.0"}`,
    environment: import.meta.env.MODE,
  });
}

export { Sentry };
export function getCurrentHub() {
  throw new Error("Function not implemented.");
}

export function captureException(
  _error: Error,
  _arg1: { extra: { errorInfo: ErrorInfo } }
) {
  throw new Error("Function not implemented.");
}
