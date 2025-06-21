// Jest setup file for testing
import '@testing-library/jest-dom';

// Mock global.fetch
global.fetch = jest.fn();

// Mock matchMedia
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

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0,
};
global.localStorage = localStorageMock as unknown as Storage;

// Mock window.performance
Object.defineProperty(window, 'performance', {
  value: {
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByName: jest.fn(),
    getEntriesByType: jest.fn(),
    clearMarks: jest.fn(),
    clearMeasures: jest.fn(),
    now: jest.fn(),
  },
});

// Mock import.meta.env
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        VITE_SENTRY_DSN: 'test-dsn',
        PROD: false,
        DEV: true,
      },
    },
  },
});
