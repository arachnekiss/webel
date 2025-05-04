import React, { Suspense, lazy, useMemo } from 'react';
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
 * 각 라우트에 대해 현재 언어에 맞는 경로를 생성하고, 해당 경로로 라우팅을 처리합니다.
 */
export const LanguageRouter: React.FC<LanguageRouterProps> = ({ routes }) => {
  const { language, translateUrl } = useLanguage();
  const [location] = useLocation();
  
  // 로드 중 메시지 다국어화
  const loadingMessage = language === 'ko' 
    ? '페이지를 불러오는 중입니다...' 
    : language === 'jp' 
      ? 'ページを読み込んでいます...' 
      : 'Loading page...';
  
  // 모든 라우트를 특정 언어로 변환하는 함수 생성 (고급 언어별 정규화)
  const getLanguageAwareRoutes = useMemo(() => {
    return routes.map(route => ({
      ...route,
      // 현재 언어용 경로 생성
      languagePath: language === 'ko' ? route.path : `/${language}${route.path}`
    }));
  }, [routes, language]);
  
  // 추가 로그 정보 출력 (디버깅용)
  console.log(`[LanguageRouter] Current language: ${language}, location: ${location}`);
  console.log(`[LanguageRouter] Routes count: ${getLanguageAwareRoutes.length}`);
  
  return (
    <Suspense fallback={<LoadingSpinner size="lg" message={loadingMessage} />}>
      <Switch>
        {/* 첫 번째: 고정 경로의 라우트를 먼저 처리 (예: /resources/type/ai_model) */}
        {getLanguageAwareRoutes
          .filter(route => !route.path.includes(':')) // 매개변수가 없는 고정 경로만 필터링
          .map(route => (
            <Route 
              key={`fixed-${language}-${route.path}`}
              path={route.languagePath}
            >
              {(params) => {
                console.log(`[Route:Fixed] Rendering ${route.languagePath}`, params);
                return <route.component {...params} {...route.props} />;
              }}
            </Route>
          ))
        }
        
        {/* 두 번째: 동적 매개변수를 포함하는 라우트 처리 (예: /resources/:id) */}
        {getLanguageAwareRoutes
          .filter(route => route.path.includes(':')) // 매개변수가 있는 동적 경로만 필터링
          .map(route => (
            <Route 
              key={`dynamic-${language}-${route.path}`}
              path={route.languagePath}
            >
              {(params) => {
                console.log(`[Route:Dynamic] Rendering ${route.languagePath}`, params);
                return <route.component {...params} {...route.props} />;
              }}
            </Route>
          ))
        }
        
        {/* 404 처리 - 어떤 라우트와도 일치하지 않는 경우 */}
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