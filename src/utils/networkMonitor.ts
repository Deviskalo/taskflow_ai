import { captureMessage } from '../lib/sentry';

interface NetworkRequest {
  url: string;
  method: string;
  startTime: number;
  endTime?: number;
  status?: number;
  statusText?: string;
  responseSize?: number;
  error?: Error;
}

class NetworkMonitor {
  private static instance: NetworkMonitor;
  private requests: Map<string, NetworkRequest> = new Map();
  private enabled: boolean;
  private maxRequestLogs = 50; // Maximum number of requests to keep in memory
  private slowThreshold = 1000; // Requests slower than this (ms) will be reported

  private constructor() {
    this.enabled = import.meta.env.PROD && !!import.meta.env.VITE_SENTRY_DSN;
  }

  public static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor();
    }
    return NetworkMonitor.instance;
  }

  public enable(): void {
    this.enabled = true;
  }

  public disable(): void {
    this.enabled = false;
  }

  public trackRequest(url: string, method: string = 'GET'): string {
    if (!this.enabled) return '';

    const requestId = this.generateRequestId();
    this.requests.set(requestId, {
      url: this.sanitizeUrl(url),
      method: method.toUpperCase(),
      startTime: performance.now(),
    });

    // Clean up old requests
    if (this.requests.size > this.maxRequestLogs) {
      const keys = Array.from(this.requests.keys()).slice(0, -this.maxRequestLogs);
      keys.forEach(key => this.requests.delete(key));
    }

    return requestId;
  }

  public trackResponse(requestId: string, status: number, statusText: string, responseSize?: number): void {
    if (!this.enabled) return;

    const request = this.requests.get(requestId);
    if (!request) return;

    request.endTime = performance.now();
    request.status = status;
    request.statusText = statusText;
    request.responseSize = responseSize;

    this.logRequest(request);
  }

  public trackError(requestId: string, error: Error): void {
    if (!this.enabled) return;

    const request = this.requests.get(requestId);
    if (!request) return;

    request.endTime = performance.now();
    request.error = error;

    this.logRequest(request);
  }

  private logRequest(request: NetworkRequest): void {
    const duration = request.endTime ? request.endTime - request.startTime : 0;
    const isError = request.status ? request.status >= 400 : !!request.error;
    const isSlow = duration > this.slowThreshold;

    // Log to console in development
    if (import.meta.env.DEV) {
      const style = 'color: blue; font-weight: bold;';
      console.groupCollapsed(
        `%c${request.method} ${request.url} ${request.status || ''} ${duration.toFixed(2)}ms`,
        style
      );
      console.log('Request:', {
        method: request.method,
        url: request.url,
        status: request.status,
        statusText: request.statusText,
        duration: `${duration.toFixed(2)}ms`,
        size: request.responseSize ? `${(request.responseSize / 1024).toFixed(2)} KB` : 'N/A',
        error: request.error,
      });
      console.groupEnd();
    }

    // Report to Sentry in production for errors or slow requests
    if (import.meta.env.PROD && (isError || isSlow)) {
      const level = isError ? 'error' : 'warning';
      const message = isError
        ? `API Error: ${request.method} ${request.url} (${request.status})`
        : `Slow API Request: ${request.method} ${request.url} (${duration.toFixed(0)}ms)`;

      // Create a single object for captureMessage
      const context = {
        request: {
          method: request.method,
          url: request.url,
        },
        response: {
          status: request.status,
          statusText: request.statusText,
          duration: `${duration.toFixed(2)}ms`,
          size: request.responseSize,
        },
        ...(request.error && {
          error: {
            name: request.error.name,
            message: request.error.message,
            stack: request.error.stack,
          }
        })
      };
      // Send to Sentry with proper typing
      if (level === 'error') {
        captureMessage(message, 'error');
      } else {
        captureMessage(message, level as 'info' | 'warning' | 'debug');
      }
      
      // Log to console with context
      console[level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'log'](message, context);
    }
  }

  private generateRequestId(): string {
    return `req_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeUrl(url: string): string {
    try {
      const parsedUrl = new URL(url);
      // Remove sensitive information from URLs (like tokens)
      if (parsedUrl.searchParams.has('token')) {
        parsedUrl.searchParams.set('token', '***');
      }
      // Remove query parameters from analytics
      if (parsedUrl.pathname.includes('analytics')) {
        parsedUrl.search = '';
      }
      return parsedUrl.toString();
    } catch (e) {
      return url;
    }
  }
}

export const networkMonitor = NetworkMonitor.getInstance();

// Monkey patch fetch to automatically track requests
if (typeof window !== 'undefined' && window.fetch) {
  const originalFetch = window.fetch;
  
  window.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const method = (init.method || 'GET').toUpperCase();
    const requestId = networkMonitor.trackRequest(url, method);
    
    try {
      const startTime = performance.now();
      const response = await originalFetch(input, init);
      const endTime = performance.now();
      
      // Clone the response if needed for further processing
      // const clonedResponse = response.clone();
      
      // Get response size from headers if available
      let responseSize: number | undefined;
      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        responseSize = parseInt(contentLength, 10) || undefined;
      }
      
      // Track successful response
      networkMonitor.trackResponse(
        requestId,
        response.status,
        response.statusText,
        responseSize
      );
      
      // Log response time
      if (endTime - startTime > 1000) { // Log slow responses
        console.warn(
          `Slow ${method} request to ${url}: ${(endTime - startTime).toFixed(2)}ms`
        );
      }
      
      return response;
    } catch (error) {
      // Track failed requests
      networkMonitor.trackError(requestId, error as Error);
      throw error;
    }
  };
}

// Export a hook to use in React components
export function useNetworkMonitor() {
  return networkMonitor;
}
