export interface GenerateContentRequest {
  prompt: string;
  options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  };
}

export interface GenerateContentResponse {
  content: string;
}

export interface AnalyzeContentRequest {
  content: string;
}

export interface AnalyzeContentResponse {
  analysis: {
    sentiment: string;
    engagementScore: number;
    suggestions: string[];
    analysis: string;
  };
}

export interface Brand {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website?: string;
  industry?: string;
  created_at: string;
  updated_at: string;
}

export interface Content {
  id: string;
  brand_id: string;
  title: string;
  content: string;
  platform: string;
  status: 'draft' | 'pending' | 'approved' | 'published';
  scheduled_for?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'agency' | 'client';
  created_at: string;
}
