import { Language } from '@/contexts/LanguageContext';

// 번역 문자열 타입 정의
export type TranslationKey = string;
export type TranslationMap = Record<TranslationKey, string>;
export type LanguageMap = Record<Language, TranslationMap>;

// 헤더 및 네비게이션 관련 번역
const headerTranslations: LanguageMap = {
  ko: {
    'nav.home': '홈',
    'nav.services': '서비스',
    'nav.resources': '리소스',
    'nav.auctions': '경매',
    'nav.community': '커뮤니티',
    'nav.about': '소개',
    'nav.login': '로그인',
    'nav.register': '회원가입',
    'nav.mypage': '마이페이지',
    'nav.logout': '로그아웃',
    'nav.admin': '관리자',
    'header.search': '검색',
    'header.notifications': '알림',
    'header.language': '언어',
    'header.location': '위치',
  },
  en: {
    'nav.home': 'Home',
    'nav.services': 'Services',
    'nav.resources': 'Resources',
    'nav.auctions': 'Auctions',
    'nav.community': 'Community',
    'nav.about': 'About',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.mypage': 'My Page',
    'nav.logout': 'Logout',
    'nav.admin': 'Admin',
    'header.search': 'Search',
    'header.notifications': 'Notifications',
    'header.language': 'Language',
    'header.location': 'Location',
  },
  jp: {
    'nav.home': 'ホーム',
    'nav.services': 'サービス',
    'nav.resources': 'リソース',
    'nav.auctions': 'オークション',
    'nav.community': 'コミュニティ',
    'nav.about': '紹介',
    'nav.login': 'ログイン',
    'nav.register': '会員登録',
    'nav.mypage': 'マイページ',
    'nav.logout': 'ログアウト',
    'nav.admin': '管理者',
    'header.search': '検索',
    'header.notifications': 'お知らせ',
    'header.language': '言語',
    'header.location': '位置',
  }
};

// 홈페이지 관련 번역
const homeTranslations: LanguageMap = {
  ko: {
    'home.title': '웨벨 서비스 플랫폼',
    'home.subtitle': '엔지니어, 소비자, 제조업체를 위한 지능형 적응 생태계',
    'home.category.title': '카테고리',
    'home.services.title': '인기 서비스',
    'home.services.viewAll': '모두 보기',
    'home.resources.title': '최신 리소스',
    'home.resources.viewAll': '모두 보기',
    'home.nearby.title': '주변 서비스',
    'home.nearby.viewAll': '모두 보기',
    'home.engineers.title': '전문 엔지니어',
    'home.engineers.viewAll': '모두 보기',
    'home.cta.title': '서비스 등록하기',
    'home.cta.subtitle': '여러분의 서비스를 등록하고 새로운 고객을 만나보세요.',
    'home.cta.button': '등록하기',
  },
  en: {
    'home.title': 'Webel Service Platform',
    'home.subtitle': 'Intelligent adaptive ecosystem for engineers, consumers, and manufacturers',
    'home.category.title': 'Categories',
    'home.services.title': 'Popular Services',
    'home.services.viewAll': 'View All',
    'home.resources.title': 'Latest Resources',
    'home.resources.viewAll': 'View All',
    'home.nearby.title': 'Nearby Services',
    'home.nearby.viewAll': 'View All',
    'home.engineers.title': 'Professional Engineers',
    'home.engineers.viewAll': 'View All',
    'home.cta.title': 'Register Your Service',
    'home.cta.subtitle': 'Register your service and meet new customers.',
    'home.cta.button': 'Register',
  },
  jp: {
    'home.title': 'ウェベルサービスプラットフォーム',
    'home.subtitle': 'エンジニア、消費者、メーカーのためのインテリジェントな適応エコシステム',
    'home.category.title': 'カテゴリー',
    'home.services.title': '人気サービス',
    'home.services.viewAll': 'すべて見る',
    'home.resources.title': '最新リソース',
    'home.resources.viewAll': 'すべて見る',
    'home.nearby.title': '近くのサービス',
    'home.nearby.viewAll': 'すべて見る',
    'home.engineers.title': '専門エンジニア',
    'home.engineers.viewAll': 'すべて見る',
    'home.cta.title': 'サービスを登録する',
    'home.cta.subtitle': 'あなたのサービスを登録して、新しい顧客に会いましょう。',
    'home.cta.button': '登録する',
  }
};

// 서비스 관련 번역
const serviceTranslations: LanguageMap = {
  ko: {
    'service.category.3d_printer': '근처 3D 프린터',
    'service.category.ai_assistant': 'AI 조립 비서',
    'service.category.remote_support': '조립 원격 지원',
    'service.category.engineers': '엔지니어 찾기',
    'service.category.manufacturers': '생산업체 찾기',
    'service.category.sponsor': 'Webel 후원하기',
    'service.category.3d_printing': '3D 프린팅',
    'service.category.manufacturing': '제조',
    'service.category.engineer': '엔지니어',
    'service.details.title': '서비스 상세',
    'service.details.provider': '제공자',
    'service.details.location': '위치',
    'service.details.rating': '평점',
    'service.details.price': '가격',
    'service.details.contact': '연락처',
    'service.details.description': '설명',
    'service.register.title': '서비스 등록',
    'service.register.type': '서비스 타입',
    'service.register.submit': '등록하기',
    'service.search.placeholder': '서비스 검색...',
    'service.filter.title': '필터',
    'service.filter.priceRange': '가격 범위',
    'service.filter.location': '위치',
    'service.filter.rating': '평점',
    'service.filter.apply': '적용하기',
  },
  en: {
    'service.category.3d_printer': 'Nearby 3D Printers',
    'service.category.ai_assistant': 'AI Assembly Assistant',
    'service.category.remote_support': 'Remote Assembly Support',
    'service.category.engineers': 'Find Engineers',
    'service.category.manufacturers': 'Find Manufacturers',
    'service.category.sponsor': 'Sponsor Webel',
    'service.category.3d_printing': '3D Printing',
    'service.category.manufacturing': 'Manufacturing',
    'service.category.engineer': 'Engineer',
    'service.details.title': 'Service Details',
    'service.details.provider': 'Provider',
    'service.details.location': 'Location',
    'service.details.rating': 'Rating',
    'service.details.price': 'Price',
    'service.details.contact': 'Contact',
    'service.details.description': 'Description',
    'service.register.title': 'Register Service',
    'service.register.type': 'Service Type',
    'service.register.submit': 'Submit',
    'service.search.placeholder': 'Search services...',
    'service.filter.title': 'Filters',
    'service.filter.priceRange': 'Price Range',
    'service.filter.location': 'Location',
    'service.filter.rating': 'Rating',
    'service.filter.apply': 'Apply',
  },
  jp: {
    'service.category.3d_printer': '近くの3Dプリンター',
    'service.category.ai_assistant': 'AI組立アシスタント',
    'service.category.remote_support': '遠隔組立サポート',
    'service.category.engineers': 'エンジニアを探す',
    'service.category.manufacturers': '製造会社を探す',
    'service.category.sponsor': 'Webelを支援する',
    'service.category.3d_printing': '3Dプリンティング',
    'service.category.manufacturing': '製造',
    'service.category.engineer': 'エンジニア',
    'service.details.title': 'サービス詳細',
    'service.details.provider': '提供者',
    'service.details.location': '場所',
    'service.details.rating': '評価',
    'service.details.price': '価格',
    'service.details.contact': '連絡先',
    'service.details.description': '説明',
    'service.register.title': 'サービス登録',
    'service.register.type': 'サービスタイプ',
    'service.register.submit': '登録する',
    'service.search.placeholder': 'サービスを検索...',
    'service.filter.title': 'フィルター',
    'service.filter.priceRange': '価格帯',
    'service.filter.location': '場所',
    'service.filter.rating': '評価',
    'service.filter.apply': '適用する',
  }
};

// 리소스 관련 번역
const resourceTranslations: LanguageMap = {
  ko: {
    'resource.category.hardware_design': '하드웨어 설계도',
    'resource.category.3d_model': '3D 모델링 파일',
    'resource.category.software': '소프트웨어 오픈소스',
    'resource.category.ai_model': 'AI 모델',
    'resource.category.flash_game': '플래시 게임',
    'resource.category.free_content': '프리 콘텐츠',
    'resource.details.title': '리소스 상세',
    'resource.details.author': '작성자',
    'resource.details.download': '다운로드',
    'resource.details.description': '설명',
    'resource.upload.title': '리소스 업로드',
    'resource.upload.type': '리소스 타입',
    'resource.upload.submit': '업로드하기',
    'resource.search.placeholder': '리소스 검색...',
    'resource.filter.title': '필터',
    'resource.filter.category': '카테고리',
    'resource.filter.date': '날짜',
    'resource.filter.popularity': '인기도',
    'resource.filter.apply': '적용하기',
  },
  en: {
    'resource.category.hardware_design': 'Hardware Design',
    'resource.category.3d_model': '3D Model',
    'resource.category.software': 'Software',
    'resource.category.ai_model': 'AI Model',
    'resource.category.flash_game': 'Flash Game',
    'resource.category.free_content': 'Free Content',
    'resource.details.title': 'Resource Details',
    'resource.details.author': 'Author',
    'resource.details.download': 'Download',
    'resource.details.description': 'Description',
    'resource.upload.title': 'Upload Resource',
    'resource.upload.type': 'Resource Type',
    'resource.upload.submit': 'Upload',
    'resource.search.placeholder': 'Search resources...',
    'resource.filter.title': 'Filters',
    'resource.filter.category': 'Category',
    'resource.filter.date': 'Date',
    'resource.filter.popularity': 'Popularity',
    'resource.filter.apply': 'Apply',
  },
  jp: {
    'resource.category.hardware_design': 'ハードウェア設計',
    'resource.category.3d_model': '3Dモデル',
    'resource.category.software': 'ソフトウェア',
    'resource.category.ai_model': 'AIモデル',
    'resource.category.flash_game': 'フラッシュゲーム',
    'resource.category.free_content': '無料コンテンツ',
    'resource.details.title': 'リソース詳細',
    'resource.details.author': '作成者',
    'resource.details.download': 'ダウンロード',
    'resource.details.description': '説明',
    'resource.upload.title': 'リソースアップロード',
    'resource.upload.type': 'リソースタイプ',
    'resource.upload.submit': 'アップロード',
    'resource.search.placeholder': 'リソースを検索...',
    'resource.filter.title': 'フィルター',
    'resource.filter.category': 'カテゴリー',
    'resource.filter.date': '日付',
    'resource.filter.popularity': '人気度',
    'resource.filter.apply': '適用する',
  }
};

// 결제 및 인증 관련 번역
const authAndPaymentTranslations: LanguageMap = {
  ko: {
    'auth.login.title': '로그인',
    'auth.login.email': '이메일',
    'auth.login.password': '비밀번호',
    'auth.login.submit': '로그인',
    'auth.login.forgotPassword': '비밀번호 찾기',
    'auth.register.title': '회원가입',
    'auth.register.name': '이름',
    'auth.register.email': '이메일',
    'auth.register.password': '비밀번호',
    'auth.register.confirmPassword': '비밀번호 확인',
    'auth.register.submit': '가입하기',
    'payment.title': '결제',
    'payment.service': '서비스',
    'payment.amount': '금액',
    'payment.method': '결제 방법',
    'payment.card': '카드',
    'payment.bank': '계좌이체',
    'payment.submit': '결제하기',
    'payment.success': '결제 성공',
    'payment.fail': '결제 실패',
  },
  en: {
    'auth.login.title': 'Login',
    'auth.login.email': 'Email',
    'auth.login.password': 'Password',
    'auth.login.submit': 'Login',
    'auth.login.forgotPassword': 'Forgot Password',
    'auth.register.title': 'Register',
    'auth.register.name': 'Name',
    'auth.register.email': 'Email',
    'auth.register.password': 'Password',
    'auth.register.confirmPassword': 'Confirm Password',
    'auth.register.submit': 'Register',
    'payment.title': 'Payment',
    'payment.service': 'Service',
    'payment.amount': 'Amount',
    'payment.method': 'Payment Method',
    'payment.card': 'Card',
    'payment.bank': 'Bank Transfer',
    'payment.submit': 'Pay',
    'payment.success': 'Payment Successful',
    'payment.fail': 'Payment Failed',
  },
  jp: {
    'auth.login.title': 'ログイン',
    'auth.login.email': 'メール',
    'auth.login.password': 'パスワード',
    'auth.login.submit': 'ログイン',
    'auth.login.forgotPassword': 'パスワードを忘れた',
    'auth.register.title': '会員登録',
    'auth.register.name': '名前',
    'auth.register.email': 'メール',
    'auth.register.password': 'パスワード',
    'auth.register.confirmPassword': 'パスワード確認',
    'auth.register.submit': '登録する',
    'payment.title': '決済',
    'payment.service': 'サービス',
    'payment.amount': '金額',
    'payment.method': '決済方法',
    'payment.card': 'カード',
    'payment.bank': '銀行振込',
    'payment.submit': '決済する',
    'payment.success': '決済成功',
    'payment.fail': '決済失敗',
  }
};

// 공통 UI 컴포넌트 관련 번역
const commonUITranslations: LanguageMap = {
  ko: {
    'ui.button.submit': '제출',
    'ui.button.cancel': '취소',
    'ui.button.save': '저장',
    'ui.button.edit': '수정',
    'ui.button.delete': '삭제',
    'ui.button.confirm': '확인',
    'ui.button.back': '뒤로',
    'ui.button.next': '다음',
    'ui.button.previous': '이전',
    'ui.button.viewMore': '더보기',
    'ui.modal.close': '닫기',
    'ui.pagination.prev': '이전',
    'ui.pagination.next': '다음',
    'ui.loading': '로딩 중...',
    'ui.error': '오류가 발생했습니다',
    'ui.noResults': '결과가 없습니다',
    'ui.notFound': '페이지를 찾을 수 없습니다',
    'ui.search': '검색',
    'ui.filter': '필터',
    'ui.sort': '정렬',
  },
  en: {
    'ui.button.submit': 'Submit',
    'ui.button.cancel': 'Cancel',
    'ui.button.save': 'Save',
    'ui.button.edit': 'Edit',
    'ui.button.delete': 'Delete',
    'ui.button.confirm': 'Confirm',
    'ui.button.back': 'Back',
    'ui.button.next': 'Next',
    'ui.button.previous': 'Previous',
    'ui.button.viewMore': 'View More',
    'ui.modal.close': 'Close',
    'ui.pagination.prev': 'Previous',
    'ui.pagination.next': 'Next',
    'ui.loading': 'Loading...',
    'ui.error': 'An error occurred',
    'ui.noResults': 'No results found',
    'ui.notFound': 'Page not found',
    'ui.search': 'Search',
    'ui.filter': 'Filter',
    'ui.sort': 'Sort',
  },
  jp: {
    'ui.button.submit': '送信',
    'ui.button.cancel': 'キャンセル',
    'ui.button.save': '保存',
    'ui.button.edit': '編集',
    'ui.button.delete': '削除',
    'ui.button.confirm': '確認',
    'ui.button.back': '戻る',
    'ui.button.next': '次へ',
    'ui.button.previous': '前へ',
    'ui.button.viewMore': 'もっと見る',
    'ui.modal.close': '閉じる',
    'ui.pagination.prev': '前へ',
    'ui.pagination.next': '次へ',
    'ui.loading': '読み込み中...',
    'ui.error': 'エラーが発生しました',
    'ui.noResults': '結果がありません',
    'ui.notFound': 'ページが見つかりません',
    'ui.search': '検索',
    'ui.filter': 'フィルター',
    'ui.sort': '並べ替え',
  }
};

// 에러 메시지 및 상태 관련 번역
const errorTranslations: LanguageMap = {
  ko: {
    'error.generic': '오류가 발생했습니다. 다시 시도해주세요.',
    'error.network': '네트워크 오류가 발생했습니다.',
    'error.server': '서버 오류가 발생했습니다.',
    'error.auth.invalidCredentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
    'error.auth.accountExists': '이미 존재하는 계정입니다.',
    'error.validation.required': '필수 항목입니다.',
    'error.validation.email': '유효한 이메일 주소를 입력해주세요.',
    'error.validation.minLength': '최소 {0}자 이상 입력해주세요.',
    'error.validation.maxLength': '최대 {0}자까지 입력 가능합니다.',
    'error.validation.passwordMatch': '비밀번호가 일치하지 않습니다.',
    'error.notFound': '요청한 페이지를 찾을 수 없습니다.',
    'error.unauthorized': '접근 권한이 없습니다.',
    'error.forbidden': '금지된 접근입니다.',
  },
  en: {
    'error.generic': 'An error occurred. Please try again.',
    'error.network': 'A network error occurred.',
    'error.server': 'A server error occurred.',
    'error.auth.invalidCredentials': 'Invalid email or password.',
    'error.auth.accountExists': 'Account already exists.',
    'error.validation.required': 'This field is required.',
    'error.validation.email': 'Please enter a valid email address.',
    'error.validation.minLength': 'Please enter at least {0} characters.',
    'error.validation.maxLength': 'Please enter no more than {0} characters.',
    'error.validation.passwordMatch': 'Passwords do not match.',
    'error.notFound': 'The requested page was not found.',
    'error.unauthorized': 'You are not authorized to access this page.',
    'error.forbidden': 'Access forbidden.',
  },
  jp: {
    'error.generic': 'エラーが発生しました。もう一度お試しください。',
    'error.network': 'ネットワークエラーが発生しました。',
    'error.server': 'サーバーエラーが発生しました。',
    'error.auth.invalidCredentials': 'メールまたはパスワードが正しくありません。',
    'error.auth.accountExists': 'アカウントはすでに存在します。',
    'error.validation.required': '必須項目です。',
    'error.validation.email': '有効なメールアドレスを入力してください。',
    'error.validation.minLength': '最小{0}文字以上入力してください。',
    'error.validation.maxLength': '最大{0}文字まで入力可能です。',
    'error.validation.passwordMatch': 'パスワードが一致しません。',
    'error.notFound': 'リクエストしたページが見つかりません。',
    'error.unauthorized': 'アクセス権限がありません。',
    'error.forbidden': '禁止されたアクセスです。',
  }
};

// 모든 번역을 하나의 객체로 병합
const translations: LanguageMap = {
  ko: {
    ...headerTranslations.ko,
    ...homeTranslations.ko,
    ...serviceTranslations.ko,
    ...resourceTranslations.ko,
    ...authAndPaymentTranslations.ko,
    ...commonUITranslations.ko,
    ...errorTranslations.ko,
  },
  en: {
    ...headerTranslations.en,
    ...homeTranslations.en,
    ...serviceTranslations.en,
    ...resourceTranslations.en,
    ...authAndPaymentTranslations.en,
    ...commonUITranslations.en,
    ...errorTranslations.en,
  },
  jp: {
    ...headerTranslations.jp,
    ...homeTranslations.jp,
    ...serviceTranslations.jp,
    ...resourceTranslations.jp,
    ...authAndPaymentTranslations.jp,
    ...commonUITranslations.jp,
    ...errorTranslations.jp,
  }
};

/**
 * 지정된 언어와 키를 사용하여 번역을 가져옵니다.
 * 해당 키가 없는 경우 키 자체를 반환합니다.
 */
export function getTranslation(key: TranslationKey, language: Language): string {
  const translationMap = translations[language];
  return translationMap[key] || key;
}

/**
 * 사용하기 편리한 번역 함수를 제공하는 훅
 * 현재 활성화된 언어와 함께 사용됩니다.
 */
export function useTranslations(language: Language) {
  return {
    t: (key: TranslationKey) => getTranslation(key, language),
    // 인자를 포함한 번역을 위한 함수
    tFormat: (key: TranslationKey, ...args: any[]) => {
      let text = getTranslation(key, language);
      args.forEach((arg, index) => {
        text = text.replace(`{${index}}`, arg);
      });
      return text;
    }
  };
}

export default translations;