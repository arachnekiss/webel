/**
 * Internationalization messages for server responses
 * Contains translations for all server response messages used in the API
 */

// Define supported languages
export type ServerLanguage = 'ko' | 'en' | 'jp';

// Define message dictionary type for translations
export type MessageDictionary = {
  [key: string]: string | MessageDictionary;
};

// Auth-related messages
const auth = {
  ko: {
    // Login messages
    invalidUsername: "유효하지 않은 아이디입니다.",
    invalidPassword: "비밀번호가 일치하지 않습니다.",
    loginFailed: "로그인에 실패했습니다.",
    logoutSuccess: "성공적으로 로그아웃되었습니다.",
    logoutError: "로그아웃 처리 중 오류가 발생했습니다.",
    unauthenticated: "인증되지 않은 사용자입니다.",
    loginRequired: "로그인이 필요합니다.",
    adminRequired: "관리자 권한이 필요합니다.",
    
    // Registration messages
    usernameExists: "이미 사용 중인 아이디입니다.",
    emailExists: "이미 사용 중인 이메일입니다.",
    registrationError: "회원가입 처리 중 오류가 발생했습니다.",
    
    // Admin messages
    invalidRequest: "유효하지 않은 요청입니다.",
    userNotFound: "사용자를 찾을 수 없습니다.",
    adminSettingError: "관리자 권한 설정 중 오류가 발생했습니다.",
    devEnvironmentOnly: "이 작업은 개발 환경에서만 허용됩니다.",
    adminCreated: "관리자 계정이 성공적으로 생성되었습니다.",
    adminCreationError: "관리자 생성 중 오류가 발생했습니다.",
    dashboardError: "대시보드 데이터 조회 중 오류가 발생했습니다."
  },
  
  en: {
    // Login messages
    invalidUsername: "Invalid username.",
    invalidPassword: "Password does not match.",
    loginFailed: "Login failed.",
    logoutSuccess: "Successfully logged out.",
    logoutError: "An error occurred during logout.",
    unauthenticated: "Unauthenticated user.",
    loginRequired: "Login required.",
    adminRequired: "Admin privileges required.",
    
    // Registration messages
    usernameExists: "Username already in use.",
    emailExists: "Email already in use.",
    registrationError: "An error occurred during registration.",
    
    // Admin messages
    invalidRequest: "Invalid request.",
    userNotFound: "User not found.",
    adminSettingError: "An error occurred while setting admin privileges.",
    devEnvironmentOnly: "This action is only allowed in development environment.",
    adminCreated: "Admin account created successfully.",
    adminCreationError: "An error occurred while creating admin account.",
    dashboardError: "An error occurred while retrieving dashboard data."
  },
  
  jp: {
    // Login messages
    invalidUsername: "無効なユーザー名です。",
    invalidPassword: "パスワードが一致しません。",
    loginFailed: "ログインに失敗しました。",
    logoutSuccess: "正常にログアウトしました。",
    logoutError: "ログアウト処理中にエラーが発生しました。",
    unauthenticated: "認証されていないユーザーです。",
    loginRequired: "ログインが必要です。",
    adminRequired: "管理者権限が必要です。",
    
    // Registration messages
    usernameExists: "すでに使用されているユーザー名です。",
    emailExists: "すでに使用されているメールアドレスです。",
    registrationError: "会員登録処理中にエラーが発生しました。",
    
    // Admin messages
    invalidRequest: "無効なリクエストです。",
    userNotFound: "ユーザーが見つかりません。",
    adminSettingError: "管理者権限の設定中にエラーが発生しました。",
    devEnvironmentOnly: "この操作は開発環境でのみ許可されています。",
    adminCreated: "管理者アカウントが正常に作成されました。",
    adminCreationError: "管理者の作成中にエラーが発生しました。",
    dashboardError: "ダッシュボードデータの取得中にエラーが発生しました。"
  }
};

// Verification-related messages
const verification = {
  ko: {
    alreadyVerified: "이미 인증이 완료되었습니다.",
    verificationFailed: "인증에 실패했습니다.",
    verificationSuccess: "인증이 성공적으로 완료되었습니다.",
    verificationExpired: "인증 코드가 만료되었습니다.",
    invalidVerificationCode: "유효하지 않은 인증 코드입니다.",
    verificationSent: "인증 코드가 발송되었습니다."
  },
  
  en: {
    alreadyVerified: "Already verified.",
    verificationFailed: "Verification failed.",
    verificationSuccess: "Verification completed successfully.",
    verificationExpired: "Verification code has expired.",
    invalidVerificationCode: "Invalid verification code.",
    verificationSent: "Verification code has been sent."
  },
  
  jp: {
    alreadyVerified: "すでに認証が完了しています。",
    verificationFailed: "認証に失敗しました。",
    verificationSuccess: "認証が正常に完了しました。",
    verificationExpired: "認証コードの有効期限が切れています。",
    invalidVerificationCode: "無効な認証コードです。",
    verificationSent: "認証コードが送信されました。"
  }
};

// Payment-related messages
const payment = {
  ko: {
    paymentInitialized: "결제가 초기화되었습니다.",
    paymentFailed: "결제에 실패했습니다.",
    paymentSuccess: "결제가 성공적으로 완료되었습니다.",
    paymentCancelled: "결제가 취소되었습니다.",
    paymentProcessingError: "결제 처리 중 오류가 발생했습니다.",
    providerNotVerified: "서비스 제공자가 인증되지 않았습니다.",
    serviceCompleted: "서비스가 완료로 표시되었습니다.",
    serviceNotFound: "서비스를 찾을 수 없습니다.",
    orderNotFound: "주문을 찾을 수 없습니다."
  },
  
  en: {
    paymentInitialized: "Payment has been initialized.",
    paymentFailed: "Payment failed.",
    paymentSuccess: "Payment completed successfully.",
    paymentCancelled: "Payment has been cancelled.",
    paymentProcessingError: "An error occurred during payment processing.",
    providerNotVerified: "Service provider is not verified.",
    serviceCompleted: "Service has been marked as completed.",
    serviceNotFound: "Service not found.",
    orderNotFound: "Order not found."
  },
  
  jp: {
    paymentInitialized: "決済が初期化されました。",
    paymentFailed: "決済に失敗しました。",
    paymentSuccess: "決済が正常に完了しました。",
    paymentCancelled: "決済がキャンセルされました。",
    paymentProcessingError: "決済処理中にエラーが発生しました。",
    providerNotVerified: "サービス提供者が認証されていません。",
    serviceCompleted: "サービスが完了としてマークされました。",
    serviceNotFound: "サービスが見つかりません。",
    orderNotFound: "注文が見つかりません。"
  }
};

// Resource and service-related messages
const resource = {
  ko: {
    resourceCreated: "리소스가 성공적으로 생성되었습니다.",
    resourceUpdated: "리소스가 성공적으로 업데이트되었습니다.",
    resourceDeleted: "리소스가 성공적으로 삭제되었습니다.",
    resourceNotFound: "리소스를 찾을 수 없습니다.",
    uploadSuccess: "파일이 성공적으로 업로드되었습니다.",
    uploadFailed: "파일 업로드에 실패했습니다.",
    invalidResourceType: "유효하지 않은 리소스 타입입니다."
  },
  
  en: {
    resourceCreated: "Resource created successfully.",
    resourceUpdated: "Resource updated successfully.",
    resourceDeleted: "Resource deleted successfully.",
    resourceNotFound: "Resource not found.",
    uploadSuccess: "File uploaded successfully.",
    uploadFailed: "File upload failed.",
    invalidResourceType: "Invalid resource type."
  },
  
  jp: {
    resourceCreated: "リソースが正常に作成されました。",
    resourceUpdated: "リソースが正常に更新されました。",
    resourceDeleted: "リソースが正常に削除されました。",
    resourceNotFound: "リソースが見つかりません。",
    uploadSuccess: "ファイルが正常にアップロードされました。",
    uploadFailed: "ファイルのアップロードに失敗しました。",
    invalidResourceType: "無効なリソースタイプです。"
  }
};

// Service-related messages
const service = {
  ko: {
    serviceCreated: "서비스가 성공적으로 생성되었습니다.",
    serviceUpdated: "서비스가 성공적으로 업데이트되었습니다.",
    serviceDeleted: "서비스가 성공적으로 삭제되었습니다.",
    serviceNotFound: "서비스를 찾을 수 없습니다.",
    serviceVerified: "서비스가 인증되었습니다.",
    invalidServiceType: "유효하지 않은 서비스 타입입니다."
  },
  
  en: {
    serviceCreated: "Service created successfully.",
    serviceUpdated: "Service updated successfully.",
    serviceDeleted: "Service deleted successfully.",
    serviceNotFound: "Service not found.",
    serviceVerified: "Service has been verified.",
    invalidServiceType: "Invalid service type."
  },
  
  jp: {
    serviceCreated: "サービスが正常に作成されました。",
    serviceUpdated: "サービスが正常に更新されました。",
    serviceDeleted: "サービスが正常に削除されました。",
    serviceNotFound: "サービスが見つかりません。",
    serviceVerified: "サービスが認証されました。",
    invalidServiceType: "無効なサービスタイプです。"
  }
};

// Common error messages
const error = {
  ko: {
    generalError: "오류가 발생했습니다.",
    databaseError: "데이터베이스 오류가 발생했습니다.",
    notFound: "요청한 리소스를 찾을 수 없습니다.",
    badRequest: "잘못된 요청입니다.",
    unauthorized: "인증되지 않은 사용자입니다.",
    forbidden: "접근 권한이 없습니다.",
    serverError: "서버 오류가 발생했습니다."
  },
  
  en: {
    generalError: "An error occurred.",
    databaseError: "A database error occurred.",
    notFound: "The requested resource was not found.",
    badRequest: "Bad request.",
    unauthorized: "Unauthorized.",
    forbidden: "Access forbidden.",
    serverError: "Server error occurred."
  },
  
  jp: {
    generalError: "エラーが発生しました。",
    databaseError: "データベースエラーが発生しました。",
    notFound: "要求されたリソースが見つかりません。",
    badRequest: "不正なリクエストです。",
    unauthorized: "認証されていません。",
    forbidden: "アクセスが禁止されています。",
    serverError: "サーバーエラーが発生しました。"
  }
};

// Combine all message dictionaries
export const messages = {
  auth,
  verification,
  payment,
  resource,
  service,
  error
};

/**
 * 서버 언어 기반 메시지 필드 가져오기
 * @param lang 언어 코드 (ko, en, jp)
 * @param path 메시지 경로 (예: "auth.loginRequired")
 * @returns 특정 언어의 메시지 또는 기본값
 */
export function getMessage(lang: ServerLanguage, path: string): string {
  // 언어 기본값 설정 (ko)
  const actualLang = lang || 'ko';
  
  // 경로에 따라 메시지 객체 순회
  const pathParts = path.split('.');
  let result: any = messages;
  
  // 지정된 경로를 따라 메시지 객체 탐색
  for (const part of pathParts) {
    if (result[part]) {
      result = result[part];
    } else {
      console.warn(`Message path not found: ${path}`);
      return ''; // 경로가 없는 경우 빈 문자열 반환
    }
  }
  
  // 해당 언어의 메시지가 없으면 한국어(기본값) 반환
  if (typeof result === 'object' && result[actualLang]) {
    return result[actualLang];
  } else if (typeof result === 'string') {
    return result;
  }
  
  // 마지막 리졸브 실패 시 한국어 반환
  return result['ko'] || '';
}