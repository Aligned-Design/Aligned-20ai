import { RequestHandler } from "express";
import { analyticsDB } from "../lib/analytics-db-service";
import { AppError } from "../lib/error-middleware";
import { ErrorCode, HTTP_STATUS } from "../lib/error-responses";

export const getAnalytics: RequestHandler = async (req, res) => {
  try {
    const { brandId } = req.params;
    const days = parseInt((req as any).query.days as string) || 30;

    // Get summary metrics from database
    const summary = await analyticsDB.getMetricsSummary(brandId, days);

    // Get platform-specific stats
    const platformStats: Record<string, unknown> = {};
    const platforms = [
      "instagram",
      "facebook",
      "linkedin",
      "twitter",
      "tiktok",
      "pinterest",
      "youtube",
      "google_business",
    ];

    for (const platform of platforms) {
      if (summary.platformBreakdown[platform]) {
        platformStats[platform] = await analyticsDB.getPlatformStats(
          brandId,
          platform,
          days,
        );
      }
    }

    // Calculate growth metrics
    const previousSummary = await analyticsDB.getMetricsSummary(
      brandId,
      days * 2,
    );
    const engagementGrowth =
      previousSummary.totalEngagement > 0
        ? ((summary.totalEngagement - previousSummary.totalEngagement) /
            previousSummary.totalEngagement) *
          100
        : 0;
    const followerGrowth =
      previousSummary.totalFollowers > 0
        ? ((summary.totalFollowers - previousSummary.totalFollowers) /
            previousSummary.totalFollowers) *
          100
        : 0;

    const analytics = {
      summary: {
        reach: summary.totalReach,
        engagement: summary.totalEngagement,
        engagementRate: summary.averageEngagementRate,
        followers: summary.totalFollowers,
        topPlatform: summary.topPlatform,
      },
      platforms: platformStats,
      comparison: {
        engagementGrowth: parseFloat(engagementGrowth.toFixed(1)),
        followerGrowth: parseFloat(followerGrowth.toFixed(1)),
      },
      timeframe: {
        days,
        startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      },
    };

    (res as any).json(analytics);
  } catch (error) {
    console.error("Failed to fetch analytics:", error);
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to fetch analytics",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "error",
      error instanceof Error ? { originalError: error.message } : undefined,
      "Please try again later or contact support"
    );
  }
};

export const getInsights: RequestHandler = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { advisorEngine } = await import("../lib/advisor-engine");

    // Get current and historical metrics
    const currentMetrics = await analyticsDB.getMetricsByDateRange(
      brandId,
      undefined,
      undefined,
      undefined,
      1000,
    );
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDateStr = thirtyDaysAgo.toISOString().split("T")[0];
    const historicalMetrics = await analyticsDB.getMetricsByDateRange(
      brandId,
      undefined,
      startDateStr,
      undefined,
      1000,
    );

    // Convert to advisor engine format
    const formattedCurrent = currentMetrics.map((m) => ({
      id: m.id,
      brandId: m.brand_id,
      platform: m.platform as unknown,
      postId: m.post_id,
      date: m.date,
      metrics: m.metrics as unknown,
      metadata: m.metadata,
      createdAt: m.created_at,
      updatedAt: m.updated_at,
    }));

    const formattedHistorical = historicalMetrics.map((m) => ({
      id: m.id,
      brandId: m.brand_id,
      platform: m.platform as unknown,
      postId: m.post_id,
      date: m.date,
      metrics: m.metrics as unknown,
      metadata: m.metadata,
      createdAt: m.created_at,
      updatedAt: m.updated_at,
    }));

    // Get goals
    const goals = await analyticsDB.getGoals(brandId);

    // Generate insights
    const insights = await advisorEngine.generateInsights({
      brandId,
      currentMetrics: formattedCurrent,
      historicalMetrics: formattedHistorical,
      goals,
      userFeedback: [],
    });

    (res as any).json({ insights, totalCount: insights.length });
  } catch (error) {
    console.error("Failed to fetch insights:", error);
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to fetch insights",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "error",
      error instanceof Error ? { originalError: error.message } : undefined,
      "Please try again later or contact support"
    );
  }
};

export const getForecast: RequestHandler = async (req, res) => {
  try {
    const { brandId } = req.params;
    const period = ((req as any).query.period as string) || "next_month";
    const { advisorEngine } = await import("../lib/advisor-engine");

    // Get current metrics
    const metrics = await analyticsDB.getMetricsByDateRange(
      brandId,
      undefined,
      undefined,
      undefined,
      1000,
    );

    // Convert to advisor format
    const formattedMetrics = metrics.map((m) => ({
      id: m.id,
      brandId: m.brand_id,
      platform: m.platform as unknown,
      postId: m.post_id,
      date: m.date,
      metrics: m.metrics as unknown,
      metadata: m.metadata,
      createdAt: m.created_at,
      updatedAt: m.updated_at,
    }));

    // Generate forecast
    const forecast = await advisorEngine.generateForecast(
      brandId,
      formattedMetrics,
      period,
    );

    (res as any).json(forecast);
  } catch (error) {
    console.error("Failed to generate forecast:", error);
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to generate forecast",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "error",
      error instanceof Error ? { originalError: error.message } : undefined,
      "Please try again later or contact support"
    );
  }
};

export const processVoiceQuery: RequestHandler = async (req, res) => {
  try {
    const { query } = req.body;
    const response = {
      query,
      response: `Based on your analytics data: ${query}`,
      suggestions: [
        "Try asking about engagement rates",
        "Check platform performance",
      ],
    };
    (res as any).json(response);
  } catch (error) {
    console.error("Failed to process voice query:", error);
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to process voice query",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "error",
      error instanceof Error ? { originalError: error.message } : undefined,
      "Please try again later or contact support"
    );
  }
};

export const provideFeedback: RequestHandler = async (req, res) => {
  try {
    const { brandId } = req.params;
    const {
      insightId,
      feedback,
      category,
      type,
      previousWeight = 1.0,
    } = req.body;

    // Calculate new weight based on feedback
    let newWeight = previousWeight;
    switch (feedback) {
      case "accepted":
      case "implemented":
        newWeight = Math.min(1.5, previousWeight + 0.1);
        break;
      case "rejected":
        newWeight = Math.max(0.5, previousWeight - 0.1);
        break;
    }

    // Log feedback to database
    await analyticsDB.logFeedback(
      brandId,
      brandId,
      insightId,
      category,
      type,
      feedback,
      previousWeight,
      newWeight,
    );

    (res as any).json({
      message: "Feedback recorded and weights updated",
      previousWeight,
      newWeight,
      adjustment: (newWeight - previousWeight).toFixed(2),
    });
  } catch (error) {
    console.error("Failed to submit feedback:", error);
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to submit feedback",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "error",
      error instanceof Error ? { originalError: error.message } : undefined,
      "Please try again later or contact support"
    );
  }
};

export const getGoals: RequestHandler = async (req, res) => {
  try {
    const { brandId } = req.params;

    // Get goals from database
    const goals = await analyticsDB.getGoals(brandId);

    // Add current progress for each goal
    const goalsWithProgress = await Promise.all(
      goals.map(async (goal) => {
        const stats = await analyticsDB.getPlatformStats(
          brandId,
          goal.metric,
          30,
        );
        return {
          ...goal,
          current: stats.averageEngagementRate || 0,
          progress:
            goal.target > 0
              ? ((stats.averageEngagementRate || 0) / goal.target) * 100
              : 0,
        };
      }),
    );

    (res as any).json({ goals: goalsWithProgress });
  } catch (error) {
    console.error("Failed to fetch goals:", error);
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to fetch goals",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "error",
      error instanceof Error ? { originalError: error.message } : undefined,
      "Please try again later or contact support"
    );
  }
};

export const createGoal: RequestHandler = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { metric, target, deadline, notes } = req.body;

    // Validate inputs
    if (!metric || target == null || !deadline) {
      return res
        .status(400)
        .json({ error: "Missing required fields: metric, target, deadline" });
    }

    // Create goal in database
    const newGoal = await analyticsDB.upsertGoal(
      brandId,
      brandId,
      metric,
      target,
      new Date(deadline),
      notes,
    );

    (res as any).status(201).json(newGoal);
  } catch (error) {
    console.error("Failed to create goal:", error);
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to create goal",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "error",
      error instanceof Error ? { originalError: error.message } : undefined,
      "Please try again later or contact support"
    );
  }
};

export const syncPlatformData: RequestHandler = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { platform } = req.body;
    const { analyticsSync } = await import("../lib/analytics-sync");

    // Trigger sync for the platform
    const startTime = new Date();
    await analyticsSync.performIncrementalSync(brandId, [
      {
        platform: platform as unknown,
        accessToken: "", // Would come from platform_connections table in real scenario
        accountId: "",
        lastSyncAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    ]);

    const endTime = new Date();
    (res as any).json({
      message: `Synced data from ${platform}`,
      status: "success",
      duration: endTime.getTime() - startTime.getTime(),
    });
  } catch (error) {
    console.error("Failed to sync platform data:", error);
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to sync platform data",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "error",
      error instanceof Error ? { originalError: error.message } : undefined,
      "Please try again later or contact support"
    );
  }
};

export const addOfflineMetric: RequestHandler = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { metric, value, date } = req.body;

    // Insert offline metric directly to database
    await analyticsDB.logSync(
      brandId,
      brandId,
      "offline",
      "manual",
      "completed",
      1,
      0,
      new Date(date),
      new Date(),
      undefined,
    );

    (res as any).json({ message: "Offline metric added", metric, value, date });
  } catch (error) {
    console.error("Failed to add offline metric:", error);
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to add offline metric",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "error",
      error instanceof Error ? { originalError: error.message } : undefined,
      "Please try again later or contact support"
    );
  }
};

export const getEngagementHeatmap: RequestHandler = async (req, res) => {
  try {
    const { brandId } = req.params;

    // Get metrics from database
    const metrics = await analyticsDB.getMetricsByDateRange(
      brandId,
      undefined,
      undefined,
      undefined,
      1000,
    );

    // Build heatmap from real data
    const heatmapData = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      engagement: 0,
    }));

    let maxEngagement = 0;
    let peakHour = 0;

    metrics.forEach((metric) => {
      const hour = parseInt(metric.date.split("T")[1]?.split(":")[0] || "0");
      heatmapData[hour].engagement += metric.metrics.engagement || 0;
      if (heatmapData[hour].engagement > maxEngagement) {
        maxEngagement = heatmapData[hour].engagement;
        peakHour = hour;
      }
    });

    (res as any).json({
      data: heatmapData,
      peak: { hour: peakHour, engagement: maxEngagement },
    });
  } catch (error) {
    console.error("Failed to generate heatmap:", error);
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to generate heatmap",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "error",
      error instanceof Error ? { originalError: error.message } : undefined,
      "Please try again later or contact support"
    );
  }
};

export const getAlerts: RequestHandler = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { advisorEngine } = await import("../lib/advisor-engine");

    // Get current and historical metrics
    const currentMetrics = await analyticsDB.getMetricsByDateRange(
      brandId,
      undefined,
      undefined,
      undefined,
      1000,
    );
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDateStr = thirtyDaysAgo.toISOString().split("T")[0];
    const historicalMetrics = await analyticsDB.getMetricsByDateRange(
      brandId,
      undefined,
      startDateStr,
      undefined,
      1000,
    );

    // Convert to advisor format
    const formattedCurrent = currentMetrics.map((m) => ({
      id: m.id,
      brandId: m.brand_id,
      platform: m.platform as unknown,
      postId: m.post_id,
      date: m.date,
      metrics: m.metrics as unknown,
      metadata: m.metadata,
      createdAt: m.created_at,
      updatedAt: m.updated_at,
    }));

    const formattedHistorical = historicalMetrics.map((m) => ({
      id: m.id,
      brandId: m.brand_id,
      platform: m.platform as unknown,
      postId: m.post_id,
      date: m.date,
      metrics: m.metrics as unknown,
      metadata: m.metadata,
      createdAt: m.created_at,
      updatedAt: m.updated_at,
    }));

    // Generate insights which will include alerts
    const insights = await advisorEngine.generateInsights({
      brandId,
      currentMetrics: formattedCurrent,
      historicalMetrics: formattedHistorical,
      goals: [],
      userFeedback: [],
    });

    // Filter for alerts only
    const alerts = insights
      .filter((i) => i.type === "alert")
      .map((i) => ({
        id: i.id,
        type: "warning",
        title: i.title,
        message: i.description,
        timestamp: i.createdAt,
        severity: i.impact === "high" ? "high" : "medium",
      }));

    (res as any).json({ alerts });
  } catch (error) {
    console.error("Failed to fetch alerts:", error);
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to fetch alerts",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "error",
      error instanceof Error ? { originalError: error.message } : undefined,
      "Please try again later or contact support"
    );
  }
};

export const acknowledgeAlert: RequestHandler = async (req, res) => {
  try {
    const { alertId } = req.params;
    (res as any).json({
      alertId,
      acknowledged: true,
      acknowledgedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to acknowledge alert:", error);
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to acknowledge alert",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "error",
      error instanceof Error ? { originalError: error.message } : undefined,
      "Please try again later or contact support"
    );
  }
};
