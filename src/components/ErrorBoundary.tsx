import React, { Component, ErrorInfo, ReactNode } from 'react';
import { captureException, showReportDialog, type ReportDialogOptions } from '../lib/sentry';
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircle, RefreshCw, AlertTriangle, Info } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  context?: Record<string, unknown>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnChange?: any[];
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId?: string;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public static defaultProps: Partial<ErrorBoundaryProps> = {
    context: {},
    onError: () => {},
    resetOnChange: [],
  };

  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI.
    return { 
      hasError: true, 
      error,
      errorInfo: null,
      showDetails: false 
    };
  }

  public componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnChange } = this.props;
    
    // Reset error boundary when resetOnChange dependencies change
    if (resetOnChange && JSON.stringify(prevProps.resetOnChange) !== JSON.stringify(resetOnChange)) {
      this.resetErrorBoundary();
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { context = {}, onError } = this.props;
    
    // Update state with error info
    this.setState({ error, errorInfo });
    
    try {
      // Capture the error with additional context
      const eventId = captureException(error, {
        ...context,
        componentStack: errorInfo.componentStack,
        boundary: 'ErrorBoundary',
      });
      
      // Only update state if we got an eventId back
      if (typeof eventId === 'string') {
        this.setState({ eventId });
      }
    } catch (err) {
      // If captureException fails, we still want to log to console
      console.error('Failed to capture exception:', err);
    }
    
    // Call the onError handler if provided
    if (onError) {
      onError(error, errorInfo);
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  private resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      eventId: undefined,
    });
  };

  private handleReset = () => {
    this.resetErrorBoundary();
    // Optionally reload the page if needed
    // window.location.reload();
  };

  private handleReportFeedback = () => {
    const { error, eventId } = this.state;
    if (error) {
      const options: ReportDialogOptions = {
        title: 'Report Feedback',
        subtitle: 'Please provide additional details about what happened.',
        subtitle2: 'Your feedback helps us improve the application.',
        labelName: 'Name',
        labelEmail: 'Email',
        labelComments: 'What happened?',
        labelClose: 'Close',
        labelSubmit: 'Submit',
        errorText: 'Please fill in all required fields',
        successMessage: 'Thank you for your feedback!',
      };
      
      if (eventId) {
        options.eventId = eventId;
      }
      
      showReportDialog(options);
    }
  };

  public render() {
    const { hasError, error, errorInfo, showDetails, eventId } = this.state;
    const { children, fallback } = this.props;
    
    // Render children if there's no error
    if (!hasError) {
      return children;
    }

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full mx-4 border border-gray-100">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Oops! Something went wrong
              </h1>
              
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                We're sorry, but we've encountered an unexpected error. Our team has been notified and we're working to fix it.
              </p>

              <div className="space-y-4 max-w-xs mx-auto">
                <Button
                  onClick={this.handleReset}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
                
                <Button
                  variant="outline"
                  onClick={this.handleReportFeedback}
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Report Issue
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={() => this.setState({ showDetails: !showDetails })}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-md"
                >
                  {showDetails ? 'Hide Details' : 'Show Error Details'}
                </Button>
              </div>

              {showDetails && (
                <div className="mt-8 text-left border-t border-gray-100 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="w-5 h-5 text-blue-500" />
                    <h3 className="font-medium text-gray-900">Error Details</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription className="font-mono text-sm">
                          {error.toString()}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {errorInfo?.componentStack && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-auto max-h-60">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Component Stack:</h4>
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                    
                    {eventId && (
                      <div className="text-sm text-gray-500">
                        <p>Error ID: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{eventId}</code></p>
                        <p className="text-xs mt-1">Please include this ID when contacting support.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Still having trouble?{' '}
                  <a 
                    href="mailto:support@taskflow.ai" 
                    className="text-blue-600 hover:underline"
                  >
                    Contact support
                  </a>
                </p>
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
