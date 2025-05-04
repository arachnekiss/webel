import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation, useRoute } from 'wouter';

// 지원하는 언어 타입
export type Language = 'ko' | 'en' | 'jp';

// 언어 컨텍스트 인터페이스
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translateUrl: (path: string) => string;
}

// 기본값 설정
const defaultLanguageContext: LanguageContextType = {
  language: 'ko',
  setLanguage: () => {},
  translateUrl: (path) => path,
};

// 컨텍스트 생성
const LanguageContext = createContext<LanguageContextType>(defaultLanguageContext);

// 언어 컨텍스트 훅
export const useLanguage = () => useContext(LanguageContext);

// 언어 경로에서 언어 코드 추출 정규식
const languagePathRegex = /^\/(en|jp)(\/.*)?$/;

// 언어 경로 검사 함수
function extractLanguageFromPath(path: string): { lang: Language | null; cleanPath: string } {
  const match = path.match(languagePathRegex);
  
  if (match) {
    return {
      lang: match[1] as Language,
      // 뒷부분이 없으면 루트로, 있으면 그 경로 사용
      cleanPath: match[2] || '/',
    };
  }
  
  return { lang: null, cleanPath: path };
}

// 언어 컨텍스트 프로바이더
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [location, navigate] = useLocation();
  const [language, setLanguageState] = useState<Language>('ko');

  // 초기 로드 시 URL에서 언어 감지
  useEffect(() => {
    const { lang, cleanPath } = extractLanguageFromPath(location);
    
    if (lang) {
      setLanguageState(lang);
    }
  }, []);

  // 언어 변경 함수
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    
    // 현재 경로에서 언어 부분을 제거하고 새 언어로 대체
    const { cleanPath } = extractLanguageFromPath(location);
    
    if (lang === 'ko') {
      // 한국어는 기본값이므로 경로에 언어 코드를 넣지 않음
      navigate(cleanPath);
    } else {
      // 다른 언어는 경로에 언어 코드 추가
      navigate(`/${lang}${cleanPath === '/' ? '' : cleanPath}`);
    }
  };

  // URL 변환 함수
  const translateUrl = (path: string): string => {
    // 이미 언어 코드가 있는지 확인
    const { lang: existingLang, cleanPath } = extractLanguageFromPath(path);
    
    // 한국어이거나 이미 언어가 지정된 경우 그대로 반환
    if (language === 'ko' || existingLang) {
      return path;
    }
    
    // 현재 언어로 경로 변환
    return `/${language}${cleanPath === '/' ? '' : cleanPath}`;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translateUrl }}>
      {children}
    </LanguageContext.Provider>
  );
};