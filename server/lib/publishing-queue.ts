import { PublishingJob, Platform, PostContent, JobStatusUpdate } from '@shared/publishing';
import { validatePostContent } from './platform-validators';
import { connectionsDB } from './connections-db-service';
import { publishingDBService } from './publishing-db-service';
import { getPlatformAPI } from './platform-apis';

interface PublishResult {
  success: boolean;
  platformPostId?: string;
  platformUrl?: string;
  error?: string;
  errorDetails?: any;
}

export class PublishingQueue {
  private jobs = new Map<string, PublishingJob>();
  private processing = new Set<string>();

  async addJob(job: PublishingJob): Promise<void> {
    // Validate content before adding to queue
    const validationResults = validatePostContent(job.platform, job.content);
    const hasErrors = validationResults.some(r => r.status === 'error');
    
    if (hasErrors) {
      job.status = 'failed';
      job.lastError = 'Content validation failed';
      job.validationResults = validationResults;
    }
    
    this.jobs.set(job.id, job);
    
    if (job.status === 'pending') {
      this.processJob(job.id);
    }
  }

  async processJob(jobId: string): Promise<void> {
    if (this.processing.has(jobId)) {
      return; // Already processing
    }

    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'pending') {
      return;
    }

    this.processing.add(jobId);
    
    try {
      // Update status to processing
      await this.updateJobStatus(jobId, { status: 'processing' });

      // Check if scheduled for future
      if (job.scheduledAt && new Date(job.scheduledAt) > new Date()) {
        // Schedule for later processing
        const delay = new Date(job.scheduledAt).getTime() - Date.now();
        setTimeout(() => this.processJob(jobId), delay);
        this.processing.delete(jobId);
        return;
      }

      // Publish to platform
      const result = await this.publishToPlatform(job);
      
      if (result.success) {
        await this.updateJobStatus(jobId, {
          status: 'published',
          platformPostId: result.platformPostId,
          platformUrl: result.platformUrl,
          publishedAt: new Date().toISOString()
        });
      } else {
        await this.handleJobFailure(jobId, result.error || 'Unknown error', result.errorDetails);
      }
    } catch (error) {
      await this.handleJobFailure(jobId, error instanceof Error ? error.message : 'Processing error');
    } finally {
      this.processing.delete(jobId);
    }
  }

  private async publishToPlatform(job: PublishingJob): Promise<PublishResult> {
    try {
      switch (job.platform) {
        case 'instagram':
          return await this.publishToInstagram(job);
        case 'facebook':
          return await this.publishToFacebook(job);
        case 'linkedin':
          return await this.publishToLinkedIn(job);
        case 'twitter':
          return await this.publishToTwitter(job);
        case 'google_business':
          return await this.publishToGoogleBusiness(job);
        default:
          throw new Error(`Unsupported platform: ${job.platform}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Publishing failed',
        errorDetails: error
      };
    }
  }

  private async publishToInstagram(job: PublishingJob): Promise<PublishResult> {
    try {
      // Get connection from database
      const connection = await connectionsDB.getConnection(job.brandId, 'instagram');
      if (!connection) {
        throw new Error('Instagram account not connected');
      }

      if (connection.status !== 'connected') {
        throw new Error(`Instagram connection status: ${connection.status}`);
      }

      // Get Instagram API client
      const instagramAPI = getPlatformAPI('instagram', connection.access_token, connection.account_id);

      // Publish to Instagram
      const result = await instagramAPI.publishPost(job.content);

      if (result.success) {
        // Create audit log entry
        await publishingDBService.createPublishingLog(
          job.id,
          job.brandId,
          'instagram',
          'published',
          1,
          {
            platformPostId: result.platformPostId,
            platformPostUrl: result.platformUrl,
            contentSnapshot: job.content
          }
        );

        return result;
      } else {
        // Log failure
        await publishingDBService.createPublishingLog(
          job.id,
          job.brandId,
          'instagram',
          'failed',
          1,
          {
            errorCode: result.errorCode,
            errorMessage: result.error,
            contentSnapshot: job.content
          }
        );

        throw new Error(result.error || 'Instagram publish failed');
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Instagram publishing failed',
        errorDetails: error
      };
    }
  }

  private async publishToFacebook(job: PublishingJob): Promise<PublishResult> {
    try {
      // Get connection from database
      const connection = await connectionsDB.getConnection(job.brandId, 'facebook');
      if (!connection) {
        throw new Error('Facebook account not connected');
      }

      if (connection.status !== 'connected') {
        throw new Error(`Facebook connection status: ${connection.status}`);
      }

      // Get Facebook API client
      const facebookAPI = getPlatformAPI('facebook', connection.access_token, connection.account_id);

      // Publish to Facebook
      const result = await facebookAPI.publishPost(job.content);

      if (result.success) {
        // Create audit log entry
        await publishingDBService.createPublishingLog(
          job.id,
          job.brandId,
          'facebook',
          'published',
          1,
          {
            platformPostId: result.platformPostId,
            platformPostUrl: result.platformUrl,
            contentSnapshot: job.content
          }
        );

        return result;
      } else {
        // Log failure
        await publishingDBService.createPublishingLog(
          job.id,
          job.brandId,
          'facebook',
          'failed',
          1,
          {
            errorCode: result.errorCode,
            errorMessage: result.error,
            contentSnapshot: job.content
          }
        );

        throw new Error(result.error || 'Facebook publish failed');
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Facebook publishing failed',
        errorDetails: error
      };
    }
  }

  private async publishToLinkedIn(job: PublishingJob): Promise<PublishResult> {
    try {
      // Get connection from database
      const connection = await connectionsDB.getConnection(job.brandId, 'linkedin');
      if (!connection) {
        throw new Error('LinkedIn account not connected');
      }

      if (connection.status !== 'connected') {
        throw new Error(`LinkedIn connection status: ${connection.status}`);
      }

      // Get LinkedIn API client
      const linkedinAPI = getPlatformAPI('linkedin', connection.access_token, connection.account_id);

      // Publish to LinkedIn
      const result = await linkedinAPI.publishPost(job.content);

      if (result.success) {
        // Create audit log entry
        await publishingDBService.createPublishingLog(
          job.id,
          job.brandId,
          'linkedin',
          'published',
          1,
          {
            platformPostId: result.platformPostId,
            platformPostUrl: result.platformUrl,
            contentSnapshot: job.content
          }
        );

        return result;
      } else {
        // Log failure
        await publishingDBService.createPublishingLog(
          job.id,
          job.brandId,
          'linkedin',
          'failed',
          1,
          {
            errorCode: result.errorCode,
            errorMessage: result.error,
            contentSnapshot: job.content
          }
        );

        throw new Error(result.error || 'LinkedIn publish failed');
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'LinkedIn publishing failed',
        errorDetails: error
      };
    }
  }

  private async publishToTwitter(job: PublishingJob): Promise<PublishResult> {
    try {
      // Get connection from database
      const connection = await connectionsDB.getConnection(job.brandId, 'twitter');
      if (!connection) {
        throw new Error('Twitter account not connected');
      }

      if (connection.status !== 'connected') {
        throw new Error(`Twitter connection status: ${connection.status}`);
      }

      // Get Twitter API client
      const twitterAPI = getPlatformAPI('twitter', connection.access_token, connection.account_id);

      // Publish to Twitter
      const result = await twitterAPI.publishPost(job.content);

      if (result.success) {
        // Create audit log entry
        await publishingDBService.createPublishingLog(
          job.id,
          job.brandId,
          'twitter',
          'published',
          1,
          {
            platformPostId: result.platformPostId,
            platformPostUrl: result.platformUrl,
            contentSnapshot: job.content
          }
        );

        return result;
      } else {
        // Log failure
        await publishingDBService.createPublishingLog(
          job.id,
          job.brandId,
          'twitter',
          'failed',
          1,
          {
            errorCode: result.errorCode,
            errorMessage: result.error,
            contentSnapshot: job.content
          }
        );

        throw new Error(result.error || 'Twitter publish failed');
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Twitter publishing failed',
        errorDetails: error
      };
    }
  }

  private async publishToGoogleBusiness(job: PublishingJob): Promise<PublishResult> {
    try {
      // Get connection from database
      const connection = await connectionsDB.getConnection(job.brandId, 'google_business');
      if (!connection) {
        throw new Error('Google Business Profile not connected');
      }

      if (connection.status !== 'connected') {
        throw new Error(`Google Business connection status: ${connection.status}`);
      }

      // Get Google Business API client
      const googleAPI = getPlatformAPI('google_business', connection.access_token, connection.account_id);

      // Publish to Google Business
      const result = await googleAPI.publishPost(job.content);

      if (result.success) {
        // Create audit log entry
        await publishingDBService.createPublishingLog(
          job.id,
          job.brandId,
          'google_business',
          'published',
          1,
          {
            platformPostId: result.platformPostId,
            platformPostUrl: result.platformUrl,
            contentSnapshot: job.content
          }
        );

        return result;
      } else {
        // Log failure
        await publishingDBService.createPublishingLog(
          job.id,
          job.brandId,
          'google_business',
          'failed',
          1,
          {
            errorCode: result.errorCode,
            errorMessage: result.error,
            contentSnapshot: job.content
          }
        );

        throw new Error(result.error || 'Google Business publish failed');
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Google Business publishing failed',
        errorDetails: error
      };
    }
  }

  private async handleJobFailure(jobId: string, error: string, errorDetails?: any): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.retryCount++;
    job.lastError = error;
    job.errorDetails = errorDetails;

    if (job.retryCount < job.maxRetries) {
      // Schedule retry with exponential backoff
      const retryDelay = Math.min(1000 * Math.pow(2, job.retryCount), 30000); // Max 30 seconds
      
      setTimeout(() => {
        job.status = 'pending';
        this.processJob(jobId);
      }, retryDelay);
    } else {
      job.status = 'failed';
    }

    await this.updateJobStatus(jobId, {
      status: job.status,
      error: error
    });
  }

  private async updateJobStatus(jobId: string, update: Partial<JobStatusUpdate>): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    Object.assign(job, update);
    job.updatedAt = new Date().toISOString();

    // Persist to database
    try {
      await publishingDBService.updateJobStatus(jobId, update.status as any);
    } catch (error) {
      console.error(`Failed to update job status in database: ${error}`);
    }

    // Emit status update event
    this.emitStatusUpdate(job);
  }

  private emitStatusUpdate(job: PublishingJob): void {
    // TODO: Implement WebSocket or SSE for real-time updates
    console.log(`Job ${job.id} status: ${job.status}`);
  }

  getJob(jobId: string): PublishingJob | undefined {
    return this.jobs.get(jobId);
  }

  getJobsByBrand(brandId: string): PublishingJob[] {
    return Array.from(this.jobs.values()).filter(job => job.brandId === brandId);
  }

  async cancelJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job || job.status === 'published' || job.status === 'processing') {
      return false;
    }

    await this.updateJobStatus(jobId, { status: 'cancelled' });
    return true;
  }

  async retryJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'failed') {
      return false;
    }

    job.retryCount = 0;
    await this.updateJobStatus(jobId, { status: 'pending' });
    this.processJob(jobId);
    return true;
  }
}

// Singleton instance
export const publishingQueue = new PublishingQueue();
