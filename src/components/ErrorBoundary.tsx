import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./ui/button";
import * as Sentry from "../lib/sentry";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ error, errorInfo });

    // Log to Sentry
    try {
      Sentry.captureException(error, { extra: { errorInfo } });
    } catch (e) {
      console.error("Error reporting to Sentry:", e);
      console.error("Original error:", error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Something went wrong
            </h1>
            <div className="mb-6 p-4 bg-red-50 rounded-md">
              <p className="text-red-700 font-medium">
                {this.state.error?.message || "An unknown error occurred"}
              </p>
              {process.env.NODE_ENV === "development" && (
                <details className="mt-2 text-sm text-red-600">
                  <summary className="cursor-pointer mb-2">
                    Error details
                  </summary>
                  <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-60">
                    {this.state.error?.stack}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="mr-2"
              >
                Reload Page
              </Button>
              <Button onClick={this.handleReset}>Try Again</Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// For backward compatibility
export default ErrorBoundary;
