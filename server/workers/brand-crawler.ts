/**
 * Brand Crawler Worker
 *
 * Crawls brand websites to extract:
 * - Voice/tone from content
 * - Color palette from visuals
 * - Keywords and themes
 * - AI-generated summaries and embeddings
 */

import { chromium, Browser, Page } from "playwright";
import Vibrant from "node-vibrant";
import robotsParser from "robots-parser";
import OpenAI from "openai";
import crypto from "crypto";

// Environment configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const CRAWL_MAX_PAGES = parseInt(process.env.CRAWL_MAX_PAGES || "50", 10);
const CRAWL_TIMEOUT_MS = parseInt(process.env.CRAWL_TIMEOUT_MS || "30000", 10);
const CRAWL_USER_AGENT = process.env.CRAWL_USER_AGENT || "AlignedAIBot/1.0";
const MAX_DEPTH = 3;
const CRAWL_DELAY_MS = 1000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

interface CrawlResult {
  url: string;
  title: string;
  metaDescription: string;
  h1: string[];
  h2: string[];
  h3: string[];
  bodyText: string;
  hash: string;
}

interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  confidence: number;
}

interface VoiceSummary {
  tone: string[];
  style: string;
  avoid: string[];
  audience: string;
  personality: string[];
}

interface BrandKitData {
  voice_summary: VoiceSummary;
  keyword_themes: string[];
  about_blurb: string;
  colors: ColorPalette;
  source_urls: string[];
}

/**
 * Retry helper with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  delayMs: number = RETRY_DELAY_MS,
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.warn(
        `[Brand Crawler] Attempt ${i + 1}/${maxRetries} failed: ${lastError.message}. Retrying in ${delayMs * Math.pow(2, i)}ms...`,
      );

      // Exponential backoff
      if (i < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, delayMs * Math.pow(2, i)),
        );
      }
    }
  }

  throw lastError || new Error("Max retries exceeded");
}

/**
 * Main orchestrator for brand intake processing
 */
export async function processBrandIntake(
  brandId: string,
  websiteUrl: string,
  supabase: any,
): Promise<BrandKitData> {
  console.log(`[Brand Crawler] Starting intake for brand ${brandId}`);

  try {
    // Step 1: Crawl website with retry logic
    const crawlResults = await retryWithBackoff(
      () => crawlWebsite(websiteUrl),
      MAX_RETRIES,
      RETRY_DELAY_MS,
    );
    console.log(
      `[Brand Crawler] Crawled ${crawlResults.length} pages (with retries)`,
    );

    // Step 2: Extract colors with retry logic
    const colors = await retryWithBackoff(
      () => extractColors(websiteUrl),
      MAX_RETRIES,
      RETRY_DELAY_MS,
    );
    console.log(`[Brand Crawler] Extracted color palette (with retries)`);

    // Step 3: Generate AI summaries (or fallback)
    const brandKit = await generateBrandKit(crawlResults, colors, websiteUrl);
    console.log(`[Brand Crawler] Generated brand kit`);

    // Step 4: Create embeddings (if OpenAI available)
    if (OPENAI_API_KEY) {
      try {
        await createEmbeddings(brandId, brandKit, crawlResults, supabase);
        console.log(`[Brand Crawler] Created embeddings`);
      } catch (embeddingError) {
        console.warn(
          "[Brand Crawler] Error creating embeddings (non-critical):",
          embeddingError,
        );
        // Don't fail the entire process if embeddings fail
      }
    } else {
      console.warn(
        "[Brand Crawler] OPENAI_API_KEY not set, skipping embeddings",
      );
    }

    return brandKit;
  } catch (error) {
    console.error(`[Brand Crawler] Error processing brand ${brandId}:`, error);
    throw error;
  }
}

/**
 * Crawl website with Playwright
 * - Same-domain only
 * - Max 50 pages, depth ≤ 3
 * - Respects robots.txt
 * - 1s delay between requests
 */
export async function crawlWebsite(startUrl: string): Promise<CrawlResult[]> {
  const baseUrl = new URL(startUrl);
  const baseDomain = baseUrl.hostname;

  const visited = new Set<string>();
  const results: CrawlResult[] = [];
  const queue: { url: string; depth: number }[] = [{ url: startUrl, depth: 0 }];

  // Check robots.txt
  const robotsTxt = await fetchRobotsTxt(startUrl);
  const robots = robotsParser(robotsTxt.url, robotsTxt.content);

  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    while (queue.length > 0 && results.length < CRAWL_MAX_PAGES) {
      const { url, depth } = queue.shift()!;

      // Skip if already visited or too deep
      if (visited.has(url) || depth > MAX_DEPTH) continue;

      // Check if URL is allowed by robots.txt
      if (!robots.isAllowed(url, CRAWL_USER_AGENT)) {
        console.log(`[Crawler] Blocked by robots.txt: ${url}`);
        continue;
      }

      visited.add(url);

      try {
        const page = await browser.newPage({
          userAgent: CRAWL_USER_AGENT,
        });

        // Fetch page with retry logic
        await retryWithBackoff(
          () =>
            page.goto(url, {
              timeout: CRAWL_TIMEOUT_MS,
              waitUntil: "networkidle",
            }),
          2, // Fewer retries per page (max 3 total with main retries)
          500, // Shorter delay for individual page fetches
        );

        // Extract content
        const crawlData = await extractPageContent(page, url);
        results.push(crawlData);

        // Find same-domain links for next crawl
        if (depth < MAX_DEPTH) {
          const links = await page.$$eval("a[href]", (anchors) =>
            anchors.map((a) => (a as HTMLAnchorElement).href),
          );

          for (const link of links) {
            try {
              const linkUrl = new URL(link);
              // Only follow same-domain links
              if (linkUrl.hostname === baseDomain && !visited.has(link)) {
                queue.push({ url: link, depth: depth + 1 });
              }
            } catch {
              // Invalid URL, skip
            }
          }
        }

        await page.close();

        // Crawl delay
        await new Promise((resolve) => setTimeout(resolve, CRAWL_DELAY_MS));
      } catch (error) {
        console.error(`[Crawler] Error crawling ${url}:`, error);
      }
    }

    return results;
  } finally {
    if (browser) await browser.close();
  }
}

/**
 * Fetch robots.txt for the domain
 */
async function fetchRobotsTxt(
  url: string,
): Promise<{ url: string; content: string }> {
  const robotsUrl = new URL("/robots.txt", url).toString();

  try {
    const response = await fetch(robotsUrl);
    const content = response.ok ? await response.text() : "";
    return { url: robotsUrl, content };
  } catch {
    return { url: robotsUrl, content: "" };
  }
}

/**
 * Extract content from a single page
 */
async function extractPageContent(
  page: Page,
  url: string,
): Promise<CrawlResult> {
  // Extract title
  const title = await page.title();

  // Extract meta description
  const metaDescription = await page
    .$eval('meta[name="description"]', (el) => el.getAttribute("content") || "")
    .catch(() => "");

  // Extract headings
  const h1 = await page.$$eval("h1", (els) =>
    els.map((el) => el.textContent?.trim() || ""),
  );
  const h2 = await page.$$eval("h2", (els) =>
    els.map((el) => el.textContent?.trim() || ""),
  );
  const h3 = await page.$$eval("h3", (els) =>
    els.map((el) => el.textContent?.trim() || ""),
  );

  // Extract body text (excluding nav, footer, script, style)
  const bodyText = await page.evaluate(() => {
    const excludeSelectors = [
      "nav",
      "footer",
      "script",
      "style",
      "noscript",
      "iframe",
    ];
    const clone = document.body.cloneNode(true) as HTMLElement;

    excludeSelectors.forEach((selector) => {
      clone.querySelectorAll(selector).forEach((el) => el.remove());
    });

    return clone.textContent?.trim() || "";
  });

  // Create hash for deduplication
  const hash = crypto.createHash("md5").update(bodyText).digest("hex");

  return {
    url,
    title,
    metaDescription,
    h1,
    h2,
    h3,
    bodyText,
    hash,
  };
}

/**
 * Extract color palette using node-vibrant
 */
export async function extractColors(url: string): Promise<ColorPalette> {
  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ userAgent: CRAWL_USER_AGENT });
    await page.goto(url, {
      timeout: CRAWL_TIMEOUT_MS,
      waitUntil: "networkidle",
    });

    // Take screenshot
    const screenshot = await page.screenshot({ fullPage: false });

    // Extract colors with vibrant
    const palette = await Vibrant.from(screenshot).getPalette();

    const colors: ColorPalette = {
      primary: palette.Vibrant?.hex || "#8B5CF6",
      secondary: palette.LightVibrant?.hex || "#F0F7F7",
      accent: palette.DarkVibrant?.hex || "#EC4899",
      confidence: palette.Vibrant?.population || 0,
    };

    await browser.close();
    return colors;
  } catch (error) {
    console.error("[Crawler] Error extracting colors:", error);
    // Fallback to default colors
    return {
      primary: "#8B5CF6",
      secondary: "#F0F7F7",
      accent: "#EC4899",
      confidence: 0,
    };
  } finally {
    if (browser) await browser.close();
  }
}

/**
 * Generate brand kit using OpenAI (or fallback)
 */
async function generateBrandKit(
  crawlResults: CrawlResult[],
  colors: ColorPalette,
  sourceUrl: string,
): Promise<BrandKitData> {
  // Dedupe by hash
  const uniqueResults = deduplicateResults(crawlResults);

  // Combine text
  const combinedText = uniqueResults
    .map((r) => `${r.title}\n${r.metaDescription}\n${r.bodyText}`)
    .join("\n\n")
    .slice(0, 10000); // Limit to 10k chars

  if (OPENAI_API_KEY) {
    return await generateBrandKitWithAI(combinedText, colors, sourceUrl);
  } else {
    return generateBrandKitFallback(uniqueResults, colors, sourceUrl);
  }
}

/**
 * Deduplicate crawl results by hash
 */
function deduplicateResults(results: CrawlResult[]): CrawlResult[] {
  const seen = new Set<string>();
  return results.filter((result) => {
    if (seen.has(result.hash)) return false;
    seen.add(result.hash);
    return true;
  });
}

/**
 * Generate brand kit using OpenAI
 */
async function generateBrandKitWithAI(
  text: string,
  colors: ColorPalette,
  sourceUrl: string,
): Promise<BrandKitData> {
  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

  const prompt = `Analyze this brand's website content and extract:
1. Tone (3-5 adjectives, e.g., "professional", "friendly", "innovative")
2. Writing style (1-2 words, e.g., "conversational", "formal")
3. Words to avoid (if any compliance issues detected)
4. Target audience (1 sentence)
5. Brand personality traits (3-5 adjectives)
6. Top 5 keyword themes
7. A concise "About" blurb (120-160 characters)

Website content:
${text}

Respond in JSON format:
{
  "tone": ["..."],
  "style": "...",
  "avoid": ["..."],
  "audience": "...",
  "personality": ["..."],
  "keyword_themes": ["..."],
  "about_blurb": "..."
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const aiResult = JSON.parse(response.choices[0].message.content || "{}");

    return {
      voice_summary: {
        tone: aiResult.tone || [],
        style: aiResult.style || "conversational",
        avoid: aiResult.avoid || [],
        audience: aiResult.audience || "",
        personality: aiResult.personality || [],
      },
      keyword_themes: aiResult.keyword_themes || [],
      about_blurb: aiResult.about_blurb || "",
      colors,
      source_urls: [sourceUrl],
    };
  } catch (error) {
    console.error("[AI] Error generating brand kit:", error);
    return generateBrandKitFallback(
      [{ bodyText: text } as CrawlResult],
      colors,
      sourceUrl,
    );
  }
}

/**
 * Fallback brand kit generation (rule-based)
 */
function generateBrandKitFallback(
  results: CrawlResult[],
  colors: ColorPalette,
  sourceUrl: string,
): Promise<BrandKitData> {
  const allText = results.map((r) => r.bodyText).join(" ");

  // Simple keyword extraction (top words by frequency)
  const words = allText.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];

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
  ]);
  const keywords = Object.entries(wordFreq)
    .filter(([word]) => !stopWords.has(word))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);

  // Generate about blurb from meta description or first paragraph
  const aboutBlurb =
    results[0]?.metaDescription?.slice(0, 160) ||
    results[0]?.bodyText?.slice(0, 160) ||
    "A professional brand committed to excellence.";

  return Promise.resolve({
    voice_summary: {
      tone: ["professional", "modern"],
      style: "conversational",
      avoid: [],
      audience: "general public",
      personality: ["trustworthy", "reliable"],
    },
    keyword_themes: keywords,
    about_blurb: aboutBlurb,
    colors,
    source_urls: [sourceUrl],
  });
}

/**
 * Create vector embeddings for brand context
 */
async function createEmbeddings(
  brandId: string,
  brandKit: BrandKitData,
  crawlResults: CrawlResult[],
  supabase: any,
): Promise<void> {
  if (!OPENAI_API_KEY) {
    console.warn("[Embeddings] OPENAI_API_KEY not set, skipping");
    return;
  }

  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

  // Combine brand context for embedding
  const contextText = `
    ${brandKit.about_blurb}
    Tone: ${brandKit.voice_summary.tone.join(", ")}
    Style: ${brandKit.voice_summary.style}
    Audience: ${brandKit.voice_summary.audience}
    Keywords: ${brandKit.keyword_themes.join(", ")}
    ${crawlResults
      .slice(0, 3)
      .map((r) => r.bodyText.slice(0, 500))
      .join("\n")}
  `.trim();

  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: contextText,
    });

    const embedding = response.data[0].embedding;

    // Store in Supabase with pgvector
    await supabase.from("brand_embeddings").upsert({
      brand_id: brandId,
      embedding,
      content: contextText,
      updated_at: new Date().toISOString(),
    });

    console.log(`[Embeddings] Created embedding for brand ${brandId}`);
  } catch (error) {
    console.error("[Embeddings] Error creating embedding:", error);
  }
}
