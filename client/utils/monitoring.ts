/**
 * Monitoring & Error Tracking Setup
 * Integrates Sentry for error tracking and Web Vitals for performance monitoring
 */

import * as Sentry from '@sentry/react';
import { onCLS, onFCP, onLCP, onTTFB } from 'web-vitals';

// Initialize Sentry for error tracking and performance monitoring
export function initializeSentry() {
  const isProduction = process.env.NODE_ENV === 'production';

  // Only initialize in production or when explicitly enabled
  if (!isProduction && !process.env.VITE_ENABLE_SENTRY) {
    console.log('ℹ️  Sentry disabled (use VITE_ENABLE_SENTRY=true to enable in development)');
    return;
  }

  const dsn = process.env.VITE_SENTRY_DSN || 'https://your-sentry-dsn@sentry.io/project-id';

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    // Use the default integrations provided by @sentry/react
    // which includes automatic error capture and error boundary support
    maxBreadcrumbs: 50,
    attachStacktrace: true,
    tracesSampleRate: isProduction ? 0.1 : 1.0,
    beforeSend(event, hint) {
      // Filter out certain errors
      if (event.exception) {
        const error = hint.originalException;
        // Don't send network errors from third-party services
        if (
          error instanceof Error &&
          error.message.includes('NetworkError') &&
          error.message.includes('third-party')
        ) {
          return null;
        }
      }
      return event;
    },
  });

  console.log('✅ Sentry initialized for error tracking and performance monitoring');
}

// Track Core Web Vitals
export function trackWebVitals() {
  const vitals: Record<string, number> = {};

  // Collect Cumulative Layout Shift
  onCLS((metric: any) => {
    vitals['CLS'] = metric.value;
    captureMetric('web-vital', metric.name, metric.value, metric.rating);
  });

  // Collect First Contentful Paint
  onFCP((metric: any) => {
    vitals['FCP'] = metric.value;
    captureMetric('web-vital', metric.name, metric.value, metric.rating);
  });

  // Collect Largest Contentful Paint
  onLCP((metric: any) => {
    vitals['LCP'] = metric.value;
    captureMetric('web-vital', metric.name, metric.value, metric.rating);
  });

  // Collect Time to First Byte
  onTTFB((metric: any) => {
    vitals['TTFB'] = metric.value;
    captureMetric('web-vital', metric.name, metric.value, metric.rating);
  });

  return vitals;
}

// Capture custom metrics
export function captureMetric(
  category: string,
  name: string,
  value: number,
  rating?: 'good' | 'needs-improvement' | 'poor'
) {
  if (process.env.NODE_ENV !== 'production' && !process.env.VITE_ENABLE_SENTRY) {
    console.debug(`📊 [${category}] ${name}: ${value}ms (${rating})`);
    return;
  }

  // Send to Sentry as a performance metric
  Sentry.captureMessage(`Web Vital: ${name} = ${value.toFixed(2)}ms`, {
    level: rating === 'poor' ? 'warning' : 'info',
    contexts: {
      metrics: {
        category,
        name,
        value,
        rating,
        timestamp: new Date().toISOString(),
      },
    },
  });

  // Also send to analytics endpoint
  if (typeof window !== 'undefined') {
    fetch('/api/analytics/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category,
        name,
        value,
        rating,
        timestamp: new Date().toISOString(),
      }),
    }).catch(err => {
      console.warn('Failed to send metric to server:', err);
    });
  }
}

// Capture user interaction metrics
export function captureUserInteraction(
  action: string,
  metadata?: Record<string, any>
) {
  Sentry.captureMessage(`User Interaction: ${action}`, {
    level: 'debug',
    contexts: {
      interaction: {
        action,
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    },
  });
}

// Set user context for error tracking
export function setUserContext(userId: string, email?: string, metadata?: Record<string, any>) {
  Sentry.setUser({
    id: userId,
    email,
    ...metadata,
  });
}

// Clear user context (on logout)
export function clearUserContext() {
  Sentry.setUser(null);
}

// Capture errors with context
export function captureError(error: Error | unknown, context?: Record<string, any>) {
  Sentry.captureException(error, {
    contexts: {
      custom: context,
    },
  });
}

// Create Sentry ErrorBoundary wrapper
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// Performance mark helpers
export function markPerformanceStart(label: string) {
  if (typeof window !== 'undefined' && window.performance?.mark) {
    window.performance.mark(`${label}-start`);
  }
}

export function markPerformanceEnd(label: string) {
  if (typeof window !== 'undefined' && window.performance?.mark && window.performance?.measure) {
    try {
      window.performance.mark(`${label}-end`);
      window.performance.measure(label, `${label}-start`, `${label}-end`);
    } catch (error) {
      console.warn(`Failed to measure performance for ${label}:`, error);
    }
  }
}

// Report metrics to Sentry
export function reportMetricsToSentry() {
  if (typeof window === 'undefined' || !window.performance) {
    return;
  }

  const entries = window.performance.getEntries();
  const metrics: Record<string, number> = {};

  entries.forEach((entry) => {
    if (entry.entryType === 'measure') {
      metrics[entry.name] = entry.duration;
    }
  });

  if (Object.keys(metrics).length > 0) {
    Sentry.captureMessage('Performance Metrics', {
      level: 'info',
      contexts: {
        performance: metrics,
      },
    });
  }
}

// Initialize everything
export function initializeMonitoring() {
  console.log('🚀 Initializing monitoring and error tracking...');

  // Initialize Sentry
  initializeSentry();

  // Track Web Vitals
  trackWebVitals();

  // Report metrics on page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', reportMetricsToSentry);
  }

  console.log('✅ Monitoring and error tracking initialized');
}

// Export Sentry for direct use
export { Sentry };
