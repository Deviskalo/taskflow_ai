// Mock implementation of the Supabase client for testing

// Define the Supabase client mock type
type SupabaseClient = {
  auth: {
    signInWithPassword: jest.Mock;
    signUp: jest.Mock;
    signOut: jest.Mock;
    getSession: jest.Mock;
    onAuthStateChange: jest.Mock;
    user: jest.Mock;
  };
  from: jest.Mock;
  select: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  eq: jest.Mock;
  order: jest.Mock;
  limit: jest.Mock;
  single: jest.Mock;
  data: { user: { id: string; email: string } | null };
  supabaseUrl?: string;
  supabaseKey?: string;
};

// Create the mock Supabase client
const createSupabaseClient = (): SupabaseClient => ({
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
          user: { id: 'test-user-id', email: 'test@example.com' }
        } 
      }, 
      error: null 
    }),
    onAuthStateChange: jest.fn().mockImplementation((callback) => {
      // Call the callback with a mock event and session to simulate auth state changes
      const mockUser = { id: 'test-user-id', email: 'test@example.com' };
      const mockSession = { access_token: 'test-token', user: mockUser };
      callback('SIGNED_IN', mockSession);
      
      // Return the unsubscribe function
      return {
        data: { 
          subscription: { 
            unsubscribe: jest.fn() 
          } 
        } 
      };
    }),
    user: jest.fn().mockReturnValue({ id: 'test-user-id', email: 'test@example.com' }),
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
  data: { user: null }
});

// Create a single instance of the mock client
const supabaseMock = createSupabaseClient();

// Create the createClient mock function
const createClient = jest.fn().mockImplementation((supabaseUrl: string, supabaseKey: string) => {
  // Store the URL and key for testing purposes
  supabaseMock.supabaseUrl = supabaseUrl;
  supabaseMock.supabaseKey = supabaseKey;
  
  return supabaseMock;
});

// Export the mocks
export const supabase = supabaseMock;
export { createClient };
