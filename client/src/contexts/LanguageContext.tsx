import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { getTranslation, TranslationKey, useTranslations } from '@/translations';

// 지원하는 언어 타입 - 한국어(ko), 영어(en), 일본어(jp)만 지원
export type Language = 'ko' | 'en' | 'jp';

// 언어 컨텍스트 타입 정의
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translateUrl: (path: string) => string;
  t: (key: TranslationKey) => string;
  tFormat: (key: TranslationKey, ...args: any[]) => string;
  getPathInLanguage: (path: string, targetLang: Language) => string;
}

// 기본 언어 컨텍스트 값
const defaultLanguageContext: LanguageContextType = {
  language: 'ko', // 기본 언어는 한국어
  setLanguage: () => {},
  translateUrl: (path: string) => path,
  t: (key: TranslationKey) => key,
  tFormat: (key: TranslationKey) => key,
  getPathInLanguage: (path: string, targetLang: Language) => path,
};

// 언어 컨텍스트 생성 - 반드시 export 해야 함
export const LanguageContext = createContext<LanguageContextType>(defaultLanguageContext);

// 언어 컨텍스트 훅
export const useLanguage = () => useContext(LanguageContext);

// URL에서 언어 코드 추출
function extractLanguageFromPath(path: string): { lang: Language | null; cleanPath: string } {
  const langRegex = /^\/(en|jp)(\/|$)/;
  const match = path.match(langRegex);
  
  if (match) {
    const lang = match[1] as Language;
    // 언어 접두사 제거
    const cleanPath = path.replace(langRegex, '/');
    console.log(`[LanguageContext] Extracted language: ${lang}, cleanPath: ${cleanPath} from path: ${path}`);
    return { lang, cleanPath };
  }
  
  console.log(`[LanguageContext] No language prefix in path: ${path}`);
  return { lang: null, cleanPath: path };
}

// 경로 관련 패턴 검사 함수들
// services/type/:type 패턴 검사 (en, jp 접두사 포함)
function isServiceTypePath(path: string): boolean {
  return /^(?:\/(?:en|jp))?\/services\/type\/[^\/]+$/.test(path);
}

// resources/type/:type 패턴 검사 (en, jp 접두사 포함)
function isResourceTypePath(path: string): boolean {
  return /^(?:\/(?:en|jp))?\/resources\/type\/[^\/]+$/.test(path);
}

// services/:id 패턴 검사 (en, jp 접두사 포함)
function isServiceDetailPath(path: string): boolean {
  return /^(?:\/(?:en|jp))?\/services\/\d+$/.test(path);
}

// resources/:id 패턴 검사 (en, jp 접두사 포함)
function isResourceDetailPath(path: string): boolean {
  return /^(?:\/(?:en|jp))?\/resources\/\d+$/.test(path);
}

// 경로에서 타입 값 추출
function extractTypeFromPath(path: string): string | null {
  // 리소스 타입 경로 패턴
  const resourceTypeMatch = path.match(/^(?:\/(?:en|jp))?\/resources\/type\/([^\/]+)$/);
  if (resourceTypeMatch) {
    return resourceTypeMatch[1];
  }
  
  // 서비스 타입 경로 패턴
  const serviceTypeMatch = path.match(/^(?:\/(?:en|jp))?\/services\/type\/([^\/]+)$/);
  if (serviceTypeMatch) {
    return serviceTypeMatch[1];
  }
  
  return null;
}

// 경로에서 ID 값 추출
function extractIdFromPath(path: string): string | null {
  // 리소스 상세 경로 패턴
  const resourceDetailMatch = path.match(/^(?:\/(?:en|jp))?\/resources\/(\d+)$/);
  if (resourceDetailMatch) {
    return resourceDetailMatch[1];
  }
  
  // 서비스 상세 경로 패턴
  const serviceDetailMatch = path.match(/^(?:\/(?:en|jp))?\/services\/(\d+)$/);
  if (serviceDetailMatch) {
    return serviceDetailMatch[1];
  }
  
  return null;
}

// LanguageProvider props 타입 정의
interface LanguageProviderProps {
  children: ReactNode;
}

// 언어 제공자 컴포넌트
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [location, navigate] = useLocation();
  
  // 초기 언어 설정 - 로컬 스토리지에서 불러오기
  const [language, setLanguageState] = useState<Language>(() => {
    // 브라우저 환경에서만 로컬 스토리지 접근
    if (typeof window !== 'undefined') {
      // 저장된 언어 설정이 있으면 사용, 없으면 기본값 'ko'
      const savedLang = localStorage.getItem('webel_language') as Language;
      if (savedLang && ['ko', 'en', 'jp'].includes(savedLang)) {
        return savedLang;
      }
    }
    return 'ko';
  });
  
  // 초기 로드 시 URL에서 언어 감지 (URL의 언어가 로컬 스토리지보다 우선)
  useEffect(() => {
    const { lang } = extractLanguageFromPath(location);
    if (lang) {
      setLanguageState(lang);
      localStorage.setItem('webel_language', lang);
    }
  }, [location]);
  
  // 특정 경로를 주어진 언어로 변환하는 함수
  const getPathInLanguage = useCallback((path: string, targetLang: Language): string => {
    console.log(`[LanguageContext] Converting path: ${path} to language: ${targetLang}`);

    // 먼저 언어 접두사 제거된 기본 경로 추출
    const { cleanPath } = extractLanguageFromPath(path);
    console.log(`[LanguageContext] Clean path extracted: ${cleanPath}`);
    
    // 기본 URL 패턴 정의 (정규식 패턴: 매칭 함수)
    const urlPatterns = [
      // resources/type/:type 패턴 - 예: /resources/type/ai_model
      {
        regex: /^\/resources\/type\/([^\/]+)$/,
        transform: (matches: RegExpMatchArray) => `/resources/type/${matches[1]}`
      },
      // services/type/:type 패턴 - 예: /services/type/3d_printing
      {
        regex: /^\/services\/type\/([^\/]+)$/,
        transform: (matches: RegExpMatchArray) => `/services/type/${matches[1]}`
      },
      // resources/:id 패턴 - 예: /resources/123
      {
        regex: /^\/resources\/(\d+)$/,
        transform: (matches: RegExpMatchArray) => `/resources/${matches[1]}`
      },
      // resources/create 경로
      {
        regex: /^\/resources\/create$/,
        transform: () => `/resources/create`
      },
      // resources/upload 경로
      {
        regex: /^\/resources\/upload$/,
        transform: () => `/resources/upload`
      },
      // resources/upload-v2 경로
      {
        regex: /^\/resources\/upload-v2$/,
        transform: () => `/resources/upload-v2`
      },
      // services/:id 패턴 - 예: /services/123
      {
        regex: /^\/services\/(\d+)$/,
        transform: (matches: RegExpMatchArray) => `/services/${matches[1]}`
      },
      // auctions/:id 패턴 - 예: /auctions/123
      {
        regex: /^\/auctions\/(\d+)$/,
        transform: (matches: RegExpMatchArray) => `/auctions/${matches[1]}`
      },
      // register-printer 특수 경로
      {
        regex: /^\/register-printer$/,
        transform: () => `/register-printer`
      },
      // admin 경로들
      {
        regex: /^\/admin\/([^\/]+)$/,
        transform: (matches: RegExpMatchArray) => `/admin/${matches[1]}`
      },
      // services/register/:type 패턴 - 예: /services/register/3d_printing
      {
        regex: /^\/services\/register\/([^\/]+)$/,
        transform: (matches: RegExpMatchArray) => `/services/register/${matches[1]}`
      },
      // services/register 기본 경로
      {
        regex: /^\/services\/register$/,
        transform: () => `/services/register`
      },
      // ai-assembly, remote-support 등 특수 페이지
      {
        regex: /^\/ai-assembly$/,
        transform: () => `/ai-assembly`
      },
      {
        regex: /^\/remote-support$/,
        transform: () => `/remote-support`
      },
      {
        regex: /^\/sponsor$/,
        transform: () => `/sponsor`
      },
      // 경로 뒤 쿼리스트링 보존
      {
        regex: /^(.+?)(\?.+)$/,
        transform: (matches: RegExpMatchArray, basePath: string) => 
          `${basePath}${matches[2]}`
      }
    ];
    
    // 클린 패스가 어떤 패턴과 일치하는지 검사
    for (const pattern of urlPatterns) {
      const matches = cleanPath.match(pattern.regex);
      if (matches) {
        console.log(`[LanguageContext] Path matches pattern: ${pattern.regex}`, matches);
        const transformedPath = pattern.transform(matches, cleanPath);
        const finalPath = targetLang === 'ko' ? transformedPath : `/${targetLang}${transformedPath}`;
        console.log(`[LanguageContext] Transformed to: ${finalPath}`);
        return finalPath;
      }
    }
    
    // 어떤 특별한 패턴과도 일치하지 않는 경우, 기본 경로 처리
    const result = targetLang === 'ko' ? cleanPath : `/${targetLang}${cleanPath}`;
    console.log(`[LanguageContext] No pattern match, using: ${result}`);
    return result;
  }, []);
  
  // 언어 변경 함수 - SPA 방식으로 개선
  const setLanguage = useCallback((lang: Language) => {
    console.log(`[LanguageContext] Changing language to: ${lang}, current path: ${location}`);
    
    try {
      // 현재 언어를 로컬 스토리지에 저장 (페이지 새로고침 후에도 유지)
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('webel_language', lang);
      }
      
      // 상태 업데이트
      setLanguageState(lang);
      
      // 현재 경로를 새 언어로 변환
      const newPath = getPathInLanguage(location, lang);
      console.log(`[LanguageContext] Redirecting to: ${newPath} using SPA navigation`);
      
      // SPA 방식으로 페이지 이동 (wouter의 navigate 사용)
      navigate(newPath, { replace: true });
      
      // 추가적인 URL 관련 컴포넌트들이 새 언어를 인식할 수 있도록 이벤트 발생
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('languageChanged', { detail: { language: lang, path: newPath } });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('[LanguageContext] Language change error:', error);
      
      // 에러 발생 시 기본 페이지로 SPA 방식 이동 시도
      try {
        if (lang === 'ko') {
          navigate('/', { replace: true });
        } else {
          navigate(`/${lang}`, { replace: true });
        }
      } catch (navError) {
        console.error('[LanguageContext] Navigation fallback error:', navError);
        // 마지막 수단: 전체 페이지 리로드
        if (lang === 'ko') {
          window.location.href = '/';
        } else {
          window.location.href = `/${lang}`;
        }
      }
      
      // 에러가 발생해도 최소한 상태 업데이트는 시도
      setLanguageState(lang);
    }
  }, [location, getPathInLanguage, navigate]);
  
  // URL을 현재 언어로 번역
  const translateUrl = useCallback((path: string): string => {
    return getPathInLanguage(path, language);
  }, [language, getPathInLanguage]);
  
  // 번역 함수 제공
  const { t, tFormat } = useTranslations(language);
  
  // 컨텍스트 값
  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    translateUrl,
    t,
    tFormat,
    getPathInLanguage
  };
  
  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};