import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";

// Import route routers
import agentsRouter from "./routes/agents";
import aiMetricsRouter from "./routes/ai-metrics";
import builderRouter from "./routes/builder-router";
import crawlerRouter from "./routes/crawler";
import escalationsRouter from "./routes/escalations";
import integrationsRouter from "./routes/integrations";
import mediaManagementRouter from "./routes/media-management";
import publishingRouter from "./routes/publishing-router";
import orchestrationRouter from "./routes/orchestration";
import milestonesRouter from "./routes/milestones";
import trialRouter from "./routes/trial";
import billingRouter from "./routes/billing";
import billingReactivationRouter from "./routes/billing-reactivation";
import stripeWebhookRouter from "./routes/webhooks/stripe";

// Import route handlers
import {
  generateContent as generateAIContent,
  generateDesign,
  getProviders as getAIProviders,
} from "./routes/ai-generation";
import {
  generateContent as generateBuilderContent,
  builderWebhook,
} from "./routes/builder";
import {
  getAnalytics,
  getInsights,
  getForecast,
  processVoiceQuery,
  provideFeedback,
  getGoals,
  createGoal,
  syncPlatformData,
  addOfflineMetric,
  getEngagementHeatmap,
  getAlerts,
  acknowledgeAlert,
} from "./routes/analytics";
import {
  bulkApproveContent,
  approveSingleContent,
  rejectContent,
  getApprovalHistory,
  requestApproval,
  getPendingApprovals,
  sendApprovalReminder,
} from "./routes/approvals";
import {
  getAuditLogs,
  getPostAuditLog,
  getAuditStats,
  exportAuditLogsHandler,
  searchAuditLogs,
  getAuditActions,
} from "./routes/audit";
import {
  getBrandIntelligence,
  submitRecommendationFeedback,
} from "./routes/brand-intelligence";
import {
  bulkApproveOrReject,
  getApprovalStatus,
  getBatchApprovalStatus,
  lockPostsAfterApproval,
} from "./routes/bulk-approvals";
import {
  getClientDashboard,
  approveContent as approveClientContent,
  rejectContent as rejectClientContent,
  addContentComment,
  getContentComments,
  uploadClientMedia,
  getClientMedia,
  getPortalContent,
  getContentWithComments,
} from "./routes/client-portal";
import {
  getClientSettings,
  updateClientSettings,
  updateEmailPreferences,
  generateUnsubscribeLink,
  unsubscribeFromEmails,
  resubscribeToEmails,
  verifyUnsubscribeToken,
} from "./routes/client-settings";
import {
  uploadMedia,
  listMedia,
  getStorageUsage,
  getAssetUrl,
  checkDuplicateAsset,
  generateSEOMetadataRoute,
  trackAssetUsage,
} from "./routes/media";
import {
  getPreferences,
  updatePreferences,
  exportPreferences,
} from "./routes/preferences";
import {
  initiateOAuth,
  handleOAuthCallback,
  getConnections,
  disconnectPlatform,
  publishContent,
  getPublishingJobs,
  retryJob,
  cancelJob,
  verifyConnection,
  refreshToken,
  publishBlogPost,
  publishEmailCampaign,
} from "./routes/publishing";
import {
  handleZapierWebhook,
  handleMakeWebhook,
  handleSlackWebhook,
  handleHubSpotWebhook,
  getWebhookStatus,
  getWebhookLogs,
  retryWebhookEvent,
} from "./routes/webhooks";
import {
  getWhiteLabelConfig,
  getConfigByDomain,
  updateWhiteLabelConfig,
} from "./routes/white-label";
import {
  getWorkflowTemplates,
  createWorkflowTemplate,
  startWorkflow,
  processWorkflowAction,
  getWorkflowNotifications,
  markNotificationRead,
  cancelWorkflow,
  getWorkflow,
  getWorkflowsForContent,
} from "./routes/workflow";

export function createServer() {
  const app = express();

  // Middleware
  // ✅ SECURE: CORS restricted to production domain
  // Development allows localhost, production allows configured domain only
  const corsOptions = {
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.VITE_APP_URL
        : [
            "http://localhost:5173",
            "http://localhost:8080",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:8080",
          ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 200,
  };
  app.use(cors(corsOptions));

  // ✅ SECURE: Security headers
  app.use((_req, res, next) => {
    // Prevent clickjacking attacks
    res.setHeader("X-Frame-Options", "DENY");
    // Prevent MIME type sniffing
    res.setHeader("X-Content-Type-Options", "nosniff");
    // Enable XSS protection in older browsers
    res.setHeader("X-XSS-Protection", "1; mode=block");
    // Prevent referrer leakage
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    // Content Security Policy
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' cdn.example.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;",
    );
    // HSTS (HTTP Strict Transport Security) - only for production
    if (process.env.NODE_ENV === "production") {
      res.setHeader(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload",
      );
    }
    next();
  });

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoints
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Basic ping endpoint
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "pong";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Register route routers
  app.use("/api/agents", agentsRouter);
  app.use("/api/ai-metrics", aiMetricsRouter);
  app.use("/api/builder", builderRouter);
  app.use("/api/crawler", crawlerRouter);
  app.use("/api/escalations", escalationsRouter);
  app.use("/api/integrations", integrationsRouter);
  app.use("/api/media-management", mediaManagementRouter);
  app.use("/api/publishing", publishingRouter);
  app.use("/api/orchestration", orchestrationRouter);
  app.use("/api/milestones", milestonesRouter);
  app.use("/api/trial", trialRouter);
  app.use("/api/billing", billingRouter);
  app.use("/api/billing", billingReactivationRouter);
  app.use("/api/webhooks/stripe", stripeWebhookRouter);

  // Register individual route handlers with appropriate paths

  // AI Generation routes
  app.post("/api/ai/generate/content", generateAIContent);
  app.post("/api/ai/generate/design", generateDesign);
  app.get("/api/ai/providers", getAIProviders);
  app.post("/api/ai/generate", generateBuilderContent);
  app.post("/api/ai/webhook", builderWebhook);

  // Analytics routes
  app.get("/api/analytics/:brandId", getAnalytics);
  app.get("/api/analytics/:brandId/insights", getInsights);
  app.get("/api/analytics/:brandId/forecast", getForecast);
  app.post("/api/analytics/:brandId/voice-query", processVoiceQuery);
  app.post("/api/analytics/:brandId/feedback", provideFeedback);
  app.get("/api/analytics/:brandId/goals", getGoals);
  app.post("/api/analytics/:brandId/goals", createGoal);
  app.post("/api/analytics/:brandId/sync", syncPlatformData);
  app.post("/api/analytics/:brandId/offline-metric", addOfflineMetric);
  app.get("/api/analytics/:brandId/heatmap", getEngagementHeatmap);
  app.get("/api/analytics/:brandId/alerts", getAlerts);
  app.post(
    "/api/analytics/:brandId/alerts/:alertId/acknowledge",
    acknowledgeAlert,
  );

  // Approvals routes
  app.post("/api/approvals/bulk", bulkApproveContent);
  app.post("/api/approvals/single", approveSingleContent);
  app.post("/api/approvals/reject", rejectContent);
  app.get("/api/approvals/history/:brandId", getApprovalHistory);
  app.post("/api/approvals/request", requestApproval);
  app.get("/api/approvals/pending/:brandId", getPendingApprovals);
  app.post("/api/approvals/:approvalId/remind", sendApprovalReminder);

  // Audit routes
  app.get("/api/audit/logs/:brandId", getAuditLogs);
  app.get("/api/audit/logs/post/:postId", getPostAuditLog);
  app.get("/api/audit/stats/:brandId", getAuditStats);
  app.get("/api/audit/export/:brandId", exportAuditLogsHandler);
  app.post("/api/audit/search/:brandId", searchAuditLogs);
  app.get("/api/audit/actions/:brandId", getAuditActions);

  // Brand Intelligence routes
  app.get("/api/brand-intelligence/:brandId", getBrandIntelligence);
  app.post(
    "/api/brand-intelligence/:brandId/feedback",
    submitRecommendationFeedback,
  );

  // Bulk Approvals routes
  app.post("/api/bulk-approvals", bulkApproveOrReject);
  app.get("/api/bulk-approvals/:contentId/status", getApprovalStatus);
  app.get("/api/bulk-approvals/batch/:batchId/status", getBatchApprovalStatus);
  app.post("/api/bulk-approvals/:contentId/lock", lockPostsAfterApproval);

  // Client Portal routes
  app.get("/api/client-portal/:clientId/dashboard", getClientDashboard);
  app.post("/api/client-portal/approve/:contentId", approveClientContent);
  app.post("/api/client-portal/reject/:contentId", rejectClientContent);
  app.post("/api/client-portal/comments/:contentId", addContentComment);
  app.get("/api/client-portal/comments/:contentId", getContentComments);
  app.post("/api/client-portal/media/upload", uploadClientMedia);
  app.get("/api/client-portal/:clientId/media", getClientMedia);
  app.get("/api/client-portal/:clientId/content", getPortalContent);
  app.get(
    "/api/client-portal/content/:contentId/with-comments",
    getContentWithComments,
  );

  // Client Settings routes
  app.get("/api/client-settings/:clientId", getClientSettings);
  app.put("/api/client-settings/:clientId", updateClientSettings);
  app.put(
    "/api/client-settings/:clientId/email-preferences",
    updateEmailPreferences,
  );
  app.post(
    "/api/client-settings/:clientId/unsubscribe-link",
    generateUnsubscribeLink,
  );
  app.post("/api/client-settings/unsubscribe", unsubscribeFromEmails);
  app.post("/api/client-settings/resubscribe", resubscribeToEmails);
  app.post("/api/client-settings/verify-unsubscribe", verifyUnsubscribeToken);

  // Media routes
  app.post("/api/media/upload", uploadMedia);
  app.get("/api/media", listMedia);
  app.get("/api/media/storage-usage/:brandId", getStorageUsage);
  app.get("/api/media/:assetId/url", getAssetUrl);
  app.post("/api/media/check-duplicate", checkDuplicateAsset);
  app.post("/api/media/:assetId/seo-metadata", generateSEOMetadataRoute);
  app.post("/api/media/:assetId/track-usage", trackAssetUsage);

  // Preferences routes
  app.get("/api/preferences/:userId", getPreferences);
  app.put("/api/preferences/:userId", updatePreferences);
  app.get("/api/preferences/:userId/export", exportPreferences);

  // Webhooks routes
  app.post("/api/webhooks/zapier", handleZapierWebhook);
  app.post("/api/webhooks/make", handleMakeWebhook);
  app.post("/api/webhooks/slack", handleSlackWebhook);
  app.post("/api/webhooks/hubspot", handleHubSpotWebhook);
  app.get("/api/webhooks/status", getWebhookStatus);
  app.get("/api/webhooks/logs/:brandId", getWebhookLogs);
  app.post("/api/webhooks/:eventId/retry", retryWebhookEvent);

  // White Label routes
  app.get("/api/white-label/:brandId/config", getWhiteLabelConfig);
  app.get("/api/white-label/domain/:domain", getConfigByDomain);
  app.put("/api/white-label/:brandId/config", updateWhiteLabelConfig);

  // Workflow routes
  app.get("/api/workflow/templates/:brandId", getWorkflowTemplates);
  app.post("/api/workflow/templates/:brandId", createWorkflowTemplate);
  app.post("/api/workflow/start/:brandId", startWorkflow);
  app.post("/api/workflow/:workflowId/action", processWorkflowAction);
  app.get("/api/workflow/:brandId/notifications", getWorkflowNotifications);
  app.put(
    "/api/workflow/notifications/:notificationId/read",
    markNotificationRead,
  );
  app.post("/api/workflow/:workflowId/cancel", cancelWorkflow);
  app.get("/api/workflow/:workflowId", getWorkflow);
  app.get("/api/workflow/content/:contentId", getWorkflowsForContent);

  return app;
}
