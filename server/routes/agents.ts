/**
 * AI Agent API Routes
 *
 * POST /api/agents/generate/doc - Generate content with Doc Agent
 * POST /api/agents/generate/design - Generate visuals with Design Agent
 * POST /api/agents/generate/advisor - Generate insights with Advisor Agent
 * GET /api/agents/bfs/calculate - Calculate Brand Fidelity Score
 * GET /api/agents/templates/:agent/:version - Get prompt template
 * POST /api/agents/review/approve/:logId - Approve flagged content
 * POST /api/agents/review/reject/:logId - Reject flagged content
 * GET /api/agents/review/queue/:brandId - Get review queue
 */

import { Router } from "express";
import { supabase } from "../lib/supabase";
import { AppError } from "../lib/error-middleware";
import { ErrorCode, HTTP_STATUS } from "../lib/error-responses";
import {
  GenerationRequest,
  GenerationResponse,
  DocInput,
  DocOutput,
  DesignInput,
  DesignOutput,
  AdvisorOutput,
  BrandSafetyConfig,
} from "../../client/types/agent-config";
import { parseBrandKit } from "../../src/types/guards";
import { calculateBFS } from "../agents/brand-fidelity-scorer";
import { lintContent, autoFixContent } from "../agents/content-linter";
import { generateWithAI, loadPromptTemplate } from "../workers/ai-generation";

const router = Router();

// Use shared supabase client from server/lib/supabase.ts

// Maximum regeneration attempts for BFS failures
const MAX_REGENERATION_ATTEMPTS = 3;

/**
 * POST /api/agents/generate/doc
 * Generate content with Doc Agent
 */
router.post("/generate/doc", async (req, res) => {
  try {
    const {
      brand_id,
      input,
      safety_mode = "safe",
      __idempotency_key,
    } = req.body as any;
    const docInput = input as DocInput;

    if (!brand_id || !input) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        "Missing required fields: brand_id, input",
        HTTP_STATUS.BAD_REQUEST,
        "warning"
      );
    }

    // Load brand safety config
    const { data: brandData, error: brandError } = await supabase
      .from("brand_safety_configs")
      .select("*")
      .eq("brand_id", brand_id)
      .single();

    if (brandError && brandError.code !== "PGRST116") {
      throw new Error(
        `Failed to load brand safety config: ${brandError.message}`,
      );
    }

    const safetyConfig: BrandSafetyConfig = brandData || {
      safety_mode,
      banned_phrases: [],
      competitor_names: [],
      claims: [],
      required_disclaimers: [],
      required_hashtags: [],
      brand_links: [],
      disallowed_topics: [],
      allow_topics: [],
      compliance_pack: "none",
    };

    // Load brand kit for context injection
    const { data: brandKit, error: brandKitError } = await supabase
      .from("brand_kits")
      .select("*")
      .eq("brand_id", brand_id)
      .single();

    if (brandKitError) {
      throw new Error(
        `Failed to load brand kit: ${brandKitError?.message || String(brandKitError)}`,
      );
    }

    const parsedBrandKit = parseBrandKit(brandKit || {});

    let attempts = 0;
    let output: DocOutput | undefined;
    let blocked = false;
    let needsReview = false;

    while (attempts < MAX_REGENERATION_ATTEMPTS && !output) {
      attempts++;

      try {
        // Generate content with AI
        const aiOutput = await generateDocContent(
          docInput,
          parsedBrandKit,
          safetyConfig,
        );

        // Calculate Brand Fidelity Score
        const bfs = await calculateBFS(
          {
            body: aiOutput.body,
            headline: aiOutput.headline,
            cta: aiOutput.cta,
            hashtags: aiOutput.hashtags,
            platform: docInput.platform,
          },
          {
            tone_keywords: parsedBrandKit.toneKeywords || [],
            brandPersonality: parsedBrandKit.brandPersonality || [],
            writingStyle: parsedBrandKit.writingStyle,
            commonPhrases: parsedBrandKit.commonPhrases,
            required_disclaimers: safetyConfig.required_disclaimers,
            required_hashtags: safetyConfig.required_hashtags,
            banned_phrases: safetyConfig.banned_phrases,
          },
        );

        // Run content linter
        const linterResult = await lintContent(
          {
            body: aiOutput.body,
            headline: aiOutput.headline,
            cta: aiOutput.cta,
            hashtags: aiOutput.hashtags,
            platform: docInput.platform,
          },
          safetyConfig,
        );

        // Auto-fix if possible
        const finalContent = {
          body: aiOutput.body,
          headline: aiOutput.headline || "",
          cta: aiOutput.cta,
          hashtags: aiOutput.hashtags,
          platform: docInput.platform,
        };

        if (!linterResult.passed && !linterResult.blocked) {
          const { content: fixedContent, fixes } = autoFixContent(
            {
              body: finalContent.body,
              headline: finalContent.headline,
              cta: finalContent.cta,
              hashtags: finalContent.hashtags,
              platform: finalContent.platform,
            },
            linterResult,
            safetyConfig,
          );

          finalContent.body = fixedContent.body;
          finalContent.headline = fixedContent.headline || "";
          finalContent.cta = fixedContent.cta || finalContent.cta;
          finalContent.hashtags =
            fixedContent.hashtags || finalContent.hashtags;
          linterResult.fixes_applied = fixes;
        }

        // Check if we should proceed
        if (linterResult.blocked) {
          blocked = true;
          break;
        }

        if (
          bfs.passed &&
          (linterResult.passed || linterResult.fixes_applied.length > 0)
        ) {
          output = {
            ...aiOutput,
            body: finalContent.body,
            headline: finalContent.headline,
            cta: finalContent.cta,
            hashtags: finalContent.hashtags,
            bfs,
            linter: linterResult,
          };
        } else if (linterResult.needs_human_review) {
          needsReview = true;
          output = {
            ...aiOutput,
            body: finalContent.body,
            headline: finalContent.headline,
            cta: finalContent.cta,
            hashtags: finalContent.hashtags,
            bfs,
            linter: linterResult,
          };
        }
        // If BFS failed or linter failed without fixes, continue loop for retry
      } catch (generationError) {
        console.error(
          `Generation attempt ${attempts} failed:`,
          generationError,
        );
        if (attempts >= MAX_REGENERATION_ATTEMPTS) {
          throw generationError;
        }
      }
    }

    // Log the generation attempt
    const logEntry = {
      brand_id,
      agent: "doc" as const,
      prompt_version: "v1.0",
      safety_mode: safetyConfig.safety_mode,
      input: docInput,
      output,
      bfs: output?.bfs,
      linter_results: output?.linter,
      approved: !needsReview && !blocked,
      revision: 0,
      timestamp: new Date().toISOString(),
      duration_ms: 0, // TODO: Track actual duration
      error: blocked
        ? "Content blocked by safety filters"
        : !output
          ? "Failed to generate acceptable content"
          : undefined,
    };

    const { data: logData, error: logError } = await supabase
      .from("generation_logs")
      .insert(logEntry)
      .select()
      .single();

    if (logError) {
      console.error("Failed to log generation:", logError);
    }

    const response: GenerationResponse = {
      success: !!output,
      output,
      bfs: output?.bfs,
      linter: output?.linter,
      needs_review: needsReview,
      blocked,
      error: blocked
        ? "Content blocked by safety filters"
        : !output
          ? "Failed to generate acceptable content after multiple attempts"
          : undefined,
      log_id: logData?.id || "",
    };

    (res as any).json(response);
  } catch (error) {
    console.error("Doc generation error:", error);
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      error instanceof Error ? error.message : "Internal server error",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "error",
      error instanceof Error ? { originalError: error.message } : undefined,
      "Please try again later or contact support"
    );
  }
});

/**
 * POST /api/agents/generate/design
 * Generate visuals with Design Agent
 */
router.post("/generate/design", async (req, res) => {
  try {
    const { brand_id, input } = req.body as GenerationRequest;

    if (!brand_id || !input) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        "Missing required fields: brand_id, input",
        HTTP_STATUS.BAD_REQUEST,
        "warning"
      );
    }

    // Load brand kit for visual context
    const { data: brandKit, error: brandKitError } = await supabase
      .from("brand_kits")
      .select("*")
      .eq("brand_id", brand_id)
      .single();

    if (brandKitError) {
      throw new Error(
        `Failed to load brand kit: ${brandKitError?.message || String(brandKitError)}`,
      );
    }

    const parsedBrandKit = parseBrandKit(brandKit || {});

    // Generate design recommendations
    const output = await generateDesignContent(
      input as DesignInput,
      parsedBrandKit,
    );

    // Log the generation
    const logEntry = {
      brand_id,
      agent: "design" as const,
      prompt_version: "v1.0",
      safety_mode: "safe" as const,
      input,
      output,
      approved: true, // Design output doesn't require BFS/linter checks
      revision: 0,
      timestamp: new Date().toISOString(),
      duration_ms: 0,
    };

    const { data: logData, error: logError } = await supabase
      .from("generation_logs")
      .insert(logEntry)
      .select()
      .single();

    if (logError) {
      console.error("Failed to log generation:", logError);
    }

    const response: GenerationResponse = {
      success: true,
      output,
      needs_review: false,
      blocked: false,
      log_id: logData?.id || "",
    };

    (res as any).json(response);
  } catch (error) {
    console.error("Design generation error:", error);
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      error instanceof Error ? error.message : "Internal server error",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "error",
      error instanceof Error ? { originalError: error.message } : undefined,
      "Please try again later or contact support"
    );
  }
});

/**
 * POST /api/agents/generate/advisor
 * Generate insights with Advisor Agent
 */
router.post("/generate/advisor", async (req, res) => {
  try {
    const { brand_id } = req.body as GenerationRequest;

    if (!brand_id) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        "Missing required field: brand_id",
        HTTP_STATUS.BAD_REQUEST,
        "warning"
      );
    }

    // Check cache first
    const { data: cachedOutput, error: cacheError } = await supabase
      .from("advisor_cache")
      .select("*")
      .eq("brand_id", brand_id)
      .gte("valid_until", new Date().toISOString())
      .single();

    if (!cacheError && cachedOutput) {
      return (res as any).json({
        success: true,
        output: cachedOutput.output,
        needs_review: false,
        blocked: false,
        log_id: cachedOutput.id,
      });
    }

    // Generate new insights
    const output = await generateAdvisorInsights(brand_id);

    // Cache the results (valid for 24 hours)
    const validUntil = new Date();
    validUntil.setHours(validUntil.getHours() + 24);

    const { data: cacheData, error: cacheSaveError } = await supabase
      .from("advisor_cache")
      .upsert({
        brand_id,
        output,
        cached_at: new Date().toISOString(),
        valid_until: validUntil.toISOString(),
      })
      .select()
      .single();

    if (cacheSaveError) {
      console.error("Failed to cache advisor output:", cacheSaveError);
    }

    // Log the generation
    const logEntry = {
      brand_id,
      agent: "advisor" as const,
      prompt_version: "v1.0",
      safety_mode: "safe" as const,
      input: { brand_id },
      output,
      approved: true,
      revision: 0,
      timestamp: new Date().toISOString(),
      duration_ms: 0,
    };

    const { data: logData, error: __logError } = await supabase
      .from("generation_logs")
      .insert(logEntry)
      .select()
      .single();

    const response: GenerationResponse = {
      success: true,
      output,
      needs_review: false,
      blocked: false,
      log_id: logData?.id || cacheData?.id || "",
    };

    (res as any).json(response);
  } catch (error) {
    console.error("Advisor generation error:", error);
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      error instanceof Error ? error.message : "Internal server error",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "error",
      error instanceof Error ? { originalError: error.message } : undefined,
      "Please try again later or contact support"
    );
  }
});

/**
 * GET /api/agents/bfs/calculate
 * Calculate Brand Fidelity Score for given content
 */
router.post("/bfs/calculate", async (req, res) => {
  try {
    const { content, brand_id } = req.body;

    if (!content || !brand_id) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        "Missing content or brand_id",
        HTTP_STATUS.BAD_REQUEST,
        "warning"
      );
    }

    // Load brand kit
    const { data: brandKit } = await supabase
      .from("brand_kits")
      .select("*")
      .eq("brand_id", brand_id)
      .single();

    const bfs = await calculateBFS(content, {
      tone_keywords: brandKit?.toneKeywords || [],
      brandPersonality: brandKit?.brandPersonality || [],
      writingStyle: brandKit?.writingStyle,
      commonPhrases: brandKit?.commonPhrases,
    });

    (res as any).json(bfs);
  } catch (error) {
    console.error("BFS calculation error:", error);
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to calculate BFS",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "error",
      error instanceof Error ? { originalError: error.message } : undefined,
      "Please try again later or contact support"
    );
  }
});

/**
 * GET /api/agents/review/queue/:brandId
 * Get content pending review
 */
router.get("/review/queue/:brandId", async (req, res) => {
  try {
    const { brandId } = req.params;

    const { data: reviewQueue, error } = await supabase
      .from("generation_logs")
      .select("*")
      .eq("brand_id", brandId)
      .eq("approved", false)
      .is("error", null)
      .order("timestamp", { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    (res as any).json({ queue: reviewQueue || [] });
  } catch (error) {
    console.error("Review queue error:", error);
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to load review queue",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "error",
      error instanceof Error ? { originalError: error.message } : undefined,
      "Please try again later or contact support"
    );
  }
});

/**
 * POST /api/agents/review/approve/:logId
 * Approve flagged content
 */
router.post("/review/approve/:logId", async (req, res) => {
  try {
    const { logId } = req.params;
    const { reviewer_notes } = req.body;

    const { error } = await supabase
      .from("generation_logs")
      .update({
        approved: true,
        reviewer_notes,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", logId);

    if (error) {
      throw error;
    }

    (res as any).json({ success: true });
  } catch (error) {
    console.error("Approval error:", error);
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to approve content",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "error",
      error instanceof Error ? { originalError: error.message } : undefined,
      "Please try again later or contact support"
    );
  }
});

/**
 * POST /api/agents/review/reject/:logId
 * Reject flagged content
 */
router.post("/review/reject/:logId", async (req, res) => {
  try {
    const { logId } = req.params;
    const { reviewer_notes } = req.body;

    const { error } = await supabase
      .from("generation_logs")
      .update({
        approved: false,
        reviewer_notes,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", logId);

    if (error) {
      throw error;
    }

    (res as any).json({ success: true });
  } catch (error) {
    console.error("Rejection error:", error);
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to reject content",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "error",
      error instanceof Error ? { originalError: error.message } : undefined,
      "Please try again later or contact support"
    );
  }
});

/**
 * GET /api/agents
 * Get available agents
 */
router.get("/", (req, res) => {
  (res as any).json({ agents: [] });
});

// Helper functions for content generation
async function generateDocContent(
  input: DocInput,
  brandKit: unknown,
  _safetyConfig: BrandSafetyConfig,
): Promise<DocOutput> {
  const template = await loadPromptTemplate("doc", "v1.0", "en");

  const prompt = template
    .replace(/\{\{brand_name\}\}/g, (brandKit as any).brandName || "Your Brand")
    .replace(/\{\{tone_keywords\}\}/g, ((brandKit as any).toneKeywords || []).join(", "))
    .replace(/\{\{writing_style\}\}/g, (brandKit as any).writingStyle || "professional")
    .replace(/\{\{topic\}\}/g, input.topic)
    .replace(/\{\{platform\}\}/g, input.platform)
    .replace(/\{\{format\}\}/g, input.format)
    .replace(/\{\{max_length\}\}/g, input.max_length?.toString() || "2200");

  const aiResponse = await generateWithAI(prompt, "doc");

  // Parse AI response (assuming JSON format)
  let parsedOutput;
  try {
    parsedOutput = JSON.parse(aiResponse);
  } catch {
    // Fallback parsing if not JSON
    parsedOutput = {
      headline: aiResponse.split("\n")[0] || "",
      body: aiResponse,
      cta: "Learn more",
      hashtags: ["#YourBrand"],
      post_theme: input.format,
      tone_used: "professional",
      aspect_ratio: input.platform === "instagram" ? "1080x1350" : "1200x630",
      char_count: aiResponse.length,
    };
  }

  return {
    headline: parsedOutput.headline || "",
    body: parsedOutput.body || aiResponse,
    cta: parsedOutput.cta || "Learn more",
    hashtags: parsedOutput.hashtags || ["#YourBrand"],
    post_theme: parsedOutput.post_theme || input.format,
    tone_used: parsedOutput.tone_used || "professional",
    aspect_ratio: parsedOutput.aspect_ratio,
    char_count: (parsedOutput.body || aiResponse).length,
    bfs: {
      overall: 0,
      tone_alignment: 0,
      terminology_match: 0,
      compliance: 0,
      cta_fit: 0,
      platform_fit: 0,
      passed: false,
      issues: [],
      regeneration_count: 0,
    },
    linter: {
      passed: false,
      profanity_detected: false,
      toxicity_score: 0,
      banned_phrases_found: [],
      banned_claims_found: [],
      missing_disclaimers: [],
      missing_hashtags: [],
      platform_violations: [],
      pii_detected: [],
      competitor_mentions: [],
      fixes_applied: [],
      blocked: false,
      needs_human_review: false,
    },
  };
}

async function generateDesignContent(
  input: DesignInput,
  brandKit: unknown,
): Promise<DesignOutput> {
  const template = await loadPromptTemplate("design", "v1.0", "en");

  const prompt = template
    .replace(
      /\{\{brand_colors\}\}/g,
      (brandKit as any).primaryColor
        ? [(brandKit as any).primaryColor, (brandKit as any).secondaryColor, (brandKit as any).accentColor]
            .filter(Boolean)
            .join(", ")
        : "#8B5CF6",
    )
    .replace(/\{\{theme\}\}/g, input.theme)
    .replace(/\{\{aspect_ratio\}\}/g, input.aspect_ratio)
    .replace(/\{\{headline\}\}/g, input.headline || "");

  const aiResponse = await generateWithAI(prompt, "design");

  let parsedOutput;
  try {
    parsedOutput = JSON.parse(aiResponse);
  } catch {
    parsedOutput = {
      cover_title: input.headline || "Your Content",
      template_ref: `${input.theme}-template`,
      alt_text: `${input.theme} content template`,
      visual_elements: ["Text overlay", "Brand colors", "Logo placement"],
      color_palette_used: [(brandKit as any).primaryColor || "#8B5CF6"],
      font_suggestions: [(brandKit as any).fontFamily || "Inter"],
    };
  }

  return {
    cover_title: parsedOutput.cover_title || input.headline || "",
    template_ref: parsedOutput.template_ref || `${input.theme}-template`,
    alt_text: parsedOutput.alt_text || "",
    thumbnail_ref: parsedOutput.thumbnail_ref,
    visual_elements: parsedOutput.visual_elements || [],
    color_palette_used: parsedOutput.color_palette_used || [],
    font_suggestions: parsedOutput.font_suggestions || [],
  };
}

async function generateAdvisorInsights(
  brand_id: string,
): Promise<AdvisorOutput> {
  // Load recent post performance data
  const { data: posts } = await supabase
    .from("scheduled_content")
    .select("*")
    .eq("brand_id", brand_id)
    .gte(
      "scheduled_for",
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    ) // Last 30 days
    .order("scheduled_for", { ascending: false });

  const template = await loadPromptTemplate("advisor", "v1.0", "en");

  const prompt = template
    .replace(/\{\{brand_id\}\}/g, brand_id)
    .replace(
      /\{\{recent_posts\}\}/g,
      JSON.stringify(posts?.slice(0, 20) || []),
    );

  const aiResponse = await generateWithAI(prompt, "advisor");

  let parsedOutput;
  try {
    parsedOutput = JSON.parse(aiResponse);
  } catch {
    // Fallback
    parsedOutput = {
      topics: [
        {
          title: "Continue Current Strategy",
          rationale: "Maintain consistent posting schedule and content themes.",
          confidence: 0.7,
        },
      ],
      best_times: [{ day: "Thursday", slot: "18:00", confidence: 0.8 }],
      format_mix: { reel: 0.4, carousel: 0.4, image: 0.2 },
      hashtags: ["#YourBrand", "#ContentMarketing"],
      keywords: ["growth", "engagement", "community"],
    };
  }

  return {
    topics: parsedOutput.topics || [],
    best_times: parsedOutput.best_times || [],
    format_mix: parsedOutput.format_mix || {},
    hashtags: parsedOutput.hashtags || [],
    keywords: parsedOutput.keywords || [],
    cached_at: new Date().toISOString(),
    valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

export default router;
