import { RequestHandler, Response } from "express";
import { BrandIntelligence } from "@shared/brand-intelligence";

/**
 * Ensures all API responses are JSON with proper headers
 * @param res Express response object
 */
function setJsonHeaders(res: Response): void {
  res.set({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-cache, no-store, must-revalidate",
  });
}

/**
 * Sends a JSON error response with proper status code and headers
 * @param res Express response object
 * @param status HTTP status code
 * @param error Error message or object
 */
function sendJsonError(
  res: Response,
  status: number,
  error: string | { error?: string; message?: string; code?: string },
): Response {
  setJsonHeaders(res);

  const errorObj = typeof error === "string" ? { error } : error;

  return res.status(status).json({
    error: errorObj.error || errorObj.message || "An error occurred",
    code: (errorObj as any).code || "UNKNOWN_ERROR",
    timestamp: new Date().toISOString(),
  });
}

export const getBrandIntelligence: RequestHandler = async (req, res) => {
  try {
    const { brandId } = req.params;

    // Validate required parameter
    if (!brandId) {
      return sendJsonError(res, 400, {
        error: "brandId parameter is required",
      });
    }

    // Validate brandId format (basic check)
    if (typeof brandId !== "string" || brandId.length === 0) {
      return sendJsonError(res, 400, { error: "Invalid brandId format" });
    }

    // Mock comprehensive brand intelligence data
    const intelligence: BrandIntelligence = {
      id: `intel_${brandId}`,
      brandId,
      brandProfile: {
        usp: [
          "Sustainable fashion with 80% recycled materials",
          "Direct-to-consumer pricing without retail markup",
          "Carbon-neutral shipping and packaging",
        ],
        differentiators: [
          "Only fashion brand with 100% transparent supply chain",
          "Proprietary fabric technology from ocean plastic",
          "Local manufacturing within 50 miles of major cities",
        ],
        coreValues: [
          "sustainability",
          "transparency",
          "quality",
          "accessibility",
        ],
        targetAudience: {
          demographics: {
            age: "25-45",
            income: "$50,000-$120,000",
            location: "Urban and suburban areas",
            education: "College-educated",
          },
          psychographics: [
            "Environmentally conscious",
            "Values authenticity",
            "Quality-focused",
            "Social media active",
          ],
          painPoints: [
            "Finding truly sustainable fashion",
            "High prices for eco-friendly options",
            "Lack of transparency in fashion industry",
          ],
          interests: [
            "sustainability",
            "fashion",
            "wellness",
            "travel",
            "technology",
          ],
        },
        brandPersonality: {
          traits: ["authentic", "innovative", "responsible", "approachable"],
          tone: "friendly and educational",
          voice: "expert but not preachy",
          communicationStyle: "conversational with purpose",
        },
        visualIdentity: {
          colorPalette: ["#2E7D32", "#66BB6A", "#E8F5E8", "#1B5E20"],
          typography: ["Modern sans-serif", "Clean", "Readable"],
          imageStyle: [
            "Natural lighting",
            "Lifestyle-focused",
            "Authentic moments",
          ],
          logoGuidelines: "Minimal, nature-inspired design",
        },
      },
      competitorInsights: {
        primaryCompetitors: [
          {
            id: "comp_1",
            name: "Patagonia",
            handle: "@patagonia",
            platform: "instagram",
            followers: 4200000,
            avgEngagement: 3.2,
            postingFrequency: 5,
            contentThemes: ["outdoor adventure", "activism", "sustainability"],
            strengths: [
              "Strong brand loyalty",
              "Authentic storytelling",
              "Purpose-driven",
            ],
            weaknesses: ["Higher price point", "Limited urban appeal"],
            lastAnalyzed: new Date().toISOString(),
          },
        ],
        benchmarks: {
          avgEngagementRate: 3.0,
          avgPostingFrequency: 6,
          topContentThemes: [
            "sustainability",
            "transparency",
            "quality",
            "lifestyle",
          ],
          bestPostingTimes: {
            instagram: ["10:00", "14:00", "19:00"],
            facebook: ["12:00", "15:00", "18:00"],
          },
        },
        gapAnalysis: {
          contentGaps: [
            "Limited behind-the-scenes manufacturing content",
            "Insufficient user-generated content showcase",
          ],
          opportunityAreas: [
            "Micro-influencer partnerships",
            "Interactive sustainability challenges",
          ],
          differentiationOpportunities: [
            "Emphasize local manufacturing advantage",
            "Showcase ocean plastic technology",
          ],
        },
      },
      audienceInsights: {
        activityPatterns: {
          instagram: {
            peakHours: ["10:00", "14:00", "19:00"],
            peakDays: ["Tuesday", "Wednesday", "Thursday"],
            timezone: "America/New_York",
            engagementHeatmap: generateEngagementHeatmap(),
          },
        },
        contentPreferences: {
          topPerformingTypes: [
            "behind-the-scenes",
            "educational",
            "user-generated",
          ],
          engagementTriggers: ["questions", "polls", "sustainability tips"],
          preferredLength: 150,
          hashtagEffectiveness: {
            "#sustainability": 1.4,
            "#ecofashion": 1.3,
          },
        },
        growthDrivers: {
          followerGrowthTriggers: [
            "viral sustainability content",
            "influencer collaborations",
          ],
          viralContentPatterns: [
            "educational carousels",
            "transformation videos",
          ],
          engagementBoosterTactics: ["ask questions", "share user stories"],
        },
      },
      contentIntelligence: {
        performanceCorrelations: {
          timeVsEngagement: [
            { time: "10:00", avgEngagement: 4.2 },
            { time: "14:00", avgEngagement: 3.8 },
            { time: "19:00", avgEngagement: 4.5 },
          ],
          contentTypeVsGrowth: [
            { type: "behind-the-scenes", growthImpact: 1.8 },
            { type: "educational", growthImpact: 1.6 },
          ],
          hashtagVsReach: [
            { hashtag: "#sustainability", reachMultiplier: 1.4 },
          ],
        },
        successPatterns: {
          topPerformingContent: [
            {
              id: "pattern_1",
              contentType: "behind-the-scenes",
              platform: "instagram",
              avgEngagement: 4.5,
              reachMultiplier: 1.8,
              successFactors: [
                "authentic storytelling",
                "manufacturing process",
              ],
              examples: ["Ocean plastic processing video"],
            },
          ],
          failurePatterns: [],
          improvementOpportunities: [
            "Add more educational value to promotional content",
          ],
        },
      },
      recommendations: {
        strategic: [
          {
            id: "strat_1",
            type: "differentiation",
            title: "Emphasize Local Manufacturing Advantage",
            description:
              "Highlight your unique local manufacturing network as a key differentiator.",
            impact: "high",
            effort: "medium",
            timeframe: "2-3 months",
            expectedOutcome: "25% increase in brand differentiation awareness",
            reasoning:
              "Competitor analysis shows no other brand emphasizes local manufacturing as strongly.",
          },
        ],
        tactical: [
          {
            id: "tact_1",
            type: "content_optimization",
            title: "Increase Behind-the-Scenes Content",
            action: "Post 2-3 behind-the-scenes videos per week",
            expectedImpact: "40% increase in engagement rate",
            platform: "instagram",
            priority: "high",
          },
        ],
        contentSuggestions: [
          {
            id: "content_1",
            contentType: "video",
            platform: "instagram",
            suggestedTopic: "Ocean Plastic Transformation Process",
            angle: "Show the journey from ocean waste to beautiful fabric",
            reasoning:
              "Behind-the-scenes content performs 80% better than average",
            expectedEngagement: 4.2,
            bestPostingTime: "19:00",
            recommendedHashtags: ["#oceanplastic", "#sustainability"],
          },
        ],
        timingOptimization: [
          {
            platform: "instagram",
            optimalTimes: ["10:00", "14:00", "19:00"],
            timezone: "America/New_York",
            reasoning: "Analysis shows 35% higher engagement at these times",
            expectedUplift: 1.35,
          },
        ],
      },
      lastAnalyzed: new Date().toISOString(),
      nextAnalysis: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      confidenceScore: 0.87,
    };

    // Always return JSON with proper headers
    setJsonHeaders(res);
    return res.status(200).json(intelligence);
  } catch (error) {
    // Log error for debugging
    try {
      const safeStringify = (v: any) => {
        try {
          return JSON.stringify(v, (_k, val) =>
            val instanceof Error
              ? { message: val.message, stack: val.stack }
              : val,
          );
        } catch (e) {
          return String(v);
        }
      };
      console.error(`[Brand Intelligence API] Error: ${safeStringify(error)}`, {
        message: error instanceof Error ? error.message : "Unknown error",
        brandId: req.params.brandId,
        timestamp: new Date().toISOString(),
      });
    } catch (logErr) {
      console.error(
        "[Brand Intelligence API] Error (logging failed):",
        String(logErr),
      );
      console.error("[Brand Intelligence API] Original error:", error);
    }

    // Return structured JSON error response
    return sendJsonError(res, 500, {
      error:
        error instanceof Error
          ? error.message
          : "Failed to load brand intelligence",
      code: "BRAND_INTELLIGENCE_ERROR",
    });
  }
};

export const submitRecommendationFeedback: RequestHandler = async (
  req,
  res,
) => {
  try {
    const { recommendationId, action } = req.body;

    // Validate required fields
    if (!recommendationId) {
      return sendJsonError(res, 400, { error: "recommendationId is required" });
    }

    if (!action || !["accepted", "rejected"].includes(action)) {
      return sendJsonError(res, 400, {
        error: 'action must be either "accepted" or "rejected"',
      });
    }

    // TODO: Store feedback in database
    // TODO: Use feedback to improve future recommendations
    // const feedbackId = await storeFeedback({ recommendationId, action, timestamp: new Date() });

    setJsonHeaders(res);
    return res.status(200).json({
      success: true,
      message: "Feedback recorded successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    try {
      const safeStringify = (v: any) => {
        try {
          return JSON.stringify(v, (_k, val) =>
            val instanceof Error
              ? { message: val.message, stack: val.stack }
              : val,
          );
        } catch (e) {
          return String(v);
        }
      };
      console.error(
        `[Brand Intelligence Feedback] Error: ${safeStringify(error)}`,
        {
          message: error instanceof Error ? error.message : "Unknown error",
          recommendationId: (req.body as any)?.recommendationId,
          timestamp: new Date().toISOString(),
        },
      );
    } catch (logErr) {
      console.error(
        "[Brand Intelligence Feedback] Error (logging failed):",
        String(logErr),
      );
      console.error("[Brand Intelligence Feedback] Original error:", error);
    }

    return sendJsonError(res, 500, {
      error:
        error instanceof Error ? error.message : "Failed to record feedback",
      code: "FEEDBACK_ERROR",
    });
  }
};

function generateEngagementHeatmap() {
  return Array.from({ length: 168 }, (_, i) => ({
    hour: i % 24,
    day: Math.floor(i / 24),
    score: Math.random() * 0.8 + 0.2,
  }));
}
