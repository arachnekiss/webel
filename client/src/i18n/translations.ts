/**
 * Internationalization translation dictionaries
 * Contains translations for all text strings used in the application
 */

// Define types for our translation structure
export type Language = 'ko' | 'en' | 'jp';

// Translation dictionary type
export type TranslationDictionary = {
  [key: string]: string | TranslationDictionary;
};

// Export translations used across the application
export const translations: Record<Language, any> = {
  ko: {
    // Navigation and general UI
    loading: '로딩 중...',
    pageLoading: '페이지를 불러오는 중입니다...',
    error: '오류가 발생했습니다',
    tryAgain: '다시 시도',
    close: '닫기',
    save: '저장',
    cancel: '취소',
    confirm: '확인',
    delete: '삭제',
    edit: '수정',
    view: '보기',
    search: '검색',
    send: '보내기',
    upload: '업로드',
    download: '다운로드',
    submit: '제출',
    goToHome: '홈으로 이동',
    processing: '처리 중...',
    
    // Error pages
    errorPages: {
      '404_title': '404 페이지를 찾을 수 없음',
      '404_message': '요청하신 페이지를 찾을 수 없습니다. URL을 확인해 주세요.'
    },
    
    // Header and footer
    login: '로그인',
    register: '회원가입',
    logout: '로그아웃',
    myAccount: '내 계정',
    settings: '설정',
    privacyPolicy: '개인정보 처리방침',
    termsOfService: '이용약관',
    
    // Navigation
    nav: {
      home: '홈',
      all_resources: '모든 리소스',
      hardware_design: '하드웨어 설계',
      software: '소프트웨어',
      ai_model: 'AI 모델',
      modeling_file: '3D 모델링 파일',
      free_content: '무료 콘텐츠',
      flash_game: '플래시 게임',
      engineering_services: '엔지니어링 서비스',
      printing_services: '3D 프린팅 서비스',
      manufacturing_services: '제조 서비스',
      menu: '메뉴',
      main_menu: '메인 메뉴',
      resource_categories: '리소스 카테고리',
      services: '서비스',
      services_description: '도움이 필요한 서비스를 찾아보세요.',
      account: '계정',
      language_settings: '언어 설정',
      admin_menu: '관리자 메뉴',
      admin_dashboard: '관리자 대시보드',
      start_3d_printing: '3D 프린팅 시작하기',
      start_3d_printing_desc: '3D 프린터를 사용하여 원하는 모델을 출력해보세요.',
      find_printer: '프린터 찾기',
      register_printer: '프린터 등록하기',
      register_printer_desc: '프린터를 등록하고 수익을 창출하세요.',
      register_printer_link: '프린터 등록',
      '3d_printer': '3D 프린터',
      ai_assistant: 'AI 어시스턴트',
      remote_support: '원격 지원',
      manufacturers: '제조사',
      sponsor: 'Webel 후원하기'
    },
    
    // Authentication
    auth: {
      login: '로그인',
      register: '회원가입',
      title: '계정',
      loginTab: '로그인',
      registerTab: '회원가입',
      loginTitle: '로그인',
      registerTitle: '회원가입',
      loginSubtitle: '계정에 로그인하세요',
      registerSubtitle: '새 계정을 만드세요',
      usernameOrEmail: '사용자 이름 또는 이메일',
      password: '비밀번호',
      confirmPassword: '비밀번호 확인',
      forgotPassword: '비밀번호를 잊으셨나요?',
      username: '사용자 이름',
      email: '이메일',
      rememberMe: '로그인 상태 유지',
      loginButton: '로그인',
      registerButton: '회원가입',
      orContinueWith: '또는 계속하기',
      alreadyHaveAccount: '이미 계정이 있으신가요?',
      dontHaveAccount: '계정이 없으신가요?',
      loginNow: '지금 로그인',
      registerNow: '지금 가입하기'
    },
    
    // Verification
    verification: {
      title: '본인 인증',
      pageDescription: '서비스 제공자가 되시려면 본인 인증 절차가 필요합니다.',
      verificationStatus: '인증 상태',
      phoneStatus: '휴대폰 인증 상태',
      bankStatus: '계좌 인증 상태',
      statusVerified: '인증됨',
      statusUnverified: '미인증',
      statusPending: '대기 중',
      phoneVerification: '휴대폰 인증',
      phoneVerificationDescription: '휴대폰 번호를 통해 본인 인증을 진행합니다.',
      phoneVerificationNote: '인증번호가 포함된 SMS가 전송됩니다.',
      phoneNumber: '휴대폰 번호',
      phoneNumberPlaceholder: '휴대폰 번호 입력 (-없이)',
      sendVerificationCode: '인증번호 발송',
      verificationCode: '인증번호',
      verificationCodePlaceholder: '인증번호 6자리 입력',
      verifyCode: '인증번호 확인',
      phoneVerificationSuccess: '휴대폰 인증이 완료되었습니다.',
      phoneVerificationFailed: '휴대폰 인증에 실패했습니다.',
      verificationCodeSent: '인증번호가 발송되었습니다.',
      verificationCodeFailed: '인증번호 발송에 실패했습니다.',
      invalidPhoneNumber: '유효하지 않은 휴대폰 번호입니다.',
      invalidVerificationCode: '유효하지 않은 인증번호입니다.',
      bankAccountVerification: '계좌 인증',
      bankAccountVerificationDescription: '계좌 정보를 등록하여 서비스 제공 대금을 받으세요.',
      bankAccountVerificationNote: '계좌 정보는 안전하게 보호됩니다.',
      bankName: '은행명',
      bankNamePlaceholder: '은행 선택',
      accountHolder: '예금주',
      accountHolderPlaceholder: '예금주명 입력',
      accountNumber: '계좌번호',
      accountNumberPlaceholder: '계좌번호 입력 (-없이)',
      registerAccount: '계좌 등록',
      bankVerificationSuccess: '계좌 등록이 완료되었습니다.',
      bankVerificationFailed: '계좌 등록에 실패했습니다.',
      invalidBankName: '은행명을 선택해주세요.',
      invalidAccountHolder: '예금주명을 입력해주세요.',
      invalidAccountNumber: '유효하지 않은 계좌번호입니다.'
    },
    
    // Resource types
    resourceType: {
      free_content: '무료 콘텐츠',
      flash_game: '플래시 게임',
      hardware_design: '하드웨어 설계',
      software: '소프트웨어',
      ai_model: 'AI 모델',
      '3d_model': '3D 모델'
    },
    
    // Service types
    serviceType: {
      '3d_printing': '3D 프린팅',
      engineer: '엔지니어',
      manufacturing: '제조'
    },
    
    // Services page
    services: {
      nearby_3d_printers: '근처 3D 프린터',
      electronic_circuit_service: '전자 회로 제작 서비스',
      woodworking_service: '목공 서비스',
      metalworking_service: '금속 가공 서비스',
      find_manufacturer: '생산업체 찾기',
      find_engineer: '엔지니어 찾기',
      all_services: '모든 서비스',
      register_service: '서비스 등록',
      register_printer: '프린터 등록',
      register_engineer: '엔지니어 등록',
      register_manufacturer: '생산업체 등록',
      
      // Location and filtering
      current_location: '현재 위치',
      location_loading: '위치 확인 중...',
      location_unknown: '알 수 없음',
      location_unavailable: '위치 정보 사용 불가',
      search_radius: '검색 반경',
      city_selection: '도시 선택',
      district_selection: '지역구',
      all: '전체',
      filter_applied: '적용 필터',
      reset_filters: '필터 초기화',
      
      // Sorting options
      sort_by: '정렬 기준',
      newest: '최신순',
      rating: '평점순',
      low_price: '낮은가격순',
      
      // View modes
      view_mode: '보기 모드',
      list_view: '목록 보기',
      map_view: '지도 보기',
      
      // Empty states
      no_printers_found: '검색 조건에 맞는 근처 3D 프린터가 없습니다.',
      no_services_found: '검색 조건에 맞는 서비스가 없습니다.',
      try_different_filters: '검색어나 필터를 변경해보세요.',
      no_printers_in_area: '이 지역에 이용 가능한 근처 3D 프린터가 없습니다.',
      try_different_area: '다른 지역을 검색하거나 필터를 조정해보세요.'
    },
    
    // Home page
    home: {
      tagline: '하드웨어 설계도부터 소프트웨어, 3D 모델까지 한 곳에서',
      mainTitle: '창작자와 엔지니어를 위한',
      mainTitleHighlight: '오픈 리소스 플랫폼',
      mainDescription: 'Webel에서 다양한 리소스를 찾고 근처의 3D 프린터와 제작 서비스에 쉽게 연결하세요. 만들고 싶은 모든 것을 가능하게 하는 커뮤니티에 참여하세요.',
      findResources: '리소스 찾기',
      findNearby3DPrinters: '근처 3D 프린터 찾기',
      participatingMembers: '다양한 업체와 개인 제작자 참여 중',
      partnerTypes: ['제작업체', '개인 제작자', '유통업체', '제조 회사', '스타트업'],
      welcome: '웰컴 메시지',
      featuredResources: '추천 리소스',
      featuredServices: '추천 서비스',
      nearbyServices: '주변 서비스',
      viewMore: '더보기',
      latestResources: '최신 리소스',
      popularResources: '인기 리소스',
      featuredContent: '추천 콘텐츠',
      hardwareTitle: '하드웨어 설계',
      hardwareDescription: '전자 제품과 하드웨어 설계를 위한 리소스',
      softwareTitle: '소프트웨어',
      softwareDescription: '펌웨어, 드라이버 및 소프트웨어 솔루션',
      aiModelTitle: 'AI 모델',
      aiModelDescription: '하드웨어 프로젝트를 위한 AI/ML 모델',
      modelingTitle: '3D 모델',
      modelingDescription: '3D 프린팅 및 하드웨어 케이스를 위한 모델',
      freeContentTitle: '무료 콘텐츠',
      freeContentDescription: '교육 자료, 가이드 및 튜토리얼',
      flashGamesTitle: '플래시 게임',
      flashGamesSubtitle: '고전 플래시 게임을 즐겨보세요',
      moreGames: '더 많은 게임',
      noGamesYet: '아직 게임이 없습니다',
      gamesComingSoon: '곧 게임이 추가될 예정입니다',
      searchResources: '리소스 검색',
      searchServices: '서비스 검색',
      browseByCategory: '카테고리별 둘러보기'
    },
    
    // Features sections
    features: {
      aiAssembly: {
        title: 'AI 조립 어시스턴트',
        subtitle: 'AI가 부품 선택과 조립을 도와드립니다',
        askQuestion: '질문하기',
        uploadImage: '이미지 업로드',
        recordAudio: '음성 녹음',
        sendingMessage: '메시지 전송 중...',
        uploadingImage: '이미지 업로드 중...',
        processingAudio: '음성 처리 중...',
        askAI: 'AI에게 물어보기',
        imagePlaceholder: '이미지를 업로드하려면 클릭하세요',
        askAboutCircuits: '회로에 대해 질문하기',
        askAboutComponents: '부품에 대해 질문하기',
        askAboutConnectionIssues: '연결 문제에 대해 질문하기',
        askAboutReplacements: '대체 부품에 대해 질문하기',
        uploadCircuitImage: '회로 이미지 업로드',
        analyzeImage: '이미지 분석',
        analyzeCircuit: '회로 분석'
      },
      
      sponsor: {
        title: '후원하기',
        subtitle: '웹엘의 발전을 위해 후원해주세요',
        description: '웹엘은 엔지니어와 메이커들을 위한 오픈 플랫폼입니다. 여러분의 후원으로 더 좋은 서비스를 제공할 수 있습니다.',
        monthly: '월간 후원',
        oneTime: '일회성 후원',
        amount: '금액',
        custom: '직접 입력',
        currency: '원',
        donate: 'Webel 후원하기',
        thankYou: '후원해주셔서 감사합니다',
        donationComplete: '후원이 완료되었습니다',
        errorProcessing: '처리 중 오류가 발생했습니다',
        tryAgain: '다시 시도해주세요'
      }
    },
    
    common: {
      viewMore: '더보기'
    },
    
    ui: {
      search: {
        placeholder: '검색어를 입력하세요',
        button: '검색',
        results: '검색 결과',
        no_results: '검색 결과가 없습니다',
        search_button: '검색'
      }
    },
    
    // Resources page
    resources: {
      no_search_results: '다음에 대한 검색 결과가 없습니다',
      no_resources_available: '사용 가능한 리소스가 없습니다',
      view_all: '모든 리소스 보기',
      search_placeholder: '리소스 검색...',
      upload_resource: '리소스 업로드',
      filter_by_category: '카테고리별 필터링',
      filter_by_type: '유형별 필터링',
      sort_by: '정렬 기준',
      newest: '최신순',
      most_downloaded: '다운로드순',
      featured: '추천순'
    }
  },
  
  en: {
    // Navigation and general UI
    loading: 'Loading...',
    pageLoading: 'Loading page...',
    error: 'An error occurred',
    tryAgain: 'Try again',
    close: 'Close',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    search: 'Search',
    send: 'Send',
    upload: 'Upload',
    download: 'Download',
    submit: 'Submit',
    goToHome: 'Go to Home',
    processing: 'Processing...',
    
    // Header and footer
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    myAccount: 'My Account',
    settings: 'Settings',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    
    // Navigation
    nav: {
      home: 'Home',
      all_resources: 'All Resources',
      hardware_design: 'Hardware Design',
      software: 'Software',
      ai_model: 'AI Model',
      modeling_file: '3D Model Files',
      free_content: 'Free Content',
      flash_game: 'Flash Games',
      engineering_services: 'Engineering Services',
      printing_services: '3D Printing Services',
      manufacturing_services: 'Manufacturing Services',
      menu: 'Menu',
      main_menu: 'Main Menu',
      resource_categories: 'Resource Categories',
      services: 'Services',
      services_description: 'Find services that you need.',
      account: 'Account',
      language_settings: 'Language Settings',
      admin_menu: 'Admin Menu',
      admin_dashboard: 'Admin Dashboard',
      start_3d_printing: 'Start 3D Printing',
      start_3d_printing_desc: 'Print your models with 3D printers.',
      find_printer: 'Find Printer',
      register_printer: 'Register Your Printer',
      register_printer_desc: 'Register your printer and earn money.',
      register_printer_link: 'Register Printer',
      '3d_printer': '3D Printer',
      ai_assistant: 'AI Assistant',
      remote_support: 'Remote Support',
      manufacturers: 'Manufacturers',
      sponsor: 'Sponsor'
    },
    
    // Authentication
    auth: {
      login: 'Login',
      register: 'Register',
      title: 'Account',
      loginTab: 'Login',
      registerTab: 'Register',
      loginTitle: 'Login',
      registerTitle: 'Register',
      loginSubtitle: 'Sign in to your account',
      registerSubtitle: 'Create a new account',
      usernameOrEmail: 'Username or Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password?',
      username: 'Username',
      email: 'Email',
      rememberMe: 'Remember me',
      loginButton: 'Sign In',
      registerButton: 'Sign Up',
      orContinueWith: 'Or continue with',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: "Don't have an account?",
      loginNow: 'Login now',
      registerNow: 'Register now'
    },
    
    // Verification
    verification: {
      title: 'Verification',
      pageDescription: 'Verification is required to become a service provider.',
      verificationStatus: 'Verification Status',
      phoneStatus: 'Phone Verification Status',
      bankStatus: 'Bank Account Verification Status',
      statusVerified: 'Verified',
      statusUnverified: 'Unverified',
      statusPending: 'Pending',
      phoneVerification: 'Phone Verification',
      phoneVerificationDescription: 'Verify your identity through your phone number.',
      phoneVerificationNote: 'An SMS with a verification code will be sent.',
      phoneNumber: 'Phone Number',
      phoneNumberPlaceholder: 'Enter phone number (no hyphens)',
      sendVerificationCode: 'Send Verification Code',
      verificationCode: 'Verification Code',
      verificationCodePlaceholder: 'Enter 6-digit code',
      verifyCode: 'Verify Code',
      phoneVerificationSuccess: 'Phone verification completed successfully.',
      phoneVerificationFailed: 'Phone verification failed.',
      verificationCodeSent: 'Verification code has been sent.',
      verificationCodeFailed: 'Failed to send verification code.',
      invalidPhoneNumber: 'Invalid phone number.',
      invalidVerificationCode: 'Invalid verification code.',
      bankAccountVerification: 'Bank Account Verification',
      bankAccountVerificationDescription: 'Register your bank account to receive payments for your services.',
      bankAccountVerificationNote: 'Your account information is securely protected.',
      bankName: 'Bank Name',
      bankNamePlaceholder: 'Select bank',
      accountHolder: 'Account Holder',
      accountHolderPlaceholder: 'Enter account holder name',
      accountNumber: 'Account Number',
      accountNumberPlaceholder: 'Enter account number (no hyphens)',
      registerAccount: 'Register Account',
      bankVerificationSuccess: 'Bank account registration completed.',
      bankVerificationFailed: 'Bank account registration failed.',
      invalidBankName: 'Please select a bank.',
      invalidAccountHolder: 'Please enter account holder name.',
      invalidAccountNumber: 'Invalid account number.'
    },
    
    // Resource types
    resourceType: {
      free_content: 'Free Content',
      flash_game: 'Flash Game',
      hardware_design: 'Hardware Design',
      software: 'Software',
      ai_model: 'AI Model',
      '3d_model': '3D Model'
    },
    
    // Service types
    serviceType: {
      '3d_printing': '3D Printing',
      engineer: 'Engineer',
      manufacturing: 'Manufacturing'
    },
    
    // Services page
    services: {
      nearby_3d_printers: 'Nearby 3D Printers',
      electronic_circuit_service: 'Electronic Circuit Service',
      woodworking_service: 'Woodworking Service',
      metalworking_service: 'Metalworking Service',
      find_manufacturer: 'Find Manufacturer',
      find_engineer: 'Find Engineer',
      all_services: 'All Services',
      register_service: 'Register Service',
      register_printer: 'Register Printer',
      register_engineer: 'Register as Engineer',
      register_manufacturer: 'Register as Manufacturer',
      
      // Location and filtering
      current_location: 'Current Location',
      location_loading: 'Checking location...',
      location_unknown: 'Unknown',
      location_unavailable: 'Location unavailable',
      search_radius: 'Search Radius',
      city_selection: 'Select City',
      district_selection: 'District',
      all: 'All',
      filter_applied: 'Applied Filters',
      reset_filters: 'Reset Filters',
      
      // Sorting options
      sort_by: 'Sort by',
      newest: 'Newest',
      rating: 'Rating',
      low_price: 'Lowest Price',
      
      // View modes
      view_mode: 'View Mode',
      list_view: 'List View',
      map_view: 'Map View',
      
      // Empty states
      no_printers_found: 'No nearby 3D printers match your search criteria.',
      no_services_found: 'No services match your search criteria.',
      try_different_filters: 'Try changing your search terms or filters.',
      no_printers_in_area: 'No 3D printers available in this area.',
      try_different_area: 'Try searching in a different area or adjusting your filters.',
      no_matching_services: 'No services match your search criteria.'
    },
    
    // Home page
    home: {
      tagline: 'From hardware designs to software, 3D models - all in one place',
      mainTitle: 'An Open Resource Platform',
      mainTitleHighlight: 'for creators and engineers',
      mainDescription: 'Find diverse resources on Webel and easily connect with nearby 3D printers and manufacturing services. Join a community that makes everything you want to create possible.',
      findResources: 'Find Resources',
      findNearby3DPrinters: 'Find Nearby 3D Printers',
      participatingMembers: 'Various companies and individual makers participating',
      partnerTypes: ['Manufacturers', 'Individual Makers', 'Distributors', 'Manufacturing Companies', 'Startups'],
      welcome: 'Welcome Message',
      featuredResources: 'Featured Resources',
      featuredServices: 'Featured Services',
      nearbyServices: 'Nearby Services',
      viewMore: 'View More',
      latestResources: 'Latest Resources',
      popularResources: 'Popular Resources',
      featuredContent: 'Featured Content',
      hardwareTitle: 'Hardware Design',
      hardwareDescription: 'Resources for electronics and hardware design',
      softwareTitle: 'Software',
      softwareDescription: 'Firmware, drivers, and software solutions',
      aiModelTitle: 'AI Models',
      aiModelDescription: 'AI/ML models for hardware projects',
      modelingTitle: '3D Models',
      modelingDescription: 'Models for 3D printing and hardware cases',
      freeContentTitle: 'Free Content',
      freeContentDescription: 'Educational materials, guides, and tutorials',
      flashGamesTitle: 'Flash Games',
      flashGamesSubtitle: 'Enjoy classic flash games',
      moreGames: 'More Games',
      noGamesYet: 'No games yet',
      gamesComingSoon: 'Games coming soon',
      searchResources: 'Search Resources',
      searchServices: 'Search Services',
      browseByCategory: 'Browse by Category'
    },
    
    // Features sections
    features: {
      aiAssembly: {
        title: 'AI Assembly Assistant',
        subtitle: 'AI helps with parts selection and assembly',
        askQuestion: 'Ask a Question',
        uploadImage: 'Upload Image',
        recordAudio: 'Record Audio',
        sendingMessage: 'Sending message...',
        uploadingImage: 'Uploading image...',
        processingAudio: 'Processing audio...',
        askAI: 'Ask AI',
        imagePlaceholder: 'Click to upload an image',
        askAboutCircuits: 'Ask about circuits',
        askAboutComponents: 'Ask about components',
        askAboutConnectionIssues: 'Ask about connection issues',
        askAboutReplacements: 'Ask about replacement parts',
        uploadCircuitImage: 'Upload circuit image',
        analyzeImage: 'Analyze Image',
        analyzeCircuit: 'Analyze Circuit'
      },
      
      sponsor: {
        title: 'Sponsor',
        subtitle: 'Support Webel to help us grow',
        description: 'Webel is an open platform for engineers and makers. Your sponsorship helps us provide better services.',
        monthly: 'Monthly Sponsorship',
        oneTime: 'One-time Donation',
        amount: 'Amount',
        custom: 'Custom',
        currency: 'USD',
        donate: 'Donate',
        thankYou: 'Thank you for your support',
        donationComplete: 'Donation completed',
        errorProcessing: 'Error processing your donation',
        tryAgain: 'Please try again'
      }
    },
    
    common: {
      viewMore: 'View More'
    },
    
    ui: {
      search: {
        placeholder: 'Enter search terms',
        button: 'Search',
        results: 'Search Results',
        no_results: 'No results found',
        search_button: 'Search'
      }
    },
    
    // Resources page
    resources: {
      no_search_results: 'No search results found for',
      no_resources_available: 'No resources available',
      view_all: 'View All Resources',
      search_placeholder: 'Search resources...',
      upload_resource: 'Upload Resource',
      filter_by_category: 'Filter by Category',
      filter_by_type: 'Filter by Type',
      sort_by: 'Sort by',
      newest: 'Newest',
      most_downloaded: 'Most Downloaded',
      featured: 'Featured'
    }
  },
  
  jp: {
    // Navigation and general UI
    loading: '読み込み中...',
    pageLoading: 'ページを読み込んでいます...',
    error: 'エラーが発生しました',
    tryAgain: '再試行',
    close: '閉じる',
    save: '保存',
    cancel: 'キャンセル',
    confirm: '確認',
    delete: '削除',
    edit: '編集',
    view: '表示',
    search: '検索',
    send: '送信',
    upload: 'アップロード',
    download: 'ダウンロード',
    submit: '提出',
    goToHome: 'ホームへ戻る',
    processing: '処理中...',
    
    // Header and footer
    login: 'ログイン',
    register: '会員登録',
    logout: 'ログアウト',
    myAccount: 'マイアカウント',
    settings: '設定',
    privacyPolicy: 'プライバシーポリシー',
    termsOfService: '利用規約',
    
    // Navigation
    nav: {
      home: 'ホーム',
      all_resources: 'すべてのリソース',
      hardware_design: 'ハードウェア設計',
      software: 'ソフトウェア',
      ai_model: 'AIモデル',
      modeling_file: '3Dモデルファイル',
      free_content: '無料コンテンツ',
      flash_game: 'フラッシュゲーム',
      engineering_services: 'エンジニアリングサービス',
      printing_services: '3Dプリントサービス',
      manufacturing_services: '製造サービス',
      menu: 'メニュー',
      main_menu: 'メインメニュー',
      resource_categories: 'リソースカテゴリー',
      services: 'サービス',
      services_description: '必要なサービスを探してください。',
      account: 'アカウント',
      language_settings: '言語設定',
      admin_menu: '管理者メニュー',
      admin_dashboard: '管理者ダッシュボード',
      start_3d_printing: '3Dプリントを始める',
      start_3d_printing_desc: '3Dプリンターであなたのモデルを出力しましょう。',
      find_printer: 'プリンターを探す',
      register_printer: 'プリンターを登録',
      register_printer_desc: 'プリンターを登録して収益を得る。',
      register_printer_link: 'プリンター登録',
      '3d_printer': '3Dプリンター',
      ai_assistant: 'AIアシスタント',
      remote_support: 'リモートサポート',
      manufacturers: 'メーカー',
      sponsor: 'スポンサー'
    },
    
    // Authentication
    auth: {
      login: 'ログイン',
      register: '会員登録',
      title: 'アカウント',
      loginTab: 'ログイン',
      registerTab: '会員登録',
      loginTitle: 'ログイン',
      registerTitle: '会員登録',
      loginSubtitle: 'アカウントにログイン',
      registerSubtitle: '新しいアカウントを作成',
      usernameOrEmail: 'ユーザー名またはメール',
      password: 'パスワード',
      confirmPassword: 'パスワード確認',
      forgotPassword: 'パスワードをお忘れですか？',
      username: 'ユーザー名',
      email: 'メールアドレス',
      rememberMe: 'ログイン状態を保持',
      loginButton: 'サインイン',
      registerButton: 'サインアップ',
      orContinueWith: 'または続行',
      alreadyHaveAccount: 'すでにアカウントをお持ちですか？',
      dontHaveAccount: 'アカウントをお持ちでない方',
      loginNow: 'いますぐログイン',
      registerNow: 'いますぐ登録'
    },
    
    // Verification
    verification: {
      title: '本人確認',
      pageDescription: 'サービス提供者になるには本人確認が必要です。',
      verificationStatus: '認証状況',
      phoneStatus: '電話認証状況',
      bankStatus: '銀行口座認証状況',
      statusVerified: '認証済み',
      statusUnverified: '未認証',
      statusPending: '保留中',
      phoneVerification: '電話番号認証',
      phoneVerificationDescription: '電話番号で本人確認を行います。',
      phoneVerificationNote: '認証コードを含むSMSが送信されます。',
      phoneNumber: '電話番号',
      phoneNumberPlaceholder: '電話番号を入力（ハイフンなし）',
      sendVerificationCode: '認証コードを送信',
      verificationCode: '認証コード',
      verificationCodePlaceholder: '6桁のコードを入力',
      verifyCode: 'コードを確認',
      phoneVerificationSuccess: '電話認証が完了しました。',
      phoneVerificationFailed: '電話認証に失敗しました。',
      verificationCodeSent: '認証コードが送信されました。',
      verificationCodeFailed: '認証コードの送信に失敗しました。',
      invalidPhoneNumber: '無効な電話番号です。',
      invalidVerificationCode: '無効な認証コードです。',
      bankAccountVerification: '銀行口座認証',
      bankAccountVerificationDescription: '銀行口座を登録してサービス提供の報酬を受け取りましょう。',
      bankAccountVerificationNote: '口座情報は安全に保護されます。',
      bankName: '銀行名',
      bankNamePlaceholder: '銀行を選択',
      accountHolder: '口座名義人',
      accountHolderPlaceholder: '口座名義人名を入力',
      accountNumber: '口座番号',
      accountNumberPlaceholder: '口座番号を入力（ハイフンなし）',
      registerAccount: '口座を登録',
      bankVerificationSuccess: '銀行口座登録が完了しました。',
      bankVerificationFailed: '銀行口座登録に失敗しました。',
      invalidBankName: '銀行を選択してください。',
      invalidAccountHolder: '口座名義人名を入力してください。',
      invalidAccountNumber: '無効な口座番号です。'
    },
    
    // Resource types
    resourceType: {
      free_content: '無料コンテンツ',
      flash_game: 'フラッシュゲーム',
      hardware_design: 'ハードウェア設計',
      software: 'ソフトウェア',
      ai_model: 'AIモデル',
      '3d_model': '3Dモデル'
    },
    
    // Service types
    serviceType: {
      '3d_printing': '3Dプリンティング',
      engineer: 'エンジニア',
      manufacturing: '製造'
    },
    
    // Services page
    services: {
      nearby_3d_printers: '近くの3Dプリンター',
      electronic_circuit_service: '電子回路製作サービス',
      woodworking_service: '木工サービス',
      metalworking_service: '金属加工サービス',
      find_manufacturer: '製造業者を探す',
      find_engineer: 'エンジニアを探す',
      all_services: 'すべてのサービス',
      register_service: 'サービス登録',
      register_printer: 'プリンター登録',
      register_engineer: 'エンジニアとして登録',
      register_manufacturer: '製造業者として登録',
      
      // Location and filtering
      current_location: '現在地',
      location_loading: '位置確認中...',
      location_unknown: '不明',
      location_unavailable: '位置情報が利用できません',
      search_radius: '検索範囲',
      city_selection: '都市を選択',
      district_selection: '地区',
      all: 'すべて',
      filter_applied: '適用済みフィルター',
      reset_filters: 'フィルターをリセット',
      
      // Sorting options
      sort_by: '並び替え',
      newest: '最新順',
      rating: '評価順',
      low_price: '価格の安い順',
      
      // View modes
      view_mode: '表示モード',
      list_view: 'リスト表示',
      map_view: '地図表示',
      
      // Empty states
      no_printers_found: '条件に一致する3Dプリンターが見つかりません。',
      no_services_found: '条件に一致するサービスが見つかりません。',
      try_different_filters: '検索条件やフィルターを変更してみてください。',
      no_printers_in_area: 'この地域には利用可能な3Dプリンターがありません。',
      try_different_area: '別の地域で検索するか、フィルターを調整してください。'
    },
    
    // Home page
    home: {
      tagline: 'ハードウェア設計からソフトウェア、3Dモデルまで1か所で',
      mainTitle: 'クリエイターとエンジニアのための',
      mainTitleHighlight: 'オープンリソースプラットフォーム',
      mainDescription: 'Webelで多様なリソースを見つけ、近くの3Dプリンターや製造サービスに簡単に接続。あなたが作りたいものすべてを可能にするコミュニティに参加しましょう。',
      findResources: 'リソースを探す',
      findNearby3DPrinters: '近くの3Dプリンターを探す',
      participatingMembers: '様々な企業と個人メーカーが参加中',
      partnerTypes: ['製造会社', '個人メーカー', '流通会社', '製造会社', 'スタートアップ'],
      welcome: 'ようこそメッセージ',
      featuredResources: 'おすすめリソース',
      featuredServices: 'おすすめサービス',
      nearbyServices: '近くのサービス',
      viewMore: 'もっと見る',
      latestResources: '最新リソース',
      popularResources: '人気リソース',
      featuredContent: 'おすすめコンテンツ',
      hardwareTitle: 'ハードウェア設計',
      hardwareDescription: '電子機器とハードウェア設計のためのリソース',
      softwareTitle: 'ソフトウェア',
      softwareDescription: 'ファームウェア、ドライバー、ソフトウェアソリューション',
      aiModelTitle: 'AIモデル',
      aiModelDescription: 'ハードウェアプロジェクト用のAI/MLモデル',
      modelingTitle: '3Dモデル',
      modelingDescription: '3Dプリントとハードウェアケース用のモデル',
      freeContentTitle: '無料コンテンツ',
      freeContentDescription: '教育教材、ガイド、チュートリアル',
      flashGamesTitle: 'フラッシュゲーム',
      flashGamesSubtitle: '懐かしのフラッシュゲームを楽しむ',
      moreGames: 'もっとゲームを見る',
      noGamesYet: 'まだゲームがありません',
      gamesComingSoon: 'ゲームは近日公開予定',
      searchResources: 'リソースを検索',
      searchServices: 'サービスを検索',
      browseByCategory: 'カテゴリーで閲覧'
    },
    
    // Features sections
    features: {
      aiAssembly: {
        title: 'AI組立アシスタント',
        subtitle: 'AIが部品選択と組立をサポート',
        askQuestion: '質問する',
        uploadImage: '画像をアップロード',
        recordAudio: '音声を録音',
        sendingMessage: 'メッセージを送信中...',
        uploadingImage: '画像をアップロード中...',
        processingAudio: '音声を処理中...',
        askAI: 'AIに質問する',
        imagePlaceholder: 'クリックして画像をアップロード',
        askAboutCircuits: '回路について質問',
        askAboutComponents: '部品について質問',
        askAboutConnectionIssues: '接続問題について質問',
        askAboutReplacements: '代替部品について質問',
        uploadCircuitImage: '回路の画像をアップロード',
        analyzeImage: '画像を分析',
        analyzeCircuit: '回路を分析'
      },
      
      sponsor: {
        title: 'スポンサー',
        subtitle: 'Webelの成長を支援する',
        description: 'Webelはエンジニアとメーカーのためのオープンプラットフォームです。あなたの支援でより良いサービスを提供できます。',
        monthly: '月額スポンサーシップ',
        oneTime: '一回限りの寄付',
        amount: '金額',
        custom: 'カスタム',
        currency: '円',
        donate: 'スポンサー',
        thankYou: 'ご支援ありがとうございます',
        donationComplete: '寄付が完了しました',
        errorProcessing: '寄付処理中にエラーが発生しました',
        tryAgain: 'もう一度お試しください'
      }
    },
    
    common: {
      viewMore: 'もっと見る'
    },
    
    ui: {
      search: {
        placeholder: '検索語を入力',
        button: '検索',
        results: '検索結果',
        no_results: '検索結果が見つかりません',
        search_button: '検索'
      }
    },
    
    // Resources page
    resources: {
      no_search_results: '検索結果は見つかりませんでした',
      no_resources_available: 'リソースがありません',
      view_all: 'すべてのリソースを見る',
      search_placeholder: 'リソースを検索...',
      upload_resource: 'リソースをアップロード',
      filter_by_category: 'カテゴリーでフィルター',
      filter_by_type: 'タイプでフィルター',
      sort_by: '並び替え',
      newest: '最新',
      most_downloaded: 'ダウンロード数',
      featured: '注目'
    }
  }
};

// Helper function to handle nested paths in translations
export function getTranslation(lang: Language, path: string): string {
  try {
    const parts = path.split('.');
    
    if (parts.length === 0) return path;
    
    // Get the translations for the requested language
    const langData = translations[lang];
    
    if (!langData) {
      console.warn(`Language ${lang} not found in translations.`);
      return path;
    }
    
    // Handle single level keys (loading, error, etc.)
    if (parts.length === 1) {
      return langData[parts[0]] || parts[0];
    }
    
    // Handle two-level keys (nav.home, resourceType.software, etc.)
    if (parts.length === 2) {
      const [section, key] = parts;
      
      // Check if section exists and has the key
      if (langData[section] && typeof langData[section] === 'object') {
        return langData[section][key] || key;
      }
    }
    
    // Handle three-level keys (features.aiAssembly.title, etc.)
    if (parts.length === 3) {
      const [section, subsection, key] = parts;
      
      // Check if section and subsection exist and have the key
      if (
        langData[section] && 
        typeof langData[section] === 'object' && 
        langData[section][subsection] && 
        typeof langData[section][subsection] === 'object'
      ) {
        return langData[section][subsection][key] || key;
      }
    }
    
    // If not found, return the last part of the path as fallback
    return parts[parts.length - 1];
  } catch (error) {
    console.error(`Translation error for path: ${path} in language: ${lang}`, error);
    return path.split('.').pop() || path;
  }
}