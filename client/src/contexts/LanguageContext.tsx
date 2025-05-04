import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { getTranslation, TranslationKey, useTranslations } from '@/translations';

// 지원하는 언어 타입
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

// 언어 컨텍스트 생성
const LanguageContext = createContext<LanguageContextType>(defaultLanguageContext);

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
  const [language, setLanguageState] = useState<Language>('ko');
  
  // 초기 로드 시 URL에서 언어 감지
  useEffect(() => {
    const { lang } = extractLanguageFromPath(location);
    if (lang) {
      setLanguageState(lang);
    }
  }, [location]);
  
  // 특정 경로를 주어진 언어로 변환하는 함수
  const getPathInLanguage = useCallback((path: string, targetLang: Language): string => {
    console.log(`[LanguageContext] Converting path: ${path} to language: ${targetLang}`);
    
    // 입력 경로에서 현재 언어 코드 및 기본 경로 추출
    const { cleanPath } = extractLanguageFromPath(path);
    
    // 특정 페이지 유형 처리
    const type = extractTypeFromPath(path);
    if (type) {
      if (isResourceTypePath(path)) {
        const basePath = `/resources/type/${type}`;
        return targetLang === 'ko' ? basePath : `/${targetLang}${basePath}`;
      }
      if (isServiceTypePath(path)) {
        const basePath = `/services/type/${type}`;
        return targetLang === 'ko' ? basePath : `/${targetLang}${basePath}`;
      }
    }
    
    // 상세 페이지 처리
    const id = extractIdFromPath(path);
    if (id) {
      if (isResourceDetailPath(path)) {
        const basePath = `/resources/${id}`;
        return targetLang === 'ko' ? basePath : `/${targetLang}${basePath}`;
      }
      if (isServiceDetailPath(path)) {
        const basePath = `/services/${id}`;
        return targetLang === 'ko' ? basePath : `/${targetLang}${basePath}`;
      }
    }
    
    // 기본 변환
    if (targetLang === 'ko') {
      return cleanPath; 
    } else {
      return `/${targetLang}${cleanPath}`;
    }
  }, []);
  
  // 언어 변경 함수 - 경로 처리 로직 개선
  const setLanguage = useCallback((lang: Language) => {
    console.log(`[LanguageContext] Changing language to: ${lang}, current path: ${location}`);
    setLanguageState(lang);
    
    // 현재 경로를 새 언어로 변환
    const newPath = getPathInLanguage(location, lang);
    console.log(`[LanguageContext] Redirecting to: ${newPath}`);
    navigate(newPath, { replace: true });
  }, [location, navigate, getPathInLanguage]);
  
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