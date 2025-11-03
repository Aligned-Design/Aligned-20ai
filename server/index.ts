import "dotenv/config";
import express from "express";
import cors from "cors";
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
  getWorkflowTemplates,
  createWorkflowTemplate,
  startWorkflow,
  processWorkflowAction,
  getWorkflowNotifications,
} from "./routes/workflow";

export function createServer() {
  const app = express();

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

  // Media management routes
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
  app.post("/api/analytics/insights/:insightId/feedback", provideFeedback);
  app.get("/api/analytics/:brandId/goals", getGoals);
  app.post("/api/analytics/:brandId/goals", createGoal);
  app.post("/api/analytics/:brandId/sync", syncPlatformData);
  app.post("/api/analytics/:brandId/offline-metrics", addOfflineMetric);
  app.get("/api/analytics/:brandId/heatmap", getEngagementHeatmap);
  app.get("/api/analytics/:brandId/alerts", getAlerts);
  app.post("/api/analytics/alerts/:alertId/acknowledge", acknowledgeAlert);

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
    
    const errors = [];
    const warnings = [];
    
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
    const { period = 'month' } = req.query;
    
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
        start: new Date(Date.now() - getPeriodDays(period) * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
        period
      },
      metrics: generateMetrics(period),
      charts: generateChartData(period),
      contentPerformance: generateContentPerformance(brandId)
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

    // Import and use the handler
    const { getBrandIntelligence } = await import('./routes/brand-intelligence');
    return getBrandIntelligence(req, res);
  });

  app.put("/api/brand-intelligence/:brandId", async (req, res) => {
    const { updateBrandIntelligence } = await import('./routes/brand-intelligence');
    return updateBrandIntelligence(req, res);
  });

  app.get("/api/brand-intelligence/:brandId/competitors", async (req, res) => {
    const { getCompetitorInsights } = await import('./routes/brand-intelligence');
    return getCompetitorInsights(req, res);
  });

  app.post("/api/brand-intelligence/feedback", async (req, res) => {
    const { submitRecommendationFeedback } = await import('./routes/brand-intelligence');
    return submitRecommendationFeedback(req, res);
  });

  return app;
}

// Helper functions for mock data generation
function getTierFeatures(tier: string) {
  const features = {
    starter: [
      'AI-powered content generation',
      'Multi-platform publishing',
      'Basic analytics & reporting',
      'Client approval workflows',
      'Team collaboration tools',
      'Email support'
    ],
    growth: [
      'Everything in Starter',
      'Advanced analytics & insights',
      'White-label client portals',
      'Custom workflow automation',
      'Priority support',
      'Team training sessions'
    ],
    enterprise: [
      'Everything in Growth',
      'Enterprise integrations',
      'Custom AI training',
      'Dedicated account manager',
      'SLA guarantees',
      'Custom onboarding'
    ]
  };
  
  return features[tier as keyof typeof features] || features.starter;
}

function getRandomBrandName() {
  const brands = ['Nike', 'Apple', 'Tesla', 'Spotify', 'Airbnb', 'Netflix'];
  return brands[Math.floor(Math.random() * brands.length)];
}

function getRandomBrandLogo() {
  const logos = ['👟', '🍎', '🚗', '🎵', '🏠', '📺'];
  return logos[Math.floor(Math.random() * logos.length)];
}

function getPeriodDays(period: any) {
  switch (period) {
    case 'week': return 7;
    case 'month': return 30;
    case 'quarter': return 90;
    case 'year': return 365;
    default: return 30;
  }
}

function generateMetrics(period: any) {
  const days = getPeriodDays(period);
  const baseReach = Math.floor(Math.random() * 50000) + 100000;
  
  return {
    reach: { 
      current: baseReach, 
      previous: Math.floor(baseReach * 0.85), 
      change: Math.round((Math.random() - 0.3) * 50) 
    },
    engagement: { 
      current: Math.floor(baseReach * 0.07), 
      previous: Math.floor(baseReach * 0.06), 
      change: Math.round((Math.random() - 0.2) * 40) 
    },
    conversions: { 
      current: Math.floor(baseReach * 0.002), 
      previous: Math.floor(baseReach * 0.0015), 
      change: Math.round((Math.random() - 0.1) * 60) 
    },
    contentVolume: { 
      current: Math.floor(days / 2), 
      previous: Math.floor(days / 2.5), 
      change: Math.round((Math.random() - 0.3) * 30) 
    },
    engagementRate: { 
      current: Math.round((6 + Math.random() * 4) * 10) / 10, 
      previous: Math.round((5 + Math.random() * 3) * 10) / 10, 
      change: Math.round((Math.random() - 0.4) * 20 * 10) / 10 
    }
  };
}

function generateChartData(period: any) {
  const days = Math.min(getPeriodDays(period), 30);
  
  return {
    reachOverTime: Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: Math.floor(Math.random() * 5000) + 3000
    })),
    engagementByPlatform: [
      { platform: 'Instagram', value: Math.floor(Math.random() * 3000) + 2000 },
      { platform: 'Facebook', value: Math.floor(Math.random() * 2000) + 1500 },
      { platform: 'LinkedIn', value: Math.floor(Math.random() * 1500) + 1000 },
      { platform: 'Twitter', value: Math.floor(Math.random() * 1000) + 500 }
    ],
    topContent: [
      { 
        id: 'content_1', 
        title: 'Summer Collection Launch', 
        engagement: Math.floor(Math.random() * 800) + 600, 
        reach: Math.floor(Math.random() * 10000) + 8000 
      },
      { 
        id: 'content_2', 
        title: 'Behind the Scenes Video', 
        engagement: Math.floor(Math.random() * 600) + 400, 
        reach: Math.floor(Math.random() * 8000) + 6000 
      },
      { 
        id: 'content_3', 
        title: 'Customer Testimonial', 
        engagement: Math.floor(Math.random() * 400) + 300, 
        reach: Math.floor(Math.random() * 6000) + 4000 
      }
    ],
    audienceGrowth: Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      followers: 52000 + Math.floor(Math.random() * 100) + i * 10
    }))
  };
}

function generateContentPerformance(brandId: any) {
  return [
    {
      id: 'content_1',
      title: 'Summer Collection Launch',
      platform: 'Instagram',
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      metrics: { 
        reach: 15420, 
        engagement: 1205, 
        clicks: 234, 
        saves: 89 
      },
      canProvideFeedback: true
    },
    {
      id: 'content_2',
      title: 'Product Feature Highlight',
      platform: 'LinkedIn',
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      metrics: { 
        reach: 8930, 
        engagement: 456, 
        clicks: 123, 
        saves: 34 
      },
      canProvideFeedback: true
    }
  ];
}

function calculateNextScheduled(schedule: any): string {
  const now = new Date();
  const [hours, minutes] = schedule.time.split(':').map(Number);
  
  let nextDate = new Date();
  nextDate.setHours(hours, minutes, 0, 0);
  
  switch (schedule.frequency) {
    case 'daily':
      if (nextDate <= now) {
        nextDate.setDate(nextDate.getDate() + 1);
      }
      break;
    case 'weekly':
      const currentDay = nextDate.getDay();
      const targetDay = schedule.dayOfWeek || 1;
      const daysUntilTarget = (targetDay - currentDay + 7) % 7;
      if (daysUntilTarget === 0 && nextDate <= now) {
        nextDate.setDate(nextDate.getDate() + 7);
      } else {
        nextDate.setDate(nextDate.getDate() + daysUntilTarget);
      }
      break;
    case 'monthly':
      nextDate.setDate(schedule.dayOfMonth || 1);
      if (nextDate <= now) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      break;
    case 'quarterly':
      const currentQuarter = Math.floor(nextDate.getMonth() / 3);
      nextDate.setMonth(currentQuarter * 3, 1);
      if (nextDate <= now) {
        nextDate.setMonth((currentQuarter + 1) * 3, 1);
      }
      break;
  }
  
  return nextDate.toISOString();
}
