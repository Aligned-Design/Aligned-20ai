import { RequestHandler } from 'express';
import crypto from 'crypto';
import {
  Platform,
  PublishRequest,
  PublishResponse,
  PublishingJob,
  PlatformConnection,
  ConnectionStatus,
  OAuthFlow,
  PostContent
} from '@shared/publishing';
import { validatePostContent, validateScheduleTime } from '../lib/platform-validators';
import {
  generateOAuthUrl,
  exchangeCodeForToken,
  refreshAccessToken,
  isTokenExpired
} from '../lib/oauth-manager';
import { publishingQueue } from '../lib/publishing-queue';
import { connectionsDB } from '../lib/connections-db-service';
import { publishingDBService } from '../lib/publishing-db-service';
import { getPlatformAPI } from '../lib/platform-apis';
import { errorFormatter } from '../lib/error-formatter';
import {
  InitiateOAuthSchema,
  PublishContentSchema,
  GetJobsQuerySchema,
  validateQuery
} from '@shared/validation-schemas';

// OAuth initiation
export const initiateOAuth: RequestHandler = async (req, res) => {
  try {
    // ✅ VALIDATED: Request body validated against InitiateOAuthSchema
    const validated = InitiateOAuthSchema.parse(req.body);
    const { platform, brandId } = validated;

    const oauthFlow = generateOAuthUrl(platform, brandId);

    res.json(oauthFlow);
  } catch (error) {
    errorFormatter.sendError(res, error instanceof Error ? error : new Error(String(error)), {
      path: req.path,
      requestId: req.headers['x-request-id'] as string
    });
  }
};

// OAuth callback handler
export const handleOAuthCallback: RequestHandler = async (req, res) => {
  try {
    const { platform } = req.params;
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(`/integrations?error=${encodeURIComponent(error as string)}`);
    }

    if (!code || !state) {
      const errorMsg = 'Missing authorization code or state parameter';
      return res.redirect(`/integrations?error=${encodeURIComponent(errorMsg)}`);
    }

    // ✅ SECURE: exchangeCodeForToken validates state from cache
    const tokenData = await exchangeCodeForToken(
      platform as Platform,
      code as string,
      state as string
    );

    const [stateToken, brandId] = (state as string).split(':');

    // Get tenantId and userId from auth context (in production, from req.user or session)
    const tenantId = (req as any).user?.tenantId || 'tenant-123';
    const userId = (req as any).user?.id;

    // Store connection in database
    await connectionsDB.upsertConnection(
      brandId,
      tenantId,
      platform as Platform,
      tokenData.accessToken,
      tokenData.accountInfo.id,
      tokenData.accountInfo.name || tokenData.accountInfo.username,
      tokenData.accountInfo.picture?.data?.url || tokenData.accountInfo.profile_image_url,
      tokenData.refreshToken,
      tokenData.expiresIn ? new Date(Date.now() + tokenData.expiresIn * 1000) : undefined,
      [], // TODO: Extract permissions from token response
      tokenData.accountInfo,
      userId
    );

    res.redirect('/integrations?success=Connected successfully');
  } catch (error) {
    console.error('OAuth callback error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Connection failed';
    res.redirect(`/integrations?error=${encodeURIComponent(errorMsg)}`);
  }
};

// Get connection status for a brand
export const getConnections: RequestHandler = async (req, res) => {
  try {
    const { brandId } = req.params;

    // Fetch connections from database
    const connections = await connectionsDB.getBrandConnections(brandId);

    // Transform to ConnectionStatus format
    const connectionStatuses: ConnectionStatus[] = connections.map(conn => ({
      platform: conn.platform as Platform,
      connected: conn.status === 'connected',
      accountName: conn.account_name,
      profilePicture: conn.profile_picture,
      tokenExpiry: conn.token_expires_at,
      permissions: conn.permissions || [],
      needsReauth: conn.status === 'expired' || conn.status === 'revoked'
    }));

    res.json(connectionStatuses);
  } catch (error) {
    errorFormatter.sendError(res, error instanceof Error ? error : new Error(String(error)), {
      path: req.path,
      requestId: req.headers['x-request-id'] as string
    });
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
    errorFormatter.sendError(res, error instanceof Error ? error : new Error(String(error)), {
      path: req.path,
      requestId: req.headers['x-request-id'] as string
    });
  }
};

// Publish content
export const publishContent: RequestHandler = async (req, res) => {
  try {
    // ✅ VALIDATED: Request body validated against PublishContentSchema
    const { brandId, platforms, content: contentText, scheduledAt, validateOnly } = PublishContentSchema.parse(req.body);

    const tenantId = (req as any).user?.tenantId || 'tenant-123';
    const userId = (req as any).user?.id;

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
      const hasErrors = platformValidation.some(r => r.status === 'error');
      if (hasErrors && !validateOnly) {
        errors.push(`${platform}: Content validation failed`);
        continue;
      }

      // Validate schedule time if provided
      if (scheduledAt) {
        const scheduleValidation = validateScheduleTime(platform, new Date(scheduledAt));
        validationResults.push(scheduleValidation);

        if (scheduleValidation.status === 'error' && !validateOnly) {
          errors.push(`${platform}: ${scheduleValidation.message}`);
          continue;
        }
      }

      if (!validateOnly) {
        // Create publishing job in database
        const dbJob = await publishingDBService.createPublishingJob(
          brandId,
          tenantId,
          content,
          [platform],
          scheduledAt ? new Date(scheduledAt) : undefined,
          userId
        );

        // Add to in-memory queue for processing
        const job: PublishingJob = {
          id: dbJob.id,
          brandId,
          tenantId,
          postId: dbJob.id,
          platform,
          connectionId: `${platform}-${brandId}`,
          status: 'pending',
          scheduledAt,
          content,
          validationResults: platformValidation,
          retryCount: 0,
          maxRetries: 3,
          createdAt: dbJob.created_at,
          updatedAt: dbJob.updated_at
        };

        jobs.push(job);
        await publishingQueue.addJob(job);
      }
    }

    const response: PublishResponse = {
      success: errors.length === 0,
      jobs,
      validationResults,
      errors: errors.length > 0 ? errors : undefined
    };

    res.json(response);
  } catch (error) {
    errorFormatter.sendError(res, error instanceof Error ? error : new Error(String(error)), {
      path: req.path,
      requestId: req.headers['x-request-id'] as string
    });
  }
};

// Get publishing jobs from database (persistent, includes historical jobs)
export const getPublishingJobs: RequestHandler = async (req, res) => {
  try {
    const { brandId } = req.params;
    // ✅ VALIDATED: Query parameters validated against GetJobsQuerySchema
    const { status, platform, limit, offset } = validateQuery(GetJobsQuerySchema, req.query);

    // Fetch from database for persistence across server restarts
    const { jobs, total } = await publishingDBService.getJobHistory(
      brandId,
      limit,
      offset
    );

    // Filter by platform if specified
    let filteredJobs = jobs;
    if (platform && platform !== 'all') {
      filteredJobs = jobs.filter(job => job.platforms?.includes(platform as string));
    }

    // Filter by brand
    filteredJobs = filteredJobs.filter(job => job.brand_id === brandId);

    // Transform database records to PublishingJob format
    const publishingJobs: PublishingJob[] = filteredJobs.map(job => ({
      id: job.id,
      brandId: job.brand_id,
      tenantId: job.tenant_id,
      postId: job.id,
      platform: (job.platforms?.[0] || 'instagram') as Platform,
      connectionId: `${job.platforms?.[0]}-${job.brand_id}`,
      status: job.status as any,
      scheduledAt: job.scheduled_at,
      publishedAt: job.published_at,
      platformPostId: undefined,
      platformUrl: undefined,
      content: job.content,
      validationResults: job.validation_results || [],
      retryCount: job.retry_count || 0,
      maxRetries: job.max_retries || 3,
      lastError: job.last_error,
      errorDetails: job.last_error_details,
      createdAt: job.created_at,
      updatedAt: job.updated_at
    }));

    res.json({
      jobs: publishingJobs,
      total,
      limit,
      offset
    });
  } catch (error) {
    errorFormatter.sendError(res, error instanceof Error ? error : new Error(String(error)), {
      path: req.path,
      requestId: req.headers['x-request-id'] as string
    });
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
      errorFormatter.sendError(res, new Error('Job cannot be retried'), {
        path: req.path,
        requestId: req.headers['x-request-id'] as string
      });
    }
  } catch (error) {
    errorFormatter.sendError(res, error instanceof Error ? error : new Error(String(error)), {
      path: req.path,
      requestId: req.headers['x-request-id'] as string
    });
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
      errorFormatter.sendError(res, new Error('Job cannot be cancelled'), {
        path: req.path,
        requestId: req.headers['x-request-id'] as string
      });
    }
  } catch (error) {
    errorFormatter.sendError(res, error instanceof Error ? error : new Error(String(error)), {
      path: req.path,
      requestId: req.headers['x-request-id'] as string
    });
  }
};

// Verify a platform connection is still valid
export const verifyConnection: RequestHandler = async (req, res) => {
  try {
    const { brandId, platform } = req.params;

    // Get connection from database
    const connection = await connectionsDB.getConnection(brandId, platform as Platform);

    if (!connection) {
      return res.status(404).json({
        verified: false,
        error: 'Connection not found'
      });
    }

    // Check if token is expired
    if (connection.token_expires_at) {
      const expiresAt = new Date(connection.token_expires_at);
      const now = new Date();

      if (expiresAt <= now) {
        return res.status(200).json({
          verified: false,
          error: 'Token expired',
          tokenExpiresAt: connection.token_expires_at,
          needsRefresh: true
        });
      }
    }

    // Check connection status
    if (connection.status !== 'connected') {
      return res.status(200).json({
        verified: false,
        error: `Connection status: ${connection.status}`,
        connectionStatus: connection.status
      });
    }

    // Try a simple API call to verify the token still works
    try {
      const platformAPI = getPlatformAPI(platform as Platform, connection.access_token, connection.account_id);

      // For now, just verify the connection object is valid
      // In production, you might make a simple test API call
      return res.json({
        verified: true,
        platform,
        accountName: connection.account_name,
        accountId: connection.account_id,
        tokenExpiresAt: connection.token_expires_at,
        lastVerified: connection.last_verified_at,
        status: connection.status
      });
    } catch (error) {
      return res.status(200).json({
        verified: false,
        error: 'Failed to verify connection',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } catch (error) {
    errorFormatter.sendError(res, error instanceof Error ? error : new Error(String(error)), {
      path: req.path,
      requestId: req.headers['x-request-id'] as string
    });
  }
};

// Refresh platform token
export const refreshToken: RequestHandler = async (req, res) => {
  try {
    const { brandId, platform } = req.params;

    // Get connection from database
    const connection = await connectionsDB.getConnection(brandId, platform as Platform);

    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    // Refresh the token
    const tokenData = await refreshAccessToken({
      id: connection.id,
      platform: connection.platform as Platform,
      brandId: connection.brand_id,
      tenantId: connection.tenant_id,
      accountId: connection.account_id,
      accountName: connection.account_name || '',
      accessToken: connection.access_token,
      refreshToken: connection.refresh_token,
      status: connection.status as any,
      permissions: connection.permissions || [],
      metadata: connection.metadata,
      createdAt: connection.created_at,
      updatedAt: connection.updated_at
    });

    // Update connection with new tokens
    await connectionsDB.updateAccessToken(
      connection.id,
      tokenData.accessToken,
      tokenData.refreshToken,
      tokenData.expiresIn ? new Date(Date.now() + tokenData.expiresIn * 1000) : undefined
    );

    res.json({ success: true });
  } catch (error) {
    errorFormatter.sendError(res, error instanceof Error ? error : new Error(String(error)), {
      path: req.path,
      requestId: req.headers['x-request-id'] as string
    });
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
      scheduledFor
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: 'Missing required fields: title, content'
      });
    }

    const supportedPlatforms = ['wordpress', 'squarespace', 'wix'];
    if (!supportedPlatforms.includes(platform)) {
      return res.status(400).json({
        error: `Blog publishing not supported for ${platform}`
      });
    }

    // Get connection
    const connection = await connectionsDB.getConnection(brandId, platform as Platform);
    if (!connection || connection.status !== 'connected') {
      return res.status(401).json({
        error: 'Platform not connected or connection expired'
      });
    }

    // Import the integration service dynamically to avoid circular dependencies
    const { IntegrationService } = await import('../lib/integrations/integration-service');

    const result = await IntegrationService.publishBlogPost(
      platform as any,
      connection.metadata || {},
      {
        title,
        content,
        excerpt,
        mediaUrls,
        tags,
        categories,
        scheduledFor
      }
    );

    res.json({
      success: true,
      message: `Blog post published to ${platform}${scheduledFor ? ' (scheduled)' : ''}`,
      result
    });
  } catch (error) {
    errorFormatter.sendError(res, error instanceof Error ? error : new Error(String(error)), {
      path: req.path,
      requestId: req.headers['x-request-id'] as string
    });
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
      scheduledFor
    } = req.body;

    if (!title || !subject || !content) {
      return res.status(400).json({
        error: 'Missing required fields: title, subject, content'
      });
    }

    const supportedPlatforms = ['mailchimp', 'squarespace', 'wix'];
    if (!supportedPlatforms.includes(platform)) {
      return res.status(400).json({
        error: `Email publishing not supported for ${platform}`
      });
    }

    // Get connection
    const connection = await connectionsDB.getConnection(brandId, platform as Platform);
    if (!connection || connection.status !== 'connected') {
      return res.status(401).json({
        error: 'Platform not connected or connection expired'
      });
    }

    // Import the integration service dynamically
    const { IntegrationService } = await import('../lib/integrations/integration-service');

    const result = await IntegrationService.publishEmailCampaign(
      platform as any,
      connection.metadata || {},
      {
        title,
        subject,
        content,
        htmlContent,
        listIds,
        excerpt,
        scheduledFor
      }
    );

    res.json({
      success: true,
      message: `Email campaign published to ${platform}${scheduledFor ? ' (scheduled)' : ''}`,
      result
    });
  } catch (error) {
    errorFormatter.sendError(res, error instanceof Error ? error : new Error(String(error)), {
      path: req.path,
      requestId: req.headers['x-request-id'] as string
    });
  }
};
