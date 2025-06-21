import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import the module to test first to avoid circular dependencies
import { 
  withFeatureFlag, 
  getFeatureFlag, 
  setFeatureFlag
} from '../featureFlags';

// Mock the environment module after imports
const createMockEnv = () => ({
  DEV: true,
  PROD: false,
  MODE: 'test',
  VITE_APP_NAME: 'Test App',
  VITE_ENVIRONMENT: 'test',
  VITE_FEATURE_TEST_FLAG: undefined as string | boolean | undefined,
  VITE_FEATURE_TEST_FEATURE: undefined as string | boolean | undefined,
  VITE_FEATURE_TEST_STRING: undefined as string | boolean | undefined,
});

let mockEnv = createMockEnv();

jest.mock('../../config/env', () => ({
  get env() {
    return mockEnv;
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('Feature Flags', () => {
  // Reset feature flags before each test
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    // Reset the internal cache by directly manipulating localStorage
    localStorage.removeItem('feature_TEST_FEATURE');
    localStorage.removeItem('feature_TEST_FLAG');
    
    // Reset any mocks
    jest.clearAllMocks();
    
    // Reset the mock env with a fresh copy
    mockEnv = createMockEnv();
  });

  describe('getFeatureFlag', () => {
    it('should return default value when flag is not set', () => {
      expect(getFeatureFlag('NON_EXISTENT_FLAG', true)).toBe(true);
      expect(getFeatureFlag('NON_EXISTENT_FLAG', false)).toBe(false);
    });

    it('should return value from localStorage when set', () => {
      // Set up the test with the correct localStorage key format
      localStorage.setItem('feature_TEST_FLAG', 'true');
      expect(getFeatureFlag('TEST_FLAG', false)).toBe(true);
      
      // Test with string value
      localStorage.setItem('feature_TEST_STRING', '"test-value"');
      expect(getFeatureFlag('TEST_STRING', 'default')).toBe('test-value');
    });
    
    it('should return value from environment when set', () => {
      // Set up the test with environment variable
      mockEnv.VITE_FEATURE_TEST_FLAG = 'true';
      expect(getFeatureFlag('TEST_FLAG', false)).toBe(true);
      
      // Test with string value
      mockEnv.VITE_FEATURE_TEST_STRING = 'test-value';
      expect(getFeatureFlag('TEST_STRING', 'default')).toBe('test-value');
    });
    
    it('should prioritize environment variable over localStorage', () => {
      // Set both environment and localStorage
      mockEnv.VITE_FEATURE_TEST_FLAG = 'true';
      localStorage.setItem('feature_TEST_FLAG', 'false');
      expect(getFeatureFlag('TEST_FLAG', false)).toBe(true);
    });
    
    it('should handle JSON parsing errors gracefully', () => {
      // Set invalid JSON in localStorage
      localStorage.setItem('feature_TEST_INVALID', '{invalid-json');
      expect(getFeatureFlag('TEST_INVALID', 'default')).toBe('default');
    });
  });

  describe('setFeatureFlag', () => {
    it('should set feature flag in localStorage', () => {
      // Test with boolean
      setFeatureFlag('TEST_FLAG', true);
      expect(localStorage.getItem('feature_TEST_FLAG')).toBe('true');
      
      // Test with string
      setFeatureFlag('TEST_STRING', 'test-value');
      expect(localStorage.getItem('feature_TEST_STRING')).toBe('"test-value"');
      
      // Test with number
      setFeatureFlag('TEST_NUMBER', 42);
      expect(localStorage.getItem('feature_TEST_NUMBER')).toBe('42');
    });
    
    it('should dispatch featureFlagChanged event', () => {
      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
      setFeatureFlag('TEST_FLAG', true);
      
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'featureFlagChanged',
          detail: {
            flag: 'TEST_FLAG',
            value: true
          }
        })
      );
    });
    
    it('should handle non-window environments', () => {
      // Save original window
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;
      
      // Should not throw
      expect(() => setFeatureFlag('TEST_FLAG', true)).not.toThrow();
      
      // Restore window
      global.window = originalWindow;
    });
  });

  describe('withFeatureFlag HOC', () => {
    // Simple test component
    const TestComponent = ({ testProp = '' }: { testProp?: string }) => 
      React.createElement('div', { 'data-testid': 'test-component' }, `Test Component ${testProp}`);
    
    // Simple fallback component
    const FallbackComponent = ({ flag }: { flag: string }) => 
      React.createElement('div', { 'data-testid': 'fallback-component' }, `Feature ${flag} is disabled`);

    it('should render component when feature is enabled', () => {
      // Set up test with the correct localStorage format
      localStorage.setItem('feature_TEST_FEATURE', JSON.stringify(true));
      
      // Create enhanced component with feature flag
      const EnhancedComponent = withFeatureFlag(
        'TEST_FEATURE',
        true, // default value
        FallbackComponent
      )(TestComponent);
      
      // Render
      render(React.createElement(EnhancedComponent, { testProp: 'test' }));
      
      // Assertions
      expect(screen.getByTestId('test-component')).toHaveTextContent('Test Component test');
      expect(screen.queryByTestId('fallback-component')).not.toBeInTheDocument();
    });

    it('should render fallback when feature is disabled', () => {
      // Set up test
      setFeatureFlag('TEST_FEATURE', false);
      
      // Create enhanced component with feature flag
      const EnhancedComponent = withFeatureFlag('TEST_FEATURE', false, FallbackComponent)(TestComponent);
      
      // Render and test
      render(React.createElement(EnhancedComponent, { testProp: 'test' }));
      
      // Assertions
      expect(screen.getByTestId('fallback-component')).toHaveTextContent('Feature TEST_FEATURE is disabled');
      expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
    });

    it('should use default fallback when none provided', () => {
      // Set up test
      setFeatureFlag('TEST_FEATURE', false);
      
      // Create enhanced component without fallback
      const EnhancedComponent = withFeatureFlag('TEST_FEATURE', false)(TestComponent);
      
      // Render and test
      const { container } = render(React.createElement(EnhancedComponent, { testProp: 'test' }));
      
      // Default fallback renders nothing
      expect(container.firstChild).toBeNull();
    });
  });
});
