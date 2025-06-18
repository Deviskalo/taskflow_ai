import { SupabaseClient, User } from '@supabase/supabase-js';

// Mock the Supabase client
const createSupabaseClient = () => {
  // Mock environment variables
  process.env.VITE_SUPABASE_URL = 'http://localhost:54321';
  process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';
  const mockAuth = {
    signInWithPassword: jest.fn().mockResolvedValue({ 
      data: { 
        user: { id: 'test-user-id', email: 'test@example.com' }, 
        session: { access_token: 'test-token' } 
      }, 
      error: null 
    }),
    signUp: jest.fn().mockResolvedValue({ 
      data: { 
        user: { id: 'test-user-id', email: 'test@example.com' },
        session: { access_token: 'test-token' }
      }, 
      error: null 
    }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    getSession: jest.fn().mockResolvedValue({ 
      data: { 
        session: { 
          access_token: 'test-token',
          refresh_token: 'test-refresh-token',
          expires_in: 3600,
          token_type: 'bearer',
          user: { id: 'test-user-id', email: 'test@example.com' }
        } 
      }, 
      error: null 
    }),
    onAuthStateChange: jest.fn().mockReturnValue({ 
      data: { 
        subscription: { 
          unsubscribe: jest.fn() 
        } 
      } 
    }),
    get user() { 
      return { 
        id: 'test-user-id', 
        email: 'test@example.com',
        user_metadata: {},
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString()
      } as User | null; 
    },
  };

  const client = {
    auth: mockAuth,
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
  } as unknown as SupabaseClient;

  // Add mock implementation for the createClient function
  const createClient = jest.fn().mockImplementation(() => {
    // Mock environment variables
    process.env.VITE_SUPABASE_URL = 'http://localhost:54321';
    process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';
    
    return client;
  });
  
  return { client, createClient };
};

const { client, createClient } = createSupabaseClient();

// Export the mock Supabase client
export const supabase = client;
export { createClient };

// Export the type for TypeScript
export type MockSupabaseClient = typeof supabase;
