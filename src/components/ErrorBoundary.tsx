import React, { Component, ErrorInfo, ReactNode } from 'react';
import { captureException, Sentry } from '../lib/sentry';
import { Button } from "./ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  context?: Record<string, unknown>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error | null;
  errorInfo?: ErrorInfo | null;
  eventId?: string;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public static defaultProps = {
    context: {},
    onError: () => {},
  };

  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { 
      hasError: true, 
      error,
      showDetails: false 
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { context, onError } = this.props;
    
    // Update state with error info
    this.setState({ error, errorInfo });
    
    // Call the onError handler if provided
    if (onError) {
      onError(error, errorInfo);
    }
    
    // Log to Sentry with additional context
    captureException(error, { 
      ...context,
      componentStack: errorInfo.componentStack,
    }, errorInfo);
    
    // You can also log to your error tracking service here
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  private toggleDetails = () => {
    this.setState(prev => ({
      showDetails: !prev.showDetails,
    }));
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    const { hasError, error, errorInfo, showDetails } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
            <div className="text-center">
              <div className="text-red-500 text-5xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Oops! Something went wrong
              </h2>
              <p className="text-gray-600 mb-6">
                We're sorry for the inconvenience. Our team has been notified about this issue.
              </p>
              
              <div className="space-y-4">
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={this.handleReset}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Reload Page
                  </button>
                </div>
                
                {(error || errorInfo) && (
                  <div>
                    <button
                      onClick={this.toggleDetails}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {showDetails ? 'Hide details' : 'Show details'}
                    </button>
                    
                    {showDetails && (
                      <div className="mt-4 p-4 bg-gray-100 rounded-md text-left overflow-auto max-h-60 text-sm">
                        {error && (
                          <div className="mb-3">
                            <h3 className="font-semibold text-gray-800 mb-1">Error:</h3>
                            <pre className="text-red-600 whitespace-pre-wrap">
                              {error.toString()}
                            </pre>
                          </div>
                        )}
                        {errorInfo?.componentStack && (
                          <div>
                            <h3 className="font-semibold text-gray-800 mb-1">Component Stack:</h3>
                            <pre className="text-gray-600 whitespace-pre-wrap">
                              {errorInfo.componentStack}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="pt-4 mt-4 border-t border-gray-200 text-sm text-gray-500">
                  <p>
                    If the problem persists, please contact support with the error details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return <>{children}</>;
  }
}

// Helper HOC for using ErrorBoundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  FallbackComponent?: React.ComponentType<{ error?: Error; errorInfo?: ErrorInfo }>,
  errorHandler?: (error: Error, errorInfo: ErrorInfo) => void
) => {
  return (props: P) => (
    <ErrorBoundary 
      fallback={FallbackComponent ? <FallbackComponent /> : undefined}
      onError={errorHandler}
    >
      <Component {...props} />
    </ErrorBoundary>
  );
};

// For backward compatibility
export default ErrorBoundary;
