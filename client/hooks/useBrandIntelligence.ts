import { useState, useEffect, useCallback } from 'react';
import { BrandIntelligence } from '@shared/brand-intelligence';

interface UseBrandIntelligenceReturn {
  intelligence: BrandIntelligence | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  submitFeedback: (recommendationId: string, action: 'accepted' | 'rejected') => Promise<void>;
}

export function useBrandIntelligence(brandId: string): UseBrandIntelligenceReturn {
  const [intelligence, setIntelligence] = useState<BrandIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBrandIntelligence = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/brand-intelligence/${brandId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setIntelligence(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load brand intelligence';
      setError(errorMessage);
      console.error('Brand intelligence error:', err);
    } finally {
      setLoading(false);
    }
  }, [brandId]);

  const submitFeedback = useCallback(async (recommendationId: string, action: 'accepted' | 'rejected') => {
    try {
      const response = await fetch('/api/brand-intelligence/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendationId, action })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }
      
      await loadBrandIntelligence();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit feedback';
      setError(errorMessage);
      console.error('Feedback error:', err);
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
