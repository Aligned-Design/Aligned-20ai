/**
 * Sitemap Generation Script
 * Generates sitemap.xml from route metadata
 * 
 * Usage: tsx scripts/generate-sitemap.ts
 */

import { writeFileSync } from 'fs';
import { getPublicRoutes } from '../client/lib/route-metadata';

const BASE_URL = 'https://www.aligned-bydesign.com';
const OUTPUT_PATH = 'public/sitemap.xml';

function generateSitemap(): string {
  const publicRoutes = getPublicRoutes();
  const currentDate = new Date().toISOString().split('T')[0];

  const urlEntries = publicRoutes.map((route) => {
    const priority = route.path === '/' ? '1.0' : '0.8';
    const changefreq =
      route.path === '/privacy' || route.path === '/terms'
        ? 'yearly'
        : route.path === '/features' || route.path === '/integrations'
        ? 'weekly'
        : 'monthly';

    return `  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join('\n\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  
${urlEntries}

</urlset>
`;
}

function main() {
  try {
    const sitemap = generateSitemap();
    writeFileSync(OUTPUT_PATH, sitemap, 'utf-8');
    console.log(`✅ Sitemap generated successfully at ${OUTPUT_PATH}`);
    console.log(`📄 Included ${getPublicRoutes().length} public routes`);
  } catch (error) {
    console.error('❌ Failed to generate sitemap:', error);
    process.exit(1);
  }
}

main();
