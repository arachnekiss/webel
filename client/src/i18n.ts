import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// 언어 코드 및 네임스페이스 타입 선언
export type LanguageCode = 'ko' | 'en' | 'ja';
export const SUPPORTED_LANGUAGES: LanguageCode[] = ['ko', 'en', 'ja'];
export const DEFAULT_LANGUAGE: LanguageCode = 'ko';

// 브라우저의 주소창과 연동되는 경로 기반 언어 감지기 옵션
const pathDetectorOptions = {
  lookupFromPathIndex: 0,  // URL의 첫 번째 세그먼트에서 언어 코드 확인
  order: ['path', 'cookie', 'localStorage', 'navigator'], // 탐지 순서
  lookupFromPathSegmentIndex: 0
};

// i18next 초기화
i18n
  // 백엔드 로드 (JSON 파일 로드)
  .use(Backend)
  // 언어 감지 플러그인 사용
  .use(LanguageDetector)
  // react-i18next 초기화
  .use(initReactI18next)
  // 초기화
  .init({
    // 기본 네임스페이스
    defaultNS: 'translation',
    // 폴백(대체) 언어
    fallbackLng: DEFAULT_LANGUAGE,
    // 지원하는 언어 목록
    supportedLngs: SUPPORTED_LANGUAGES,
    // 디버그 모드 (개발 중에만 활성화)
    debug: process.env.NODE_ENV === 'development',
    // 언어 감지 옵션
    detection: pathDetectorOptions,
    // 인터폴레이션 설정
    interpolation: {
      // React는 XSS 방지를 자체적으로 처리하므로 비활성화
      escapeValue: false,
    },
    // 백엔드 옵션 (JSON 파일 위치)
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    // 초기화 중에 번역 로드하지 않음 (나중에 필요에 따라 로드)
    initImmediate: true,
    // 언어 변경 시 페이지 리로드 방지
    react: {
      useSuspense: true,
    }
  });

// 현재 언어 코드 가져오기
export const getCurrentLanguage = (): LanguageCode => {
  return (i18n.language as LanguageCode) || DEFAULT_LANGUAGE;
};

// 언어 변경 함수 (경로 기반)
export const changeLanguage = async (language: LanguageCode): Promise<void> => {
  // 현재 URL 가져오기
  const url = new URL(window.location.href);
  const pathname = url.pathname;
  
  // 현재 URL에서 언어 코드 제거 (있는 경우)
  let newPath = pathname;
  for (const lang of SUPPORTED_LANGUAGES) {
    if (pathname.startsWith(`/${lang}/`)) {
      newPath = pathname.substring(3); // /ko/, /en/, /ja/ 제거
      break;
    } else if (pathname === `/${lang}`) {
      newPath = '/'; // 루트 경로로 변경
      break;
    }
  }
  
  // 루트 경로가 아니면서 슬래시로 시작하지 않는 경우 슬래시 추가
  if (newPath !== '/' && !newPath.startsWith('/')) {
    newPath = '/' + newPath;
  }
  
  // 변경할 언어가 기본 언어가 아닌 경우에만 URL에 언어 코드 추가
  if (language !== DEFAULT_LANGUAGE) {
    // 루트 경로인 경우
    if (newPath === '/') {
      newPath = `/${language}`;
    } else {
      newPath = `/${language}${newPath}`;
    }
  }
  
  // i18next 언어 변경
  await i18n.changeLanguage(language);
  
  // URL 업데이트 (페이지 새로고침 없이)
  window.history.pushState({}, '', newPath + url.search + url.hash);
  
  // 언어 쿠키 저장 (90일 유지)
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 90);
  document.cookie = `i18next=${language};expires=${expirationDate.toUTCString()};path=/`;
};

export default i18n;