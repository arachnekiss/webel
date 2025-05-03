import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

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
  
  // URL 변경
  window.history.pushState({}, '', newPath);
  
  // localStorage에 언어 설정 저장 (페이지 새로고침 시에도 유지)
  localStorage.setItem('i18nextLng', lang);
  
  // 이벤트 발생 (다른 컴포넌트에서 감지할 수 있도록)
  const event = new CustomEvent('languageChanged', { detail: { language: lang } });
  window.dispatchEvent(event);
};

// 현재 언어 식별을 위한 함수
export const getCurrentLanguage = (): string => {
  const path = window.location.pathname;
  const langFromPath = getLanguageFromPath(path);
  
  if (langFromPath) {
    return langFromPath;
  }
  
  // localStorage에서 언어 설정 확인
  const storedLang = localStorage.getItem('i18nextLng');
  if (storedLang && supportedLanguages.some(l => l.code === storedLang.split('-')[0])) {
    return storedLang.split('-')[0];
  }
  
  // 브라우저 설정이나 기본 언어 사용
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

// i18next 초기화 - 이미 초기화되었는지 확인
let initialized = false;

// 번역 리소스 직접 정의
const enTranslations = {
  "app_name": "Engineering Service Platform",
  "navigation": {
    "home": "Home",
    "services": "Services",
    "resources": "Resources",
    "auctions": "Auctions",
    "ai_assembly": "AI Assembly",
    "remote_support": "Remote Support",
    "sponsor": "Sponsor",
    "about": "About"
  },
  "header": {
    "login": "Login",
    "register": "Register",
    "profile": "Profile",
    "dashboard": "Dashboard",
    "admin": "Admin",
    "logout": "Logout",
    "search": "Search",
    "search_placeholder": "Enter search term..."
  },
  "common": {
    "loading": "Loading...",
    "error": "An error occurred",
    "try_again": "Try Again"
  }
};

const koTranslations = {
  "app_name": "엔지니어링 서비스 플랫폼",
  "navigation": {
    "home": "홈",
    "services": "서비스",
    "resources": "리소스",
    "auctions": "경매",
    "ai_assembly": "AI 어셈블리",
    "remote_support": "원격 지원",
    "sponsor": "후원하기",
    "about": "소개"
  },
  "header": {
    "login": "로그인",
    "register": "회원가입",
    "profile": "프로필",
    "dashboard": "대시보드",
    "admin": "관리자",
    "logout": "로그아웃",
    "search": "검색",
    "search_placeholder": "검색어를 입력하세요..."
  },
  "common": {
    "loading": "로딩 중...",
    "error": "오류가 발생했습니다",
    "try_again": "다시 시도하기"
  }
};

const jaTranslations = {
  "app_name": "エンジニアリングサービスプラットフォーム",
  "navigation": {
    "home": "ホーム",
    "services": "サービス",
    "resources": "リソース",
    "auctions": "オークション",
    "ai_assembly": "AI アセンブリー",
    "remote_support": "リモートサポート",
    "sponsor": "スポンサー",
    "about": "概要"
  },
  "header": {
    "login": "ログイン",
    "register": "登録",
    "profile": "プロフィール",
    "dashboard": "ダッシュボード",
    "admin": "管理者",
    "logout": "ログアウト",
    "search": "検索",
    "search_placeholder": "検索語を入力してください..."
  },
  "common": {
    "loading": "読み込み中...",
    "error": "エラーが発生しました",
    "try_again": "再試行"
  }
};

// i18next 초기화
const resources = {
  en: {
    common: enTranslations
  },
  ko: {
    common: koTranslations
  },
  ja: {
    common: jaTranslations
  }
};

// 언어 감지 - 경로에서 언어 추출
const detectedLang = typeof window !== 'undefined' ? getLanguageFromPath(window.location.pathname) : null;
const langFromStorage = typeof localStorage !== 'undefined' ? localStorage.getItem('i18nextLng') : null;

// 초기 언어 결정
const initialLang = detectedLang || 
                    (langFromStorage ? langFromStorage.split('-')[0] : null) || 
                    'ko';

// i18next가 아직 초기화되지 않았다면 초기화
if (!initialized && !i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLang,
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
  
  initialized = true;
}

export default i18n;