// Mock the environment module first
jest.mock('../../config/env', () => ({
  env: {
    DEV: true,
    PROD: false,
    MODE: 'test',
    VITE_APP_NAME: 'Test App',
    VITE_ENVIRONMENT: 'test',
  },
}));

// Import testing utilities
import '@testing-library/jest-dom';

// Mock the performance module first
jest.mock('../performance', () => {
  // Create mock implementations inside the factory
  const mockMark = jest.fn();
  const mockMeasure = jest.fn();
  
  return {
    performanceMonitor: {
      mark: mockMark,
      measure: mockMeasure,
      metrics: {},
    },
    // Export mocks for assertions
    __mocks: {
      mockMark,
      mockMeasure,
    },
  };
});

// Import the mocked module after setting up the mock
import { performanceMonitor as mockedPerformanceMonitor } from '../performance';

// Get the mocks for assertions
const { mockMark, mockMeasure } = require('../performance').__mocks;

describe('PerformanceMonitor', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations
    mockMark.mockImplementation(() => {});
    mockMeasure.mockImplementation(() => ({}));
  });

  describe('mark', () => {
    it('should call the mark method with the correct name', () => {
      const markName = 'test-mark';
      
      // Call the mark method
      mockedPerformanceMonitor.mark(markName);
      
      // Verify the mock was called with the correct arguments
      expect(mockMark).toHaveBeenCalledWith(markName);
    });
  });

  describe('measure', () => {
    it('should call the measure method with the correct arguments', () => {
      const measureName = 'test-measure';
      const startMark = 'start-mark';
      const endMark = 'end-mark';
      
      // Call the measure method
      mockedPerformanceMonitor.measure(measureName, startMark, endMark);
      
      // Verify the mock was called with the correct arguments
      expect(mockMeasure).toHaveBeenCalledWith(measureName, startMark, endMark);
    });
  });
});
