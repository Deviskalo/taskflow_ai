import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { ProtectedRoute } from '../ProtectedRoute';

// Mock child component
const MockDashboard = () => <div>Dashboard Content</div>;

// Mock the AuthContext module
const mockUseAuth = jest.fn();

jest.mock('../../contexts/AuthContext', () => ({
  ...jest.requireActual('../../contexts/AuthContext'),
  useAuth: mockUseAuth,
}));

describe('ProtectedRoute', () => {
  // Helper function to render the component with different auth states
  const renderWithAuth = (initialPath = '/dashboard') => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <AuthProvider>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MockDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    // Clear all mocks between tests
    jest.clearAllMocks();
  });

  it('renders the protected component when user is authenticated', () => {
    // Mock the useAuth hook to return an authenticated user
    mockUseAuth.mockReturnValue({
      user: { id: '123', email: 'test@example.com' },
      loading: false,
    });

    renderWithAuth();
    
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    // Mock the useAuth hook to return an unauthenticated user
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    });

    renderWithAuth();
    
    // The component should redirect to /login, so the Dashboard content should not be present
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
    // Instead, we should see the login page content
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('shows loading state while checking authentication', () => {
    // Mock the useAuth hook to return loading state
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
    });

    renderWithAuth();
    
    // You might want to add a loading spinner or indicator in your ProtectedRoute
    // For now, we'll just check that the Dashboard content is not shown yet
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
    // And that the login page content is also not shown yet
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });
});
