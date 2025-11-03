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
    const userId = 'current-user';
    
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
    
    // Basic validation
    const errors: Array<{ field: string; message: string }> = [];
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
    
    res.json({ 
      success: true, 
      message: 'Preferences updated successfully',
      updatedAt: new Date().toISOString()
    });
  });

  // White-label routes
  app.get("/api/white-label/config", getWhiteLabelConfig);
  app.get("/api/white-label/by-domain", getConfigByDomain);
  app.put("/api/white-label/config", updateWhiteLabelConfig);

  // Client portal routes
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

  // Content Production Dashboard routes
  app.get("/api/content/dashboard", (req, res) => {
    const { brandId } = req.query;
    
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
          }
        }
      ],
      upcomingDeadlines: [],
      erroredItems: [],
      queuedItems: []
    });
  });

  app.post("/api/content/:contentId/retry", (req, res) => {
    const { contentId } = req.params;
    
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
    
    res.json({ 
      success: true, 
      message: `Batch ${action || 'operation'} completed successfully`,
      processedCount: contentIds?.length || 0,
      batchId: `batch_${Date.now()}`
    });
  });

  // Analytics Portal routes
  app.get("/api/analytics-portal/:brandId", (req, res) => {
    const { brandId } = req.params;
    const { period = 'month' } = req.query;
    
    res.json({
      brandInfo: {
        name: 'Nike',
        logo: '👟',
        colors: {
          primary: '#000000',
          secondary: '#FF6B35'
        }
      },
      timeRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
        period
      },
      metrics: {
        reach: { current: 125847, previous: 98234, change: 28.1 },
        engagement: { current: 8934, previous: 7123, change: 25.4 },
        conversions: { current: 234, previous: 189, change: 23.8 },
        contentVolume: { current: 24, previous: 20, change: 20.0 },
        engagementRate: { current: 7.1, previous: 7.3, change: -2.7 }
      },
      charts: {
        reachOverTime: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          value: Math.floor(Math.random() * 5000) + 3000
        })),
        engagementByPlatform: [
          { platform: 'Instagram', value: 4234 },
          { platform: 'Facebook', value: 2890 },
          { platform: 'LinkedIn', value: 1810 }
        ],
        topContent: [
          { id: 'content_1', title: 'Summer Collection Launch', engagement: 1205, reach: 15420 }
        ],
        audienceGrowth: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          followers: 52000 + Math.floor(Math.random() * 100) + i * 10
        }))
      },
      contentPerformance: [
        {
          id: 'content_1',
          title: 'Summer Collection Launch',
          platform: 'Instagram',
          publishedAt: '2024-01-15T09:00:00Z',
          metrics: { reach: 15420, engagement: 1205, clicks: 234, saves: 89 },
          canProvideFeedback: true
        }
      ]
    });
  });

  // Brand Intelligence routes
  app.get("/api/brand-intelligence/:brandId", (req, res) => {
    const { brandId } = req.params;
    
    if (!brandId) {
      return res.status(400).json({ error: 'brandId required' });
    }

    res.json({
      id: `intel_${brandId}`,
      brandId,
      brandProfile: {
        usp: [
          'Sustainable fashion with 80% recycled materials',
          'Direct-to-consumer pricing without retail markup'
        ],
        differentiators: [
          'Only fashion brand with 100% transparent supply chain',
          'Proprietary fabric technology from ocean plastic'
        ],
        coreValues: ['sustainability', 'transparency', 'quality'],
        targetAudience: {
          demographics: {
            age: '25-45',
            income: '$50,000-$120,000',
            location: 'Urban and suburban areas'
          },
          psychographics: ['Environmentally conscious', 'Values authenticity'],
          painPoints: ['Finding truly sustainable fashion'],
          interests: ['sustainability', 'fashion', 'wellness']
        },
        brandPersonality: {
          traits: ['authentic', 'innovative', 'responsible'],
          tone: 'friendly and educational',
          voice: 'expert but not preachy',
          communicationStyle: 'conversational with purpose'
        },
        visualIdentity: {
          colorPalette: ['#2E7D32', '#66BB6A'],
          typography: ['Modern sans-serif'],
          imageStyle: ['Natural lighting', 'Lifestyle-focused'],
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
            contentThemes: ['outdoor adventure', 'activism'],
            strengths: ['Strong brand loyalty'],
            weaknesses: ['Higher price point'],
            lastAnalyzed: new Date().toISOString()
          }
        ],
        benchmarks: {
          avgEngagementRate: 3.0,
          avgPostingFrequency: 6,
          topContentThemes: ['sustainability', 'transparency'],
          bestPostingTimes: {
            instagram: ['10:00', '14:00', '19:00']
          }
        },
        gapAnalysis: {
          contentGaps: ['Limited behind-the-scenes content'],
          opportunityAreas: ['Micro-influencer partnerships'],
          differentiationOpportunities: ['Emphasize local manufacturing']
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
          topPerformingTypes: ['behind-the-scenes', 'educational'],
          engagementTriggers: ['questions', 'polls'],
          preferredLength: 150,
          hashtagEffectiveness: {
            '#sustainability': 1.4
          }
        },
        growthDrivers: {
          followerGrowthTriggers: ['viral sustainability content'],
          viralContentPatterns: ['educational carousels'],
          engagementBoosterTactics: ['ask questions']
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
            { type: 'behind-the-scenes', growthImpact: 1.8 }
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
          improvementOpportunities: ['Add more educational value']
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
            action: 'Post 2-3 behind-the-scenes videos per week',
            expectedImpact: '40% increase in engagement rate',
            platform: 'instagram',
            priority: 'high'
          }
        ],
        contentSuggestions: [
          {
            id: 'content_1',
            contentType: 'video',
            platform: 'instagram',
            suggestedTopic: 'Ocean Plastic Transformation Process',
            angle: 'Show the journey from ocean waste to beautiful fabric',
            reasoning: 'Behind-the-scenes content performs 80% better than average',
            expectedEngagement: 4.2,
            bestPostingTime: '19:00',
            recommendedHashtags: ['#oceanplastic', '#sustainability']
          }
        ],
        timingOptimization: [
          {
            platform: 'instagram',
            optimalTimes: ['10:00', '14:00', '19:00'],
            timezone: 'America/New_York',
            reasoning: 'Analysis shows 35% higher engagement at these times',
            expectedUplift: 1.35
          }
        ]
      },
      lastAnalyzed: new Date().toISOString(),
      nextAnalysis: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      confidenceScore: 0.87
    });
  });

  app.post("/api/brand-intelligence/feedback", (req, res) => {
    const { recommendationId, action } = req.body;
    
    res.json({
      success: true,
      message: 'Feedback recorded successfully',
      recommendationId,
      action
    });
  });

  return app;
}
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
           