/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

// ============================================================================
// DEMO & EXAMPLE TYPES
// ============================================================================

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// ============================================================================
// AI GENERATION TYPES
// ============================================================================

export interface AIGenerationRequest {
  prompt: string;
  platformType?: string;
  characterLimit?: number;
  includeHashtags?: boolean;
  tone?: string;
  brandContext?: string;
}

export interface AIGenerationResponse {
  content: string;
  variations?: string[];
  hashtags?: string[];
  estimatedEngagement?: number;
}

export interface AIProviderStatus {
  provider: 'openai' | 'anthropic' | 'auto';
  available: boolean;
  modelName?: string;
}

// ============================================================================
// AGENT TYPES
// ============================================================================

export interface AgentGenerateRequest {
  prompt: string;
  agentType?: string;
  context?: Record<string, unknown>;
}

export interface AgentGenerateResponse {
  id: string;
  result: string;
  metadata?: Record<string, unknown>;
  executionTime?: number;
}

// ============================================================================
// ASSET & BRAND TYPES
// ============================================================================

export interface AssetUploadResponse {
  id: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

export interface BrandIntakeRequest {
  brandName: string;
  description?: string;
  industry?: string;
  targetAudience?: string;
  websiteUrl?: string;
  socialLinks?: Record<string, string>;
}

export interface BrandKitResponse {
  id: string;
  brandName: string;
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  typography?: {
    fontFamily?: string;
    fontWeights?: number[];
  };
  voiceAndTone?: {
    tone?: string[];
    personality?: string;
  };
  guidelines?: string;
}

// ============================================================================
// CALENDAR & CONTENT TYPES
// ============================================================================

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  platform?: string;
  status?: 'draft' | 'scheduled' | 'published' | 'failed';
  contentId?: string;
}

export interface CalendarFilter {
  platform?: string;
  status?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface PostModel {
  id: string;
  content: string;
  platform: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduledAt?: string;
  publishedAt?: string;
  mediaIds?: string[];
  hashtags?: string[];
  mentions?: string[];
}

export interface PostUpdateRequest {
  content?: string;
  platform?: string;
  status?: 'draft' | 'scheduled' | 'published';
  scheduledAt?: string;
  mediaIds?: string[];
  hashtags?: string[];
}

// ============================================================================
// REVIEW & APPROVAL TYPES
// ============================================================================

export interface ReviewQueueResponse {
  id: string;
  items: ReviewItem[];
  totalCount: number;
  pendingCount: number;
}

export interface ReviewItem {
  id: string;
  contentId: string;
  content: string;
  platform: string;
  submittedBy: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
}

export interface ReviewActionRequest {
  reviewId: string;
  action: 'approve' | 'reject';
  feedback?: string;
  suggestions?: string;
}

export interface ReviewActionResponse {
  success: boolean;
  reviewId: string;
  action: 'approve' | 'reject';
  updatedAt: string;
}

// ============================================================================
// INTEGRATION TYPES
// ============================================================================

export interface IntegrationFilter {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith';
  value: string;
}

export interface IntegrationSyncConfig {
  syncEnabled: boolean;
  syncFrequency: 'realtime' | 'hourly' | 'daily';
  syncDirection: 'inbound' | 'outbound' | 'bidirectional';
  autoSync: boolean;
  filterRules?: IntegrationFilter[];
}

// ============================================================================
// WORKFLOW TYPES
// ============================================================================

export interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  config?: Record<string, unknown>;
  status?: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export interface WorkflowInstance {
  id: string;
  templateId?: string;
  steps: WorkflowStep[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// ANALYTICS & MONITORING TYPES
// ============================================================================

export interface AnalyticsMetric {
  id: string;
  title: string;
  current: number;
  previous?: number;
  change?: number;
  isPercentage?: boolean;
  icon?: string;
  color?: string;
}

export interface AnalyticsPortalData {
  metrics?: AnalyticsMetric[];
  data?: Record<string, unknown>;
}

export interface SyncEventData {
  syncId: string;
  eventType: string;
  platform?: string;
  progress?: number;
  recordsProcessed?: number;
  totalRecords?: number;
  currentMetric?: string;
  timestamp?: string;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface NotificationMessage {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  brandId?: string;
  actionUrl?: string;
  timestamp?: string;
}

// ============================================================================
// USER & PREFERENCES TYPES
// ============================================================================

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  notifications?: boolean;
  emailDigest?: 'daily' | 'weekly' | 'never';
  language?: string;
  timezone?: string;
}

export interface WhiteLabelConfig {
  brandName?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  customDomain?: string;
  favicon?: string;
  previewMode?: boolean;
}

// ============================================================================
// ERROR & RESPONSE TYPES
// ============================================================================

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  statusCode?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// ============================================================================
// CLIENT PORTAL TYPES
// ============================================================================

export interface ClientDashboardData {
  totalContent: number;
  approvedContent: number;
  pendingApprovals: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  content?: string;
}

export interface ClientMediaItem {
  id: string;
  filename: string;
  thumbnail?: string;
  uploadedAt: string;
  uploadedBy?: string;
  status?: 'uploading' | 'ready' | 'failed';
}
