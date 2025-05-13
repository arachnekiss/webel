import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import * as path from 'path';
import * as fs from 'fs';
import { setupTusUpload } from './tus-upload';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// paths-helper 유틸리티 사용하여 안전한 경로 관리
import { getUploadPath, getPublicPath, ensureDirectoryExists } from './utils/paths-helper';

// 업로드 및 public 경로 
const uploadDir = getUploadPath();
const publicPath = getPublicPath();

// 디렉토리 존재 확인 (안전 메커니즘)
// 1. 상위 디렉터리부터 확인 (경로 충돌 방지)
ensureDirectoryExists(publicPath);

// 2. 파일 시스템 안정성 확인 후 하위 디렉터리 생성
// public 경로가 디렉터리인지 재확인
if (fs.existsSync(publicPath) && fs.statSync(publicPath).isDirectory()) {
  ensureDirectoryExists(path.join(publicPath, 'images'));
  ensureDirectoryExists(path.join(publicPath, 'static'));
} else {
  console.error(`오류: ${publicPath} 경로가 디렉터리가 아닙니다. 실행을 중단합니다.`);
  process.exit(1);
}

// 3. 업로드 디렉터리 생성
ensureDirectoryExists(uploadDir);

// uploads 및 public 디렉토리를 정적 파일로 제공
app.use('/uploads', express.static(uploadDir));
app.use('/images', express.static(path.join(publicPath, 'images')));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // tus 업로드 시스템 설정
  setupTusUpload(app);
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    console.error('Error:', err);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
