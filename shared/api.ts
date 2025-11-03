/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

import { 
  GenerationRequest, 
  GenerationResponse, 
  BrandFidelityScore,
  LinterResult 
} from "../client/types/agent-config";

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
  timestamp: string;
}

/**
 * AI Agent API Types
 */
export interface AgentGenerateRequest extends GenerationRequest {
  provider?: "openai" | "claude" | "auto";
}

export interface AgentGenerateResponse extends GenerationResponse {
  provider_used?: string;
  attempts?: number;
}

export interface BFSCalculateRequest {
  content: {
    body: string;
    headline?: string;
    cta?: string;
    hashtags?: string[];
    platform: string;
  };
  brand_id: string;
}

export interface BFSCalculateResponse extends BrandFidelityScore {
  // Extends the base BFS with no additional fields
}

export interface ReviewQueueResponse {
  queue: Array<{
    id: string;
    brand_id: string;
    agent: string;
    input: any;
    output: any;
    bfs?: BrandFidelityScore;
    linter_results?: LinterResult;
    timestamp: string;
    error?: string;
  }>;
}

export interface ReviewActionRequest {
  reviewer_notes?: string;
}

export interface ReviewActionResponse {
  success: boolean;
  error?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResponse {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// Content Production API Types
export interface ContentGenerationRequest {
  brandId: string;
  platform: string;
  prompt: string;
  settings?: {
    tone?: string;
    length?: number;
    includeHashtags?: boolean;
  };
}

export interface ContentGenerationResponse {
  success: boolean;
  contentId: string;
  jobId: string;
  status: 'generating' | 'completed' | 'failed';
  estimatedCompletion?: string;
}

// Analytics API Types
export interface AnalyticsMetric {
  current: number;
  previous: number;
  change: number;
}

export interface AnalyticsData {
  brandInfo: {
    name: string;
    logo?: string;
    colors: {
      primary: string;
      secondary: string;
    };
  };
  timeRange: {
    start: string;
    end: string;
    period: string;
  };
  metrics: {
    reach: AnalyticsMetric;
    engagement: AnalyticsMetric;
    conversions: AnalyticsMetric;
    engagementRate: AnalyticsMetric;
  };
}

// Trial and Subscription API Types
export interface TrialStartRequest {
  email: string;
  brandCount?: number;
  userType?: 'agency' | 'client';
}

export interface TrialStartResponse {
  success: boolean;
  trialId: string;
  expiresAt: string;
  brandCount: number;
  features: string[];
}

export interface SubscriptionStatus {
  isActive: boolean;
  plan: 'trial' | 'starter' | 'growth' | 'enterprise';
  daysRemaining?: number;
  expiresAt?: string;
  featuresUsed: {
    contentGenerated: number;
    postsPublished: number;
    analyticsViewed: boolean;
  };
  limits: {
    maxContent: number;
    maxPosts: number;
    maxBrands: number;
  };
}

// Onboarding API Types
export interface OnboardingProgress {
  userId: string;
  currentStep: string | null;
  completedSteps: string[];
  skippedSteps: string[];
  startedAt: string;
  totalSteps: number;
  progressPercentage: number;
  userType?: 'agency' | 'client';
}

export interface OnboardingCompletion {
  userId: string;
  userType: 'agency' | 'client';
  completedSteps: string[];
}
