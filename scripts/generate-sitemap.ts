/**
 * Sitemap Generator
 * Generates sitemap.xml from route metadata
 * Run with: npx tsx scripts/generate-sitemap.ts
 */

import { writeFileSync } from "fs";
import { join } from "path";
import { ROUTE_METADATA } from "../client/lib/route-metadata";

const BASE_URL = "https://www.aligned-bydesign.com";
const OUTPUT_PATH = join(process.cwd(), "public", "sitemap.xml");

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

function generateSitemap(): string {
  const today = new Date().toISOString().split("T")[0];

  // Get all public routes (indexable)
  const publicRoutes = Object.values(ROUTE_METADATA).filter(
    (route) => route.visibility === "public" && !route.noindex,
  );

  // Map routes to sitemap URLs
  const urls: SitemapUrl[] = publicRoutes.map((route) => ({
    loc: `${BASE_URL}${route.path}`,
    lastmod: today,
    changefreq: getChangeFreq(route.path),
    priority: getPriority(route.path),
  }));

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  ${urls
    .map(
      (url) => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
    )
    .join("")}
</urlset>`;

  return xml;
}

function getChangeFreq(path: string): string {
  if (path === "/") return "weekly";
  if (path === "/pricing") return "monthly";
  if (path === "/features") return "weekly";
  if (path === "/integrations") return "weekly";
  if (path === "/privacy" || path === "/terms") return "yearly";
  return "monthly";
}

function getPriority(path: string): string {
  if (path === "/") return "1.0";
  if (path === "/features" || path === "/pricing" || path === "/integrations")
    return "0.9";
  if (path === "/about" || path === "/contact") return "0.8";
  if (path === "/help") return "0.7";
  if (path === "/privacy" || path === "/terms") return "0.5";
  return "0.6";
}

// Generate and write sitemap
const sitemap = generateSitemap();
writeFileSync(OUTPUT_PATH, sitemap, "utf-8");
console.log("✅ Sitemap generated successfully at:", OUTPUT_PATH);
console.log(
  `📊 Total URLs: ${Object.values(ROUTE_METADATA).filter((r) => r.visibility === "public" && !r.noindex).length}`,
);
