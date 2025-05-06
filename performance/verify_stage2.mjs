import fs from "fs/promises";
import { execSync } from "child_process";

// Failure function with retry count tracking
let failCount = 0;
function fail(message) {
  failCount++;
  console.error(`FAIL: ${message}`);
  
  if (failCount >= 3) {
    console.error("\n========================================");
    console.error("⚠️ HELP NEEDED: Verification failed 3 times");
    console.error("Please submit authentic test data that meets all verification requirements");
    console.error("========================================\n");
    process.exit(1);
  }
  
  process.exit(1);
}

// Check file size and content
async function verifyFile(path, minBytes, checks = {}) {
  try {
    // Check if file exists
    const stat = await fs.stat(path);
    if (stat.size < minBytes) {
      fail(`${path} too small (${stat.size} bytes, minimum ${minBytes})`);
    }
    
    // Read file content
    const content = await fs.readFile(path, checks.encoding || 'utf8');
    
    // Check for placeholder/cheating patterns
    if (!checks.isBinary && (
      content.includes('__PLACEHOLDER__') || 
      content.includes('/dev/urandom') || 
      content.includes('urandom')
    )) {
      fail(`${path} contains placeholder markers`);
    }
    
    // Check for specific content patterns
    if (checks.patterns) {
      for (const [name, pattern] of Object.entries(checks.patterns)) {
        if (!pattern.test(content)) {
          fail(`${path} missing required content: ${name}`);
        }
      }
    }
    
    // Check for duplicate HTML content (indicates copy-paste)
    if (checks.checkForDuplicateHtml && content.includes('<html>')) {
      const htmlCount = (content.match(/<html>/g) || []).length;
      if (htmlCount >= 3) {
        fail(`${path} contains duplicated HTML content (${htmlCount} <html> tags)`);
      }
    }
    
    // Parse JSON if required
    if (checks.parseJson) {
      try {
        const json = JSON.parse(content);
        
        // Run JSON validation function if provided
        if (checks.validateJson) {
          checks.validateJson(json, path);
        }
      } catch (e) {
        fail(`${path} contains invalid JSON: ${e.message}`);
      }
    }
    
    console.log(`PASS ${path}`);
    return true;
  } catch (e) {
    if (e.code === 'ENOENT') {
      fail(`${path} does not exist`);
    } else {
      fail(`${path} verification error: ${e.message}`);
    }
    return false;
  }
}

// k6 raw logs verification ≥ 5 KB and error rate check
await verifyFile("performance/basic-load-raw.json", 5_000, {
  parseJson: true,
  validateJson: (json, path) => {
    // Check if metrics structure exists
    if (!json.metrics || !json.metrics.http_req_failed) {
      fail(`${path} is missing required metrics data`);
    }
    
    // Check error rate
    const errorRate = json.metrics.http_req_failed.value;
    if (errorRate > 0.001) {
      fail(`${path} error rate (${errorRate}) exceeds maximum (0.001)`);
    }
    
    // Ensure test ran with correct parameters
    if (!json.options || !json.options.scenarios || !json.options.scenarios.default) {
      fail(`${path} missing test configuration data`);
    }
    
    const scenario = json.options.scenarios.default;
    if (scenario.vus !== 10 || !scenario.duration.includes("5m")) {
      fail(`${path} was not run with required parameters (10 VUs, 5m duration)`);
    }
    
    console.log(`PASS ${path} error rate: ${errorRate}`);
  }
});

// Upload stress test verification ≥ 5 KB
await verifyFile("performance/upload-stress-raw.json", 5_000, {
  parseJson: true,
  validateJson: (json, path) => {
    // Check if metrics structure exists
    if (!json.metrics) {
      fail(`${path} is missing required metrics data`);
    }
    
    // Check if upload metrics are present
    if (!json.metrics.upload_error_rate) {
      fail(`${path} is missing upload_error_rate metric`);
    }
    
    // Ensure test ran with correct parameters
    if (!json.options || !json.options.scenarios || !json.options.scenarios.default) {
      fail(`${path} missing test configuration data`);
    }
    
    const scenario = json.options.scenarios.default;
    if (scenario.vus !== 10 || !scenario.duration.includes("2m")) {
      fail(`${path} was not run with required parameters (10 VUs, 2m duration)`);
    }
  }
});

// Lighthouse HTML verification ≥ 50 KB
const lighthouseScorePattern = /<div class="lh-gauge__percentage">(\d+)<\/div>/;
await verifyFile("performance/lh-desktop.html", 50_000, {
  checkForDuplicateHtml: true,
  patterns: {
    'performance score': lighthouseScorePattern
  },
  validateScore: async (path) => {
    const content = await fs.readFile(path, 'utf8');
    const match = content.match(lighthouseScorePattern);
    if (!match) {
      fail(`${path} is missing performance score`);
    }
    
    const score = parseInt(match[1], 10);
    if (score < 90) {
      fail(`${path} performance score (${score}) is below minimum (90)`);
    }
    
    console.log(`PASS ${path} performance score: ${score}`);
  }
});

// Check Lighthouse desktop score
const desktopContent = await fs.readFile("performance/lh-desktop.html", 'utf8');
const desktopMatch = desktopContent.match(lighthouseScorePattern);
if (!desktopMatch) {
  fail("lh-desktop.html is missing performance score");
}

const desktopScore = parseInt(desktopMatch[1], 10);
if (desktopScore < 90) {
  fail(`Desktop performance score (${desktopScore}) is below minimum (90)`);
}
console.log(`PASS desktop performance score: ${desktopScore}`);

// Check Lighthouse mobile score
await verifyFile("performance/lh-mobile.html", 50_000, {
  checkForDuplicateHtml: true,
  patterns: {
    'performance score': lighthouseScorePattern
  }
});

const mobileContent = await fs.readFile("performance/lh-mobile.html", 'utf8');
const mobileMatch = mobileContent.match(lighthouseScorePattern);
if (!mobileMatch) {
  fail("lh-mobile.html is missing performance score");
}

const mobileScore = parseInt(mobileMatch[1], 10);
if (mobileScore < 90) {
  fail(`Mobile performance score (${mobileScore}) is below minimum (90)`);
}
console.log(`PASS mobile performance score: ${mobileScore}`);

// Sentry screenshot ≥ 10 KB (binary file)
await verifyFile("performance/sentry-screenshot.png", 10_000, { 
  isBinary: true,
  encoding: null
});

// TODO: When SENTRY_REF_HASH environment variable is available:
// const sentryHashReference = process.env.SENTRY_REF_HASH;
// if (sentryHashReference) {
//   const sentryImageHash = crypto.createHash('sha256').update(await fs.readFile("performance/sentry-screenshot.png")).digest('hex');
//   if (sentryImageHash !== sentryHashReference) {
//     fail(`Sentry screenshot hash mismatch: ${sentryImageHash} ≠ ${sentryHashReference}`);
//   }
//   console.log("PASS Sentry screenshot hash verification");
// }

// Check markdown reports
await verifyFile("performance/bottleneck-analysis.md", 5_000);
await verifyFile("performance/database-optimization-report.md", 4_000);

// Verify summary.md error rate ≤ 0.1%
await verifyFile("performance/summary.md", 1_000);
const summary = await fs.readFile("performance/summary.md", 'utf8');
const errorRateMatch = summary.match(/Error Rate.*?([0-9.]+)%/i);
if (!errorRateMatch) {
  fail("summary.md is missing Error Rate calculation");
}

const errorRate = parseFloat(errorRateMatch[1]);
if (errorRate > 0.1) {
  fail(`Error Rate (${errorRate}%) exceeds maximum (0.1%)`);
}
console.log(`PASS Error Rate: ${errorRate}%`);

console.log("\n========================================");
console.log("✅ ALL CHECKS PASS - STAGE 2 VERIFICATION COMPLETE");
console.log("========================================\n");