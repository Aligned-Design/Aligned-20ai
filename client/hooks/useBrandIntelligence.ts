import { useState, useEffect, useCallback } from 'react';
import { BrandIntelligence } from '@shared/brand-intelligence';

interface UseBrandIntelligenceReturn {
  intelligence: BrandIntelligence | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  submitFeedback: (recommendationId: string, action: 'accepted' | 'rejected') => Promise<void>;
}

interface ApiErrorResponse {
  error?: string;
  code?: string;
  details?: Record<string, unknown>;
  message?: string;
}

/**
 * Safely parses JSON response with defensive checks
 * Validates content-type header and handles JSON parsing errors gracefully
 * @param response Fetch response object
 * @returns Parsed JSON data or throws descriptive error
 */
async function safeJsonParse(response: any): Promise<unknown> {
  // Helper to read content-type from Headers-like or plain object
  const getContentType = () => {
    try {
      if (response && response.headers) {
        if (typeof response.headers.get === 'function') {
          return response.headers.get('content-type') || '';
        }
        if (typeof response.headers['content-type'] === 'string') {
          return response.headers['content-type'];
        }
      }
    } catch (e) {
      // ignore
    }
    return '';
  };

  const contentType = getContentType();

  // If content-type explicitly not JSON, prefer to read text and throw
  if (contentType && !contentType.includes('application/json')) {
    if (typeof response.text === 'function') {
      const bodyText = await response.text();
      const preview = bodyText.slice(0, 300).replace(/\s+/g, ' ');
      throw new Error(
        `Invalid response format: expected JSON but got ${contentType || 'no content-type header'}. Response preview: ${preview}`
      );
    }
    throw new Error(`Invalid response format: expected JSON but got ${contentType || 'no content-type header'}.`);
  }

  // If response.json exists, try it first (covers native Response and many mocks)
  if (response && typeof response.json === 'function') {
    try {
      return await response.json();
    } catch (jsonErr) {
      // If json() fails, try to fallback to text and parse
      if (typeof response.text === 'function') {
        const bodyText = await response.text();
        const preview = bodyText.slice(0, 500).replace(/\s+/g, ' ');
        try {
          return JSON.parse(bodyText);
        } catch (parseErr) {
          throw new Error(
            `Failed to parse JSON: ${parseErr instanceof Error ? parseErr.message : 'unknown error'}. Body preview: ${preview}`
          );
        }
      }
      throw new Error(`Failed to parse JSON: ${jsonErr instanceof Error ? jsonErr.message : String(jsonErr)}`);
    }
  }

  // If only text() is available, attempt to parse it
  if (response && typeof response.text === 'function') {
    const bodyText = await response.text();
    const preview = bodyText.slice(0, 500).replace(/\s+/g, ' ');
    try {
      return JSON.parse(bodyText);
    } catch (parseErr) {
      throw new Error(
        `Failed to parse JSON from text response: ${parseErr instanceof Error ? parseErr.message : 'unknown error'}. Body preview: ${preview}`
      );
    }
  }

  // Last resort: return response as-is if it appears to be a plain object
  if (response && typeof response === 'object') {
    return response;
  }

  throw new Error('Response does not support json() or text() parsing');
}

/**
 * Extracts user-friendly error message from various error sources
 * @param err Error object, API response, or unknown error
 * @returns User-friendly error message suitable for display
 */
function getErrorMessage(err: unknown): string {
  // Handle Error objects
  if (err instanceof Error) {
    return err.message;
  }

  // Handle API error response objects
  if (typeof err === 'object' && err !== null) {
    const apiError = err as ApiErrorResponse;
    return apiError.error || apiError.message || 'An unknown error occurred';
  }

  // Fallback
  return 'An unknown error occurred. Please try again.';
}

export function useBrandIntelligence(brandId: string): UseBrandIntelligenceReturn {
  const [intelligence, setIntelligence] = useState<BrandIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBrandIntelligence = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Make request with explicit JSON acceptance
      const response = await fetch(
        `/api/brand-intelligence/${brandId}`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      // Log response diagnostics for debugging
      const respContentType = response && response.headers && (typeof response.headers.get === 'function' ? response.headers.get('content-type') : response.headers['content-type']) || '';
      console.debug('[Brand Intelligence] fetch response status:', response.status, 'content-type:', respContentType);

      // Handle non-OK status codes
      if (!response.ok) {
        // Try to parse error response as JSON first
        let errorData: unknown;
        try {
          errorData = await safeJsonParse(response);
        } catch (parseErr) {
          // If JSON parsing fails, include response preview in error
          throw new Error(`HTTP ${response.status}: ${response.statusText}. Response not JSON.`);
        }

        // Handle specific HTTP status codes
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in.');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to view this brand intelligence.');
        } else if (response.status === 404) {
          throw new Error('Brand intelligence data not found.');
        } else if (response.status >= 500) {
          throw new Error('Server error occurred. Please try again later.');
        }

        // Try to extract error message from API response
        const apiError = errorData as ApiErrorResponse;
        throw new Error(apiError.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Parse successful response with validation
      const data = await safeJsonParse(response);
      setIntelligence(data as BrandIntelligence);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);

      // Comprehensive error logging for debugging
      console.error('[Brand Intelligence] Error:', {
        error: err,
        message: errorMessage,
        brandId,
        timestamp: new Date().toISOString()
      });

      // Log to telemetry/monitoring service if available
      if (typeof window !== 'undefined' && (window as any).__telemetry?.error) {
        (window as any).__telemetry.error('brand_intelligence_fetch_failed', {
          message: errorMessage,
          brandId,
          timestamp: new Date().toISOString()
        });
      }
    } finally {
      setLoading(false);
    }
  }, [brandId]);

  const submitFeedback = useCallback(async (recommendationId: string, action: 'accepted' | 'rejected') => {
    try {
      const response = await fetch('/api/brand-intelligence/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ recommendationId, action })
      });

      if (!response.ok) {
        // Try to parse error response
        let errorData: unknown;
        try {
          errorData = await safeJsonParse(response);
        } catch (parseErr) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const apiError = errorData as ApiErrorResponse;
        throw new Error(apiError.error || 'Failed to submit feedback');
      }

      // Verify response is valid JSON
      await safeJsonParse(response);

      // Reload data after successful feedback
      await loadBrandIntelligence();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);

      console.error('[Brand Intelligence Feedback] Error:', {
        error: err,
        message: errorMessage,
        recommendationId,
        action,
        timestamp: new Date().toISOString()
      });

      if (typeof window !== 'undefined' && (window as any).__telemetry?.error) {
        (window as any).__telemetry.error('brand_intelligence_feedback_failed', {
          message: errorMessage,
          recommendationId,
          timestamp: new Date().toISOString()
        });
      }
    }
  }, [loadBrandIntelligence]);

  useEffect(() => {
    loadBrandIntelligence();
  }, [loadBrandIntelligence]);

  return {
    intelligence,
    loading,
    error,
    refresh: loadBrandIntelligence,
    submitFeedback
  };
}
