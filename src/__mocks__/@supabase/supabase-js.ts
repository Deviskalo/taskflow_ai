// Mock for @supabase/supabase-js
export const createClient = jest.fn().mockImplementation(() => ({
  auth: {
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
      }; 
    },
  },
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({ data: null, error: null }),
}));

export const SupabaseClient = jest.fn().mockImplementation(() => ({
  // Same implementation as createClient
  ...createClient()
}));
