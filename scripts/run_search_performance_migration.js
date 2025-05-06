/**
 * Script to run search performance optimization migration
 * This migration adds normalized generated columns with GIN indexes to improve search performance
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration
const migrationFile = path.join(__dirname, '../server/migrations/20250507_optimize_search_performance.sql');

// Connect to database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function runMigration() {
  console.log('Starting search performance optimization migration...');
  const client = await pool.connect();
  
  try {
    // Read migration SQL file
    const sql = fs.readFileSync(migrationFile, 'utf8');
    
    // Start transaction
    await client.query('BEGIN');
    
    console.log('Executing migration...');
    await client.query(sql);
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('Migration completed successfully!');
    
    // Run EXPLAIN ANALYZE on sample queries to test performance
    console.log('\nAnalyzing query performance:');
    
    // Sample query 1: Basic text search
    console.log('\nQuery 1: Basic text search');
    const q1Result = await client.query(`
      EXPLAIN ANALYZE
      SELECT id, title, description, category, tags
      FROM resources
      WHERE norm_title % 'software' OR norm_desc % 'software'
      LIMIT 10
    `);
    console.log(q1Result.rows.map(row => row.QUERY_PLAN).join('\n'));
    
    // Sample query 2: Multilingual search
    console.log('\nQuery 2: Multilingual search (Korean)');
    const q2Result = await client.query(`
      EXPLAIN ANALYZE
      SELECT id, title, description, category, tags
      FROM resources
      WHERE norm_title % '소프트웨어' OR norm_desc % '소프트웨어'
      LIMIT 10
    `);
    console.log(q2Result.rows.map(row => row.QUERY_PLAN).join('\n'));
    
    // Sample query 3: Combined search with sorting
    console.log('\nQuery 3: Combined search with category filtering and sorting');
    const q3Result = await client.query(`
      EXPLAIN ANALYZE
      SELECT id, title, description, category, tags, created_at
      FROM resources
      WHERE 
        (norm_title % 'programming' OR norm_desc % 'programming' OR 'programming' = ANY(tags))
        AND category = 'software'
      ORDER BY created_at DESC
      LIMIT 10
    `);
    console.log(q3Result.rows.map(row => row.QUERY_PLAN).join('\n'));

  } catch (error) {
    // Rollback transaction in case of error
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    // Release client back to pool
    client.release();
    await pool.end();
  }
}

// Run migration
runMigration().catch(error => {
  console.error('Migration script failed:', error);
  process.exit(1);
});