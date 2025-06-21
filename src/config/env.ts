// ImportMetaEnv is now defined in vite-env.d.ts

interface Env extends Omit<ImportMetaEnv, 'MODE' | 'DEV' | 'PROD' | 'SSR'> {
  // Required environment variables
  VITE_APP_NAME: string;
  VITE_APP_VERSION: string;
  VITE_API_BASE_URL: string;
  
  // Environment modes (from ImportMetaEnv)
  DEV: boolean;
  PROD: boolean;
  MODE: string;
  
  // Optional with defaults (overrides from ImportMetaEnv with more specific types)
  VITE_ENABLE_ANALYTICS: boolean;
  VITE_DEBUG_MODE: boolean;
  VITE_ENVIRONMENT: 'development' | 'staging' | 'production';
  
  // Feature flags (overrides from ImportMetaEnv with more specific types)
  VITE_FEATURE_TEST_FLAG: boolean;
  VITE_FEATURE_TEST_FEATURE: boolean;
  
  // Performance (overrides from ImportMetaEnv with more specific types)
  VITE_PERFORMANCE_MONITORING: boolean;
  VITE_NETWORK_MONITORING: boolean;
  
  // Error tracking (overrides from ImportMetaEnv with more specific types)
  VITE_LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
}

// Helper function to safely get environment variables
function getEnvValue<T extends string | boolean | number>(
  key: string,
  defaultValue: T,
  type: 'string' | 'boolean' | 'number' = 'string'
): T {
  // Only use import.meta.env in Vite
  const value = import.meta.env[key] ?? defaultValue;
  
  if (value === undefined || value === null) {
    return defaultValue;
  }

  const stringValue = String(value).trim();
  
  switch (type) {
    case 'boolean':
      // Handle boolean strings ('true', '1', 'yes')
      return (['true', '1', 'yes', 'y'].includes(stringValue.toLowerCase())) as unknown as T;
    case 'number':
      // Parse number, return default if NaN
      const num = Number(stringValue);
      return (isNaN(num) ? defaultValue : num) as unknown as T;
    default:
      return stringValue as unknown as T;
  }
}

// Initialize environment variables with type safety and defaults
export const env: Env = {
  // Required environment variables
  VITE_APP_NAME: getEnvValue('VITE_APP_NAME', 'TaskFlow AI'),
  VITE_APP_VERSION: getEnvValue('VITE_APP_VERSION', '1.0.0'),
  VITE_API_BASE_URL: getEnvValue('VITE_API_BASE_URL', 'https://api.taskflow-ai.com'),
  
  // Optional with defaults
  VITE_SENTRY_DSN: getEnvValue('VITE_SENTRY_DSN', ''),
  VITE_ENABLE_ANALYTICS: getEnvValue('VITE_ENABLE_ANALYTICS', false, 'boolean'),
  VITE_DEBUG_MODE: getEnvValue('VITE_DEBUG_MODE', false, 'boolean'),
  VITE_ENVIRONMENT: getEnvValue('VITE_ENVIRONMENT', 'development') as 'development' | 'staging' | 'production',
  
  // Feature flags
  VITE_FEATURE_TEST_FLAG: getEnvValue('VITE_FEATURE_TEST_FLAG', false, 'boolean'),
  VITE_FEATURE_TEST_FEATURE: getEnvValue('VITE_FEATURE_TEST_FEATURE', false, 'boolean'),
  VITE_FEATURE_TEST_STRING: getEnvValue('VITE_FEATURE_TEST_STRING', 'default'),
  
  // Performance
  VITE_PERFORMANCE_MONITORING: getEnvValue('VITE_PERFORMANCE_MONITORING', true, 'boolean'),
  VITE_NETWORK_MONITORING: getEnvValue('VITE_NETWORK_MONITORING', true, 'boolean'),
  
  // Analytics
  VITE_GOOGLE_ANALYTICS_ID: getEnvValue('VITE_GOOGLE_ANALYTICS_ID', ''),
  
  // Error tracking
  VITE_LOG_LEVEL: getEnvValue('VITE_LOG_LEVEL', 'error') as 'debug' | 'info' | 'warn' | 'error',
  
  // Vite built-in environment variables
  DEV: false,
  PROD: import.meta.env.PROD,
  MODE: import.meta.env.MODE || 'development'
};

// Validate required environment variables in production
if (import.meta.env.PROD) {
  const requiredVars: (keyof Env)[] = [
    'VITE_APP_NAME',
    'VITE_APP_VERSION',
    'VITE_API_BASE_URL',
    'VITE_SENTRY_DSN'
  ];

  const missingVars = requiredVars.filter(key => !env[key]);
  
  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`;
    console.error(errorMessage);
    
    // In production, show a user-friendly error message
    if (typeof window !== 'undefined') {
      const errorElement = document.getElementById('root-error');
      if (errorElement) {
        errorElement.innerHTML = `
          <div style="padding: 20px; color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px;">
            <h2>Configuration Error</h2>
            <p>${errorMessage}</p>
            <p>Please contact support if this issue persists.</p>
          </div>
        `;
      }
    }
    
    throw new Error(errorMessage);
  }
}

// Log environment in development
if (import.meta.env.DEV) {
  console.log('Environment variables:', {
    ...env,
    VITE_SENTRY_DSN: env.VITE_SENTRY_DSN ? '[REDACTED]' : 'Not set',
    VITE_GOOGLE_ANALYTICS_ID: env.VITE_GOOGLE_ANALYTICS_ID ? '[REDACTED]' : 'Not set'
  });
}

// Helper functions for type-safe environment access
export const isFeatureEnabled = (feature: keyof Env): boolean => {
  const value = env[feature];
  return value === true || value === 'true' || value === '1';
};

export const isDebugMode = (): boolean => {
  if (typeof env.VITE_DEBUG_MODE === 'boolean') {
    return env.VITE_DEBUG_MODE || !import.meta.env.PROD;
  }
  return env.VITE_DEBUG_MODE === 'true' || !import.meta.env.PROD;
};

// Environment validation is done at the module level
// No need for an explicit validateEnv call
