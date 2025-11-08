/**
 * Event Broadcaster
 *
 * Provides higher-level helper functions for emitting domain-specific events
 * Called by publishing queue, analytics sync, and other business logic
 *
 * This decouples business logic from WebSocket implementation details
 */

import {
  broadcastJobStatusUpdate,
  broadcastAnalyticsSyncProgress,
  broadcastNotificationToUser,
  getWebSocketInstance,
} from "./websocket-server";

// ============ JOB STATUS EVENTS ============

export interface JobStatusUpdatePayload {
  status: "draft" | "pending" | "approved" | "published" | "failed";
  progress?: number; // 0-100
  currentPlatform?: string;
  error?: string;
  details?: Record<string, any>;
}

/**
 * Emit when job is created
 */
export function broadcastJobCreated(
  jobId: string,
  data: {
    brandId: string;
    platforms: string[];
    scheduledAt?: string;
  }
): void {
  broadcastJobStatusUpdate(jobId, {
    status: "draft",
    progress: 0,
    details: data,
    eventType: "job:created",
  });
}

/**
 * Emit when job enters pending state (waiting for approval)
 */
export function broadcastJobPending(
  jobId: string,
  data: {
    brandId: string;
    platforms: string[];
  }
): void {
  broadcastJobStatusUpdate(jobId, {
    status: "pending",
    progress: 10,
    details: data,
    eventType: "job:pending",
  });
}

/**
 * Emit when job is approved
 */
export function broadcastJobApproved(
  jobId: string,
  data: {
    brandId: string;
    approvedBy: string;
  }
): void {
  broadcastJobStatusUpdate(jobId, {
    status: "approved",
    progress: 20,
    details: data,
    eventType: "job:approved",
  });
}

/**
 * Emit when job is publishing (with progress)
 */
export function broadcastJobPublishing(
  jobId: string,
  data: {
    brandId: string;
    currentPlatform: string;
    platformIndex: number;
    totalPlatforms: number;
  }
): void {
  const progress = Math.floor((data.platformIndex / data.totalPlatforms) * 80) + 20;

  broadcastJobStatusUpdate(jobId, {
    status: "approved",
    progress,
    currentPlatform: data.currentPlatform,
    details: data,
    eventType: "job:publishing",
  });
}

/**
 * Emit when job successfully completes
 */
export function broadcastJobCompleted(
  jobId: string,
  data: {
    brandId: string;
    platformsPublished: string[];
    publishedUrls?: Record<string, string>;
  }
): void {
  broadcastJobStatusUpdate(jobId, {
    status: "published",
    progress: 100,
    details: data,
    eventType: "job:completed",
  });
}

/**
 * Emit when job fails
 */
export function broadcastJobFailed(
  jobId: string,
  data: {
    brandId: string;
    error: string;
    failedPlatforms?: string[];
    retryCount?: number;
  }
): void {
  broadcastJobStatusUpdate(jobId, {
    status: "failed",
    progress: 0,
    error: data.error,
    details: data,
    eventType: "job:failed",
  });
}

/**
 * Emit retry attempt
 */
export function broadcastJobRetry(
  jobId: string,
  data: {
    brandId: string;
    retryCount: number;
    nextAttemptAt: string;
  }
): void {
  broadcastJobStatusUpdate(jobId, {
    status: "pending",
    progress: 10,
    details: data,
    eventType: "job:retry",
  });
}

// ============ ANALYTICS SYNC EVENTS ============

export interface AnalyticsSyncProgressPayload {
  platform: string;
  progress: number; // 0-100
  recordsProcessed: number;
  totalRecords?: number;
  currentMetric?: string;
}

/**
 * Emit when analytics sync starts
 */
export function broadcastAnalyticsSyncStarted(
  brandId: string,
  data: {
    syncId: string;
    platform: string;
  }
): void {
  broadcastAnalyticsSyncProgress(brandId, {
    platform: data.platform,
    progress: 0,
    recordsProcessed: 0,
    eventType: "analytics:sync-started",
    syncId: data.syncId,
  });
}

/**
 * Emit analytics sync progress
 */
export function broadcastAnalyticsSyncProgressUpdate(
  brandId: string,
  platform: string,
  progress: AnalyticsSyncProgressPayload
): void {
  broadcastAnalyticsSyncProgress(brandId, {
    platform,
    ...progress,
    eventType: "analytics:sync-progress",
  });
}

/**
 * Emit when analytics sync completes
 */
export function broadcastAnalyticsSyncCompleted(
  brandId: string,
  data: {
    syncId: string;
    platform: string;
    recordsProcessed: number;
    duration: number; // in milliseconds
  }
): void {
  broadcastAnalyticsSyncProgress(brandId, {
    platform: data.platform,
    progress: 100,
    recordsProcessed: data.recordsProcessed,
    eventType: "analytics:sync-completed",
    syncId: data.syncId,
    duration: data.duration,
  });
}

/**
 * Emit when insight generation completes
 */
export function broadcastInsightsGenerated(
  brandId: string,
  data: {
    insightCount: number;
    topInsights: Array<{ title: string; priority: string }>;
  }
): void {
  broadcastAnalyticsSyncProgress(brandId, {
    platform: "insights",
    progress: 100,
    recordsProcessed: data.insightCount,
    eventType: "analytics:insights-generated",
    insightCount: data.insightCount,
    topInsights: data.topInsights,
  });
}

/**
 * Emit when forecast is ready
 */
export function broadcastForecastReady(
  brandId: string,
  data: {
    forecastId: string;
    predictions: number; // number of forecasted data points
    confidence: number; // confidence score 0-1
  }
): void {
  broadcastAnalyticsSyncProgress(brandId, {
    platform: "forecast",
    progress: 100,
    recordsProcessed: data.predictions,
    eventType: "analytics:forecast-ready",
    forecastId: data.forecastId,
    confidence: data.confidence,
  });
}

// ============ NOTIFICATION EVENTS ============

export type NotificationType =
  | "job-completed"
  | "job-failed"
  | "approval-needed"
  | "insight-available"
  | "sync-complete"
  | "alert";

/**
 * Emit notification to specific user
 */
export function broadcastNotification(
  userId: string,
  data: {
    type: NotificationType;
    title: string;
    message: string;
    brandId?: string;
    actionUrl?: string;
    severity?: "info" | "warning" | "error" | "success";
  }
): void {
  broadcastNotificationToUser(userId, {
    type: data.type,
    title: data.title,
    message: data.message,
    brandId: data.brandId,
    actionUrl: data.actionUrl,
    severity: data.severity || "info",
  });
}

/**
 * Broadcast alert to all team members
 */
export function broadcastTeamAlert(
  teamId: string,
  data: {
    title: string;
    message: string;
    severity: "warning" | "error" | "critical";
    actionUrl?: string;
  }
): void {
  const io = getWebSocketInstance();
  io.of("/notifications")
    .to(`team-${teamId}`)
    .emit("team:alert", {
      ...data,
      timestamp: new Date().toISOString(),
    });
}

// ============ BATCH OPERATIONS ============

/**
 * Emit progress for batch job operation
 */
export function broadcastBatchJobProgress(
  batchId: string,
  data: {
    totalJobs: number;
    processedJobs: number;
    successCount: number;
    failureCount: number;
  }
): void {
  const progress = Math.floor((data.processedJobs / data.totalJobs) * 100);

  const io = getWebSocketInstance();
  io.of("/jobs")
    .to(`batch-${batchId}`)
    .emit("batch:progress", {
      batchId,
      ...data,
      progress,
      timestamp: new Date().toISOString(),
    });
}

/**
 * Emit batch operation completion
 */
export function broadcastBatchJobCompleted(
  batchId: string,
  data: {
    totalJobs: number;
    successCount: number;
    failureCount: number;
    failedJobs?: string[];
  }
): void {
  const io = getWebSocketInstance();
  io.of("/jobs")
    .to(`batch-${batchId}`)
    .emit("batch:completed", {
      batchId,
      ...data,
      timestamp: new Date().toISOString(),
    });
}

export default {
  broadcastJobCreated,
  broadcastJobPending,
  broadcastJobApproved,
  broadcastJobPublishing,
  broadcastJobCompleted,
  broadcastJobFailed,
  broadcastJobRetry,
  broadcastAnalyticsSyncStarted,
  broadcastAnalyticsSyncProgressUpdate,
  broadcastAnalyticsSyncCompleted,
  broadcastInsightsGenerated,
  broadcastForecastReady,
  broadcastNotification,
  broadcastTeamAlert,
  broadcastBatchJobProgress,
  broadcastBatchJobCompleted,
};
