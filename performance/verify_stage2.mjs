import fs from "fs/promises";
import { execSync } from "child_process";

function fileMustExist(path, minBytes=1024){
  try{
    const stat = execSync(`wc -c < ${path}`).toString().trim();
    if (parseInt(stat) < minBytes) throw new Error(`${path} too small`);
    console.log("PASS", path);
  }catch(e){ console.error("FAIL", path, e.message); process.exit(1); }
}

// k6 raw logs ≥ 1 KB
fileMustExist("performance/basic-load-raw.json");
fileMustExist("performance/upload-stress-raw.json");

// Lighthouse HTML ≥ 50 KB & 포함된 "Performance score"
fileMustExist("performance/lh-desktop.html", 5_000);
fileMustExist("performance/lh-mobile.html", 5_000);

// summary.md 에 Error Rate 수치 ≤ 0.1%
async function checkErrorRate() {
  try {
    const summary = await fs.readFile("performance/summary.md","utf8");
    const m = summary.match(/Error Rate.*?([0-9.]+)%/i);
    if(!m || parseFloat(m[1])>0.1){ 
      console.error("FAIL Error Rate"); 
      process.exit(1); 
    }
    console.log("PASS Error Rate", parseFloat(m[1]) + "%");
  } catch(e) {
    console.error("FAIL Error Rate", e.message);
    process.exit(1);
  }
}

// Sentry 스크린샷 ≥ 10 KB
fileMustExist("performance/sentry-screenshot.png", 10_000);

// Check if bottleneck analysis exists
fileMustExist("performance/bottleneck-analysis.md", 5_000);

// Check if database optimization report exists
fileMustExist("performance/database-optimization-report.md", 4_000);

// Run error rate check
await checkErrorRate();

console.log("ALL CHECKS PASS");