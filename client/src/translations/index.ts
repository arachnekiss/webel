import { Language } from '@/contexts/LanguageContext';

// 번역 데이터 타입 정의
export type TranslationKeys = {
  common: {
    viewMore: string;
    searchPlaceholder: string;
    login: string;
    logout: string;
    register: string;
    menu: string;
    search: string;
    sponsor: string;
    mainMenu: string;
    accountMenu: string;
  };
  nav: {
    home: string;
    allResources: string;
    resourceCategories: string;
    services: string;
    account: string;
  };
  home: {
    heroTitle: string;
    heroSubtitle: string;
    featuredResources: string;
    featuredServices: string;
    nearbyServices: string;
    hardwareDescription: string;
    softwareDescription: string;
    aiModelDescription: string;
    modelingDescription: string;
    freeContentDescription: string;
    flashGamesSubtitle: string;
    moreGames: string;
    noGamesYet: string;
    gamesComingSoon: string;
  };
  auth: {
    loginTitle: string;
    registerTitle: string;
    username: string;
    password: string;
    confirmPassword: string;
    email: string;
    fullName: string;
    loginButton: string;
    registerButton: string;
    switchToRegister: string;
    switchToLogin: string;
  };
  footer: {
    resources: string;
    companyInfo: string;
    allRightsReserved: string;
  };
  resourceType: {
    hardware_design: string;
    software: string;
    ai_model: string;
    '3d_model': string;
    free_content: string;
    flash_game: string;
  };
};

// 한국어 번역 (원본)
const ko: TranslationKeys = {
  common: {
    viewMore: '더 보기',
    searchPlaceholder: '하드웨어, 소프트웨어, 3D 프린터 등을 검색하세요',
    login: '로그인',
    logout: '로그아웃',
    register: '회원가입',
    menu: '메뉴',
    search: '검색',
    sponsor: 'Webel 후원하기',
    mainMenu: '메인 메뉴',
    accountMenu: '계정',
  },
  nav: {
    home: '홈',
    allResources: '모든 리소스',
    resourceCategories: '리소스 카테고리',
    services: '서비스',
    account: '계정',
  },
  home: {
    heroTitle: '전자하드웨어 개발자를 위한 지능형 리소스 공유 플랫폼',
    heroSubtitle: '하드웨어 설계도, 소프트웨어, 3D 모델 등을 쉽게 찾고 공유하세요',
    featuredResources: '주목할 만한 리소스',
    featuredServices: '서비스 둘러보기',
    nearbyServices: '내 주변 서비스',
    hardwareDescription: '전자제품, 로봇, IoT 장치 등의 하드웨어 설계도 모음',
    softwareDescription: '오픈소스 펌웨어, 소프트웨어, 라이브러리 등',
    aiModelDescription: '하드웨어 개발에 활용 가능한 AI 모델 및 알고리즘',
    modelingDescription: '3D 프린팅 가능한 모델링 파일, CAD 등',
    freeContentDescription: '무료로 이용 가능한 다양한 유용한 자료들',
    flashGamesSubtitle: '브라우저에서 즐길 수 있는 플래시 게임 모음',
    moreGames: '더 많은 게임',
    noGamesYet: '아직 등록된 게임이 없습니다',
    gamesComingSoon: '곧 다양한 게임이 추가될 예정입니다',
  },
  auth: {
    loginTitle: '로그인',
    registerTitle: '회원가입',
    username: '사용자 이름',
    password: '비밀번호',
    confirmPassword: '비밀번호 확인',
    email: '이메일',
    fullName: '이름',
    loginButton: '로그인',
    registerButton: '가입하기',
    switchToRegister: '계정이 없으신가요? 회원가입',
    switchToLogin: '이미 계정이 있으신가요? 로그인',
  },
  footer: {
    resources: '리소스',
    companyInfo: '회사 정보',
    allRightsReserved: '판권 소유',
  },
  resourceType: {
    hardware_design: '하드웨어 설계도',
    software: '소프트웨어 오픈소스',
    ai_model: 'AI 모델',
    '3d_model': '3D 모델링 파일',
    free_content: '프리 콘텐츠',
    flash_game: '플래시 게임',
  },
};

// 영어 번역
const en: TranslationKeys = {
  common: {
    viewMore: 'View More',
    searchPlaceholder: 'Search for hardware, software, 3D printers, etc.',
    login: 'Login',
    logout: 'Logout',
    register: 'Register',
    menu: 'Menu',
    search: 'Search',
    sponsor: 'Sponsor Webel',
    mainMenu: 'Main Menu',
    accountMenu: 'Account',
  },
  nav: {
    home: 'Home',
    allResources: 'All Resources',
    resourceCategories: 'Resource Categories',
    services: 'Services',
    account: 'Account',
  },
  home: {
    heroTitle: 'Intelligent Resource Sharing Platform for Electronic Hardware Developers',
    heroSubtitle: 'Easily find and share hardware designs, software, 3D models, and more',
    featuredResources: 'Featured Resources',
    featuredServices: 'Explore Services',
    nearbyServices: 'Services Near Me',
    hardwareDescription: 'Collection of hardware designs for electronics, robots, IoT devices, etc.',
    softwareDescription: 'Open source firmware, software, libraries, and more',
    aiModelDescription: 'AI models and algorithms for hardware development',
    modelingDescription: '3D printable modeling files, CAD, etc.',
    freeContentDescription: 'Various useful materials available for free',
    flashGamesSubtitle: 'Collection of flash games playable in browser',
    moreGames: 'More Games',
    noGamesYet: 'No games available yet',
    gamesComingSoon: 'Various games will be added soon',
  },
  auth: {
    loginTitle: 'Login',
    registerTitle: 'Register',
    username: 'Username',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    email: 'Email',
    fullName: 'Full Name',
    loginButton: 'Login',
    registerButton: 'Register',
    switchToRegister: 'Don\'t have an account? Register',
    switchToLogin: 'Already have an account? Login',
  },
  footer: {
    resources: 'Resources',
    companyInfo: 'Company Info',
    allRightsReserved: 'All rights reserved',
  },
  resourceType: {
    hardware_design: 'Hardware Designs',
    software: 'Open Source Software',
    ai_model: 'AI Models',
    '3d_model': '3D Modeling Files',
    free_content: 'Free Content',
    flash_game: 'Flash Games',
  },
};

// 일본어 번역
const jp: TranslationKeys = {
  common: {
    viewMore: 'もっと見る',
    searchPlaceholder: 'ハードウェア、ソフトウェア、3Dプリンタなどを検索',
    login: 'ログイン',
    logout: 'ログアウト',
    register: '会員登録',
    menu: 'メニュー',
    search: '検索',
    sponsor: 'Webelを支援する',
    mainMenu: 'メインメニュー',
    accountMenu: 'アカウント',
  },
  nav: {
    home: 'ホーム',
    allResources: 'すべてのリソース',
    resourceCategories: 'リソースカテゴリ',
    services: 'サービス',
    account: 'アカウント',
  },
  home: {
    heroTitle: '電子ハードウェア開発者向けのインテリジェントリソース共有プラットフォーム',
    heroSubtitle: 'ハードウェア設計図、ソフトウェア、3Dモデルなどを簡単に検索・共有',
    featuredResources: '注目のリソース',
    featuredServices: 'サービスを探す',
    nearbyServices: '近くのサービス',
    hardwareDescription: '電子製品、ロボット、IoTデバイスなどのハードウェア設計図コレクション',
    softwareDescription: 'オープンソースファームウェア、ソフトウェア、ライブラリなど',
    aiModelDescription: 'ハードウェア開発に活用できるAIモデルとアルゴリズム',
    modelingDescription: '3D印刷可能なモデリングファイル、CADなど',
    freeContentDescription: '無料で利用できる様々な有用な資料',
    flashGamesSubtitle: 'ブラウザで楽しめるフラッシュゲームコレクション',
    moreGames: 'もっとゲームを見る',
    noGamesYet: 'まだゲームが登録されていません',
    gamesComingSoon: '近日中に様々なゲームが追加される予定です',
  },
  auth: {
    loginTitle: 'ログイン',
    registerTitle: '会員登録',
    username: 'ユーザー名',
    password: 'パスワード',
    confirmPassword: 'パスワード確認',
    email: 'メールアドレス',
    fullName: '名前',
    loginButton: 'ログイン',
    registerButton: '登録する',
    switchToRegister: 'アカウントをお持ちでない方は？ 会員登録',
    switchToLogin: 'すでにアカウントをお持ちの方は？ ログイン',
  },
  footer: {
    resources: 'リソース',
    companyInfo: '会社情報',
    allRightsReserved: '無断複写・転載を禁じます',
  },
  resourceType: {
    hardware_design: 'ハードウェア設計図',
    software: 'ソフトウェアオープンソース',
    ai_model: 'AIモデル',
    '3d_model': '3Dモデリングファイル',
    free_content: 'フリーコンテンツ',
    flash_game: 'フラッシュゲーム',
  },
};

// 번역 유틸리티 함수
export const getTranslation = (language: Language, key: string, defaultText: string = ''): string => {
  // 중첩된 키 경로 (예: 'common.viewMore')를 분해
  const parts = key.split('.');
  const translations = { ko, en, jp }[language];
  
  // 중첩 객체 속성에 접근
  try {
    let result: any = translations;
    for (const part of parts) {
      result = result[part];
      if (result === undefined) return defaultText || key;
    }
    return result;
  } catch (error) {
    console.error(`Translation error for path: ${key} in language: ${language}`);
    return defaultText || key;
  }
};

// 번역 함수 훅
export const useTranslation = (language: Language) => {
  return (key: string, defaultText: string = ''): string => {
    return getTranslation(language, key, defaultText);
  };
};