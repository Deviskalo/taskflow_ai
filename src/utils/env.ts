interface RequiredEnvVars {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  // Add other required environment variables here
}

const requiredEnvVars: (keyof RequiredEnvVars)[] = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
];

/**
 * Validates that all required environment variables are set
 * @throws {Error} If any required environment variables are missing
 */
export function validateEnv() {
  const missingVars = requiredEnvVars.filter(
    (envVar) => !import.meta.env[envVar]
  );

  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables: ${missingVars.join(
      ', '
    )}. Please check your .env file.`;
    
    if (import.meta.env.PROD) {
      // In production, throw an error that will be caught by the error boundary
      throw new Error(errorMessage);
    } else {
      // In development, log a warning but don't throw
      console.warn(errorMessage);
      return false;
    }
  }
  return true;
}

/**
 * Gets an environment variable with type safety
 * @param key The environment variable key
 * @param defaultValue Optional default value if the variable is not set
 * @returns The environment variable value or the default value
 */
export function getEnv<T = string>(
  key: string,
  defaultValue?: T
): T | undefined {
  const value = import.meta.env[key];
  
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    if (import.meta.env.DEV) {
      console.warn(`Environment variable ${key} is not set`);
    }
    return undefined;
  }
  
  // Type conversion based on the default value's type
  if (typeof defaultValue === 'number') {
    return (parseFloat(value) || 0) as unknown as T;
  }
  if (typeof defaultValue === 'boolean') {
    return (value === 'true') as unknown as T;
  }
  if (Array.isArray(defaultValue)) {
    return (value ? value.split(',') : []) as unknown as T;
  }
  
  return value as unknown as T;
}
