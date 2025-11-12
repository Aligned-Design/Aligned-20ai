/**
 * Route Metadata Export Script
 * Exports route metadata as JSON and CSV
 * 
 * Usage: tsx scripts/export-route-metadata.ts
 */

import { writeFileSync } from 'fs';
import { ROUTE_METADATA } from '../client/lib/route-metadata';

const JSON_OUTPUT = 'ROUTE_METADATA_EXPORT.json';
const CSV_OUTPUT = 'ROUTE_METADATA_EXPORT.csv';

function exportAsJSON(): void {
  const routes = Object.values(ROUTE_METADATA);
  const output = JSON.stringify(routes, null, 2);
  writeFileSync(JSON_OUTPUT, output, 'utf-8');
  console.log(`✅ JSON export: ${JSON_OUTPUT}`);
}

function exportAsCSV(): void {
  const routes = Object.values(ROUTE_METADATA);
  const headers = [
    'Path',
    'Visibility',
    'Title',
    'Description',
    'Noindex',
    'White Label',
  ];
  
  const rows = routes.map((route) => [
    route.path,
    route.visibility,
    `"${route.title}"`,
    `"${route.description}"`,
    route.noindex ? 'YES' : 'NO',
    route.whiteLabel ? 'YES' : 'NO',
  ]);

  const csv = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  writeFileSync(CSV_OUTPUT, csv, 'utf-8');
  console.log(`✅ CSV export: ${CSV_OUTPUT}`);
}

function printSummary(): void {
  const routes = Object.values(ROUTE_METADATA);
  const byVisibility = routes.reduce((acc, route) => {
    acc[route.visibility] = (acc[route.visibility] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const indexable = routes.filter((r) => !r.noindex).length;
  const noindex = routes.filter((r) => r.noindex).length;

  console.log('\n📊 Route Metadata Summary:');
  console.log(`   Total Routes: ${routes.length}`);
  console.log(`   Public: ${byVisibility.public || 0}`);
  console.log(`   User: ${byVisibility.user || 0}`);
  console.log(`   Client: ${byVisibility.client || 0}`);
  console.log(`   Indexable: ${indexable}`);
  console.log(`   Noindex: ${noindex}`);
  console.log('');
}

function main() {
  try {
    exportAsJSON();
    exportAsCSV();
    printSummary();
    console.log('✅ Route metadata export complete\n');
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

main();
