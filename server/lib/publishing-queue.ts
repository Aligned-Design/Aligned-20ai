import { PublishingJob, Platform, PostContent, JobStatusUpdate } from '@shared/publishing';
import { validatePostContent } from './platform-validators';

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
    // TODO: Implement Instagram publishing via Graph API
    // This is a simplified mock implementation
    
    const delay = Math.random() * 2000 + 1000; // 1-3 seconds
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Simulate occasional failures for testing
    if (Math.random() < 0.1) {
      throw new Error('Instagram API rate limit exceeded');
    }
    
    return {
      success: true,
      platformPostId: `ig_${Date.now()}`,
      platformUrl: `https://instagram.com/p/mock_${job.id}`
    };
  }

  private async publishToFacebook(job: PublishingJob): Promise<PublishResult> {
    // TODO: Implement Facebook publishing via Graph API
    const delay = Math.random() * 1500 + 500;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    if (Math.random() < 0.05) {
      throw new Error('Facebook connection expired');
    }
    
    return {
      success: true,
      platformPostId: `fb_${Date.now()}`,
      platformUrl: `https://facebook.com/posts/mock_${job.id}`
    };
  }

  private async publishToLinkedIn(job: PublishingJob): Promise<PublishResult> {
    // TODO: Implement LinkedIn publishing via API
    const delay = Math.random() * 2500 + 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return {
      success: true,
      platformPostId: `li_${Date.now()}`,
      platformUrl: `https://linkedin.com/posts/mock_${job.id}`
    };
  }

  private async publishToTwitter(job: PublishingJob): Promise<PublishResult> {
    // TODO: Implement Twitter publishing via API v2
    const delay = Math.random() * 1000 + 500;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    if (Math.random() < 0.08) {
      throw new Error('Tweet contains prohibited content');
    }
    
    return {
      success: true,
      platformPostId: `tw_${Date.now()}`,
      platformUrl: `https://twitter.com/status/mock_${job.id}`
    };
  }

  private async publishToGoogleBusiness(job: PublishingJob): Promise<PublishResult> {
    // TODO: Implement Google Business Posts via My Business API
    const delay = Math.random() * 3000 + 1500;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return {
      success: true,
      platformPostId: `gbp_${Date.now()}`,
      platformUrl: `https://business.google.com/posts/mock_${job.id}`
    };
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

    // TODO: Persist to database
    // await db.publishingJobs.update(jobId, job);

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
