import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { Language } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string) => string;
  formatUrl: (path: string) => string;
}

const defaultLanguage: Language = 'ko';

// Create the context with a default value
const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  setLanguage: () => {},
  t: (path: string) => path,
  formatUrl: (path: string) => path,
});

// Import translations directly
import { getTranslation as gt } from '../i18n/translations';

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // 항상 기본 언어를 한국어로 설정하고, URL이나 localStorage에서 변경된 경우에만 다른 언어로 변경
  const [language, setLanguageState] = useState<Language>('ko');
  const [, navigate] = useLocation();

  // Check URL for language on first load
  useEffect(() => {
    // Check for stored language preference
    const storedLang = localStorage.getItem('preferredLanguage') as Language | null;
    
    const pathname = window.location.pathname;
    
    // Extract language from URL if it exists
    if (pathname.startsWith('/en')) {
      setLanguageState('en');
    } else if (pathname.startsWith('/jp')) {
      setLanguageState('jp');
    } else if (storedLang && ['en', 'jp', 'ko'].includes(storedLang)) {
      // Use stored preference if URL doesn't specify language
      setLanguageState(storedLang);
    }
    
    // Listen for popstate (browser back/forward) to update language
    const handlePopState = () => {
      const newPathname = window.location.pathname;
      if (newPathname.startsWith('/en')) {
        setLanguageState('en');
      } else if (newPathname.startsWith('/jp')) {
        setLanguageState('jp');
      } else if (!newPathname.startsWith('/en') && !newPathname.startsWith('/jp')) {
        setLanguageState('ko');
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
  // Set language and update URL
  const setLanguage = (lang: Language) => {
    if (lang === language) return;
    
    setLanguageState(lang);
    
    // Update URL to reflect language change
    const pathname = window.location.pathname;
    let newPath = pathname;
    
    // If current URL starts with a language code, remove it
    if (pathname.startsWith('/en') || pathname.startsWith('/jp')) {
      newPath = pathname.substring(3); // Remove language prefix
    }
    
    // If empty path after removing language, set to root
    if (!newPath) newPath = '/';
    
    // Add new language prefix if not Korean (default)
    if (lang !== 'ko') {
      newPath = `/${lang}${newPath.startsWith('/') ? newPath : '/' + newPath}`;
    }
    
    // Use navigate to update URL without reloading the page
    navigate(newPath, { replace: true });
    
    // Store preference in localStorage
    localStorage.setItem('preferredLanguage', lang);
  };
  
  // Function to translate text based on the current language
  const t = (path: string): string => {
    return gt(language, path);
  };
  
  // Function to format URLs with the current language
  const formatUrl = (path: string): string => {
    if (language === 'ko') return path; // Default language doesn't need prefix
    
    // Check if path already has language prefix
    if (path.startsWith(`/${language}`)) return path;
    
    // Remove any existing language prefix
    let cleanPath = path;
    if (path.match(/^\/(en|jp)\//)) {
      cleanPath = path.substring(3);
    }
    
    // Add current language prefix
    return `/${language}${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}`;
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, formatUrl }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};