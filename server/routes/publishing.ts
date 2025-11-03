import { RequestHandler } from 'express';
import crypto from 'crypto';
import { 
  Platform, 
  PublishRequest, 
  PublishResponse, 
  PublishingJob, 
  PlatformConnection,
  ConnectionStatus,
  OAuthFlow
} from '@shared/publishing';
import { validatePostContent, validateScheduleTime } from '../lib/platform-validators';
import { 
  generateOAuthUrl, 
  exchangeCodeForToken, 
  refreshAccessToken, 
  isTokenExpired 
} from '../lib/oauth-manager';
import { publishingQueue } from '../lib/publishing-queue';

// OAuth initiation
export const initiateOAuth: RequestHandler = async (req, res) => {
  try {
    const { platform, brandId } = req.body;

    if (!platform || !brandId) {
      return res.status(400).json({ error: 'Platform and brandId required' });
    }

    const oauthFlow = generateOAuthUrl(platform as Platform, brandId);

    res.json(oauthFlow);
  } catch (error) {
    console.error('OAuth initiation error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to initiate OAuth'
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
      return res.redirect('/integrations?error=Missing authorization code');
    }

    const tokenData = await exchangeCodeForToken(
      platform as Platform, 
      code as string, 
      state as string
    );

    const [stateToken, brandId] = (state as string).split(':');

    // Create connection record
    const connection: PlatformConnection = {
      id: crypto.randomUUID(),
      platform: platform as Platform,
      brandId,
      tenantId: 'tenant-123', // TODO: Get from session/auth
      accountId: tokenData.accountInfo.id,
      accountName: tokenData.accountInfo.name || tokenData.accountInfo.username,
      profilePicture: tokenData.accountInfo.picture?.data?.url || tokenData.accountInfo.profile_image_url,
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      tokenExpiresAt: tokenData.expiresIn 
        ? new Date(Date.now() + tokenData.expiresIn * 1000).toISOString()
        : undefined,
      status: 'connected',
      permissions: [], // TODO: Extract from token response
      metadata: tokenData.accountInfo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // TODO: Store connection in database
    // await db.connections.upsert(connection);

    res.redirect('/integrations?success=Connected successfully');
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(`/integrations?error=${encodeURIComponent('Connection failed')}`);
  }
};

// Get connection status for a brand
export const getConnections: RequestHandler = async (req, res) => {
  try {
    const { brandId } = req.params;

    // TODO: Fetch from database
    // const connections = await db.connections.findByBrandId(brandId);
    
    // Mock data for now
    const connections: ConnectionStatus[] = [
      {
        platform: 'instagram',
        connected: true,
        accountName: '@mybrand',
        profilePicture: 'https://example.com/avatar.jpg',
        tokenExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        permissions: ['user_profile', 'user_media'],
        needsReauth: false
      },
      {
        platform: 'facebook',
        connected: false,
        needsReauth: false,
        permissions: []
      }
    ];

    res.json(connections);
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get connections'
    });
  }
};

// Disconnect a platform
export const disconnectPlatform: RequestHandler = async (req, res) => {
  try {
    const { brandId, platform } = req.params;

    // TODO: Update connection status in database
    // await db.connections.update({ brandId, platform }, { status: 'disconnected' });

    res.json({ success: true });
  } catch (error) {
    console.error('Disconnect error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to disconnect'
    });
  }
};

// Publish content
export const publishContent: RequestHandler = async (req, res) => {
  try {
    const { brandId, platforms, content, scheduledAt, validateOnly }: PublishRequest = req.body;

    if (!brandId || !platforms || !content) {
      return res.status(400).json({ error: 'brandId, platforms, and content required' });
    }

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
        // Create publishing job
        const job: PublishingJob = {
          id: crypto.randomUUID(),
          brandId,
          tenantId: 'tenant-123', // TODO: Get from auth
          postId: crypto.randomUUID(),
          platform,
          connectionId: `conn-${platform}-${brandId}`, // TODO: Get actual connection ID
          status: 'pending',
          scheduledAt,
          content,
          validationResults: platformValidation,
          retryCount: 0,
          maxRetries: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
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
    console.error('Publish error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to publish content'
    });
  }
};

// Get publishing jobs
export const getPublishingJobs: RequestHandler = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { status, platform, limit = 50 } = req.query;

    let jobs = publishingQueue.getJobsByBrand(brandId);

    // Filter by status
    if (status && status !== 'all') {
      jobs = jobs.filter(job => job.status === status);
    }

    // Filter by platform
    if (platform && platform !== 'all') {
      jobs = jobs.filter(job => job.platform === platform);
    }

    // Limit results
    jobs = jobs.slice(0, Number(limit));

    // Sort by creation date (newest first)
    jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(jobs);
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get publishing jobs'
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
      res.status(400).json({ error: 'Job cannot be retried' });
    }
  } catch (error) {
    console.error('Retry job error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to retry job'
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
      res.status(400).json({ error: 'Job cannot be cancelled' });
    }
  } catch (error) {
    console.error('Cancel job error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to cancel job'
    });
  }
};

// Refresh platform token
export const refreshToken: RequestHandler = async (req, res) => {
  try {
    const { brandId, platform } = req.params;

    // TODO: Get connection from database
    // const connection = await db.connections.findOne({ brandId, platform });
    
    // Mock connection for now
    const connection: PlatformConnection = {
      id: 'mock-id',
      platform: platform as Platform,
      brandId,
      tenantId: 'tenant-123',
      accountId: 'account-123',
      accountName: 'Mock Account',
      accessToken: 'old-token',
      refreshToken: 'refresh-token',
      status: 'connected',
      permissions: [],
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    const tokenData = await refreshAccessToken(connection);

    // Update connection with new tokens
    connection.accessToken = tokenData.accessToken;
    if (tokenData.refreshToken) {
      connection.refreshToken = tokenData.refreshToken;
    }
    if (tokenData.expiresIn) {
      connection.tokenExpiresAt = new Date(Date.now() + tokenData.expiresIn * 1000).toISOString();
    }
    connection.status = 'connected';
    connection.updatedAt = new Date().toISOString();

    // TODO: Save updated connection
    // await db.connections.update(connection.id, connection);

    res.json({ success: true });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to refresh token'
    });
  }
};
