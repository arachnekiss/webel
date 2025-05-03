import React, { createContext, useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  supportedLanguages, 
  getCurrentLanguage, 
  changeLanguage, 
  getCountryFromLanguage,
  getCountryServices
} from '@/lib/i18n';

// 타입 정의
type LanguageContextType = {
  currentLanguage: string;
  currentCountry: string;
  availableLanguages: typeof supportedLanguages;
  countryServices: {
    payment: string[];
    identity: string[];
    account: string[];
  };
  changeLanguage: (lang: string) => void;
};

// 컨텍스트 생성
const LanguageContext = createContext<LanguageContextType | null>(null);

// 컨텍스트 프로바이더 컴포넌트
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(getCurrentLanguage());
  const [currentCountry, setCurrentCountry] = useState(getCountryFromLanguage(currentLanguage));
  
  // 언어 변경 처리
  const handleChangeLanguage = (lang: string) => {
    changeLanguage(lang);
    setCurrentLanguage(lang);
    setCurrentCountry(getCountryFromLanguage(lang));
  };
  
  // URL 변경 시 언어 감지
  useEffect(() => {
    const detectLanguageFromURL = () => {
      const detectedLang = getCurrentLanguage();
      if (detectedLang !== currentLanguage) {
        setCurrentLanguage(detectedLang);
        setCurrentCountry(getCountryFromLanguage(detectedLang));
        i18n.changeLanguage(detectedLang);
      }
    };
    
    // 초기 감지
    detectLanguageFromURL();
    
    // history 변경 이벤트 감지
    const handleLocationChange = () => {
      detectLanguageFromURL();
    };
    
    window.addEventListener('popstate', handleLocationChange);
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [currentLanguage, i18n]);
  
  // 제공할 컨텍스트 값
  const contextValue: LanguageContextType = {
    currentLanguage,
    currentCountry,
    availableLanguages: supportedLanguages,
    countryServices: getCountryServices(currentCountry),
    changeLanguage: handleChangeLanguage
  };
  
  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// 커스텀 훅
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;