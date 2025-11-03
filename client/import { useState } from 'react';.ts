import { useState } from 'react';
import { GenerateContentRequest, GenerateContentResponse, AnalyzeContentRequest, AnalyzeContentResponse } from '@shared/types';

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateContent = async (request: GenerateContentRequest): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GenerateContentResponse = await response.json();
      return data.content;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate content';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const analyzeContent = async (request: AnalyzeContentRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: AnalyzeContentResponse = await response.json();
      return data.analysis;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze content';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateContent,
    analyzeContent,
    loading,
    error,
  };
}
