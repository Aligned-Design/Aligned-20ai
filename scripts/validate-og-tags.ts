/**
 * OpenGraph Tag Validation Script
 * Validates OG tags are properly configured for all public pages
 * 
 * Usage: tsx scripts/validate-og-tags.ts
 */

import { getPublicRoutes } from '../client/lib/route-metadata';

interface ValidationResult {
  route: string;
  valid: boolean;
  issues: string[];
  tags: {
    title: boolean;
    description: boolean;
    type: boolean;
    url: boolean;
    image: boolean;
    siteName: boolean;
    twitterCard: boolean;
  };
}

function validateRoute(route: { path: string; title: string; description: string; ogImage?: string }): ValidationResult {
  const issues: string[] = [];
  const tags = {
    title: false,
    description: false,
    type: true, // Always set to 'website' by SEOHead
    url: true, // Generated from path
    image: false,
    siteName: true, // Always set to 'Aligned AI'
    twitterCard: true, // Always set to 'summary_large_image'
  };

  // Check title
  if (route.title && route.title.length > 0) {
    tags.title = true;
    if (route.title.length > 60) {
      issues.push(`Title too long (${route.title.length} chars, recommended < 60)`);
    }
  } else {
    issues.push('Missing title');
  }

  // Check description
  if (route.description && route.description.length > 0) {
    tags.description = true;
    if (route.description.length > 160) {
      issues.push(`Description too long (${route.description.length} chars, recommended < 160)`);
    }
    if (route.description.length < 50) {
      issues.push(`Description too short (${route.description.length} chars, recommended > 50)`);
    }
  } else {
    issues.push('Missing description');
  }

  // Check OG image
  if (route.ogImage) {
    tags.image = true;
    if (!route.ogImage.startsWith('http')) {
      issues.push('OG image should be absolute URL');
    }
  } else {
    issues.push('Missing OG image (will use default)');
  }

  const valid = issues.filter(i => !i.includes('(will use default)')).length === 0;

  return {
    route: route.path,
    valid,
    issues,
    tags,
  };
}

function main() {
  const publicRoutes = getPublicRoutes();
  const results: ValidationResult[] = publicRoutes.map(validateRoute);

  console.log('\n🔍 OpenGraph Tag Validation Report\n');
  console.log('='.repeat(70));

  let passCount = 0;
  let warnCount = 0;
  let failCount = 0;

  results.forEach((result) => {
    const status = result.valid ? '✅' : result.issues.some(i => i.includes('Missing')) ? '❌' : '⚠️';
    
    if (result.valid) passCount++;
    else if (status === '❌') failCount++;
    else warnCount++;

    console.log(`\n${status} ${result.route}`);
    
    if (result.issues.length > 0) {
      result.issues.forEach((issue) => {
        const icon = issue.includes('will use default') ? '  ℹ️' : issue.includes('too') ? '  ⚠️' : '  ❌';
        console.log(`${icon} ${issue}`);
      });
    }

    // Show tag status
    const tagStatus = Object.entries(result.tags)
      .filter(([_, value]) => value)
      .map(([key]) => key)
      .join(', ');
    console.log(`  Tags: ${tagStatus}`);
  });

  console.log('\n' + '='.repeat(70));
  console.log('\n📊 Summary:');
  console.log(`   Total Routes: ${results.length}`);
  console.log(`   ✅ Passed: ${passCount}`);
  console.log(`   ⚠️  Warnings: ${warnCount}`);
  console.log(`   ❌ Failed: ${failCount}`);

  console.log('\n📋 Checklist:');
  console.log('   - All routes have titles');
  console.log('   - All routes have descriptions');
  console.log('   - OG images configured (or using default)');
  console.log('   - Twitter Card support enabled');
  console.log('   - Canonical URLs generated');

  console.log('\n🧪 Test URLs:');
  console.log('   Facebook: https://developers.facebook.com/tools/debug/');
  console.log('   Twitter: https://cards-dev.twitter.com/validator');
  console.log('   LinkedIn: https://www.linkedin.com/post-inspector/');

  console.log('\n✅ OG tag validation complete\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

main();
