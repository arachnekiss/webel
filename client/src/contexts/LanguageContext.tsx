import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
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
}

// 기본 언어 컨텍스트 값
const defaultLanguageContext: LanguageContextType = {
  language: 'ko', // 기본 언어는 한국어
  setLanguage: () => {},
  translateUrl: (path: string) => path,
  t: (key: TranslationKey) => key,
  tFormat: (key: TranslationKey) => key,
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

// 경로 유형 확인을 위한 유틸리티 함수들
function isResourceTypePath(path: string): boolean {
  return /^\/resources\/type\/[^\/]+$/.test(path);
}

function isServiceTypePath(path: string): boolean {
  return /^\/services\/type\/[^\/]+$/.test(path);
}

// 타입 정보 추출
function extractTypeFromPath(path: string): string | null {
  const resourceMatch = path.match(/^(?:\/(?:en|jp))?\/resources\/type\/([^\/]+)$/);
  if (resourceMatch) {
    return resourceMatch[1];
  }
  
  const serviceMatch = path.match(/^(?:\/(?:en|jp))?\/services\/type\/([^\/]+)$/);
  if (serviceMatch) {
    return serviceMatch[1];
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
  
  // 언어 변경 함수
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    
    // 현재 경로에서 언어 부분 제거
    const { cleanPath } = extractLanguageFromPath(location);
    
    // 새 언어로 URL 업데이트
    if (lang !== 'ko') {
      navigate(`/${lang}${cleanPath}`);
    } else {
      // 한국어(기본)는 접두사 없음
      navigate(cleanPath);
    }
  };
  
  // URL을 현재 언어로 번역
  const translateUrl = (path: string): string => {
    // 이미 언어 접두사가 있는 경우 제거
    const { cleanPath } = extractLanguageFromPath(path);
    
    // 한국어가 아닌 경우 언어 접두사 추가
    if (language !== 'ko') {
      console.log(`[LanguageContext] Translating URL: ${path} -> /${language}${cleanPath}`);
      return `/${language}${cleanPath}`;
    }
    
    console.log(`[LanguageContext] Translating URL: ${path} -> ${cleanPath}`);
    return cleanPath;
  };
  
  // 번역 함수 제공
  const { t, tFormat } = useTranslations(language);
  
  // 컨텍스트 값
  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    translateUrl,
    t,
    tFormat
  };
  
  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};