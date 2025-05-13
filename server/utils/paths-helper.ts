/**
 * 경로 관련 헬퍼 유틸리티
 * 안전한 경로 해석 보장
 */

import path from 'path';

// 애플리케이션 기본 경로
export const getBasePath = (): string => {
  return process.env.BASE_PATH || process.cwd() || '.';
};

// 클라이언트 경로 (Vite 클라이언트 앱)
export const getClientPath = (): string => {
  const clientPathEnv = process.env.CLIENT_PATH;
  if (clientPathEnv) return clientPathEnv;
  
  const basePath = getBasePath();
  return path.join(basePath, 'client');
};

// 업로드 경로
export const getUploadPath = (): string => {
  const uploadDirEnv = process.env.UPLOAD_DIR;
  if (uploadDirEnv) return uploadDirEnv;
  
  const basePath = getBasePath();
  return path.join(basePath, 'uploads');
};

// 정적 파일 경로
export const getPublicPath = (): string => {
  const publicPathEnv = process.env.PUBLIC_PATH;
  if (publicPathEnv) return publicPathEnv;
  
  const basePath = getBasePath();
  return path.join(basePath, 'public');
};

// 임시 파일 경로
export const getTempPath = (): string => {
  const tempDirEnv = process.env.TEMP_DIR;
  if (tempDirEnv) return tempDirEnv;
  
  const basePath = getBasePath();
  return path.join(basePath, 'temp');
};

// 안전한 경로 해석 함수 - undefined를 방지
export const safePath = (...parts: (string | undefined)[]): string => {
  // undefined인 부분 필터링하여 유효한 경로만 사용
  const validParts = parts.filter(p => p !== undefined) as string[];
  
  // 유효한 경로가 없는 경우 기본 경로 반환
  if (validParts.length === 0) {
    return getBasePath();
  }
  
  return path.resolve(...validParts);
};

// 디렉토리 확인 및 생성 함수
export const ensureDirectoryExists = (dirPath: string): void => {
  const fs = require('fs');
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};