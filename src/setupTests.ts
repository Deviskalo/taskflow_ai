// Import the jest-dom library for custom matchers
import '@testing-library/jest-dom';

// Mock environment variables
const mockEnv = {
  VITE_SUPABASE_URL: 'https://mock-supabase-url.com',
  VITE_SUPABASE_ANON_KEY: 'mock-supabase-anon-key',
  NODE_ENV: 'test',
};

// Mock process.env and import.meta.env
process.env = {
  ...process.env,
  ...mockEnv,
};

// Mock import.meta.env
Object.defineProperty(globalThis, 'import.meta', {
  value: {
    env: mockEnv,
  },
  configurable: true,
  writable: true,
});

// Custom matchers are now defined in src/types/jest.d.ts

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.scrollTo
window.scrollTo = jest.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock ResizeObserver
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserverStub;
