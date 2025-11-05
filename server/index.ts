import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { handleDemo } from "./routes/demo";
import integrationsRouter from "./routes/integrations";
import agentsRouter from "./routes/agents";
import {
  uploadMedia,
  listMedia,
  getStorageUsage,
  getAssetUrl,
  checkDuplicateAsset,
  generateSEOMetadataRoute,
  trackAssetUsage,
} from "./routes/media";
import mediaManagementRouter from "./routes/media-management";
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
  getWhiteLabelConfig,
  getConfigByDomain,
  updateWhiteLabelConfig,
} from "./routes/white-label";
import {
  getClientDashboard,
  approveContent,
  addContentComment,
  uploadClientMedia,
} from "./routes/client-portal";
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
  getWorkflowTemplates,
  createWorkflowTemplate,
  startWorkflow,
  processWorkflowAction,
  getWorkflowNotifications,
} from "./routes/workflow";
import { initializeEmailService } from "./lib/email-service";
import { generateContent, getProviderStatus } from "./routes/ai";
import { serverEnv } from '@shared/env';
import { builderWebhook } from "./routes/builder";
import { validateAIProviders } from "./workers/ai-generation";
import { generateContent as generateContentWorker, getProviders } from "./routes/ai-generation";
import { recoverPublishingJobs } from "./lib/job-recovery";
import publishingRouter from "./routes/publishing-router";
import { scheduleAnalyticsSyncJobs, syncBrandAnalytics, generateBrandMonthlyPlan, getSyncStatus } from "./lib/analytics-scheduler";
import { autoPlanGenerator } from "./lib/auto-plan-generator";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper functions for demo/mock data
function getTierFeatures(tier: string): string[] {
  const features: Record<string, string[]> = {
    starter: ["Basic Analytics", "Up to 5 brands", "Email Support"],
    professional: ["Advanced Analytics", "Up to 20 brands", "Priority Support", "API Access"],
    enterprise: ["Full Analytics", "Unlimited brands", "24/7 Support", "Custom Integrations", "SLA"],
  };
  return features[tier.toLowerCase()] || features.starter;
}

function getRandomBrandName(): string {
  const adjectives = ["Digital", "Smart", "Creative", "Bold", "Modern"];
  const nouns = ["Solutions", "Labs", "Studios", "Tech", "Works"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun}`;
}

function getRandomBrandLogo(): string {
  const logos = ["🚀", "💡", "🎨", "📱", "🌟"];
  return logos[Math.floor(Math.random() * logos.length)];
}

function getPeriodDays(period: string): number {
  const days: Record<string, number> = {
    day: 1,
    week: 7,
    month: 30,
    quarter: 90,
    year: 365,
  };
  return days[period] || 30;
}

function generateMetrics(period: string): Record<string, number> {
  const base = Math.floor(Math.random() * 1000) + 500;
  return {
    impressions: base * 5,
    reach: base * 3,
    engagements: Math.floor(base * 0.15),
    clicks: Math.floor(base * 0.08),
    shares: Math.floor(base * 0.03),
    likes: Math.floor(base * 0.12),
    comments: Math.floor(base * 0.05),
  };
}

function generateChartData(period: string): Array<{ date: string; value: number }> {
  const days = getPeriodDays(period);
  const data = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000);
    data.push({
      date: date.toISOString().split("T")[0],
      value: Math.floor(Math.random() * 1000) + 100,
    });
  }
  return data;
}

function generateContentPerformance(brandId: string): Array<{ title: string; engagement: number }> {
  return [
    { title: "Brand Announcement", engagement: Math.floor(Math.random() * 1000) },
    { title: "Product Launch", engagement: Math.floor(Math.random() * 1000) },
    { title: "Team Update", engagement: Math.floor(Math.random() * 500) },
  ];
}

function calculateNextScheduled(schedule: any): string {
  const now = new Date();
  if (schedule.frequency === "daily") {
    return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  } else if (schedule.frequency === "weekly") {
    return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  } else if (schedule.frequency === "monthly") {
    return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  }
  return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
}

export function createServer() {
  const app = express();
  const PORT = process.env.PORT || 8080;
  const isDev = process.env.NODE_ENV !== 'production';

  // Middleware
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8080'
  }));
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development"
    });
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Integration platform routes
  app.use("/api/integrations", integrationsRouter);

  // AI Agent routes
  app.use("/api/agents", agentsRouter);

  // Media management routes (PHASE 6)
  app.use("/api/media", mediaManagementRouter);

  // Publishing routes (PHASE 7)
  app.use("/api/publishing", publishingRouter);

  // Legacy media routes (kept for backward compatibility)
  app.post("/api/media/upload", uploadMedia);
  app.get("/api/media/list", listMedia);
  app.get("/api/media/usage/:brandId", getStorageUsage);
  app.get("/api/media/url/:tenantId/:assetPath", getAssetUrl);
  app.get("/api/media/duplicate", checkDuplicateAsset);
  app.post("/api/media/seo-metadata", generateSEOMetadataRoute);
  app.post("/api/media/track-usage", trackAssetUsage);

  // Analytics routes
  app.get("/api/analytics/:brandId", getAnalytics);
  app.get("/api/analytics/:brandId/insights", getInsights);
  app.get("/api/analytics/:brandId/forecast", getForecast);
  app.post("/api/analytics/voice-query", processVoiceQuery);
  app.post("/api/analytics/:brandId/feedback", provideFeedback);
  app.get("/api/analytics/:brandId/goals", getGoals);
  app.post("/api/analytics/:brandId/goals", createGoal);
  app.post("/api/analytics/:brandId/sync", syncPlatformData);
  app.post("/api/analytics/:brandId/offline-metrics", addOfflineMetric);
  app.get("/api/analytics/:brandId/heatmap", getEngagementHeatmap);
  app.get("/api/analytics/:brandId/alerts", getAlerts);
  app.post("/api/analytics/alerts/:alertId/acknowledge", acknowledgeAlert);

  // Auto-plan generation routes
  app.get("/api/analytics/:brandId/plans/current", async (req, res) => {
    try {
      const { brandId } = req.params;
      const plan = await autoPlanGenerator.getCurrentMonthPlan(brandId);
      if (!plan) {
        return res.status(404).json({ error: 'No plan found for current month' });
      }
      res.json(plan);
    } catch (error) {
      console.error('Failed to fetch current plan:', error);
      res.status(500).json({ error: 'Failed to fetch current plan' });
    }
  });

  app.post("/api/analytics/:brandId/plans/generate", async (req, res) => {
    try {
      const { brandId } = req.params;
      const { month } = req.body;
      const plan = await generateBrandMonthlyPlan(
        brandId,
        brandId,
        month ? new Date(month) : undefined
      );
      res.json(plan);
    } catch (error) {
      console.error('Failed to generate plan:', error);
      res.status(500).json({ error: 'Failed to generate plan' });
    }
  });

  app.post("/api/analytics/:brandId/plans/:planId/approve", async (req, res) => {
    try {
      const { brandId, planId } = req.params;
      const userId = (req.query.userId as string) || 'system';
      const plan = await autoPlanGenerator.approvePlan(brandId, brandId, planId, userId);
      res.json(plan);
    } catch (error) {
      console.error('Failed to approve plan:', error);
      res.status(500).json({ error: 'Failed to approve plan' });
    }
  });

  app.get("/api/analytics/:brandId/plans/history", async (req, res) => {
    try {
      const { brandId } = req.params;
      const limit = parseInt(req.query.limit as string) || 12;
      const plans = await autoPlanGenerator.getPlanHistory(brandId, limit);
      res.json(plans);
    } catch (error) {
      console.error('Failed to fetch plan history:', error);
      res.status(500).json({ error: 'Failed to fetch plan history' });
    }
  });

  // Analytics scheduler status routes
  app.post("/api/analytics/:brandId/sync-now", async (req, res) => {
    try {
      const { brandId } = req.params;
      const syncPromise = syncBrandAnalytics(brandId, brandId);
      // Don't wait for sync to complete, return immediately
      syncPromise.catch(err => console.error('Async sync error:', err));
      res.json({ message: 'Sync initiated', status: 'pending' });
    } catch (error) {
      console.error('Failed to initiate sync:', error);
      res.status(500).json({ error: 'Failed to initiate sync' });
    }
  });

  app.get("/api/analytics/:brandId/sync-status", async (req, res) => {
    try {
      const { brandId } = req.params;
      const status = await getSyncStatus(brandId);
      res.json(status);
    } catch (error) {
      console.error('Failed to fetch sync status:', error);
      res.status(500).json({ error: 'Failed to fetch sync status' });
    }
  });

  // Enhanced Preferences routes
  app.get("/api/preferences", (req, res) => {
    // TODO: Get user from auth context
    const userId = 'current-user';
    
    // Mock comprehensive user preferences
    res.json({
      id: 'pref_1',
      userId,
      brandId: req.query.brandId || null,
      aiSettings: {
        defaultTone: 'professional',
        brandVoice: {
          personality: ['trustworthy', 'innovative', 'approachable'],
          avoidWords: ['cheap', 'basic'],
          preferredStyle: 'conversational',
          industryContext: 'technology'
        },
        creativityLevel: 'balanced',
        strictBrandMode: false,
        autoGenerateHashtags: true,
        maxContentLength: {
          twitter: 280,
          instagram: 2200,
          linkedin: 3000
        }
      },
      publishing: {
        defaultPlatforms: ['instagram', 'linkedin'],
        postingFrequency: {
          instagram: {
            postsPerWeek: 5,
            preferredTimes: ['09:00', '17:00'],
            timezone: 'America/New_York'
          }
        },
        autoApproval: {
          enabled: true,
          rules: {
            minBrandFitScore: 80,
            requiresReview: ['video', 'promotional'],
            autoPublishScore: 90
          }
        },
        schedulingBuffer: 2
      },
      notifications: {
        email: {
          enabled: true,
          frequency: 'daily',
          types: {
            contentReady: true,
            approvalNeeded: true,
            analyticsReports: false,
            systemUpdates: true
          }
        },
        inApp: {
          enabled: true,
          types: ['approval', 'content_ready']
        },
        slack: {
          enabled: false,
          webhookUrl: '',
          channelMentions: false
        }
      },
      teamSettings: {
        role: 'admin',
        permissions: {
          canCreateContent: true,
          canApproveContent: true,
          canEditSettings: true,
          canInviteUsers: true,
          canViewAnalytics: true,
          canExportData: true
        },
        workflowPreferences: {
          requiresApproval: true,
          approvalWorkflow: ['creator', 'manager', 'client']
        }
      },
      advanced: {
        analytics: {
          reportingInterval: 'weekly',
          customMetrics: ['engagement_rate', 'brand_mentions'],
          dataRetention: 365
        },
        api: {
          rateLimits: {},
          webhookEndpoints: []
        },
        experimental: {
          betaFeatures: ['AI Content Variations', 'Smart Scheduling'],
          aiModelVersion: 'stable',
          advancedPromptSettings: false
        }
      },
      interface: {
        theme: 'light',
        language: 'en',
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        showAdvancedOptions: false,
        defaultDashboardView: 'overview',
        compactMode: false
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString()
    });
  });

  app.put("/api/preferences", (req, res) => {
    const preferences = req.body;
    
    // Validate preferences
    const errors = [];
    if (preferences.aiSettings?.creativityLevel && !['conservative', 'balanced', 'creative', 'experimental'].includes(preferences.aiSettings.creativityLevel)) {
      errors.push({ field: 'creativityLevel', message: 'Invalid creativity level' });
    }
    
    if (preferences.publishing?.autoApproval?.rules?.minBrandFitScore && 
        (preferences.publishing.autoApproval.rules.minBrandFitScore < 0 || preferences.publishing.autoApproval.rules.minBrandFitScore > 100)) {
      errors.push({ field: 'minBrandFitScore', message: 'Score must be between 0 and 100' });
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }
    
    // TODO: Save to database with proper validation
    // TODO: Create audit log entry
    
    res.json({ 
      success: true, 
      message: 'Preferences updated successfully',
      updatedAt: new Date().toISOString()
    });
  });

  app.post("/api/preferences/validate", (req, res) => {
    const { section, updates } = req.body;

    const errors: Array<{ field: string; message: string }> = [];
    const warnings: Array<{ field: string; message: string }> = [];

    if (section === 'aiSettings') {
      if (updates.creativityLevel === 'experimental') {
        warnings.push({
          field: 'creativityLevel',
          message: 'Experimental mode may produce unpredictable results'
        });
      }
      if (updates.maxContentLength) {
        Object.entries(updates.maxContentLength).forEach(([platform, length]) => {
          if (typeof length !== 'number' || length <= 0) {
            errors.push({ field: `maxContentLength.${platform}`, message: 'Content length must be a positive number' });
          }
        });
      }
    }
    
    if (section === 'publishing') {
      if (updates.autoApproval?.rules?.autoPublishScore > 95) {
        warnings.push({
          field: 'autoPublishScore',
          message: 'Very high auto-publish scores may reduce content quality control'
        });
      }
    }

    res.json({
      valid: errors.length === 0,
      errors,
      warnings
    });
  });

  app.post("/api/preferences/reset", (req, res) => {
    // TODO: Reset preferences to default values
    // TODO: Create audit log entry
    
    res.json({ 
      success: true, 
      message: 'Preferences reset to defaults' 
    });
  });

  app.get("/api/preferences/audit", (req, res) => {
    // TODO: Return audit log for preference changes
    res.json([
      {
        id: 'audit_1',
        userId: 'current-user',
        action: 'update',
        section: 'aiSettings',
        changes: [
          {
            field: 'creativityLevel',
            oldValue: 'conservative',
            newValue: 'balanced'
          }
        ],
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
      }
    ]);
  });

  // White-label routes
  app.get("/api/white-label/config", getWhiteLabelConfig);
  app.get("/api/white-label/by-domain", getConfigByDomain);
  app.put("/api/white-label/config", updateWhiteLabelConfig);

  // Client portal routes (read-only access for clients)
  app.get("/api/client/dashboard", getClientDashboard);
  app.post("/api/client/content/:contentId/approve", approveContent);
  app.post("/api/client/content/:contentId/comments", addContentComment);
  app.post("/api/client/media/upload", uploadClientMedia);

  // Approval workflow routes (PHASE 8: Client Collaboration)
  app.post("/api/approvals/bulk", bulkApproveContent);
  app.post("/api/approvals/:postId/approve", approveSingleContent);
  app.post("/api/approvals/:postId/reject", rejectContent);
  app.get("/api/approvals/:postId/history", getApprovalHistory);
  app.post("/api/approvals/request", requestApproval);
  app.get("/api/approvals/pending", getPendingApprovals);
  app.post("/api/approvals/send-reminder", sendApprovalReminder);

  // Workflow routes
  app.get("/api/workflow/templates", getWorkflowTemplates);
  app.post("/api/workflow/templates", createWorkflowTemplate);
  app.post("/api/workflow/start", startWorkflow);
  app.post("/api/workflow/action", processWorkflowAction);
  app.get("/api/workflow/notifications", getWorkflowNotifications);

  // Client portal workflow routes
  app.post("/api/client/workflow/action", processWorkflowAction);

  // Onboarding routes
  app.get("/api/onboarding/progress", (req, res) => {
    const userId = req.query.userId || 'current-user';
    
    res.json({
      userId,
      currentStep: 'welcome',
      completedSteps: [],
      skippedSteps: [],
      startedAt: new Date().toISOString(),
      totalSteps: 6,
      progressPercentage: 0,
      userType: req.query.userType || 'agency'
    });
  });

  app.post("/api/onboarding/complete", (req, res) => {
    const { userId, completedSteps } = req.body;
    
    // TODO: Save onboarding completion to database
    res.json({ 
      success: true,
      userId,
      completedAt: new Date().toISOString(),
      completedSteps: completedSteps || []
    });
  });

  app.post("/api/onboarding/skip-step", (req, res) => {
    const { userId, stepId } = req.body;
    
    // TODO: Save skipped step to database
    res.json({ 
      success: true,
      userId,
      skippedStep: stepId
    });
  });

  // Trial and subscription routes
  app.post("/api/trial/start", (req, res) => {
    const { email, brandCount = 1 } = req.body;
    
    // TODO: Create trial user and subscription
    res.json({ 
      success: true, 
      trialId: `trial_${Date.now()}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      brandCount,
      features: [
        'AI Content Generation',
        'Multi-platform Publishing',
        'Basic Analytics',
        'Client Approval Workflows',
        'Email Support'
      ]
    });
  });

  app.get("/api/trial/status", (req, res) => {
    const { userId } = req.query;
    
    res.json({
      isActive: true,
      daysRemaining: 5,
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      featuresUsed: {
        contentGenerated: 23,
        postsPublished: 12,
        analyticsViewed: true
      },
      limits: {
        maxContent: 50,
        maxPosts: 25,
        maxBrands: 1
      }
    });
  });

  app.get("/api/pricing/calculate", (req, res) => {
    const { brands, yearly } = req.query;
    const brandCount = parseInt(brands as string) || 1;
    const isYearly = yearly === 'true';

    // Calculate pricing based on tiers
    let pricePerBrand = 199; // Default starter price
    let tierName = 'starter';
    
    if (brandCount >= 20) {
      pricePerBrand = 99;
      tierName = 'enterprise';
    } else if (brandCount >= 10) {
      pricePerBrand = 149;
      tierName = 'growth';
    }

    const monthlyTotal = pricePerBrand * brandCount;
    const yearlyTotal = monthlyTotal * 12;
    const yearlySavings = isYearly ? monthlyTotal * 2 : 0;

    res.json({
      brandCount,
      pricePerBrand,
      monthlyTotal,
      yearlyTotal: yearlyTotal - yearlySavings,
      yearlySavings,
      tier: tierName,
      features: getTierFeatures(tierName),
      savings: brandCount >= 10 ? `Save $${(199 - pricePerBrand) * brandCount}/month` : null
    });
  });

  // Content Production Dashboard routes
  app.get("/api/content/dashboard", (req, res) => {
    const { brandId } = req.query;
    
    // Mock production dashboard data with real-time status
    res.json({
      summary: {
        total: 45,
        completed: 32,
        inQueue: 8,
        errored: 3,
        generating: 2
      },
      recentActivity: [
        {
          id: 'content_1',
          brandId: brandId || 'brand_1',
          title: 'Summer Campaign Post #1',
          content: 'Discover the perfect summer vibes with our latest collection...',
          platform: 'instagram',
          status: 'completed',
          priority: 'high',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          generationJob: {
            id: 'job_1',
            status: 'completed',
            progress: 100,
            retryCount: 0
          },
          metadata: {
            generationType: 'ai',
            wordCount: 150,
            imageCount: 1,
            hashtags: ['#summer', '#fashion', '#style']
          },
          preview: {
            thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
            fullContent: 'Discover the perfect summer vibes with our latest collection...',
            variations: []
          }
        },
        {
          id: 'content_2',
          brandId: brandId || 'brand_1',
          title: 'Product Showcase Video',
          content: 'Behind the scenes of our latest product photoshoot...',
          platform: 'tiktok',
          status: 'generating',
          priority: 'medium',
          createdAt: new Date(Date.now() - 30000).toISOString(),
          updatedAt: new Date().toISOString(),
          generationJob: {
            id: 'job_2',
            status: 'running',
            progress: 65,
            retryCount: 0,
            estimatedCompletion: new Date(Date.now() + 120000).toISOString()
          },
          metadata: {
            generationType: 'ai',
            wordCount: 0,
            imageCount: 0,
            hashtags: ['#bts', '#product', '#video']
          }
        },
        {
          id: 'content_3',
          brandId: brandId || 'brand_1',
          title: 'Holiday Promotion',
          content: 'Failed to generate content due to API rate limit...',
          platform: 'facebook',
          status: 'error',
          priority: 'high',
          createdAt: new Date(Date.now() - 300000).toISOString(),
          updatedAt: new Date(Date.now() - 60000).toISOString(),
          generationJob: {
            id: 'job_3',
            status: 'failed',
            progress: 0,
            error: 'API rate limit exceeded. Please try again in 5 minutes.',
            retryCount: 2
          },
          metadata: {
            generationType: 'ai',
            wordCount: 0,
            imageCount: 0,
            hashtags: []
          }
        }
      ],
      upcomingDeadlines: [
        {
          id: 'content_4',
          title: 'Black Friday Campaign',
          platform: 'instagram',
          status: 'queued',
          scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'high'
        }
      ],
      erroredItems: [
        {
          id: 'content_3',
          title: 'Holiday Promotion',
          platform: 'facebook',
          status: 'error',
          generationJob: {
            error: 'API rate limit exceeded. Please try again in 5 minutes.',
            retryCount: 2
          }
        }
      ],
      queuedItems: [
        {
          id: 'content_5',
          title: 'Weekly Newsletter Content',
          platform: 'linkedin',
          status: 'queued',
          priority: 'low',
          queuePosition: 1
        }
      ]
    });
  });

  app.post("/api/content/:contentId/retry", (req, res) => {
    const { contentId } = req.params;
    
    // TODO: Retry content generation
    res.json({ 
      success: true, 
      message: 'Content retry initiated',
      contentId,
      newJobId: `job_${Date.now()}`,
      estimatedCompletion: new Date(Date.now() + 180000).toISOString()
    });
  });

  app.post("/api/content/batch", (req, res) => {
    const { action, contentIds } = req.body;
    
    // TODO: Process batch operation
    res.json({ 
      success: true, 
      message: `Batch ${action} completed successfully`,
      processedCount: contentIds?.length || 0,
      batchId: `batch_${Date.now()}`
    });
  });

  app.post("/api/content/generate", (req, res) => {
    const { brandId, platform, prompt, settings } = req.body;
    
    // TODO: Start content generation job
    res.json({
      success: true,
      contentId: `content_${Date.now()}`,
      jobId: `job_${Date.now()}`,
      status: 'generating',
      estimatedCompletion: new Date(Date.now() + 120000).toISOString()
    });
  });

  // Enhanced Analytics Portal routes
  app.get("/api/analytics-portal/:brandId", (req, res) => {
    const { brandId } = req.params;
    const periodParam = (req.query.period as string) || 'month';
    const brandIdStr = Array.isArray(brandId) ? brandId[0] : (typeof brandId === 'string' ? brandId : '');

    // Mock comprehensive analytics data with realistic numbers
    res.json({
      brandInfo: {
        name: getRandomBrandName(),
        logo: getRandomBrandLogo(),
        colors: {
          primary: '#000000',
          secondary: '#FF6B35'
        }
      },
      timeRange: {
        start: new Date(Date.now() - getPeriodDays(periodParam) * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
        period: periodParam
      },
      metrics: generateMetrics(periodParam),
      charts: generateChartData(periodParam),
      contentPerformance: generateContentPerformance(brandIdStr)
    });
  });

  app.post("/api/analytics-portal/feedback", (req, res) => {
    const { contentId, type, message, priority } = req.body;
    
    // TODO: Save feedback to database
    res.json({ 
      success: true, 
      feedbackId: `feedback_${Date.now()}`,
      message: 'Feedback submitted successfully',
      notificationSent: true
    });
  });

  app.post("/api/analytics-portal/share-link", (req, res) => {
    const { brandId, name, includeMetrics, dateRange, expiresAt, passwordProtected } = req.body;
    
    const shareLink = {
      id: `share_${Date.now()}`,
      brandId,
      token: `token_${Math.random().toString(36).substr(2, 9)}`,
      name,
      includeMetrics,
      dateRange,
      expiresAt,
      passwordProtected,
      allowDownload: true,
      viewCount: 0,
      createdAt: new Date().toISOString()
    };

    res.json({
      success: true,
      shareLink,
      url: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/analytics/shared/${shareLink.token}`
    });
  });

  app.get("/api/analytics-portal/shared/:token", (req, res) => {
    const { token } = req.params;
    
    // TODO: Validate token and return analytics data
    // Mock validation
    if (!token.startsWith('token_')) {
      return res.status(404).json({ valid: false, error: 'Invalid or expired link' });
    }
    
    res.json({
      valid: true,
      data: {
        brandInfo: { name: 'Shared Brand', logo: '🔗' },
        metrics: generateMetrics('month'),
        charts: generateChartData('month'),
        restrictions: ['no_download', 'watermarked']
      }
    });
  });

  // Custom Reports routes
  app.get("/api/analytics-portal/:brandId/reports", (req, res) => {
    const { brandId } = req.params;
    
    // Mock custom reports data
    res.json([
      {
        id: 'report_1',
        name: 'Monthly Performance Report',
        description: 'Comprehensive monthly analytics with key metrics and insights',
        brandId,
        createdBy: 'user_1',
        schedule: {
          frequency: 'monthly',
          dayOfMonth: 1,
          time: '09:00',
          timezone: 'America/New_York'
        },
        content: {
          includeMetrics: ['reach', 'engagement', 'conversions', 'engagementRate'],
          includePlatforms: ['instagram', 'facebook', 'linkedin'],
          includeCharts: ['reachOverTime', 'engagementByPlatform', 'topContent']
        },
        delivery: {
          format: 'pdf',
          recipients: ['client@example.com', 'manager@agency.com'],
          subject: 'Your Monthly Social Media Performance Report',
          message: 'Please find your monthly analytics report attached.',
          attachAnalytics: true
        },
        dateRange: {
          type: 'relative',
          relativePeriod: 'last_30_days'
        },
        isActive: true,
        lastSent: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        nextScheduled: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'report_2',
        name: 'Weekly Team Update',
        description: 'Quick weekly summary for internal team meetings',
        brandId,
        createdBy: 'user_1',
        schedule: {
          frequency: 'weekly',
          dayOfWeek: 1,
          time: '08:00',
          timezone: 'America/New_York'
        },
        content: {
          includeMetrics: ['reach', 'engagement'],
          includePlatforms: ['instagram', 'linkedin'],
          includeCharts: ['topContent']
        },
        delivery: {
          format: 'html',
          recipients: ['team@agency.com'],
          subject: 'Weekly Social Media Update',
          attachAnalytics: false
        },
        dateRange: {
          type: 'relative',
          relativePeriod: 'last_7_days'
        },
        isActive: true,
        lastSent: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        nextScheduled: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]);
  });

  app.post("/api/analytics-portal/:brandId/reports", (req, res) => {
    const { brandId } = req.params;
    const reportData = req.body;
    
    // TODO: Save custom report to database
    const newReport = {
      id: `report_${Date.now()}`,
      ...reportData,
      brandId,
      createdBy: 'current-user', // TODO: Get from auth
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nextScheduled: calculateNextScheduled(reportData.schedule)
    };

    res.json({ success: true, report: newReport });
  });

  app.put("/api/analytics-portal/:brandId/reports/:reportId", (req, res) => {
    const { brandId, reportId } = req.params;
    const updates = req.body;
    
    // TODO: Update report in database
    res.json({ success: true, message: 'Report updated successfully' });
  });

  app.post("/api/analytics-portal/:brandId/reports/:reportId/send", (req, res) => {
    const { brandId, reportId } = req.params;
    
    // TODO: Generate and send report immediately
    res.json({ 
      success: true, 
      message: 'Report sent successfully',
      executionId: `exec_${Date.now()}`
    });
  });

  app.delete("/api/analytics-portal/:brandId/reports/:reportId", (req, res) => {
    const { brandId, reportId } = req.params;
    
    // TODO: Delete report from database
    res.json({ success: true, message: 'Report deleted successfully' });
  });

  // Brand Intelligence routes
  app.get("/api/brand-intelligence/:brandId", async (req, res) => {
    const { brandId } = req.params;
    
    if (!brandId) {
      return res.status(400).json({ error: 'brandId required' });
    }

    // Mock comprehensive brand intelligence data
    const intelligence = {
      id: `intel_${brandId}`,
      brandId,
      brandProfile: {
        usp: [
          'Sustainable fashion with 80% recycled materials',
          'Direct-to-consumer pricing without retail markup',
          'Carbon-neutral shipping and packaging'
        ],
        differentiators: [
          'Only fashion brand with 100% transparent supply chain',
          'Proprietary fabric technology from ocean plastic',
          'Local manufacturing within 50 miles of major cities'
        ],
        coreValues: ['sustainability', 'transparency', 'quality', 'accessibility'],
        targetAudience: {
          demographics: {
            age: '25-45',
            income: '$50,000-$120,000',
            location: 'Urban and suburban areas',
            education: 'College-educated'
          },
          psychographics: [
            'Environmentally conscious',
            'Values authenticity',
            'Quality-focused'
          ],
          painPoints: [
            'Finding truly sustainable fashion',
            'High prices for eco-friendly options'
          ],
          interests: ['sustainability', 'fashion', 'wellness']
        },
        brandPersonality: {
          traits: ['authentic', 'innovative', 'responsible', 'approachable'],
          tone: 'friendly and educational',
          voice: 'expert but not preachy',
          communicationStyle: 'conversational with purpose'
        },
        visualIdentity: {
          colorPalette: ['#2E7D32', '#66BB6A', '#E8F5E8', '#1B5E20'],
          typography: ['Modern sans-serif', 'Clean', 'Readable'],
          imageStyle: ['Natural lighting', 'Lifestyle-focused', 'Authentic moments'],
          logoGuidelines: 'Minimal, nature-inspired design'
        }
      },
      competitorInsights: {
        primaryCompetitors: [
          {
            id: 'comp_1',
            name: 'Patagonia',
            handle: '@patagonia',
            platform: 'instagram',
            followers: 4200000,
            avgEngagement: 3.2,
            postingFrequency: 5,
            contentThemes: ['outdoor adventure', 'activism', 'sustainability'],
            strengths: ['Strong brand loyalty', 'Authentic storytelling'],
            weaknesses: ['Higher price point', 'Limited urban appeal'],
            lastAnalyzed: new Date().toISOString()
          }
        ],
        benchmarks: {
          avgEngagementRate: 3.0,
          avgPostingFrequency: 6,
          topContentThemes: ['sustainability', 'transparency', 'quality'],
          bestPostingTimes: {
            instagram: ['10:00', '14:00', '19:00'],
            facebook: ['12:00', '15:00', '18:00']
          }
        },
        gapAnalysis: {
          contentGaps: [
            'Limited behind-the-scenes manufacturing content',
            'Insufficient user-generated content showcase'
          ],
          opportunityAreas: [
            'Micro-influencer partnerships',
            'Interactive sustainability challenges'
          ],
          differentiationOpportunities: [
            'Emphasize local manufacturing advantage',
            'Showcase ocean plastic technology'
          ]
        }
      },
      audienceInsights: {
        activityPatterns: {
          instagram: {
            peakHours: ['10:00', '14:00', '19:00'],
            peakDays: ['Tuesday', 'Wednesday', 'Thursday'],
            timezone: 'America/New_York',
            engagementHeatmap: Array.from({ length: 168 }, (_, i) => ({
              hour: i % 24,
              day: Math.floor(i / 24),
              score: Math.random() * 0.8 + 0.2
            }))
          }
        },
        contentPreferences: {
          topPerformingTypes: ['behind-the-scenes', 'educational', 'user-generated'],
          engagementTriggers: ['questions', 'polls', 'sustainability tips'],
          preferredLength: 150,
          hashtagEffectiveness: {
            '#sustainability': 1.4,
            '#ecofashion': 1.3
          }
        },
        growthDrivers: {
          followerGrowthTriggers: ['viral sustainability content'],
          viralContentPatterns: ['educational carousels'],
          engagementBoosterTactics: ['ask questions', 'share user stories']
        }
      },
      contentIntelligence: {
        performanceCorrelations: {
          timeVsEngagement: [
            { time: '10:00', avgEngagement: 4.2 },
            { time: '14:00', avgEngagement: 3.8 },
            { time: '19:00', avgEngagement: 4.5 }
          ],
          contentTypeVsGrowth: [
            { type: 'behind-the-scenes', growthImpact: 1.8 },
            { type: 'educational', growthImpact: 1.6 }
          ],
          hashtagVsReach: [
            { hashtag: '#sustainability', reachMultiplier: 1.4 }
          ]
        },
        successPatterns: {
          topPerformingContent: [
            {
              id: 'pattern_1',
              contentType: 'behind-the-scenes',
              platform: 'instagram',
              avgEngagement: 4.5,
              reachMultiplier: 1.8,
              successFactors: ['authentic storytelling'],
              examples: ['Ocean plastic processing video']
            }
          ],
          failurePatterns: [],
          improvementOpportunities: [
            'Add more educational value to promotional content'
          ]
        }
      },
      recommendations: {
        strategic: [
          {
            id: 'strat_1',
            type: 'differentiation',
            title: 'Emphasize Local Manufacturing Advantage',
            description: 'Highlight your unique local manufacturing network.',
            impact: 'high',
            effort: 'medium',
            timeframe: '2-3 months',
            expectedOutcome: '25% increase in brand differentiation awareness',
            reasoning: 'Competitor analysis shows opportunity.'
          }
        ],
        tactical: [
          {
            id: 'tact_1',
            type: 'content_optimization',
            title: 'Increase Behind-the-Scenes Content',
            description: 'Share more about your sustainable practices and team stories.',
            impact: 'medium',
            effort: 'low',
            timeframe: '1-2 months',
            expectedOutcome: '15% increase in engagement on Instagram',
            reasoning: 'Behind-the-scenes content performs well.'
          },
          {
            id: 'tact_2',
            type: 'hashtag_strategy',
            title: 'Optimize Hashtag Usage',
            description: 'Use a mix of trending and niche hashtags for better reach.',
            impact: 'medium',
            effort: 'medium',
            timeframe: '1 month',
            expectedOutcome: '10% increase in post reach',
            reasoning: 'Hashtags significantly impact discoverability.'
          }
        ]
      }
    };

    res.json(intelligence);
  });

  // New AI routes
  app.post("/api/ai/generate", generateContent);
  app.get("/api/ai/providers", getProviderStatus);

  return app;
}

// Start server if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = createServer();
  const port = parseInt(process.env.PORT || process.env.PORT || '3001', 10);

  app.listen(port, async () => {
    console.log(`Server running on port ${port}`);

    // Initialize PHASE 7: Job Recovery on startup
    try {
      await recoverPublishingJobs();
    } catch (error) {
      console.error('Failed to recover publishing jobs:', error);
    }

    // Initialize PHASE 8: Analytics Scheduler
    try {
      scheduleAnalyticsSyncJobs();
      console.log('📅 Analytics scheduler initialized');
    } catch (error) {
      console.error('Failed to initialize analytics scheduler:', error);
    }

    // Initialize PHASE 9: Email Service for Client Collaboration
    try {
      await initializeEmailService();
      console.log('📧 Email service initialized');
    } catch (error) {
      console.error('Failed to initialize email service:', error);
    }
  });
}
