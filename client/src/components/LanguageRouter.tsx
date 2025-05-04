import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Switch, Route } from 'wouter';
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
  
  console.log(`[LanguageRouter] Current language: ${language}, rendering routes for this language`);
  
  return (
    <Suspense fallback={<LoadingSpinner size="lg" message={loadingMessage} />}>
      <Switch>
        {/* 각 언어별 경로 생성 */}
        {routes.map((route) => (
          <Route 
            key={getRoutePath(route.path, language)}
            path={getRoutePath(route.path, language)}
          >
            {(params) => <route.component {...params} {...route.props} />}
          </Route>
        ))}
        
        {/* 404 처리 */}
        <Route path="*">
          {() => <NotFound />}
        </Route>
      </Switch>
    </Suspense>
  );
};