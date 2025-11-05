import React from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.setupObservers();
  }

  private setupObservers() {
    // Measure LCP, FID, CLS
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              name: entry.entryType,
              value: entry.startTime,
              timestamp: Date.now(),
              metadata: {
                name: entry.name,
                duration: 'duration' in entry ? entry.duration : undefined
              }
            });
          }
        });

        observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
        this.observers.push(observer);
      } catch (error) {
        console.warn('Performance monitoring not supported:', error);
      }
    }
  }

  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Send to analytics service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(metric);
    }
  }

  private sendToAnalytics(metric: PerformanceMetric) {
    // TODO: Integrate with analytics service (e.g., Google Analytics, Mixpanel)
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric)
    }).catch(error => {
      console.warn('Failed to send performance metric:', error);
    });
  }

  getMetrics() {
    return [...this.metrics];
  }

  clearMetrics() {
    this.metrics = [];
  }

  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

// React hook for component performance tracking
export function usePerformanceTracking(componentName: string) {
  React.useEffect(() => {
    const startTime = Date.now();
    
    return () => {
      const endTime = Date.now();
      performanceMonitor.recordMetric({
        name: 'component-render',
        value: endTime - startTime,
        timestamp: endTime,
        metadata: { componentName }
      });
    };
  }, [componentName]);
}
