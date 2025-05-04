import React, { Suspense, lazy, useEffect, useState } from 'react';
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
  
  // 각 언어별 경로 생성
  const getRoutePath = (basePath: string, currentLanguage: Language) => {
    // 기본 언어(한국어)는 경로 앞에 접두사 없음
    if (currentLanguage === 'ko') return basePath;
    
    // 다른 언어는 /en/, /jp/ 같은 접두사 추가
    return `/${currentLanguage}${basePath}`;
  };
  
  // 기본 라우트 외에 추가로 동적 경로를 위한 라우트 생성
  const generateSpecialRoutes = () => {
    // 리소스 타입별 경로 처리
    const resourceTypeRoutes = [
      'hardware_design',
      'software',
      '3d_model',
      'ai_model',
      'free_content',
      'flash_game'
    ].map(type => ({
      path: `/resources/type/${type}`,
      component: lazy(() => import('@/pages/Resources')),
      props: { type }
    }));
    
    // 서비스 타입별 경로 처리
    const serviceTypeRoutes = [
      '3d_printing',
      'manufacturing',
      'engineer'
    ].map(type => ({
      path: `/services/type/${type}`,
      component: lazy(() => import('@/pages/Services')),
      props: { type }
    }));
    
    return [...resourceTypeRoutes, ...serviceTypeRoutes];
  };
  
  // 동적 라우트 생성하여 기존 라우트에 추가
  const allRoutes = [...routes, ...generateSpecialRoutes()];
  
  console.log(`[LanguageRouter] Current language: ${language}, location: ${location}, rendering routes`);
  
  return (
    <Suspense fallback={<LoadingSpinner size="lg" message={loadingMessage} />}>
      <Switch>
        {/* 기존 라우트 + 특수 라우트 */}
        {allRoutes.map((route) => (
          <Route 
            key={getRoutePath(route.path, language)}
            path={getRoutePath(route.path, language)}
          >
            {(params) => {
              console.log(`[Route] Rendering ${route.path} with params:`, params);
              return <route.component {...params} {...route.props} />;
            }}
          </Route>
        ))}
        
        {/* 동적 경로 직접 처리 */}
        <Route path="/:lang/services/type/:type">
          {(params) => {
            console.log(`[DynamicRoute] Rendering service type page with params:`, params);
            // 동적 컴포넌트 로드
            const Services = lazy(() => import('@/pages/Services'));
            // 명시적으로 props 객체 생성
            const componentProps = { 
              type: params.type,
              lang: params.lang
            };
            return <Services {...componentProps} />;
          }}
        </Route>
        
        <Route path="/:lang/resources/type/:type">
          {(params) => {
            console.log(`[DynamicRoute] Rendering resource type page with params:`, params);
            // 동적 컴포넌트 로드
            const Resources = lazy(() => import('@/pages/Resources'));
            // 명시적으로 props 객체 생성
            const componentProps = { 
              type: params.type,
              lang: params.lang
            };
            return <Resources {...componentProps} />;
          }}
        </Route>
        
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