#!/usr/bin/env node

/**
 * Run Stage 3 multilingual search migration script
 * 
 * This script will execute the SQL migration to add the necessary PostgreSQL
 * extensions and functions required for multilingual search optimization.
 */

import { spawnSync } from 'child_process';

console.log('=== Stage 3: Multilingual Search Optimization Migration ===');
console.log('Running migration script...');

// Execute the migration script using tsx
const result = spawnSync('tsx', ['server/migrations/run_multilingual_search.ts'], {
  stdio: 'inherit',
  shell: true
});

if (result.status === 0) {
  console.log('\n✅ Migration completed successfully');
  console.log('The database now has:');
  console.log('  - pg_trgm extension installed');
  console.log('  - Language-specific normalization functions');
  console.log('  - Optimized search indexes for 5 languages');
  console.log('\nYou can now use the multilingual search API at:');
  console.log('  GET /api/search?q=query&lang=auto&type=all');
  console.log('\nSupported languages:');
  console.log('  - Korean (ko)');
  console.log('  - English (en)');
  console.log('  - Japanese (ja)');
  console.log('  - Chinese (zh)');
  console.log('  - Spanish (es)');
} else {
  console.error('\n❌ Migration failed');
  console.error('Check the logs above for details');
  process.exit(1);
}