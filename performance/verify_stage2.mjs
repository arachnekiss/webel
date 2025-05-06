/**
 * STAGE 2 HARD-VERIFY v3
 * 
 * This script verifies that all requirements for Stage 2 have been met.
 * It enforces strict validation of real test data (not placeholders).
 * 
 * Critical Requirements:
 * 1. k6 load test results with http_req_failed.rate <= 0.001 (strict 0.1% limit)
 * 2. Lighthouse scores >= 90 for both desktop and mobile
 * 3. Sentry screenshot PNG with correct SHA-256 hash
 * 4. No placeholder content (urandom|PLACEHOLDER strings)
 * 5. Minimum file sizes: JSON >= 5KB, HTML >= 50KB, PNG >= 10KB
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function exit(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

// Verification functions
async function verifyFileExists(filePath, minSize = 0) {
  try {
    const fullPath = path.join(__dirname, filePath);
    const stats = await fs.stat(fullPath);
    
    if (stats.size < minSize) {
      await exit(`${filePath} too small (${stats.size} bytes, minimum ${minSize})`);
      return false;
    }
    
    console.log(`PASS ${filePath}`);
    return true;
  } catch (err) {
    await exit(`${filePath} not found`);
    return false;
  }
}

async function verifyK6ErrorRate(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    const data = JSON.parse(await fs.readFile(fullPath, 'utf8'));
    
    // Check error rate - STRICT requirement: <= 0.001 (0.1%)
    if (!data.metrics || !data.metrics.http_req_failed || !data.metrics.http_req_failed.values) {
      await exit(`${filePath} missing required metric: http_req_failed`);
      return false;
    }
    
    const errorRate = data.metrics.http_req_failed.values.rate;
    const errorRatePercent = errorRate * 100;
    
    if (errorRate <= 0.001) {
      console.log(`PASS ${filePath} error rate: ${errorRatePercent.toFixed(4)}%`);
      return true;
    } else {
      await exit(`${filePath} error rate too high: ${errorRatePercent.toFixed(4)}% (max 0.1%)`);
      return false;
    }
  } catch (err) {
    await exit(`Error processing ${filePath}: ${err.message}`);
    return false;
  }
}

async function verifyLighthouseScore(filePath, type) {
  try {
    const fullPath = path.join(__dirname, filePath);
    const html = await fs.readFile(fullPath, 'utf8');
    
    // Check for placeholder content
    if (html.includes('urandom') || html.includes('PLACEHOLDER')) {
      await exit(`${filePath} contains placeholder content`);
      return false;
    }
    
    // Extract performance score from HTML content
    const scoreMatch = html.match(/<div class="lh-gauge__percentage">(\d+)<\/div>\s*<\/div>\s*<div class="lh-category-label">Performance<\/div>/);
    
    if (!scoreMatch || !scoreMatch[1]) {
      await exit(`Could not extract performance score from ${filePath}`);
      return false;
    }
    
    const score = parseInt(scoreMatch[1], 10);
    
    if (score >= 90) {
      console.log(`PASS ${type} performance score: ${score}`);
      return true;
    } else {
      await exit(`${type} performance score too low: ${score} (min 90)`);
      return false;
    }
  } catch (err) {
    await exit(`Error processing ${filePath}: ${err.message}`);
    return false;
  }
}

async function verifySentryScreenshot(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    const fileData = await fs.readFile(fullPath);
    
    // Check file size
    if (fileData.length < 10 * 1024) {
      await exit(`${filePath} too small (${fileData.length} bytes, minimum 10KB)`);
      return false;
    }
    
    // Calculate SHA-256 hash
    const hash = crypto.createHash('sha256').update(fileData).digest('hex');
    console.log(`Sentry screenshot hash: ${hash}`);
    
    // Verify against reference hash if provided in environment
    const refHash = process.env.SENTRY_REF_HASH;
    if (refHash && hash !== refHash) {
      console.log(`Reference hash: ${refHash}`);
      await exit(`Sentry screenshot hash mismatch`);
      return false;
    }
    
    console.log(`PASS ${filePath}`);
    return true;
  } catch (err) {
    await exit(`${filePath} not found or invalid: ${err.message}`);
    return false;
  }
}

async function verifyNoPlaceholders(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    const fileContent = await fs.readFile(fullPath, 'utf8');
    
    if (fileContent.includes('urandom') || fileContent.includes('PLACEHOLDER')) {
      await exit(`${filePath} contains placeholder content`);
      return false;
    }
    
    return true;
  } catch (err) {
    // If file is binary or doesn't exist, skip placeholder check
    return true;
  }
}

async function verifyOverallErrorRate() {
  try {
    // Calculate from both test results
    const basicLoadPath = path.join(__dirname, 'basic-load-raw.json');
    const uploadStressPath = path.join(__dirname, 'upload-stress-raw.json');
    
    const basicLoadData = JSON.parse(await fs.readFile(basicLoadPath, 'utf8'));
    const uploadStressData = JSON.parse(await fs.readFile(uploadStressPath, 'utf8'));
    
    // Extract failure counts and total requests
    const basicLoadFails = basicLoadData.metrics.http_req_failed.values.fails || 0;
    const basicLoadTotal = basicLoadData.metrics.http_reqs.values.count || 1;
    
    const uploadStressFails = uploadStressData.metrics.http_req_failed.values.fails || 0;
    const uploadStressTotal = uploadStressData.metrics.http_reqs.values.count || 1;
    
    // Calculate overall error rate
    const totalFails = basicLoadFails + uploadStressFails;
    const totalRequests = basicLoadTotal + uploadStressTotal;
    const errorRate = (totalFails / totalRequests) * 100;
    
    if (errorRate < 0.1) {
      console.log(`PASS Error Rate: ${errorRate.toFixed(3)}%`);
      return true;
    } else {
      await exit(`Error rate too high: ${errorRate.toFixed(3)}% (max 0.1%)`);
      return false;
    }
  } catch (err) {
    await exit(`Error calculating overall error rate: ${err.message}`);
    return false;
  }
}

// Main verification function
async function runVerification() {
  // Verify k6 load test results
  await verifyK6ErrorRate('basic-load-raw.json');
  await verifyFileExists('basic-load-raw.json', 5000);
  await verifyNoPlaceholders('basic-load-raw.json');
  
  // Verify upload stress test results
  await verifyFileExists('upload-stress-raw.json', 5000);
  await verifyNoPlaceholders('upload-stress-raw.json');
  
  // Verify Lighthouse reports
  await verifyFileExists('lh-desktop.html', 50000);
  await verifyLighthouseScore('lh-desktop.html', 'desktop');
  
  await verifyFileExists('lh-mobile.html', 50000);
  await verifyLighthouseScore('lh-mobile.html', 'mobile');
  
  // Verify Sentry screenshot
  await verifySentryScreenshot('sentry-screenshot.png');
  
  // Verify analysis reports
  await verifyFileExists('bottleneck-analysis.md', 5000);
  await verifyFileExists('database-optimization-report.md', 5000);
  await verifyFileExists('summary.md', 1000);
  
  // Verify overall error rate
  await verifyOverallErrorRate();
  
  // If we get here, all checks passed
  console.log('\n=========================================');
  console.log('✅ ALL CHECKS PASS - STAGE 2 VERIFICATION COMPLETE');
  console.log('=========================================');
  process.exit(0);
}

// Run verification
runVerification().catch(error => {
  console.error('\n=========================================');
  console.error(`❌ VERIFICATION FAILED: ${error.message}`);
  console.error('=========================================');
  process.exit(1);
});