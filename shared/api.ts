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
  environment: string;
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

export type BFSCalculateResponse = BrandFidelityScore;

export interface ReviewQueueResponse {
  queue: Array<{
    id: string;
    brand_id: string;
    agent: string;
    input: unknown;
    output: unknown;
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

export interface ApiResponse<T = unknown> {
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

// Shared API types between client and server

export interface AIGenerationRequest {
  prompt: string;
  agentType: "doc" | "design" | "advisor";
  provider?: "openai" | "claude";
}

export interface AIGenerationResponse {
  content: string;
  provider: string;
  agentType: string;
}

export interface AIProviderStatus {
  available: string[];
  default: string;
}

// Shared API interfaces for type safety between client and server

export interface PingResponse {
  message: string;
  timestamp: string;
}

export interface AIProvidersResponse {
  success: boolean;
  providers: Array<"openai" | "claude">;
  default: "openai" | "claude" | null;
  error?: string;
}

// PHASE 3: Brand Kit Builder API Types
export interface BrandIntakeRequest {
  // Basic Info
  brandName: string;
  industry: string;
  companySize: "startup" | "small" | "medium" | "large" | "enterprise";
  website?: string;
  
  // Brand Voice & Messaging
  missionStatement: string;
  valueProposition: string;
  targetAudience: string;
  brandPersonality: string[];
  toneOfVoice: string[];
  keyMessages: string[];
  
  // Visual Identity
  primaryColors: string[];
  secondaryColors: string[];
  logoUrls: string[];
  fontFamilies: string[];
  visualStyle: string;
  
  // Content Guidelines
  contentTopics: string[];
  avoidTopics: string[];
  competitorBrands: string[];
  uniqueDifferentiators: string[];
  
  // Compliance & Legal
  legalGuidelines: string;
  brandGuidelines: string;
  approvalProcess: string;
}

export interface BrandKitResponse {
  success: boolean;
  brandKit: {
    id: string;
    brandName: string;
    version: number;
    createdAt: string;
    updatedAt: string;
    
    // Brand Identity
    identity: {
      mission: string;
      values: string[];
      personality: string[];
      voice: string[];
    };
    
    // Visual System
    visual: {
      colors: {
        primary: string[];
        secondary: string[];
        palette: { name: string; hex: string; usage: string }[];
      };
      typography: {
        primary: string;
        secondary: string;
        fonts: { name: string; weight: string; usage: string }[];
      };
      logos: { url: string; variant: string; usage: string }[];
      style: string;
    };
    
    // Content Guidelines
    content: {
      topics: string[];
      avoidTopics: string[];
      tone: string[];
      messaging: string[];
      competitors: string[];
      differentiators: string[];
    };
    
    // AI Context
    aiContext: {
      brandSummary: string;
      voiceProfile: string;
      contentStyle: string;
      restrictions: string[];
    };
  };
  error?: string;
}

export interface AssetUploadRequest {
  brandId: string;
  file: File;
  category: "logo" | "font" | "image" | "document";
  metadata?: {
    name?: string;
    description?: string;
    usage?: string;
  };
}

export interface AssetUploadResponse {
  success: boolean;
  asset: {
    id: string;
    url: string;
    filename: string;
    category: string;
    size: number;
    metadata?: Record<string, unknown>;
  };
  error?: string;
}

export interface WebsiteCrawlRequest {
  url: string;
  brandId: string;
  extractColors?: boolean;
  extractFonts?: boolean;
  maxPages?: number;
}

export interface WebsiteCrawlResponse {
  success: boolean;
  data: {
    colors: { hex: string; frequency: number }[];
    fonts: { family: string; weights: string[] }[];
    content: { title: string; description: string; headings: string[] };
    images: { url: string; alt: string }[];
  };
  error?: string;
}

export interface BrandValidationResponse {
  valid: boolean;
  errors: {
    field: string;
    message: string;
    severity: "error" | "warning";
  }[];
  aiCompatible: boolean;
}

// PHASE 4: Content Creation Workflows API Types
export interface PostModel {
  id: string;
  brandId: string;
  status: 'draft' | 'review' | 'approved' | 'scheduled' | 'published' | 'failed';
  assigneeId?: string;
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok';
  
  // Content
  caption: string;
  hashtags: string[];
  assetIds: string[];
  
  // Scheduling
  scheduledAt?: string;
  publishedAt?: string;
  timeZone: string;
  
  // Workflow
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  
  // Compliance
  complianceScore: number; // Brand Fidelity Score 0-1
  linterResults: {
    profanityCheck: boolean;
    lengthCheck: boolean;
    brandVoiceFit: number;
    warnings: string[];
    errors: string[];
  };
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // History
  revisionCount: number;
  lastEditedBy: string;
}

export interface PostCreateRequest {
  brandId: string;
  platform: PostModel['platform'];
  caption?: string;
  hashtags?: string[];
  assetIds?: string[];
  scheduledAt?: string;
  timeZone?: string;
}

export interface PostUpdateRequest {
  caption?: string;
  hashtags?: string[];
  assetIds?: string[];
  scheduledAt?: string;
  status?: PostModel['status'];
}

export interface PostHistory {
  id: string;
  postId: string;
  action: 'created' | 'updated' | 'approved' | 'rejected' | 'scheduled' | 'published';
  userId: string;
  userName: string;
  timestamp: string;
  changes?: {
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }[];
  comment?: string;
}

export interface CommentThread {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  content: string;
  mentions: string[]; // user IDs mentioned
  timestamp: string;
  replies: CommentThread[];
  resolved: boolean;
}

export interface ApprovalRequest {
  postId: string;
  action: 'approve' | 'reject';
  comment?: string;
  changes?: PostUpdateRequest;
}

export interface CalendarEvent {
  id: string;
  postId: string;
  brandId: string;
  brandName: string;
  platform: PostModel['platform'];
  status: PostModel['status'];
  title: string;
  scheduledAt: string;
  duration: number; // minutes
  color: string; // brand color
}

export interface CalendarFilter {
  brands?: string[];
  platforms?: PostModel['platform'][];
  statuses?: PostModel['status'][];
  dateRange: {
    start: string;
    end: string;
  };
}

export interface AutosaveState {
  postId: string;
  content: PostUpdateRequest;
  timestamp: string;
  userId: string;
}

export interface UndoRedoState {
  postId: string;
  states: {
    content: PostUpdateRequest;
    timestamp: string;
    action: string;
  }[];
  currentIndex: number;
  maxStates: number; // 20 as per requirement
}

export interface PublishPreview {
  platform: PostModel['platform'];
  preview: {
    caption: string;
    hashtags: string[];
    characterCount: number;
    maxCharacters: number;
    truncated: boolean;
    assets: {
      id: string;
      url: string;
      type: 'image' | 'video';
      aspectRatio: string;
    }[];
    estimatedReach: number;
    suggestedTime: string;
  };
  validation: {
    valid: boolean;
    errors: string[];
    warnings: string[];
  };
}

export interface ComplianceLinterResult {
  postId: string;
  brandFidelityScore: number; // 0-1, must be ≥ 0.8
  checks: {
    profanity: {
      passed: boolean;
      flaggedWords: string[];
    };
    length: {
      passed: boolean;
      characterCount: number;
      maxCharacters: number;
      platform: string;
    };
    brandVoice: {
      score: number; // 0-1
      passed: boolean; // must be ≥ 0.8
      analysis: string;
    };
    disclaimers: {
      required: boolean;
      present: boolean;
      missing: string[];
    };
    ratios: {
      textToHashtag: number;
      passed: boolean;
    };
  };
  timestamp: string;
}

// ...existing code... (rest of your interfaces)
