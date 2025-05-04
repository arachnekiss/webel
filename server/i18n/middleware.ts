/**
 * 언어 감지 미들웨어
 * 
 * - 기본적으로 'ko'(한국어)를 사용합니다.
 * - 클라이언트 요청 헤더의 'Accept-Language'를 확인합니다.
 * - URL 경로에 '/en/' 또는 '/jp/'가 포함된 경우 해당 언어를 적용합니다.
 * - 감지된 언어는 req 객체에 저장됩니다.
 */

import { Request, Response, NextFunction } from 'express';
import { ServerLanguage } from './messages';

// req 객체에 language 속성 추가 (타입 확장)
declare global {
  namespace Express {
    interface Request {
      language: ServerLanguage;
    }
  }
}

/**
 * URL 경로에서 언어 코드 추출
 * @param path URL 경로
 * @returns 언어 코드 또는 null
 */
function extractLanguageFromPath(path: string): ServerLanguage | null {
  if (path.startsWith('/en/') || path === '/en') {
    return 'en';
  } else if (path.startsWith('/jp/') || path === '/jp') {
    return 'jp';
  }
  return null;
}

/**
 * 언어 헤더에서 지원 언어 추출
 * @param acceptLanguage Accept-Language 헤더 값
 * @returns 지원 언어 또는 기본값 'ko'
 */
function extractLanguageFromHeader(acceptLanguage: string | undefined): ServerLanguage {
  if (!acceptLanguage) return 'ko';
  
  // 'ko', 'en', 'jp' 감지
  const langParts = acceptLanguage.toLowerCase().split(',');
  for (const part of langParts) {
    const lang = part.trim().split(';')[0]; // "en-US;q=0.9" -> "en-US"
    if (lang.startsWith('ko')) return 'ko';
    if (lang.startsWith('en')) return 'en'; 
    if (lang.startsWith('ja') || lang.startsWith('jp')) return 'jp';
  }
  
  return 'ko'; // 기본값
}

/**
 * 언어 감지 미들웨어
 */
export function languageDetectionMiddleware(req: Request, res: Response, next: NextFunction) {
  // 1. URL 경로에서 언어 확인
  const pathLang = extractLanguageFromPath(req.path);
  
  // 2. 헤더에서 언어 확인 (URL에 언어가 없는 경우)
  const headerLang = extractLanguageFromHeader(req.headers['accept-language']);
  
  // 3. 언어 설정 (우선순위: URL 경로 > 헤더 > 기본값)
  req.language = pathLang || headerLang || 'ko';
  
  next();
}