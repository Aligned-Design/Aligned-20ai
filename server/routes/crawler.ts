/**
 * Crawler API Routes
 *
 * POST /api/crawl/start - Start a crawl job
 * GET /api/crawl/result/:jobId - Get crawl results
 * POST /api/brand-kit/apply - Apply selected changes
 * GET /api/brand-kit/history/:brandId - Get change history
 * POST /api/brand-kit/revert - Revert a field to previous value
 */

import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import {
  processBrandIntake,
  crawlWebsite,
  extractColors,
} from "../workers/brand-crawler";
import {
  CrawlerSuggestion,
  FieldChange,
  FieldHistoryEntry,
  canCrawlerUpdate,
  createTrackedField,
} from "../../client/types/brand-kit-field";

const router = Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// In-memory job store (use Redis in production)
const crawlJobs = new Map<string, unknown>();

/**
 * POST /api/crawl/start
 * Start a website crawl job
 */
router.post("/crawl/start", async (req, res) => {
  try {
    const { brand_id, url } = req.body;

    if (!brand_id || !url) {
      return res.status(400).json({ error: "brand_id and url are required" });
    }

    // Verify user has access to brand
    const userId = req.headers["x-user-id"]; // From auth middleware
    const { data: member, error: memberError } = await supabase
      .from("brand_members")
      .select("*")
      .eq("brand_id", brand_id)
      .eq("user_id", userId)
      .single();

    if (memberError || !member) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Get current brand_kit
    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .select("brand_kit")
      .eq("id", brand_id)
      .single();

    if (brandError) {
      return res.status(404).json({ error: "Brand not found" });
    }

    const job_id = `crawl_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Store job with pending status
    crawlJobs.set(job_id, {
      job_id,
      brand_id,
      url,
      status: "pending",
      started_at: new Date().toISOString(),
    });

    // Start crawl in background (don't await)
    runCrawlJob(job_id, brand_id, url, brand.brand_kit || {}).catch((error) => {
      console.error(`Crawl job ${job_id} failed:`, error);
      const job = crawlJobs.get(job_id);
      if (job) {
        job.status = "failed";
        job.error = error.message;
        job.completed_at = new Date().toISOString();
      }
    });

    res.json({ job_id, status: "pending" });
  } catch (error: unknown) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Background crawl job
 */
async function runCrawlJob(
  job_id: string,
  brand_id: string,
  url: string,
  currentBrandKit: unknown,
) {
  const job = crawlJobs.get(job_id);
  if (!job) return;

  job.status = "processing";

  try {
    // Crawl website
    const crawlResults = await crawlWebsite(url);

    // Extract colors
    const colors = await extractColors(url);

    // Generate AI summaries (or fallback)
    const combinedText = crawlResults
      .map((r) => `${r.title}\n${r.metaDescription}\n${r.bodyText}`)
      .join("\n\n")
      .slice(0, 10000);

    // Generate suggestions by comparing with current values
    const suggestions: CrawlerSuggestion[] = [];

    // Colors
    if (colors.primary) {
      suggestions.push({
        field: "colors",
        label: "Brand Colors",
        currentValue: currentBrandKit.colors?.value || null,
        currentSource: currentBrandKit.colors?.source || "crawler",
        suggestedValue: {
          primary: colors.primary,
          secondary: colors.secondary,
          accent: colors.accent,
        },
        confidence: colors.confidence / 1000, // Normalize
        category: "colors",
      });
    }

    // Keywords (simple extraction for now)
    const keywords = extractKeywords(combinedText);
    if (keywords.length > 0) {
      suggestions.push({
        field: "keywords",
        label: "Brand Keywords",
        currentValue: currentBrandKit.keywords?.value || [],
        currentSource: currentBrandKit.keywords?.source || "crawler",
        suggestedValue: keywords,
        confidence: 0.7,
        category: "keywords",
      });
    }

    // About blurb
    const aboutBlurb = crawlResults[0]?.metaDescription?.slice(0, 160) || "";
    if (aboutBlurb) {
      suggestions.push({
        field: "about_blurb",
        label: "About Description",
        currentValue: currentBrandKit.about_blurb?.value || "",
        currentSource: currentBrandKit.about_blurb?.source || "crawler",
        suggestedValue: aboutBlurb,
        confidence: 0.8,
        category: "about",
      });
    }

    // Update job with results
    job.status = "completed";
    job.completed_at = new Date().toISOString();
    job.suggestions = suggestions;
    job.palette = [colors.primary, colors.secondary, colors.accent];
    job.keywords = keywords;
  } catch (error: unknown) {
    job.status = "failed";
    job.error = error.message;
    job.completed_at = new Date().toISOString();
  }
}

/**
 * Simple keyword extraction (replace with AI in production)
 */
function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const wordFreq = words.reduce(
    (acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const stopWords = new Set([
    "that",
    "this",
    "with",
    "from",
    "have",
    "will",
    "your",
    "their",
    "about",
    "what",
    "when",
    "where",
    "which",
    "would",
    "there",
    "these",
    "those",
  ]);

  return Object.entries(wordFreq)
    .filter(([word]) => !stopWords.has(word))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

/**
 * GET /api/crawl/result/:jobId
 * Get crawl job status and results
 */
router.get("/crawl/result/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = crawlJobs.get(jobId);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json(job);
  } catch (error: unknown) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/brand-kit/apply
 * Apply selected changes from crawler
 */
router.post("/brand-kit/apply", async (req, res) => {
  try {
    const { brand_id, changes } = req.body as {
      brand_id: string;
      changes: FieldChange[];
    };

    if (!brand_id || !changes || !Array.isArray(changes)) {
      return res.status(400).json({ error: "brand_id and changes[] required" });
    }

    const userId = req.headers["x-user-id"];

    // Get current brand_kit
    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .select("brand_kit")
      .eq("id", brand_id)
      .single();

    if (brandError) {
      return res.status(404).json({ error: "Brand not found" });
    }

    const brandKit = brand.brand_kit || {};
    const history: FieldHistoryEntry[] = [];

    // Apply changes with source enforcement
    for (const change of changes) {
      const currentField = brandKit[change.field];

      // Check if field is user-edited
      if (currentField?.source === "user" && !change.force_user_override) {
        console.warn(`Skipping ${change.field}: protected by user edit`);
        continue;
      }

      // Record history
      history.push({
        timestamp: new Date().toISOString(),
        field: change.field,
        old_value: currentField?.value || null,
        new_value: change.value,
        old_source: currentField?.source || "crawler",
        new_source: change.source,
        changed_by: change.source === "user" ? "user" : "crawler",
        user_id: userId as string,
      });

      // Update field with tracking
      brandKit[change.field] = createTrackedField(change.value, change.source);
    }

    // Save updated brand_kit
    const { error: updateError } = await supabase
      .from("brands")
      .update({ brand_kit: brandKit })
      .eq("id", brand_id);

    if (updateError) {
      return res.status(500).json({ error: "Failed to update brand kit" });
    }

    // Save history
    await saveHistory(brand_id, history);

    res.json({ success: true, applied: changes.length });
  } catch (error: unknown) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/brand-kit/history/:brandId
 * Get change history for a brand
 */
router.get("/brand-kit/history/:brandId", async (req, res) => {
  try {
    const { brandId } = req.params;
    const { field } = req.query;

    const { data, error } = await supabase
      .from("brand_kit_history")
      .select("*")
      .eq("brand_id", brandId)
      .order("created_at", { ascending: false })
      .limit(field ? 10 : 100);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Filter by field if specified
    const history = field
      ? data.filter((entry: unknown) => entry.field === field)
      : data;

    res.json({ history });
  } catch (error: unknown) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/brand-kit/revert
 * Revert a field to a previous value
 */
router.post("/brand-kit/revert", async (req, res) => {
  try {
    const { brand_id, field, history_id } = req.body;

    if (!brand_id || !field || !history_id) {
      return res
        .status(400)
        .json({ error: "brand_id, field, and history_id required" });
    }

    // Get history entry
    const { data: historyEntry, error: historyError } = await supabase
      .from("brand_kit_history")
      .select("*")
      .eq("id", history_id)
      .single();

    if (historyError || !historyEntry) {
      return res.status(404).json({ error: "History entry not found" });
    }

    // Get current brand_kit
    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .select("brand_kit")
      .eq("id", brand_id)
      .single();

    if (brandError) {
      return res.status(404).json({ error: "Brand not found" });
    }

    const brandKit = brand.brand_kit || {};

    // Revert field
    brandKit[field] = createTrackedField(
      historyEntry.old_value,
      historyEntry.old_source,
    );

    // Save
    const { error: updateError } = await supabase
      .from("brands")
      .update({ brand_kit: brandKit })
      .eq("id", brand_id);

    if (updateError) {
      return res.status(500).json({ error: "Failed to revert field" });
    }

    res.json({ success: true, field, value: historyEntry.old_value });
  } catch (error: unknown) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Helper: Save history entries
 */
async function saveHistory(brand_id: string, entries: FieldHistoryEntry[]) {
  if (entries.length === 0) return;

  const records = entries.map((entry) => ({
    brand_id,
    field: entry.field,
    old_value: entry.old_value,
    new_value: entry.new_value,
    old_source: entry.old_source,
    new_source: entry.new_source,
    changed_by: entry.changed_by,
    user_id: entry.user_id,
  }));

  await supabase.from("brand_kit_history").insert(records);

  // Cleanup: Keep only last 10 entries per field
  for (const field of new Set(entries.map((e) => e.field))) {
    const { data: allEntries } = await supabase
      .from("brand_kit_history")
      .select("id")
      .eq("brand_id", brand_id)
      .eq("field", field)
      .order("created_at", { ascending: false });

    if (allEntries && allEntries.length > 10) {
      const toDelete = allEntries.slice(10).map((e: unknown) => e.id);
      await supabase.from("brand_kit_history").delete().in("id", toDelete);
    }
  }
}

export default router;
