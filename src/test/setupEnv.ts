// Mock for Vite's import.meta.env
const MOCK_ENV = {
  VITE_APP_NAME: 'TaskFlow AI',
  VITE_SUPABASE_URL: 'https://mock-supabase-url.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'mock-supabase-anon-key',
  VITE_SENTRY_DSN: 'mock-sentry-dsn',
  VITE_ENVIRONMENT: 'test',
  MODE: 'test',
  DEV: true,
  PROD: false,
  SSR: false,
};

// Mock import.meta.env
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: MOCK_ENV,
    },
  },
  configurable: true,
  writable: true,
});

// Mock global objects
Object.defineProperty(global, 'performance', {
  value: {
    now: jest.fn().mockReturnValue(0),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByType: jest.fn().mockReturnValue([]),
    clearMarks: jest.fn(),
    clearMeasures: jest.fn(),
  },
  configurable: true,
  writable: true,
});

// Mock requestIdleCallback
Object.defineProperty(global, 'requestIdleCallback', {
  value: jest.fn((cb) => {
    const start = Date.now();
    return setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 50 }), 0);
  }),
  configurable: true,
  writable: true,
});

// Mock cancelIdleCallback
Object.defineProperty(global, 'cancelIdleCallback', {
  value: jest.fn((id) => clearTimeout(id)),
  configurable: true,
  writable: true,
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  configurable: true,
  writable: true,
});
