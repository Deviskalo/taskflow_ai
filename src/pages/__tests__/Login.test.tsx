import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Login } from "../Login";
import { AuthProvider } from "../../contexts/AuthContext";
import { BrowserRouter as Router } from "react-router-dom";

// Mock the useAuth hook
const mockSignIn = jest.fn().mockResolvedValue({ error: null });

jest.mock("../../contexts/AuthContext", () => ({
  ...jest.requireActual("../../contexts/AuthContext"),
  useAuth: () => ({
    signIn: mockSignIn,
    user: null,
    loading: false,
    signOut: jest.fn(),
    signUp: jest.fn(),
  }),
}));

// Mock the supabase client
jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn().mockResolvedValue({ 
        data: { 
          user: { id: 'test-user-id', email: 'test@example.com' }, 
          session: { access_token: 'test-token' } 
        }, 
        error: null 
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      user: () => ({
        id: 'test-user-id',
        email: 'test@example.com',
        user_metadata: {},
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString()
      })
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
  })),
}));

describe("Login", () => {
  const renderLogin = () => {
    return render(
      <Router>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </Router>
    );
  };

  it("renders the login form", () => {
    renderLogin();

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
  });

  it("shows validation errors when form is submitted empty", async () => {
    renderLogin();

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    fireEvent.click(submitButton);

    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it("shows error for invalid email format", async () => {
    renderLogin();

    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument();
    });
  });

  it("submits the form with valid data", async () => {
    const mockSignIn = jest.fn().mockResolvedValue({ error: null });

    // Mock the useAuth hook with mock implementation
    jest.mock("../../contexts/AuthContext", () => ({
      ...jest.requireActual("../../contexts/AuthContext"),
      useAuth: () => ({
        signIn: mockSignIn,
      }),
    }));

    renderLogin();

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
    });
  });
});
