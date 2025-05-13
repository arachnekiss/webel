import path from 'path';
import fs from 'fs';

// 기본 경로 설정 (환경 변수가 없을 때 사용될 기본값)
const DEFAULT_UPLOAD_DIR = './uploads';
const DEFAULT_TEMP_DIR = './temp';
const DEFAULT_CLIENT_PATH = './client/dist';
const DEFAULT_BASE_PATH = '.';
const DEFAULT_PUBLIC_PATH = './public';

/**
 * 업로드 디렉토리 경로를 안전하게 가져오는 함수
 * 환경 변수가 없으면 기본값 사용
 */
export function getUploadPath(): string {
  const uploadPath = process.env.UPLOAD_DIR || DEFAULT_UPLOAD_DIR;
  
  // 상대 경로인 경우 절대 경로로 변환
  if (!path.isAbsolute(uploadPath)) {
    return path.resolve(process.cwd(), uploadPath);
  }
  
  return uploadPath;
}

/**
 * 임시 디렉토리 경로를 안전하게 가져오는 함수
 */
export function getTempPath(): string {
  const tempPath = process.env.TEMP_DIR || DEFAULT_TEMP_DIR;
  
  // 상대 경로인 경우 절대 경로로 변환
  if (!path.isAbsolute(tempPath)) {
    return path.resolve(process.cwd(), tempPath);
  }
  
  return tempPath;
}

/**
 * 클라이언트 빌드 디렉토리 경로를 안전하게 가져오는 함수
 */
export function getClientPath(): string {
  const clientPath = process.env.CLIENT_PATH || DEFAULT_CLIENT_PATH;
  
  // 상대 경로인 경우 절대 경로로 변환
  if (!path.isAbsolute(clientPath)) {
    return path.resolve(process.cwd(), clientPath);
  }
  
  return clientPath;
}

/**
 * 기본 경로를 안전하게 가져오는 함수
 */
export function getBasePath(): string {
  const basePath = process.env.BASE_PATH || DEFAULT_BASE_PATH;
  
  // 상대 경로인 경우 절대 경로로 변환
  if (!path.isAbsolute(basePath)) {
    return path.resolve(process.cwd(), basePath);
  }
  
  return basePath;
}

/**
 * 공용 파일 디렉토리 경로를 안전하게 가져오는 함수
 */
export function getPublicPath(): string {
  const publicPath = process.env.PUBLIC_PATH || DEFAULT_PUBLIC_PATH;
  
  // 상대 경로인 경우 절대 경로로 변환
  if (!path.isAbsolute(publicPath)) {
    return path.resolve(process.cwd(), publicPath);
  }
  
  return publicPath;
}

/**
 * 디렉토리가 존재하는지 확인하고, 없으면 생성하는 유틸리티 함수
 * @param dirPath 디렉토리 경로
 */
export function ensureDirectoryExists(dirPath: string): void {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`디렉토리 생성됨: ${dirPath}`);
    }
  } catch (error) {
    console.error(`디렉토리 생성 중 오류 발생: ${dirPath}`, error);
  }
}

/**
 * 환경 변수와 경로 검증을 수행하는 함수
 * 서버 시작 시 호출해야 함
 */
export function validatePathEnvironment(): void {
  // 중요 경로들 검증
  const uploadPath = getUploadPath();
  const tempPath = getTempPath();
  const clientPath = getClientPath();
  const publicPath = getPublicPath();
  
  console.log(`환경 경로 검증:
  업로드 경로: ${uploadPath}
  임시 파일 경로: ${tempPath}
  클라이언트 경로: ${clientPath}
  공용 파일 경로: ${publicPath}
  `);
  
  // 필수 디렉토리 생성 확인
  ensureDirectoryExists(uploadPath);
  ensureDirectoryExists(tempPath);
}

// 경로 디버깅 정보를 제공하는 함수
export function getPathDebugInfo(): Record<string, string> {
  return {
    cwd: process.cwd(),
    uploadPath: getUploadPath(),
    tempPath: getTempPath(),
    clientPath: getClientPath(),
    basePath: getBasePath(),
    publicPath: getPublicPath(),
    NODE_ENV: process.env.NODE_ENV || 'not set',
  };
}