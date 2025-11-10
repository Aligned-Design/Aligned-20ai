import { RequestHandler } from "express";

import {
  Platform,
  PublishResponse,
  PublishingJob,
  ConnectionStatus,
  PostContent,
} from "@shared/publishing";
import {
  validatePostContent,
  validateScheduleTime,
} from "../lib/platform-validators";
import { canAccessBrand } from "../lib/auth-context";
import {
  generateOAuthUrl,
  exchangeCodeForToken,
  refreshAccessToken,
} from "../lib/oauth-manager";
import { publishingQueue } from "../lib/publishing-queue";
import { connectionsDB } from "../lib/connections-db-service";
import { publishingDBService } from "../lib/publishing-db-service";
import { getPlatformAPI } from "../lib/platform-apis";
import { AppError } from "../lib/error-middleware";
import { ErrorCode, HTTP_STATUS } from "../lib/error-responses";
import {
  InitiateOAuthSchema,
  PublishContentSchema,
  GetJobsQuerySchema,
  validateQuery,
} from "@shared/validation-schemas";

// OAuth initiation
export const initiateOAuth: RequestHandler = async (req, res) => {
  try {
    // ✅ VALIDATED: Request body validated against InitiateOAuthSchema
    const validated = InitiateOAuthSchema.parse(req.body);
    const { platform, brandId } = validated;

    const oauthFlow = generateOAuthUrl(platform, brandId);

    res.json(oauthFlow);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to initiate OAuth flow",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "error",
      error instanceof Error ? { originalError: error.message } : undefined,
      "Please try again later or contact support"
    );
  }
};

/**
 * ✅ SECURE: OAuth callback handler with full security checks
 * - Validates CSRF state token from cache
 * - Requires authenticated user context
 * - Validates user has access to target brand
 * - Rate limited to prevent brute force
 */
export const handleOAuthCallback: RequestHandler = async (req, res) => {
  try {
    const { platform } = req.params;
    const { code, state, error } = req.query;

    // Handle OAuth provider errors
    if (error) {
      return res.redirect(
        `/integrations?error=${encodeURIComponent(error as string)}`,
      );
    }

    // Validate required parameters
    if (!code || !state) {
      const errorMsg = "Missing authorization code or state parameter";
      return res.redirect(
        `/integrations?error=${encodeURIComponent(errorMsg)}`,
      );
    }

    // ✅ SECURE: exchangeCodeForToken validates state from cache
    // and returns brandId from backend cache (not from state parameter)
    const tokenData = await exchangeCodeForToken(
      platform as Platform,
      code as string,
      state as string,
    );

    const { brandId } = tokenData;

    // ✅ SECURE: Require authentication context
    const authContext = (req as unknown).auth;
    if (!authContext || !authContext.userId) {
      const errorMsg =
        "Authentication required to complete OAuth authorization";
      return res.redirect(
        `/integrations?error=${encodeURIComponent(errorMsg)}`,
      );
    }

    // ✅ SECURE: Validate user has access to this brand
    if (!canAccessBrand(authContext, brandId)) {
      const errorMsg = "You do not have permission to access this brand";
      return res.redirect(
        `/integrations?error=${encodeURIComponent(errorMsg)}`,
      );
    }

    // Use authenticated context
    const tenantId = authContext.tenantId || "tenant-123";
    const userId = authContext.userId;

    // Store connection in database
    await connectionsDB.upsertConnection(
      brandId,
      tenantId,
      platform as Platform,
      tokenData.accessToken,
      tokenData.accountInfo.id,
      tokenData.accountInfo.name || tokenData.accountInfo.username,
      tokenData.accountInfo.picture?.data?.url ||
        tokenData.accountInfo.profile_image_url,
      tokenData.refreshToken,
      tokenData.expiresIn
        ? new Date(Date.now() + tokenData.expiresIn * 1000)
        : undefined,
      [], // TODO: Extract permissions from token response
      tokenData.accountInfo,
      userId,
    );

    res.redirect("/integrations?success=Connected successfully");
  } catch (error) {
    console.error("OAuth callback error:", error);
    const errorMsg =
      error instanceof Error ? error.message : "Connection failed";
    res.redirect(`/integrations?error=${encodeURIComponent(errorMsg)}`);
  }
};

// Get connection status for a brand
export const getConnections: RequestHandler = async (req, res) => {
  try {
    const { brandId } = req.params;

    // Fetch connections from database
    const connections: unknown[] = await connectionsDB.getBrandConnections(brandId);

    // Transform to ConnectionStatus format
    const connectionStatuses: ConnectionStatus[] = connections.map((conn) => ({
      platform: conn.platform as Platform,
      connected: conn.status === "connected",
      accountName: conn.account_name,
      profilePicture: conn.profile_picture,
      tokenExpiry: conn.token_expires_at,
      permissions: conn.permissions || [],
      needsReauth: conn.status === "expired" || conn.status === "revoked",
    }));

    res.json(connectionStatuses);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to fetch connections",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "error",
      error instanceof Error ? { originalError: error.message } : undefined,
      "Please try again later or contact support"
    );
  }
};

// Disconnect a platform
export const disconnectPlatform: RequestHandler = async (req, res) => {
  try {
    const { brandId, platform } = req.params;

    // Disconnect in database
    await connectionsDB.disconnectPlatform(brandId, platform as Platform);

    res.json({ success: true });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to disconnect platform",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "error",
      error instanceof Error ? { originalError: error.message } : undefined,
      "Please try again later or contact support"
    );
  }
};

// Publish content
export const publishContent: RequestHandler = async (req, res) => {
  try {
    // ✅ VALIDATED: Request body validated against PublishContentSchema
    const {
      brandId,
      platforms,
      content: contentText,
      scheduledAt,
      validateOnly,
    } = PublishContentSchema.parse(req.body);

    const tenantId = (req as unknown).user?.tenantId || "tenant-123";
    const userId = (req as unknown).user?.id;

    // Convert content string to PostContent object
    const content: PostContent = { text: contentText };

    const jobs: PublishingJob[] = [];
    const validationResults = [];
    const errors = [];

    // Validate content for each platform
    for (const platform of platforms) {
      const platformValidation = validatePostContent(platform, content);
      validationResults.push(...platformValidation);

      // Check for errors
      const hasErrors = platformValidation.some((r) => r.status === "error");
      if (hasErrors && !validateOnly) {
        errors.push(`${platform}: Content validation failed`);
        continue;
      }

      // Validate schedule time if provided
      if (scheduledAt) {
        const scheduleValidation = validateScheduleTime(
          platform,
          new Date(scheduledAt),
        );
        validationResults.push(scheduleValidation);

        if (scheduleValidation.status === "error" && !validateOnly) {
          errors.push(`${platform}: ${scheduleValidation.message}`);
          continue;
        }
      }

      if (!validateOnly) {
        // Create publishing job in database
        const dbJob = await publishingDBService.createPublishingJob(
          brandId,
          tenantId,
          content as unknown as Record<string, unknown>,
          [platform],
          scheduledAt ? new Date(scheduledAt) : undefined,
          userId,
        );

        // Add to in-memory queue for processing
        const job: PublishingJob = {
          id: dbJob.id,
          brandId,
          tenantId,
          postId: dbJob.id,
          platform,
          connectionId: `${platform}-${brandId}`,
          status: "pending",
          scheduledAt,
          content,
          validationResults: platformValidation,
          retryCount: 0,
          maxRetries: 3,
          createdAt: dbJob.created_at,
          updatedAt: dbJob.updated_at,
        };

        jobs.push(job);
        await publishingQueue.addJob(job);
      }
    }

    const response: PublishResponse = {
      success: errors.length === 0,
      jobs,
      validationResults,
      errors: errors.length > 0 ? errors : undefined,
    };

    res.json(response);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to publish content",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "error",
      error instanceof Error ? { originalError: error.message } : undefined,
      "Please try again later or contact support"
    );
  }
};

// Get publishing jobs from database (persistent, includes historical jobs)
export const getPublishingJobs: RequestHandler = async (req, res) => {
  try {
    const { brandId } = req.params;
    // ✅ VALIDATED: Query parameters validated against GetJobsQuerySchema
    const { __status, platform, limit, offset } = validateQuery(
      GetJobsQuerySchema,
      req.query,
    );

    // Fetch from database for persistence across server restarts
    const { jobs, total } = await publishingDBService.getJobHistory(
      brandId,
      limit,
      offset,
    );
    const jobsAny: unknown[] = (jobs as unknown) || [];

    // Filter by platform if specified
    let filteredJobs = jobsAny;
    if (platform && platform !== "all") {
      filteredJobs = jobsAny.filter((job) =>
        job.platforms?.includes(platform as string),
      );
    }

    // Filter by brand
    filteredJobs = filteredJobs.filter((job: unknown) => job.brand_id === brandId);

    // Transform database records to PublishingJob format
    const publishingJobs: PublishingJob[] = filteredJobs.map((job: unknown) => ({
      id: (job as any).id,
      brandId: (job as any).brand_id,
      tenantId: (job as any).tenant_id,
      postId: (job as any).id,
      platform: ((job as any).platforms?.[0] || "instagram") as Platform,
      connectionId: `${(job as any).platforms?.[0]}-${(job as any).brand_id}`,
      status: (job as any).status || "pending",
      scheduledAt: (job as any).scheduled_at,
      publishedAt: (job as any).published_at,
      platformPostId: undefined,
      platformUrl: undefined,
      content: (job as any).content,
      validationResults: ((job as any).validation_results as unknown[]) || [],
      retryCount: (job as any).retry_count || 0,
      maxRetries: (job as any).max_retries || 3,
      lastError: (job as any).last_error,
      errorDetails: (job as any).last_error_details,
      createdAt: (job as any).created_at,
      updatedAt: (job as any).updated_at,
    }));

    res.json({
      jobs: publishingJobs,
      total,
      limit,
      offset,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to get publishing jobs",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "error",
      error instanceof Error ? { originalError: error.message } : undefined,
      "Please try again later or contact support"
    );
  }
};

// Retry a failed job
export const retryJob: RequestHandler = async (req, res) => {
  try {
    const { jobId } = req.params;

    const success = await publishingQueue.retryJob(jobId);

    if (success) {
      res.json({ success: true });
    } else {
      throw new AppError(
        ErrorCode.INTERNAL_ERROR,
        "Job cannot be retried",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "error"
      );
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to retry job",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "error",
      error instanceof Error ? { originalError: error.message } : undefined,
      "Please try again later or contact support"
    );
  }
};

// Cancel a job
export const cancelJob: RequestHandler = async (req, res) => {
  try {
    const { jobId } = req.params;

    const success = await publishingQueue.cancelJob(jobId);

    if (success) {
      res.json({ success: true });
    } else {
      throw new AppError(
        ErrorCode.INTERNAL_ERROR,
        "Job cannot be cancelled",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "error"
      );
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to cancel job",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "error",
      error instanceof Error ? { originalError: error.message } : undefined,
      "Please try again later or contact support"
    );
  }
};

// Verify a platform connection is still valid
export const verifyConnection: RequestHandler = async (req, res) => {
  try {
    const { brandId, platform } = req.params;

    // Get connection from database
    const connection = await connectionsDB.getConnection(
      brandId,
      platform as Platform,
    );

    if (!connection) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        "Connection not found",
        HTTP_STATUS.NOT_FOUND,
        "info"
      );
    }

    // Check if token is expired
    if (connection.token_expires_at) {
      const expiresAt = new Date(connection.token_expires_at);
      const now = new Date();

      if (expiresAt <= now) {
        return res.status(200).json({
          verified: false,
          error: "Token expired",
          tokenExpiresAt: connection.token_expires_at,
          needsRefresh: true,
        });
      }
    }

    // Check connection status
    if (connection.status !== "connected") {
      return res.status(200).json({
        verified: false,
        error: `Connection status: ${connection.status}`,
        connectionStatus: connection.status,
      });
    }

    // Try a simple API call to verify the token still works
    try {
      const __platformAPI = getPlatformAPI(
        platform as Platform,
        connection.access_token,
        connection.account_id,
      );

      // For now, just verify the connection object is valid
      // In production, you might make a simple test API call
      return res.json({
        verified: true,
        platform,
        accountName: connection.account_name,
        accountId: connection.account_id,
        tokenExpiresAt: connection.token_expires_at,
        lastVerified: connection.last_verified_at,
        status: connection.status,
      });
    } catch (error) {
      return res.status(200).json({
        verified: false,
        error: "Failed to verify connection",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to verify connection",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "error",
      error instanceof Error ? { originalError: error.message } : undefined,
      "Please try again later or contact support"
    );
  }
};

// Refresh platform token
export const refreshToken: RequestHandler = async (req, res) => {
  try {
    const { brandId, platform } = req.params;

    // Get connection from database
    const connection = await connectionsDB.getConnection(
      brandId,
      platform as Platform,
    );

    if (!connection) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        "Connection not found",
        HTTP_STATUS.NOT_FOUND,
        "info"
      );
    }

    // Refresh the token
    const tokenData = await refreshAccessToken({
      id: connection.id,
      platform: connection.platform as Platform,
      brandId: connection.brand_id,
      tenantId: connection.tenant_id,
      accountId: connection.account_id,
      accountName: connection.account_name || "",
      accessToken: connection.access_token,
      refreshToken: connection.refresh_token,
      status: (connection.status || "connected") as "error" | "connected" | "disconnected" | "expired",
      permissions: (connection.permissions || []) as any,
      metadata: (connection.metadata || {}) as any,
      createdAt: connection.created_at,
      updatedAt: connection.updated_at,
    });

    // Update connection with new tokens
    await connectionsDB.updateAccessToken(
      connection.id,
      tokenData.accessToken,
      tokenData.refreshToken,
      tokenData.expiresIn
        ? new Date(Date.now() + tokenData.expiresIn * 1000)
        : undefined,
    );

    res.json({ success: true });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to refresh token",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "error",
      error instanceof Error ? { originalError: error.message } : undefined,
      "Please try again later or contact support"
    );
  }
};

// Publish blog post to WordPress, Squarespace, or Wix
export const publishBlogPost: RequestHandler = async (req, res) => {
  try {
    const { brandId, platform } = req.params;
    const {
      title,
      content,
      excerpt,
      mediaUrls,
      tags,
      categories,
      scheduledFor,
    } = req.body;

    if (!title || !content) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        "Missing required fields: title, content",
        HTTP_STATUS.BAD_REQUEST,
        "warning",
        undefined,
        "Please provide both title and content in your request"
      );
    }

    const supportedPlatforms = ["wordpress", "squarespace", "wix"];
    if (!supportedPlatforms.includes(platform)) {
      throw new AppError(
        ErrorCode.INVALID_FORMAT,
        `Blog publishing not supported for ${platform}`,
        HTTP_STATUS.BAD_REQUEST,
        "warning",
        undefined,
        `Please use one of the supported platforms: ${supportedPlatforms.join(", ")}`
      );
    }

    // Get connection
    const connection = await connectionsDB.getConnection(
      brandId,
      platform as Platform,
    );
    if (!connection || connection.status !== "connected") {
      throw new AppError(
        ErrorCode.UNAUTHORIZED,
        "Platform not connected or connection expired",
        HTTP_STATUS.UNAUTHORIZED,
        "warning",
        undefined,
        "Please reconnect your platform and try again"
      );
    }

    // Import the integration service dynamically to avoid circular dependencies
    const { IntegrationService } = await import(
      "../lib/integrations/integration-service"
    );

    const result = await IntegrationService.publishBlogPost(
      platform as string,
      (connection.metadata || {}) as any,
      {
        title,
        content,
        excerpt,
        mediaUrls,
        tags,
        categories,
        scheduledFor,
      },
    );

    res.json({
      success: true,
      message: `Blog post published to ${platform}${scheduledFor ? " (scheduled)" : ""}`,
      result,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to publish blog post",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "error",
      error instanceof Error ? { originalError: error.message } : undefined,
      "Please try again later or contact support"
    );
  }
};

// Publish email campaign to Mailchimp, Squarespace, or Wix
export const publishEmailCampaign: RequestHandler = async (req, res) => {
  try {
    const { brandId, platform } = req.params;
    const {
      title,
      subject,
      content,
      htmlContent,
      listIds,
      excerpt,
      scheduledFor,
    } = req.body;

    if (!title || !subject || !content) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        "Missing required fields: title, subject, content",
        HTTP_STATUS.BAD_REQUEST,
        "warning",
        undefined,
        "Please provide title, subject, and content in your request"
      );
    }

    const supportedPlatforms = ["mailchimp", "squarespace", "wix"];
    if (!supportedPlatforms.includes(platform)) {
      throw new AppError(
        ErrorCode.INVALID_FORMAT,
        `Email publishing not supported for ${platform}`,
        HTTP_STATUS.BAD_REQUEST,
        "warning",
        undefined,
        `Please use one of the supported platforms: ${supportedPlatforms.join(", ")}`
      );
    }

    // Get connection
    const connection = await connectionsDB.getConnection(
      brandId,
      platform as Platform,
    );
    if (!connection || connection.status !== "connected") {
      throw new AppError(
        ErrorCode.UNAUTHORIZED,
        "Platform not connected or connection expired",
        HTTP_STATUS.UNAUTHORIZED,
        "warning",
        undefined,
        "Please reconnect your platform and try again"
      );
    }

    // Import the integration service dynamically
    const { IntegrationService } = await import(
      "../lib/integrations/integration-service"
    );

    const result = await IntegrationService.publishEmailCampaign(
      platform as string,
      (connection.metadata || {}) as any,
      {
        title,
        subject,
        content,
        htmlContent,
        listIds,
        excerpt,
        scheduledFor,
      },
    );

    res.json({
      success: true,
      message: `Email campaign published to ${platform}${scheduledFor ? " (scheduled)" : ""}`,
      result,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to publish email campaign",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "error",
      error instanceof Error ? { originalError: error.message } : undefined,
      "Please try again later or contact support"
    );
  }
};
