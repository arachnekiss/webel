import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation resources directly
import enTranslation from '../locales/en-resources';
import koTranslation from '../locales/ko-resources';
import jaTranslation from '../locales/ja-resources';

// 지원하는 언어 목록
export const supportedLanguages = [
  { code: 'ko', name: '한국어', country: 'KR', currency: 'KRW', symbol: '₩' },
  { code: 'en', name: 'English', country: 'US', currency: 'USD', symbol: '$' },
  { code: 'ja', name: '日本語', country: 'JP', currency: 'JPY', symbol: '¥' }
];

// 언어 코드 맵핑
export const languageMap: Record<string, string> = {
  'ko-KR': 'ko',
  'ko': 'ko',
  'en-US': 'en',
  'en-GB': 'en',
  'en': 'en',
  'ja-JP': 'ja',
  'ja': 'ja'
};

// URL 경로에서 언어를 추출하는 함수
export const getLanguageFromPath = (path: string): string | null => {
  const pathSegments = path.split('/').filter(segment => segment);
  if (pathSegments.length > 0) {
    const possibleLang = pathSegments[0];
    return supportedLanguages.some(lang => lang.code === possibleLang) ? possibleLang : null;
  }
  return null;
};

// 언어 변경 함수 (URL 기반)
export const changeLanguage = (lang: string): void => {
  if (!supportedLanguages.some(l => l.code === lang)) {
    console.error(`Unsupported language: ${lang}`);
    return;
  }

  const currentPath = window.location.pathname;
  const currentLang = getLanguageFromPath(currentPath);
  
  // 현재 URL에서 언어 코드를 교체하거나 추가
  let newPath = currentPath;
  
  if (currentLang) {
    // 기존 언어 코드를 교체
    newPath = currentPath.replace(`/${currentLang}`, `/${lang}`);
  } else {
    // 언어 코드가 없으면 경로의 시작에 추가
    newPath = `/${lang}${currentPath.startsWith('/') ? currentPath : '/' + currentPath}`;
  }
  
  // 언어 설정 및 URL 이동
  i18n.changeLanguage(lang);
  window.history.pushState({}, '', newPath);
};

// 현재 언어 식별을 위한 함수
export const getCurrentLanguage = (): string => {
  const path = window.location.pathname;
  const langFromPath = getLanguageFromPath(path);
  
  if (langFromPath) {
    return langFromPath;
  }
  
  // URL에 언어가 없으면 브라우저 설정이나 기본 언어 사용
  return i18n.language.split('-')[0] || 'ko';
};

// 국가별 결제, 본인인증, 계좌인증 시스템 정보
export const countryServices = {
  KR: {
    payment: ['card', 'bank_transfer', 'naver_pay', 'kakao_pay', 'paypal'],
    identity: ['phone', 'kakao', 'naver', 'pass'],
    account: ['bank_account']
  },
  US: {
    payment: ['card', 'paypal', 'apple_pay', 'google_pay'],
    identity: ['ssn', 'id_verification'],
    account: ['bank_account', 'routing_number']
  },
  JP: {
    payment: ['card', 'bank_transfer', 'konbini', 'paypal', 'paypay'],
    identity: ['my_number', 'drivers_license'],
    account: ['bank_account']
  }
};

// 언어 코드로부터 국가 코드 얻기
export const getCountryFromLanguage = (langCode: string): string => {
  const language = supportedLanguages.find(lang => lang.code === langCode);
  return language ? language.country : 'US';
};

// 국가별 서비스 정보 얻기
export const getCountryServices = (countryCode: string) => {
  return countryServices[countryCode as keyof typeof countryServices] || countryServices.US;
};

// i18next 초기화
const resources = {
  en: {
    common: enTranslation
  },
  ko: {
    common: koTranslation
  },
  ja: {
    common: jaTranslation
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ko',
    debug: import.meta.env.DEV,
    
    // 언어 감지 우선순위
    detection: {
      order: ['path', 'localStorage', 'navigator'],
      lookupFromPathIndex: 0,
      caches: ['localStorage'],
    },
    
    // 기본 네임스페이스
    defaultNS: 'common',
    ns: ['common'],
    
    // 보간 옵션
    interpolation: {
      escapeValue: false, // React에서는 이스케이프 처리가 필요 없음
    },
    
    react: {
      useSuspense: true,
    },
  });

export default i18n;