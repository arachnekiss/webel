import React, { Suspense, lazy } from 'react';
import { Switch, Route, useLocation } from 'wouter';
import { Language, useLanguage } from '@/contexts/LanguageContext';
import { RouteConfig } from '../lib/language-routes';
import { Loader2 } from 'lucide-react';

// 로딩 스피너 컴포넌트
const LoadingSpinner = ({ 
  size = 'md', 
  message = '로딩 중...'
}: { 
  size?: 'sm' | 'md' | 'lg'; 
  message?: string;
}) => {
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }[size];

  return (
    <div className="flex flex-col items-center justify-center w-full py-12">
      <Loader2 className={`${sizeClass} animate-spin text-primary mb-4`} />
      {message && <p className="text-muted-foreground text-center">{message}</p>}
    </div>
  );
};

// NotFound 페이지
const NotFound = lazy(() => import('@/pages/not-found'));

// 라우터 속성
interface LanguageRouterProps {
  routes: RouteConfig[];
}

/**
 * 언어별 라우팅을 처리하는 컴포넌트
 */
export const LanguageRouter: React.FC<LanguageRouterProps> = ({ routes }) => {
  const { language } = useLanguage();
  const [location] = useLocation();
  
  // 로드 중 메시지 다국어화
  const loadingMessage = language === 'ko' 
    ? '페이지를 불러오는 중입니다...' 
    : language === 'jp' 
      ? 'ページを読み込んでいます...' 
      : 'Loading page...';
      
  // 현재 언어에 기반한 라우트 경로 생성
  const getLanguagePath = (path: string): string => {
    if (language === 'ko') return path;
    return `/${language}${path}`;
  };
  
  console.log(`[LanguageRouter] Current language: ${language}, location: ${location}`);
  
  return (
    <Suspense fallback={<LoadingSpinner size="lg" message={loadingMessage} />}>
      <Switch>
        {/* 각 라우트를 현재 언어에 맞는 경로로 렌더링 */}
        {routes.map((route) => (
          <Route 
            key={`${language}-${route.path}`}
            path={getLanguagePath(route.path)}
          >
            {(params) => {
              console.log(`[Route] Rendering ${getLanguagePath(route.path)} (${language})`);
              return <route.component {...params} {...route.props} />;
            }}
          </Route>
        ))}
        
        {/* 404 처리 */}
        <Route path="*">
          {() => {
            console.log(`[NotFound] No route matched for path: ${location}`);
            return <NotFound />;
          }}
        </Route>
      </Switch>
    </Suspense>
  );
};