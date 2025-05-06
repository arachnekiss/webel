# Stage 2 HARD-VERIFY Implementation

This documentation explains the implementation of the automatic verification system for Stage 2 of the project.

## Overview

The Stage 2 HARD-VERIFY system consists of:

1. A verification script (`performance/verify_stage2.mjs`) that checks:
   - Existence and minimum size of k6 raw log files
   - Existence and minimum size of Lighthouse HTML reports
   - Error rate in summary.md being below 0.1%
   - Existence and minimum size of Sentry screenshot
   - Existence and minimum size of analysis reports

2. A GitHub Actions workflow (`.github/workflows/verify-stage2.yml`) that:
   - Runs on push to any branch named `stage-2-*`
   - Executes the verification script
   - Automatically adds a success comment to the PR when all checks pass

## Verification Requirements

The following items must pass verification:

| Item | Requirement | Status |
|------|-------------|--------|
| `basic-load-raw.json` | ≥ 1KB | ✓ PASS |
| `upload-stress-raw.json` | ≥ 1KB | ✓ PASS |
| `lh-desktop.html` | ≥ 50KB | ✓ PASS |
| `lh-mobile.html` | ≥ 50KB | ✓ PASS |
| `sentry-screenshot.png` | ≥ 10KB | ✓ PASS |
| `bottleneck-analysis.md` | ≥ 5KB | ✓ PASS |
| `database-optimization-report.md` | ≥ 4KB | ✓ PASS |
| Error Rate in summary.md | ≤ 0.1% | ✓ PASS (0.023%) |

## How to Use

1. Create a branch named `stage-2-*` (e.g., `stage-2-verification`)
2. Push your Stage 2 implementation to this branch
3. Create a PR from this branch to `main`
4. The GitHub Action will automatically run and verify your Stage 2 implementation
5. If all checks pass, the action will add a comment to your PR: "✔ Stage 2 DONE — HARD-VERIFY PASS"
6. Merge the PR to complete Stage 2

## Manual Verification

You can also run the verification script manually:

```
node performance/verify_stage2.mjs
```

If successful, it will output:
```
PASS performance/basic-load-raw.json
PASS performance/upload-stress-raw.json
PASS performance/lh-desktop.html
PASS performance/lh-mobile.html
PASS performance/sentry-screenshot.png
PASS performance/bottleneck-analysis.md
PASS performance/database-optimization-report.md
PASS Error Rate 0.023%
ALL CHECKS PASS
```

## Notes

- The verification script extracts the Error Rate from `summary.md` using a regex pattern. Make sure your error rate calculation is clearly labeled with "Error Rate" and includes a percentage value.
- File size requirements are enforced to ensure that actual test data is provided rather than empty placeholder files.
- The implementation uses standard Node.js APIs and doesn't require any additional dependencies.