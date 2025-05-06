import React from 'react';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/contexts/LanguageContext';

const ApiDocs: React.FC = () => {
  const { language } = useLanguage();
  
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-10">
      <Helmet>
        <title>
          {language === 'ko' ? 'API 문서 - Webel' : 
           language === 'jp' ? 'APIドキュメント - Webel' : 
           'API Documentation - Webel'}
        </title>
      </Helmet>
      
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 md:p-8 mb-10">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white border-b pb-4 border-gray-200 dark:border-gray-700">
            {language === 'ko' ? 'API 문서' : 
             language === 'jp' ? 'APIドキュメント' : 
             'API Documentation'}
          </h1>
          
          <div className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {language === 'ko' ? 
                'Webel은 리소스 검색, 서비스 매칭, 사용자 관리 등을 위한 다양한 API를 제공합니다. 모든 API 요청은 JSON 형식을 사용합니다.' : 
                language === 'jp' ? 
                'Webelはリソース検索、サービスマッチング、ユーザー管理などのための様々なAPIを提供します。すべてのAPIリクエストはJSON形式を使用します。' : 
                'Webel provides various APIs for resource discovery, service matching, user management, and more. All API requests use JSON format.'}
            </p>
            
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 py-2 mb-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold">
                {language === 'ko' ? '목차' : 
                 language === 'jp' ? '目次' : 
                 'Table of Contents'}
              </h2>
              <ul className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-1">
                <li><a href="#auth" className="text-blue-600 dark:text-blue-400 hover:underline">
                  {language === 'ko' ? '인증' : 
                   language === 'jp' ? '認証' : 
                   'Authentication'}
                </a></li>
                <li><a href="#users" className="text-blue-600 dark:text-blue-400 hover:underline">
                  {language === 'ko' ? '사용자' : 
                   language === 'jp' ? 'ユーザー' : 
                   'Users'}
                </a></li>
                <li><a href="#resources" className="text-blue-600 dark:text-blue-400 hover:underline">
                  {language === 'ko' ? '리소스' : 
                   language === 'jp' ? 'リソース' : 
                   'Resources'}
                </a></li>
                <li><a href="#services" className="text-blue-600 dark:text-blue-400 hover:underline">
                  {language === 'ko' ? '서비스' : 
                   language === 'jp' ? 'サービス' : 
                   'Services'}
                </a></li>
                <li><a href="#payments" className="text-blue-600 dark:text-blue-400 hover:underline">
                  {language === 'ko' ? '결제' : 
                   language === 'jp' ? '決済' : 
                   'Payments'}
                </a></li>
                <li><a href="#verification" className="text-blue-600 dark:text-blue-400 hover:underline">
                  {language === 'ko' ? '인증' : 
                   language === 'jp' ? '認証' : 
                   'Verification'}
                </a></li>
                <li><a href="#admin" className="text-blue-600 dark:text-blue-400 hover:underline">
                  {language === 'ko' ? '관리자' : 
                   language === 'jp' ? '管理者' : 
                   'Admin'}
                </a></li>
              </ul>
            </div>
            
            {/* 인증 섹션 */}
            <section id="auth" className="mb-12 scroll-mt-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                {language === 'ko' ? '인증 API' : 
                 language === 'jp' ? '認証 API' : 
                 'Authentication API'}
              </h2>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '회원 가입' : 
                   language === 'jp' ? '会員登録' : 
                   'Register'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-green-600 dark:text-green-400">POST /api/register</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '새 사용자를 등록합니다.' : 
                   language === 'jp' ? '新しいユーザーを登録します。' : 
                   'Register a new user.'}
                </p>
                <div className="mt-3 mb-2">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">
                    {language === 'ko' ? '요청 형식' : 
                     language === 'jp' ? 'リクエスト形式' : 
                     'Request Format'}
                  </h4>
                  <pre className="bg-gray-800 text-gray-100 p-3 rounded-md overflow-x-auto"><code>{`{
  "username": "string",
  "email": "string",
  "password": "string",
  "fullName": "string"
}`}</code></pre>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '로그인' : 
                   language === 'jp' ? 'ログイン' : 
                   'Login'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-green-600 dark:text-green-400">POST /api/login</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '사용자 인증 및 세션 생성.' : 
                   language === 'jp' ? 'ユーザー認証とセッション作成。' : 
                   'Authenticate a user and create a session.'}
                </p>
                <div className="mt-3 mb-2">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">
                    {language === 'ko' ? '요청 형식' : 
                     language === 'jp' ? 'リクエスト形式' : 
                     'Request Format'}
                  </h4>
                  <pre className="bg-gray-800 text-gray-100 p-3 rounded-md overflow-x-auto"><code>{`{
  "username": "string",
  "password": "string"
}`}</code></pre>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '로그아웃' : 
                   language === 'jp' ? 'ログアウト' : 
                   'Logout'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-green-600 dark:text-green-400">POST /api/logout</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '현재 사용자 세션을 종료합니다.' : 
                   language === 'jp' ? '現在のユーザーセッションを終了します。' : 
                   'End the current user session.'}
                </p>
              </div>
            </section>
            
            {/* 사용자 섹션 */}
            <section id="users" className="mb-12 scroll-mt-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                {language === 'ko' ? '사용자 API' : 
                 language === 'jp' ? 'ユーザー API' : 
                 'Users API'}
              </h2>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '현재 사용자 정보 가져오기' : 
                   language === 'jp' ? '現在のユーザー情報の取得' : 
                   'Get Current User'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-blue-600 dark:text-blue-400">GET /api/user</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '현재 인증된 사용자의 정보를 반환합니다.' : 
                   language === 'jp' ? '現在認証されているユーザーの情報を返します。' : 
                   'Returns information about the currently authenticated user.'}
                </p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '사용자 정보 가져오기' : 
                   language === 'jp' ? 'ユーザー情報の取得' : 
                   'Get User Information'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-blue-600 dark:text-blue-400">GET /api/users/:id</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '특정 사용자의 정보를 ID로 조회합니다.' : 
                   language === 'jp' ? '特定のユーザーの情報をIDで照会します。' : 
                   'Get information about a specific user by ID.'}
                </p>
              </div>
            </section>
            
            {/* 리소스 섹션 */}
            <section id="resources" className="mb-12 scroll-mt-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                {language === 'ko' ? '리소스 API' : 
                 language === 'jp' ? 'リソース API' : 
                 'Resources API'}
              </h2>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '모든 리소스 목록' : 
                   language === 'jp' ? 'すべてのリソース一覧' : 
                   'List All Resources'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-blue-600 dark:text-blue-400">GET /api/resources</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '사용 가능한 모든 리소스를 가져옵니다. limit 매개변수로 결과 제한 가능.' : 
                   language === 'jp' ? '利用可能なすべてのリソースを取得します。limit パラメータで結果を制限可能。' : 
                   'Get all available resources. Can limit results with the limit parameter.'}
                </p>
                <div className="mt-3 mb-2">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">
                    {language === 'ko' ? '선택적 쿼리 파라미터' : 
                     language === 'jp' ? 'オプションクエリパラメータ' : 
                     'Optional Query Parameters'}
                  </h4>
                  <pre className="bg-gray-800 text-gray-100 p-3 rounded-md overflow-x-auto"><code>{`?limit=20    // 반환할 최대 아이템 수
?page=1      // 페이지 번호`}</code></pre>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '리소스 카테고리별 조회' : 
                   language === 'jp' ? 'リソースをカテゴリ別に照会' : 
                   'Get Resources by Category'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-blue-600 dark:text-blue-400">GET /api/resources/category/:category</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '특정 카테고리의 리소스를 가져옵니다.' : 
                   language === 'jp' ? '特定のカテゴリのリソースを取得します。' : 
                   'Get resources in a specific category.'}
                </p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '리소스 유형별 조회' : 
                   language === 'jp' ? 'リソースをタイプ別に照会' : 
                   'Get Resources by Type'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-blue-600 dark:text-blue-400">GET /api/resources/type/:type</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '특정 유형의 리소스를 가져옵니다. (hardware_design, software, 3d_model, ai_model, free_content, flash_game)' : 
                   language === 'jp' ? '特定のタイプのリソースを取得します。(hardware_design, software, 3d_model, ai_model, free_content, flash_game)' : 
                   'Get resources of a specific type. (hardware_design, software, 3d_model, ai_model, free_content, flash_game)'}
                </p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '리소스 상세 정보' : 
                   language === 'jp' ? 'リソースの詳細情報' : 
                   'Get Resource Details'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-blue-600 dark:text-blue-400">GET /api/resources/:id</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '특정 리소스의 상세 정보를 가져옵니다.' : 
                   language === 'jp' ? '特定のリソースの詳細情報を取得します。' : 
                   'Get detailed information about a specific resource.'}
                </p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '리소스 다운로드' : 
                   language === 'jp' ? 'リソースのダウンロード' : 
                   'Download Resource'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-blue-600 dark:text-blue-400">GET /api/resources/:id/download</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '특정 리소스를 다운로드하거나 다운로드 URL을 가져옵니다.' : 
                   language === 'jp' ? '特定のリソースをダウンロードするか、ダウンロードURLを取得します。' : 
                   'Download a specific resource or get its download URL.'}
                </p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '리소스 생성' : 
                   language === 'jp' ? 'リソースの作成' : 
                   'Create Resource'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-green-600 dark:text-green-400">POST /api/resources</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '새 리소스를 생성합니다. 인증 필요.' : 
                   language === 'jp' ? '新しいリソースを作成します。認証が必要。' : 
                   'Create a new resource. Authentication required.'}
                </p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '리소스 이미지 업로드' : 
                   language === 'jp' ? 'リソース画像のアップロード' : 
                   'Upload Resource Image'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-green-600 dark:text-green-400">POST /api/resources/upload-image</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '리소스 이미지를 업로드합니다. 인증 필요. Content-Type: multipart/form-data' : 
                   language === 'jp' ? 'リソース画像をアップロードします。認証が必要。Content-Type: multipart/form-data' : 
                   'Upload a resource image. Authentication required. Content-Type: multipart/form-data'}
                </p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '리소스 파일 업로드' : 
                   language === 'jp' ? 'リソースファイルのアップロード' : 
                   'Upload Resource File'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-green-600 dark:text-green-400">POST /api/resources/upload-file</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '리소스 파일을 업로드합니다. 인증 필요. Content-Type: multipart/form-data' : 
                   language === 'jp' ? 'リソースファイルをアップロードします。認証が必要。Content-Type: multipart/form-data' : 
                   'Upload a resource file. Authentication required. Content-Type: multipart/form-data'}
                </p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '리소스 수정' : 
                   language === 'jp' ? 'リソースの更新' : 
                   'Update Resource'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-yellow-600 dark:text-yellow-400">PUT /api/resources/:id</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '기존 리소스를 수정합니다. 관리자 인증 필요.' : 
                   language === 'jp' ? '既存のリソースを更新します。管理者認証が必要。' : 
                   'Update an existing resource. Admin authentication required.'}
                </p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '리소스 삭제' : 
                   language === 'jp' ? 'リソースの削除' : 
                   'Delete Resource'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-red-600 dark:text-red-400">DELETE /api/resources/:id</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '리소스를 삭제합니다(소프트 삭제). 관리자 인증 필요.' : 
                   language === 'jp' ? 'リソースを削除します（ソフト削除）。管理者認証が必要。' : 
                   'Delete a resource (soft delete). Admin authentication required.'}
                </p>
              </div>
            </section>
            
            {/* 서비스 섹션 */}
            <section id="services" className="mb-12 scroll-mt-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                {language === 'ko' ? '서비스 API' : 
                 language === 'jp' ? 'サービス API' : 
                 'Services API'}
              </h2>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '모든 서비스 목록' : 
                   language === 'jp' ? 'すべてのサービス一覧' : 
                   'List All Services'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-blue-600 dark:text-blue-400">GET /api/services</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '모든 등록된 서비스를 가져옵니다. limit 매개변수로 결과 제한 가능.' : 
                   language === 'jp' ? 'すべての登録されたサービスを取得します。limit パラメータで結果を制限可能。' : 
                   'Get all registered services. Can limit results with the limit parameter.'}
                </p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '유형별 서비스 목록' : 
                   language === 'jp' ? 'タイプ別サービス一覧' : 
                   'List Services by Type'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-blue-600 dark:text-blue-400">GET /api/services/type/:type</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '특정 유형의 서비스를 가져옵니다. (3d_printing, manufacturing, engineer)' : 
                   language === 'jp' ? '特定のタイプのサービスを取得します。(3d_printing, manufacturing, engineer)' : 
                   'Get services of a specific type. (3d_printing, manufacturing, engineer)'}
                </p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '근처 서비스 목록' : 
                   language === 'jp' ? '近くのサービス一覧' : 
                   'List Nearby Services'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-blue-600 dark:text-blue-400">GET /api/services/nearby</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '지정된 위치 근처의 서비스를 가져옵니다.' : 
                   language === 'jp' ? '指定された位置の近くのサービスを取得します。' : 
                   'Get services near a specified location.'}
                </p>
                <div className="mt-3 mb-2">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">
                    {language === 'ko' ? '필수 쿼리 파라미터' : 
                     language === 'jp' ? '必須クエリパラメータ' : 
                     'Required Query Parameters'}
                  </h4>
                  <pre className="bg-gray-800 text-gray-100 p-3 rounded-md overflow-x-auto"><code>{`?lat=37.5665    // 위도
?long=126.9780   // 경도

// 선택적 파라미터
?maxDistance=10  // 최대 거리(km)`}</code></pre>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '서비스 상세 정보' : 
                   language === 'jp' ? 'サービスの詳細情報' : 
                   'Get Service Details'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-blue-600 dark:text-blue-400">GET /api/services/:id</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '특정 서비스의 상세 정보를 가져옵니다.' : 
                   language === 'jp' ? '特定のサービスの詳細情報を取得します。' : 
                   'Get detailed information about a specific service.'}
                </p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '서비스 등록' : 
                   language === 'jp' ? 'サービスの登録' : 
                   'Register Service'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-green-600 dark:text-green-400">POST /api/services</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '새 서비스를 등록합니다.' : 
                   language === 'jp' ? '新しいサービスを登録します。' : 
                   'Register a new service.'}
                </p>
              </div>
            </section>
            
            {/* 결제 섹션 */}
            <section id="payments" className="mb-12 scroll-mt-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                {language === 'ko' ? '결제 API' : 
                 language === 'jp' ? '決済 API' : 
                 'Payments API'}
              </h2>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '결제 초기화' : 
                   language === 'jp' ? '決済の初期化' : 
                   'Initialize Payment'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-green-600 dark:text-green-400">POST /api/payments/initialize</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '결제 프로세스를 시작합니다. 인증 필요.' : 
                   language === 'jp' ? '決済プロセスを開始します。認証が必要。' : 
                   'Initialize the payment process. Authentication required.'}
                </p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '결제 승인' : 
                   language === 'jp' ? '決済の承認' : 
                   'Approve Payment'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-green-600 dark:text-green-400">POST /api/payments/approve</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '결제를 승인합니다. 인증 필요.' : 
                   language === 'jp' ? '決済を承認します。認証が必要。' : 
                   'Approve a payment. Authentication required.'}
                </p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '결제 취소' : 
                   language === 'jp' ? '決済のキャンセル' : 
                   'Cancel Payment'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-green-600 dark:text-green-400">POST /api/payments/cancel</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '결제를 취소합니다. 인증 필요.' : 
                   language === 'jp' ? '決済をキャンセルします。認証が必要。' : 
                   'Cancel a payment. Authentication required.'}
                </p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '사용자 주문 목록' : 
                   language === 'jp' ? 'ユーザー注文一覧' : 
                   'Get User Orders'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-blue-600 dark:text-blue-400">GET /api/user/orders</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '현재 사용자의 주문 목록을 가져옵니다. 인증 필요.' : 
                   language === 'jp' ? '現在のユーザーの注文一覧を取得します。認証が必要。' : 
                   'Get orders for the current user. Authentication required.'}
                </p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '제공자 주문 목록' : 
                   language === 'jp' ? 'プロバイダー注文一覧' : 
                   'Get Provider Orders'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-blue-600 dark:text-blue-400">GET /api/provider/orders</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '서비스 제공자에 대한 주문 목록을 가져옵니다. 인증 필요.' : 
                   language === 'jp' ? 'サービスプロバイダーの注文一覧を取得します。認証が必要。' : 
                   'Get orders for a service provider. Authentication required.'}
                </p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '서비스 완료 처리' : 
                   language === 'jp' ? 'サービス完了処理' : 
                   'Complete Service'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-green-600 dark:text-green-400">POST /api/orders/:orderId/complete</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '주문된 서비스의 완료를 처리합니다. 인증 필요.' : 
                   language === 'jp' ? '注文されたサービスの完了を処理します。認証が必要。' : 
                   'Mark an ordered service as complete. Authentication required.'}
                </p>
              </div>
            </section>
            
            {/* 인증/검증 섹션 */}
            <section id="verification" className="mb-12 scroll-mt-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                {language === 'ko' ? '인증 API' : 
                 language === 'jp' ? '認証 API' : 
                 'Verification API'}
              </h2>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '인증 상태 확인' : 
                   language === 'jp' ? '認証状態の確認' : 
                   'Get Verification Status'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-blue-600 dark:text-blue-400">GET /api/user/verification</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '현재 사용자의 인증 상태를 확인합니다. 인증 필요.' : 
                   language === 'jp' ? '現在のユーザーの認証状態を確認します。認証が必要。' : 
                   'Check the verification status of the current user. Authentication required.'}
                </p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '인증 요청' : 
                   language === 'jp' ? '認証リクエスト' : 
                   'Request Verification'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-green-600 dark:text-green-400">POST /api/user/request-verification</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '전화번호 인증을 요청합니다. 인증 필요.' : 
                   language === 'jp' ? '電話番号認証をリクエストします。認証が必要。' : 
                   'Request phone number verification. Authentication required.'}
                </p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '전화번호 인증' : 
                   language === 'jp' ? '電話番号認証' : 
                   'Verify Phone Number'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-green-600 dark:text-green-400">POST /api/user/verify-phone</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '인증 코드로 전화번호를 인증합니다. 인증 필요.' : 
                   language === 'jp' ? '認証コードで電話番号を認証します。認証が必要。' : 
                   'Verify phone number with verification code. Authentication required.'}
                </p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '계좌 등록' : 
                   language === 'jp' ? '口座登録' : 
                   'Register Bank Account'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-green-600 dark:text-green-400">POST /api/user/register-bank-account</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '사용자의 은행 계좌 정보를 등록합니다. 인증 필요.' : 
                   language === 'jp' ? 'ユーザーの銀行口座情報を登録します。認証が必要。' : 
                   'Register bank account information for the user. Authentication required.'}
                </p>
              </div>
            </section>
            
            {/* 관리자 섹션 */}
            <section id="admin" className="mb-12 scroll-mt-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                {language === 'ko' ? '관리자 API' : 
                 language === 'jp' ? '管理者 API' : 
                 'Admin API'}
              </h2>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '대시보드 데이터' : 
                   language === 'jp' ? 'ダッシュボードデータ' : 
                   'Dashboard Data'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-blue-600 dark:text-blue-400">GET /api/admin/dashboard</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '관리자 대시보드 데이터를 가져옵니다. 관리자 인증 필요.' : 
                   language === 'jp' ? '管理者ダッシュボードデータを取得します。管理者認証が必要。' : 
                   'Get admin dashboard data. Admin authentication required.'}
                </p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '모든 사용자 목록' : 
                   language === 'jp' ? 'すべてのユーザー一覧' : 
                   'List All Users'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-blue-600 dark:text-blue-400">GET /api/admin/users</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '모든 사용자 목록을 가져옵니다. 관리자 인증 필요.' : 
                   language === 'jp' ? 'すべてのユーザー一覧を取得します。管理者認証が必要。' : 
                   'Get a list of all users. Admin authentication required.'}
                </p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '사용자 삭제' : 
                   language === 'jp' ? 'ユーザーの削除' : 
                   'Delete User'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-red-600 dark:text-red-400">DELETE /api/admin/users/:id</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '사용자를 삭제합니다. 관리자 인증 필요.' : 
                   language === 'jp' ? 'ユーザーを削除します。管理者認証が必要。' : 
                   'Delete a user. Admin authentication required.'}
                </p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '관리자 권한 설정' : 
                   language === 'jp' ? '管理者権限の設定' : 
                   'Set Admin Status'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-green-600 dark:text-green-400">POST /api/admin/set-admin</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '사용자의 관리자 권한을 설정합니다. 관리자 인증 필요.' : 
                   language === 'jp' ? 'ユーザーの管理者権限を設定します。管理者認証が必要。' : 
                   'Set admin status for a user. Admin authentication required.'}
                </p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '모든 리소스 목록' : 
                   language === 'jp' ? 'すべてのリソース一覧' : 
                   'List All Resources'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-blue-600 dark:text-blue-400">GET /api/admin/resources</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '모든 리소스 목록을 가져옵니다. 관리자 인증 필요.' : 
                   language === 'jp' ? 'すべてのリソース一覧を取得します。管理者認証が必要。' : 
                   'Get a list of all resources. Admin authentication required.'}
                </p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '모든 서비스 목록' : 
                   language === 'jp' ? 'すべてのサービス一覧' : 
                   'List All Services'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-blue-600 dark:text-blue-400">GET /api/admin/services</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '모든 서비스 목록을 가져옵니다. 관리자 인증 필요.' : 
                   language === 'jp' ? 'すべてのサービス一覧を取得します。管理者認証が必要。' : 
                   'Get a list of all services. Admin authentication required.'}
                </p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '서비스 인증' : 
                   language === 'jp' ? 'サービスの認証' : 
                   'Verify Service'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-yellow-600 dark:text-yellow-400">PUT /api/admin/services/:id/verify</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '서비스를 인증합니다. 관리자 인증 필요.' : 
                   language === 'jp' ? 'サービスを認証します。管理者認証が必要。' : 
                   'Verify a service. Admin authentication required.'}
                </p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {language === 'ko' ? '서비스 삭제' : 
                   language === 'jp' ? 'サービスの削除' : 
                   'Delete Service'}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-3">
                  <code className="text-sm text-red-600 dark:text-red-400">DELETE /api/admin/services/:id</code>
                </div>
                <p className="mb-2">
                  {language === 'ko' ? '서비스를 삭제합니다. 관리자 인증 필요.' : 
                   language === 'jp' ? 'サービスを削除します。管理者認証が必要。' : 
                   'Delete a service. Admin authentication required.'}
                </p>
              </div>
            </section>
            
            {/* 인증 요구사항 */}
            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                {language === 'ko' ? '인증 요구사항' : 
                 language === 'jp' ? '認証要件' : 
                 'Authentication Requirements'}
              </h2>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded mb-6">
                <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">
                  {language === 'ko' ? '인증이 필요한 API' : 
                   language === 'jp' ? '認証が必要なAPI' : 
                   'APIs Requiring Authentication'}
                </h3>
                <p className="text-blue-700 dark:text-blue-400">
                  {language === 'ko' ? 
                    '다음 API는 인증이 필요합니다. 요청 시 세션 쿠키가 있어야 합니다. 세션은 /api/login을 통해 가져올 수 있습니다.' : 
                    language === 'jp' ? 
                    '以下のAPIは認証が必要です。リクエスト時にセッションクッキーが必要です。セッションは/api/loginから取得できます。' : 
                    'The following APIs require authentication. Requests must include a session cookie, which can be obtained through /api/login.'}
                </p>
                <ul className="mt-2 list-disc list-inside text-blue-700 dark:text-blue-400">
                  <li>/api/user</li>
                  <li>/api/user/*</li>
                  <li>/api/resources (POST)</li>
                  <li>/api/resources/upload-*</li>
                  <li>/api/payments/*</li>
                  <li>/api/orders/*</li>
                </ul>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded">
                <h3 className="text-lg font-medium text-purple-800 dark:text-purple-300 mb-2">
                  {language === 'ko' ? '관리자 인증이 필요한 API' : 
                   language === 'jp' ? '管理者認証が必要なAPI' : 
                   'APIs Requiring Admin Authentication'}
                </h3>
                <p className="text-purple-700 dark:text-purple-400">
                  {language === 'ko' ? 
                    '다음 API는 관리자 권한이 있는 인증된 사용자만 접근할 수 있습니다.' : 
                    language === 'jp' ? 
                    '以下のAPIは管理者権限を持つ認証されたユーザーのみアクセスできます。' : 
                    'The following APIs can only be accessed by authenticated users with admin privileges.'}
                </p>
                <ul className="mt-2 list-disc list-inside text-purple-700 dark:text-purple-400">
                  <li>/api/admin/*</li>
                  <li>/api/resources/:id (PUT, DELETE)</li>
                </ul>
              </div>
            </section>
            
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
              <p className="text-sm">
                © {new Date().getFullYear()} Webel
              </p>
              <p className="text-sm mt-2">
                {language === 'ko' ? 
                  '이 API 문서는 Webel 플랫폼의 기능적인 부분만을 다룹니다. 추가 개발 정보는 개발자에게 문의하세요.' : 
                  language === 'jp' ? 
                  'このAPIドキュメントはWebelプラットフォームの機能的な部分のみを扱います。追加開発情報については開発者にお問い合わせください。' : 
                  'This API documentation covers only the functional aspects of the Webel platform. For additional development information, please contact the developers.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocs;