interface ImportMetaEnv {
  VITE_APP_NAME: string;
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_SENTRY_DSN: string;
  VITE_ENVIRONMENT: string;
  MODE: 'development' | 'production' | 'test';
  DEV: boolean;
  PROD: boolean;
  SSR: boolean;
  [key: string]: string | boolean | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
