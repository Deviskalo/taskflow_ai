import * as React from 'react';
import { env } from '../config/env';

// Feature flags configuration
type FeatureFlagKey = 
  | 'DARK_MODE'      // UI Features
  | 'NOTIFICATIONS'
  | 'OFFLINE_MODE'
  | 'EXPERIMENTAL_FEATURE'  // Experimental Features
  | 'AB_TEST_VARIANT';      // A/B Testing

const FEATURE_FLAGS: Record<FeatureFlagKey, FeatureFlagKey> = {
  DARK_MODE: 'DARK_MODE',
  NOTIFICATIONS: 'NOTIFICATIONS',
  OFFLINE_MODE: 'OFFLINE_MODE',
  EXPERIMENTAL_FEATURE: 'EXPERIMENTAL_FEATURE',
  AB_TEST_VARIANT: 'AB_TEST_VARIANT',
} as const;
type FeatureFlagValue = string | boolean | number;

// Helper function to check if a feature is enabled
export function isFeatureEnabled(feature: string): boolean {
  const value = (env as any)[`VITE_FEATURE_${feature}`];
  return value === 'true' || value === true || value === '1';
}

// Helper function to get feature flag value with type safety
export function getFeatureFlag<T extends FeatureFlagValue>(
  flag: string,
  defaultValue: T
): T {
  try {
    // Try to get from environment variables first
    const envValue = (env as any)[`VITE_FEATURE_${flag}`];
    if (envValue !== undefined) {
      return envValue as T;
    }
    
    // Then try localStorage
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem(`feature_${flag}`);
      if (storedValue !== null) {
        try {
          return JSON.parse(storedValue) as T;
        } catch (e) {
          console.warn(`Failed to parse feature flag ${flag} from localStorage`, e);
        }
      }
    }
    
    return defaultValue;
  } catch (error) {
    console.error(`Error getting feature flag ${flag}:`, error);
    return defaultValue;
  }
}

/**
 * Set a feature flag value (stored in localStorage)
 * @param flag The feature flag to set
 * @param value The value to set
 */
export function setFeatureFlag(flag: string, value: FeatureFlagValue): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`feature_${flag}`, JSON.stringify(value));
      
      // Dispatch event that can be listened to elsewhere in the app
      window.dispatchEvent(
        new CustomEvent('featureFlagChanged', {
          detail: { flag, value },
        })
      );
    }
  } catch (error) {
    console.error(`Error setting feature flag ${flag}:`, error);
  }
}

/**
 * Reset a feature flag to its default value
 * @param flag The feature flag to reset
 */
export function resetFeatureFlag(flag: string): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`feature_${flag}`);
      
      // Dispatch event that can be listened to elsewhere in the app
      window.dispatchEvent(
        new CustomEvent('featureFlagChanged', {
          detail: { flag, value: undefined },
        })
      );
    }
  } catch (error) {
    console.error(`Error resetting feature flag ${flag}:`, error);
  }
}

// Define the type for the fallback component props
interface FeatureFlagFallbackProps {
  flag: string;
}

// Default fallback component that renders nothing
const DefaultFallback: React.FC<FeatureFlagFallbackProps> = () => null;

// Type for the HOC
type WithFeatureFlagHOC = <P extends object>(
  Component: React.ComponentType<P>
) => React.ComponentType<P>;

/**
 * Higher Order Component to conditionally render based on a feature flag
 * @param flag - The feature flag name to check
 * @param defaultValue - Default value if the flag is not set
 * @param FallbackComponent - Component to render when the feature is disabled
 */
function withFeatureFlag(
  flag: string,
  defaultValue: FeatureFlagValue,
  FallbackComponent: React.ComponentType<FeatureFlagFallbackProps> = DefaultFallback
): WithFeatureFlagHOC {
  return <P extends object>(
    Component: React.ComponentType<P>
  ): React.ComponentType<P> => {
    const WrappedComponent: React.FC<P> = (props) => {
      const isEnabled = getFeatureFlag(flag, defaultValue);
      
      if (!isEnabled) {
        // Create a new props object that matches FeatureFlagFallbackProps
        const fallbackProps: FeatureFlagFallbackProps = { flag };
        return React.createElement(FallbackComponent, fallbackProps);
      }
      
      // Use React.createElement for the main component as well
      return React.createElement(Component, props);
    };
    
    // Set display name for better debugging
    const displayName = 
      (Component as any).displayName || 
      (Component as any).name || 
      'Component';
    
    WrappedComponent.displayName = `withFeatureFlag(${displayName})`;
    
    return WrappedComponent;
  };
}

export { withFeatureFlag };

/**
 * React hook to use a feature flag
 * @param flag The feature flag to use
 * @param defaultValue Default value if the flag is not set
 * @returns The current value of the feature flag and a function to update it
 */
export function useFeatureFlag<T extends FeatureFlagValue>(
  flag: string,
  defaultValue: T
): [T, (value: T) => void] {
  const [value, setValue] = React.useState<T>(() => 
    getFeatureFlag(flag, defaultValue)
  );

  // Listen for changes to the feature flag
  React.useEffect(() => {
    const handleChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ flag: string; value: T }>;
      if (customEvent.detail.flag === flag) {
        setValue(customEvent.detail.value ?? getFeatureFlag(flag, defaultValue));
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('featureFlagChanged', handleChange);
      return () => {
        window.removeEventListener('featureFlagChanged', handleChange);
      };
    }
  }, [flag, defaultValue]);

  // Update the feature flag
  const updateValue = React.useCallback(
    (newValue: T) => {
      setFeatureFlag(flag, newValue);
    },
    [flag]
  );

  return [value, updateValue];
}

// Export feature flags with helper methods
export const FeatureFlags = {
  ...FEATURE_FLAGS,
  
  isEnabled: (flag: string): boolean => 
    isFeatureEnabled(flag),
    
  get: <T extends FeatureFlagValue>(flag: string, defaultValue: T): T =>
    getFeatureFlag(flag, defaultValue),
    
  set: (flag: string, value: FeatureFlagValue): void =>
    setFeatureFlag(flag, value),
    
  enable: (flag: string): void =>
    setFeatureFlag(flag, true),
    
  disable: (flag: string): void =>
    setFeatureFlag(flag, false),
    
  reset: (flag: string): void =>
    resetFeatureFlag(flag),
};
