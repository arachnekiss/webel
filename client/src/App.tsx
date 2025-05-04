import React, { useEffect, Suspense } from 'react';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LocationProvider } from '@/contexts/LocationContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/hooks/use-auth';
import { useDeviceDetect } from './lib/useDeviceDetect';
import { usePageScroll } from '@/hooks/use-page-scroll';

// 컴포넌트
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import { LanguageRouter } from '@/components/LanguageRouter';
import { appRoutes } from './lib/routes-config';

/**
 * 메인 라우터 컴포넌트
 * 앱의 레이아웃과 언어별 라우팅을 처리
 */
function Router() {
  const { isMobile } = useDeviceDetect();
  
  // 성능 모니터링 적용
  useEffect(() => {
    const initializePerformance = async () => {
      const { measureRendering } = await import('./lib/performance');
      return measureRendering('Router');
    };
    
    let cleanup = () => {};
    initializePerformance().then(cleanupFn => {
      cleanup = cleanupFn;
    });
    
    return () => cleanup();
  }, []);
  
  // 스크롤 관리 훅 적용
  usePageScroll();
  
  // 추가 스크롤 리셋 처리
  useEffect(() => {
    const resetScroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    };
    
    const handleRouteChange = () => {
      resetScroll();
      setTimeout(resetScroll, 100);
    };
    
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('pushstate', handleRouteChange);
    
    resetScroll();
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('pushstate', handleRouteChange);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* 헤더 영역 */}
      <Header />
      
      <div className="flex-1 container mx-auto pt-6 px-4 md:px-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* 왼쪽 사이드바 영역 - 모바일에서는 숨김 */}
          {!isMobile && (
            <div className="w-64 shrink-0">
              <Sidebar />
            </div>
          )}
          
          {/* 메인 콘텐츠 영역 */}
          <div className="flex-1 flex flex-col overflow-x-hidden">
            {/* 언어 기반 라우터 사용 */}
            <LanguageRouter routes={appRoutes} />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

/**
 * 앱 메인 컴포넌트
 * 모든 주요 컨텍스트 프로바이더와 초기화 로직 포함
 */
function App() {
  // 앱 성능 모니터링
  useEffect(() => {
    const initializePerformance = async () => {
      const { measureRendering } = await import('./lib/performance');
      return measureRendering('App');
    };
    
    let cleanup = () => {};
    initializePerformance().then(cleanupFn => {
      cleanup = cleanupFn;
    });
    
    return () => cleanup();
  }, []);
  
  // 앱 초기화 시 중요 데이터 프리페치
  useEffect(() => {
    const initializeDataAndCaches = async () => {
      try {
        // 성능 측정 시작
        const { startMeasure, endMeasure } = await import('./lib/performance');
        const initEventId = startMeasure('rendering', 'App Initialization');
        
        // 앱 구동에 필요한 핵심 데이터 먼저 로드
        const { prefetchInitialData, prefetchCategories, preloadHeavyData } = await import('./lib/queryClient');
        
        // 1. 필수 초기 데이터 먼저 프리페치 (사용자 데이터 등)
        await prefetchInitialData();
        
        // 2. 메인 카테고리 데이터 프리페치 (홈 화면에 필요)
        prefetchCategories().catch(err => {
          console.warn('카테고리 데이터 프리페치 중 오류:', err);
        });
        
        // 3. 백그라운드에서 무거운 데이터 로드 (낮은 우선순위)
        setTimeout(() => {
          preloadHeavyData().catch(err => {
            console.warn('백그라운드 데이터 로드 중 오류:', err);
          });
        }, 3000); // 앱 초기화 후 3초 뒤 시작
        
        // 성능 측정 종료
        endMeasure(initEventId);
      } catch (error) {
        console.error('데이터 초기화 중 오류:', error);
      }
    };

    // 데이터 초기화 실행
    initializeDataAndCaches();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LocationProvider>
          <LanguageProvider>
            <AuthProvider>
              <Toaster />
              <Router />
            </AuthProvider>
          </LanguageProvider>
        </LocationProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;