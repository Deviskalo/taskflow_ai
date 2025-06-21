/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Required
  VITE_APP_NAME: string;
  VITE_APP_VERSION: string;
  VITE_API_BASE_URL: string;
  
  // Optional with defaults
  VITE_SENTRY_DSN?: string;
  VITE_ENABLE_ANALYTICS?: string;
  VITE_DEBUG_MODE?: string;
  VITE_ENVIRONMENT?: string;
  
  // Feature flags
  VITE_FEATURE_TEST_FLAG?: string;
  VITE_FEATURE_TEST_FEATURE?: string;
  VITE_FEATURE_TEST_STRING?: string;
  
  // Performance
  VITE_PERFORMANCE_MONITORING?: string;
  VITE_NETWORK_MONITORING?: string;
  
  // Analytics
  VITE_GOOGLE_ANALYTICS_ID?: string;
  
  // Error tracking
  VITE_LOG_LEVEL?: string;
  
  // Vite built-in
  MODE: 'development' | 'production' | 'test';
  DEV: boolean;
  PROD: boolean;
  SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
