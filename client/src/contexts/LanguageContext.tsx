import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageCode, getCurrentLanguage, changeLanguage, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../i18n';

// 언어 컨텍스트 타입 정의
interface LanguageContextType {
  currentLanguage: LanguageCode;
  changeLanguage: (language: LanguageCode) => Promise<void>;
  languageLoaded: boolean;
}

// 기본값으로 컨텍스트 생성
const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: DEFAULT_LANGUAGE,
  changeLanguage: async () => {},
  languageLoaded: false,
});

// 컨텍스트 훅
export const useLanguage = () => useContext(LanguageContext);

// 프로퍼티 타입 정의
interface LanguageProviderProps {
  children: ReactNode;
}

// 언어 경로 감지 및 처리
export const processLanguagePath = () => {
  const pathname = window.location.pathname;
  
  // 첫 번째 세그먼트가 지원되는 언어 코드인지 확인
  for (const lang of SUPPORTED_LANGUAGES) {
    if (pathname === `/${lang}` || pathname.startsWith(`/${lang}/`)) {
      return lang as LanguageCode;
    }
  }
  
  return null;
};

// 언어 제공자 컴포넌트
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(getCurrentLanguage());
  const [languageLoaded, setLanguageLoaded] = useState(false);
  
  // 초기 언어 설정 처리
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        // URL에서 언어 감지
        const pathLanguage = processLanguagePath();
        
        if (pathLanguage) {
          // URL에 언어 코드가 있으면 해당 언어로 설정
          await i18n.changeLanguage(pathLanguage);
          setCurrentLanguage(pathLanguage);
        } else {
          // 브라우저 언어 또는 저장된 언어 사용
          const detectedLanguage = getCurrentLanguage();
          setCurrentLanguage(detectedLanguage);
          
          // 기본 언어가 아닌 경우 URL 업데이트
          if (detectedLanguage !== DEFAULT_LANGUAGE) {
            const newPath = window.location.pathname === '/' 
              ? `/${detectedLanguage}`
              : `/${detectedLanguage}${window.location.pathname}`;
            window.history.replaceState({}, '', newPath);
          }
        }
        
        setLanguageLoaded(true);
      } catch (error) {
        console.error('Language initialization error:', error);
        setLanguageLoaded(true); // 에러가 있어도 로딩 완료 처리
      }
    };
    
    initializeLanguage();
  }, [i18n]);
  
  // i18n 언어 변경 이벤트 리스너
  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setCurrentLanguage(lng as LanguageCode);
    };
    
    // 언어 변경 이벤트 구독
    i18n.on('languageChanged', handleLanguageChanged);
    
    return () => {
      // 이벤트 리스너 정리
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);
  
  // 언어 변경 핸들러
  const handleChangeLanguage = async (language: LanguageCode) => {
    try {
      await changeLanguage(language);
      setCurrentLanguage(language);
    } catch (error) {
      console.error('Language change error:', error);
    }
  };
  
  // 컨텍스트 값
  const contextValue: LanguageContextType = {
    currentLanguage,
    changeLanguage: handleChangeLanguage,
    languageLoaded,
  };
  
  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};