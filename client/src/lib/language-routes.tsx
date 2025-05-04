import React from 'react';
import { Switch, Route } from 'wouter';
import { Language } from '@/contexts/LanguageContext';

// 라우트 타입 정의
export interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
}

// 언어별 라우트 렌더링 함수
export function renderRoutesWithLanguage(
  routes: RouteConfig[], 
  language: Language
): JSX.Element {
  // 언어 접두사 생성 ('/en/', '/jp/' 또는 '')
  const langPrefix = language === 'ko' ? '' : `/${language}`;
  
  return (
    <Switch>
      {routes.map((route) => (
        <Route 
          key={`${langPrefix}${route.path}`} 
          path={`${langPrefix}${route.path}`}
        >
          {(params) => <route.component {...params} {...route.props} />}
        </Route>
      ))}
      
      {/* 이 Switch에서 처리되지 않은 경로는 NotFound로 처리됨 */}
    </Switch>
  );
}