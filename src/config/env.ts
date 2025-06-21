
interface Env {
  // Required environment variables
  VITE_APP_NAME: string;
  VITE_APP_VERSION: string;
  VITE_API_BASE_URL: string;
  
  // Environment modes
  DEV: boolean;
  PROD: boolean;
  MODE: string;
  
  // Optional with defaults
  VITE_SENTRY_DSN?: string;
  VITE_ENABLE_ANALYTICS?: string;
  VITE_DEBUG_MODE?: string;
  VITE_ENVIRONMENT?: string;
  
  // Feature flags
  VITE_FEATURE_NOTIFICATIONS?: string;
  VITE_FEATURE_OFFLINE?: string;
}

// Helper function to safely get environment variables
function getEnvValue(key: string, defaultValue: string): string;
function getEnvValue(key: string, defaultValue?: string): string | undefined;
function getEnvValue(key: string, defaultValue?: string): string | undefined {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value?.toString();
}

// Type-safe environment variables access
export const env: Env = {
  // Environment modes
  DEV: Boolean(import.meta.env.DEV || process.env.NODE_ENV === 'development'),
  PROD: Boolean(import.meta.env.PROD || process.env.NODE_ENV === 'production'),
  MODE: String(import.meta.env.MODE || process.env.NODE_ENV || 'development'),
  
  // Required
  VITE_APP_NAME: getEnvValue('VITE_APP_NAME', 'TaskFlow AI'),
  VITE_APP_VERSION: getEnvValue('VITE_APP_VERSION', '0.0.0'),
  VITE_API_BASE_URL: getEnvValue('VITE_API_BASE_URL', '/api'),
  
  // Optional with defaults
  VITE_SENTRY_DSN: getEnvValue('VITE_SENTRY_DSN'),
  VITE_ENABLE_ANALYTICS: getEnvValue('VITE_ENABLE_ANALYTICS', 'false'),
  VITE_DEBUG_MODE: getEnvValue('VITE_DEBUG_MODE', 'false'),
  VITE_ENVIRONMENT: getEnvValue('VITE_ENVIRONMENT', 'development'),
  
  // Feature flags
  VITE_FEATURE_NOTIFICATIONS: getEnvValue('VITE_FEATURE_NOTIFICATIONS', 'true'),
  VITE_FEATURE_OFFLINE: getEnvValue('VITE_FEATURE_OFFLINE', 'false'),
};

// Runtime validation of required environment variables
export function validateEnv() {
  const requiredVars: (keyof Env)[] = [
    'VITE_APP_NAME',
    'VITE_APP_VERSION',
    'VITE_API_BASE_URL',
  ];

  const missingVars = requiredVars.filter(
    (key) => !import.meta.env[key] && !env[key]
  );

  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`;
    if (import.meta.env.PROD) {
      console.error(errorMessage);
    } else {
      throw new Error(errorMessage);
    }
  }

  // Log environment in development
  if (import.meta.env.DEV) {
    console.log('Environment variables:', {
      ...env,
      // Don't log sensitive values in development
      VITE_SENTRY_DSN: env.VITE_SENTRY_DSN ? '***' : undefined,
    });
  }
}

// Helper functions for type-safe environment access
export const isFeatureEnabled = (feature: keyof Env): boolean => {
  const value = env[feature];
  return value === 'true' || value === '1';
};

export const isDebugMode = (): boolean => {
  return env.VITE_DEBUG_MODE === 'true' || !import.meta.env.PROD;
};

// Call validate on import if we're in the browser
if (typeof window !== 'undefined') {
  validateEnv();
}
