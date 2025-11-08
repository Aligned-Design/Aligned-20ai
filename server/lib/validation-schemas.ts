/**
 * Zod Validation Schemas
 * Centralized input validation schemas for all API endpoints
 * Ensures strict type checking and OWASP compliance
 */

import { z } from "zod";

// ============================================================================
// Common Base Schemas
// ============================================================================

/** UUID validation */
export const UUIDSchema = z.string().uuid("Invalid UUID format");

/** Brand ID validation */
export const BrandIdSchema = z
  .string()
  .min(1, "Brand ID is required")
  .max(255, "Brand ID must be less than 255 characters")
  .regex(/^[a-zA-Z0-9_-]+$/, "Brand ID can only contain alphanumeric, hyphen, and underscore");

/** Platform validation */
export const PlatformSchema = z.enum([
  "instagram",
  "facebook",
  "linkedin",
  "twitter",
  "google_business",
]);

/** User ID validation */
export const UserIdSchema = z
  .string()
  .min(1, "User ID is required")
  .max(255, "User ID must be less than 255 characters");

/** Email validation */
export const EmailSchema = z
  .string()
  .email("Invalid email format")
  .max(255, "Email must be less than 255 characters");

/** URL validation */
export const URLSchema = z
  .string()
  .url("Invalid URL format")
  .max(2048, "URL must be less than 2048 characters");

/** Pagination */
export const PaginationSchema = z.object({
  page: z.number().int().min(1, "Page must be >= 1").optional().default(1),
  limit: z.number().int().min(1, "Limit must be >= 1").max(100, "Limit must be <= 100").optional().default(20),
});

// ============================================================================
// Query Parameters
// ============================================================================

/** Get integrations query */
export const GetIntegrationsQuerySchema = z.object({
  brandId: BrandIdSchema,
  type: PlatformSchema.optional(),
  status: z.enum(["connected", "disconnected", "error"]).optional(),
  ...PaginationSchema.shape,
});

/** Get content query */
export const GetContentQuerySchema = z.object({
  brandId: BrandIdSchema,
  status: z.enum(["draft", "scheduled", "published", "archived"]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  ...PaginationSchema.shape,
});

/** Get approvals query */
export const GetApprovalsQuerySchema = z.object({
  brandId: BrandIdSchema,
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  userId: UserIdSchema.optional(),
  ...PaginationSchema.shape,
});

// ============================================================================
// Body Schemas - OAuth & Integrations
// ============================================================================

/** OAuth initiate request */
export const OAuthInitiateBodySchema = z.object({
  platform: PlatformSchema,
  brandId: BrandIdSchema,
  redirectUrl: URLSchema.optional(),
});

/** OAuth callback request */
export const OAuthCallbackBodySchema = z.object({
  code: z.string().min(1, "Authorization code is required").max(4096),
  state: z.string().min(32, "State token must be at least 32 characters"),
  platform: PlatformSchema,
});

/** Create integration request */
export const CreateIntegrationBodySchema = z.object({
  brandId: BrandIdSchema,
  type: PlatformSchema,
  name: z.string().min(1, "Integration name is required").max(255),
  credentials: z.record(z.string(), z.unknown()).optional(),
  settings: z.object({
    syncEnabled: z.boolean().optional().default(true),
    syncFrequency: z.enum(["realtime", "hourly", "daily"]).optional(),
    autoSync: z.boolean().optional().default(true),
  }).optional(),
});

/** Update integration request */
export const UpdateIntegrationBodySchema = z.object({
  name: z.string().min(1, "Integration name is required").max(255).optional(),
  settings: z.object({
    syncEnabled: z.boolean().optional(),
    syncFrequency: z.enum(["realtime", "hourly", "daily"]).optional(),
    autoSync: z.boolean().optional(),
  }).optional(),
});

// ============================================================================
// Body Schemas - Content & Publishing
// ============================================================================

/** Create content request */
export const CreateContentBodySchema = z.object({
  brandId: BrandIdSchema,
  title: z.string().min(1, "Title is required").max(255),
  body: z.string().min(1, "Body is required").max(10000),
  platforms: z.array(PlatformSchema).min(1, "At least one platform is required"),
  scheduledAt: z.string().datetime().optional(),
  mediaUrls: z.array(URLSchema).optional(),
});

/** Update content request */
export const UpdateContentBodySchema = z.object({
  title: z.string().min(1, "Title is required").max(255).optional(),
  body: z.string().min(1, "Body is required").max(10000).optional(),
  platforms: z.array(PlatformSchema).optional(),
  status: z.enum(["draft", "scheduled", "published"]).optional(),
});

/** Publish content request */
export const PublishContentBodySchema = z.object({
  contentId: z.string().min(1, "Content ID is required"),
  platforms: z.array(PlatformSchema).optional(),
  scheduledFor: z.string().datetime().optional(),
});

// ============================================================================
// Body Schemas - Approvals
// ============================================================================

/** Create approval request */
export const CreateApprovalBodySchema = z.object({
  brandId: BrandIdSchema,
  contentId: z.string().min(1, "Content ID is required"),
  approverIds: z.array(UserIdSchema).min(1, "At least one approver is required"),
  notes: z.string().max(1000).optional(),
});

/** Approve/Reject request */
export const ApprovalDecisionBodySchema = z.object({
  approvalId: z.string().min(1, "Approval ID is required"),
  decision: z.enum(["approved", "rejected"]),
  feedback: z.string().max(1000).optional(),
});

// ============================================================================
// Body Schemas - Settings & Preferences
// ============================================================================

/** Update brand settings */
export const UpdateBrandSettingsBodySchema = z.object({
  brandId: BrandIdSchema,
  name: z.string().min(1, "Brand name is required").max(255).optional(),
  logo: URLSchema.optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color").optional(),
  timezone: z.string().optional(),
});

/** Update user preferences */
export const UpdateUserPreferencesBodySchema = z.object({
  userId: UserIdSchema,
  notificationSettings: z.object({
    emailNotifications: z.boolean().optional(),
    slackNotifications: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),
  }).optional(),
  theme: z.enum(["light", "dark"]).optional(),
  language: z.string().optional(),
});

// ============================================================================
// Body Schemas - Webhooks
// ============================================================================

/** Register webhook request */
export const RegisterWebhookBodySchema = z.object({
  brandId: BrandIdSchema,
  platform: PlatformSchema,
  events: z.array(z.string()).min(1, "At least one event is required"),
  url: URLSchema,
  active: z.boolean().optional().default(true),
});

/** Update webhook request */
export const UpdateWebhookBodySchema = z.object({
  events: z.array(z.string()).optional(),
  url: URLSchema.optional(),
  active: z.boolean().optional(),
});

// ============================================================================
// Body Schemas - Analytics
// ============================================================================

/** Get analytics request */
export const GetAnalyticsQuerySchema = z.object({
  brandId: BrandIdSchema,
  platform: PlatformSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  metrics: z.array(z.string()).optional(),
});

// ============================================================================
// Body Schemas - Bulk Operations
// ============================================================================

/** Bulk approve request */
export const BulkApproveBodySchema = z.object({
  approvalIds: z.array(z.string().min(1)).min(1, "At least one approval ID is required"),
  feedback: z.string().max(1000).optional(),
});

/** Bulk publish request */
export const BulkPublishBodySchema = z.object({
  contentIds: z.array(z.string().min(1)).min(1, "At least one content ID is required"),
  scheduledFor: z.string().datetime().optional(),
});

// ============================================================================
// Path Parameters
// ============================================================================

/** ID path parameter */
export const IdParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

/** Brand and ID path parameters */
export const BrandAndIdParamSchema = z.object({
  brandId: BrandIdSchema,
  id: z.string().min(1, "ID is required"),
});

/** Platform path parameter */
export const PlatformParamSchema = z.object({
  platform: PlatformSchema,
});

// ============================================================================
// Export type helpers
// ============================================================================

export type GetIntegrationsQuery = z.infer<typeof GetIntegrationsQuerySchema>;
export type OAuthInitiateBody = z.infer<typeof OAuthInitiateBodySchema>;
export type OAuthCallbackBody = z.infer<typeof OAuthCallbackBodySchema>;
export type CreateIntegrationBody = z.infer<typeof CreateIntegrationBodySchema>;
export type CreateContentBody = z.infer<typeof CreateContentBodySchema>;
export type CreateApprovalBody = z.infer<typeof CreateApprovalBodySchema>;
export type UpdateBrandSettingsBody = z.infer<typeof UpdateBrandSettingsBodySchema>;
export type UpdateUserPreferencesBody = z.infer<typeof UpdateUserPreferencesBodySchema>;
export type RegisterWebhookBody = z.infer<typeof RegisterWebhookBodySchema>;
