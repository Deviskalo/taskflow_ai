import { captureMessage } from '../lib/sentry';
import { env } from '../config/env';

// Extend PerformanceEntry to include properties we need
interface ExtendedPerformanceEntry extends PerformanceEntry {
  initiatorType?: string;
  transferSize?: number;
}

interface Metric {
  name: string;
  value: number;
  tags?: Record<string, string>;
}

/**
 * Track performance metrics and report them to Sentry
 */
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Record<string, number> = {};
  private sentryEnabled: boolean;

  private constructor() {
    this.sentryEnabled = !!env.VITE_SENTRY_DSN;
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Mark a performance milestone
   */
  public mark(name: string): void {
    if (typeof performance !== 'undefined') {
      this.metrics[name] = performance.now();
    }
  }

  /**
   * Measure the duration between two marks
   */
  public measure(metricName: string, startMark: string, endMark: string): void {
    if (typeof performance === 'undefined') return;

    const start = this.metrics[startMark];
    const end = this.metrics[endMark];

    if (start && end) {
      const duration = end - start;
      this.report({
        name: metricName,
        value: duration,
        tags: { type: 'duration' },
      });
    }
  }

  /**
   * Report a custom metric
   */
  public report(metric: Metric): void {
    const { name, value, tags = {} } = metric;
    
    // Log to console in development
    if (env.DEV) {
      console.log(`[Performance] ${name}:`, value, tags);
    }

    // Report to Sentry in production
    if (this.sentryEnabled && env.PROD) {
      // Format tags for the message
      const tagString = Object.entries({ ...tags, value, metric: name })
        .map(([key, val]) => `${key}=${val}`)
        .join(', ');
      
      captureMessage(
        `[Performance] ${name}: ${value}ms (${tagString})`,
        'info'
      );
    }
  }

  /**
   * Track page load performance
   */
  public trackPageLoad(): void {
    if (typeof window === 'undefined') return;

    // Use requestIdleCallback to avoid impacting page load performance
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(
        () => {
          this.captureNavigationTiming();
          this.captureResourceTiming();
        },
        { timeout: 2000 }
      );
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      setTimeout(() => {
        this.captureNavigationTiming();
        this.captureResourceTiming();
      }, 2000);
    }
  }

  private captureNavigationTiming(): void {
    if (!('performance' in window) || !performance.getEntriesByType) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return;

    const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.startTime;
    const loadTime = navigation.loadEventEnd - navigation.startTime;
    const domProcessing = navigation.domComplete - navigation.domInteractive;

    const navigationMetrics: Record<string, number> = {
      'navigation.redirect': navigation.redirectEnd - navigation.redirectStart,
      'navigation.dns': navigation.domainLookupEnd - navigation.domainLookupStart,
      'navigation.tcp': navigation.connectEnd - navigation.connectStart,
      'navigation.request': navigation.responseStart - navigation.requestStart,
      'navigation.response': navigation.responseEnd - navigation.responseStart,
      'navigation.domContentLoaded': domContentLoaded,
      'navigation.domProcessing': domProcessing,
      'navigation.loadTime': loadTime,
      'navigation.total': navigation.loadEventEnd - navigation.startTime,
    };

    Object.entries(navigationMetrics).forEach(([name, value]) => {
      this.report({
        name,
        value,
        tags: { type: 'navigation' },
      });
    });
  }

  private captureResourceTiming(): void {
    if (!('performance' in window) || !performance.getEntriesByType) return;

    const resources = performance.getEntriesByType('resource');
    const resourceTypes: Record<string, number> = {};
    let totalSize = 0;

    resources.forEach((resource: ExtendedPerformanceEntry) => {
      const type = resource.initiatorType || 'other';
      const size = resource.transferSize || 0;
      
      // Track total size by resource type
      if (!resourceTypes[type]) {
        resourceTypes[type] = 0;
      }
      resourceTypes[type] += size;
      totalSize += size;

      // Report individual resource timings for large resources
      if (size > 100000) { // 100KB
        this.report({
          name: 'resource.large',
          value: resource.duration,
          tags: {
            type: 'resource',
            resourceType: type,
            url: this.sanitizeUrl(resource.name),
            size: size.toString(),
          },
        });
      }
    });

    // Report total resource usage
    Object.entries(resourceTypes).forEach(([type, size]) => {
      this.report({
        name: 'resource.total',
        value: size,
        tags: { type: 'resource', resourceType: type },
      });
    });

    this.report({
      name: 'resource.total',
      value: totalSize,
      tags: { type: 'resource', resourceType: 'all' },
    });
  }

  private sanitizeUrl(url: string): string {
    try {
      const parsedUrl = new URL(url);
      // Remove query parameters and hashes
      return `${parsedUrl.origin}${parsedUrl.pathname}`;
    } catch (e) {
      return url.split('?')[0].split('#')[0];
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// Track initial page load
if (typeof window !== 'undefined') {
  performanceMonitor.mark('pageLoadStart');
  window.addEventListener('load', () => {
    performanceMonitor.mark('pageLoadEnd');
    performanceMonitor.measure('page.load', 'pageLoadStart', 'pageLoadEnd');
    performanceMonitor.trackPageLoad();
  });
}

/**
 * Hook to measure component render performance
 */
export function useMeasurePerformance(componentName: string) {
  const startMark = `${componentName}-render-start`;
  const endMark = `${componentName}-render-end`;
  const measureName = `${componentName}-render`;

  const startTracking = () => {
    if (typeof performance !== 'undefined') {
      performance.mark(startMark);
    }
  };

  const endTracking = () => {
    if (typeof performance === 'undefined') return;

    performance.mark(endMark);
    
    try {
      performance.measure(measureName, startMark, endMark);
      const [measure] = performance.getEntriesByName(measureName);
      
      if (measure) {
        performanceMonitor.report({
          name: 'component.render',
          value: measure.duration,
          tags: { component: componentName },
        });
      }
    } catch (e) {
      console.warn(`Failed to measure performance for ${componentName}:`, e);
    }
  };

  return { startTracking, endTracking };
}
