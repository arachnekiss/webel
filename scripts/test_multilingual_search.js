#!/usr/bin/env node

/**
 * Multilingual Search Test Tool
 * 
 * This script sends test queries to the multilingual search API
 * to verify that it works correctly with different languages.
 */

import fetch from 'node-fetch';
import { table } from 'table';
import chalk from 'chalk';

// Configuration
const baseUrl = 'http://localhost:5000';
const testQueries = [
  { lang: 'ko', query: '엔지니어링', description: 'Korean - Engineering' },
  { lang: 'en', query: 'engineering', description: 'English - Engineering' },
  { lang: 'ja', query: 'エンジニアリング', description: 'Japanese - Engineering' },
  { lang: 'zh', query: '工程', description: 'Chinese - Engineering' },
  { lang: 'es', query: 'ingeniería', description: 'Spanish - Engineering' },
  
  // Auto language detection tests
  { lang: 'auto', query: '소프트웨어', description: 'Auto detect - Korean (Software)' },
  { lang: 'auto', query: 'software', description: 'Auto detect - English (Software)' },
  { lang: 'auto', query: '3Dプリンター', description: 'Auto detect - Japanese (3D Printer)' },
  
  // Multi-term search tests
  { lang: 'en', query: 'open source software', description: 'Multi-term - English' },
  { lang: 'ko', query: '오픈 소스 소프트웨어', description: 'Multi-term - Korean' }
];

async function runTest() {
  console.log(chalk.bold.blue('=== Multilingual Search Test Tool ===\n'));
  console.log(chalk.yellow('Sending test queries to the API...\n'));
  
  const results = [];
  const tableHeaders = ['Description', 'Query', 'Lang', 'Status', 'Time (ms)', 'Results'];
  
  for (const { lang, query, description } of testQueries) {
    const startTime = Date.now();
    
    try {
      // Build the URL
      const url = new URL('/api/search', baseUrl);
      url.searchParams.append('q', query);
      url.searchParams.append('lang', lang);
      url.searchParams.append('limit', '5');
      
      console.log(chalk.gray(`Testing: ${description} - ${url}`));
      
      const response = await fetch(url.toString());
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (response.ok) {
        const data = await response.json();
        
        results.push([
          description,
          query,
          data.language || lang,
          chalk.green('✓'),
          duration,
          `${data.totalCount} results`
        ]);
      } else {
        const errorText = await response.text();
        results.push([
          description,
          query,
          lang,
          chalk.red('✗'),
          duration,
          chalk.red(`Error: ${response.status} - ${errorText}`)
        ]);
      }
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      results.push([
        description,
        query,
        lang,
        chalk.red('✗'),
        duration,
        chalk.red(`Error: ${error.message}`)
      ]);
    }
  }
  
  // Display results in a table
  console.log('\n' + table([tableHeaders, ...results]));
  
  // Summary
  const successCount = results.filter(r => r[3] === chalk.green('✓')).length;
  const totalTests = results.length;
  
  console.log(chalk.bold(`${successCount}/${totalTests} tests passed\n`));
  
  if (successCount === totalTests) {
    console.log(chalk.bold.green('✅ All tests passed successfully!'));
  } else {
    console.log(chalk.bold.yellow('⚠️ Some tests failed. Check the results above.'));
  }
}

// Main execution
runTest().catch(error => {
  console.error(chalk.red('\nError running tests:'), error);
  process.exit(1);
});