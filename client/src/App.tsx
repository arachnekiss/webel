import React, { useEffect, Suspense, lazy } from 'react';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LocationProvider } from '@/contexts/LocationContext';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/hooks/use-auth';
import { useDeviceDetect } from './lib/useDeviceDetect';
import { usePageScroll } from '@/hooks/use-page-scroll';
import { Switch, Route } from 'wouter';

// 컴포넌트
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import { appRoutes } from './lib/routes-config';

// 404 페이지
const NotFound = lazy(() => import('@/pages/not-found'));

/**
 * Main Router Component
 * Handles app layout and language-specific routing
 */
function Router() {
  const { isMobile } = useDeviceDetect();
  const { language } = useLanguage();
  
  // 로딩 상태 표시 메시지 - 다국어 지원
  const loadingMessage = language === 'ko' 
    ? '페이지를 불러오는 중입니다...' 
    : language === 'jp' 
      ? 'ページを読み込んでいます...' 
      : 'Loading page...';
  
  // Apply performance monitoring 
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
  
  // Apply scroll management hook
  usePageScroll();
  
  // Additional scroll reset handling
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
  
  // 언어에 따른 경로 접두사 설정
  const prefix = language === 'ko' ? '' : `/${language}`;
  
  // 로딩 스피너 표시 컴포넌트
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <span className="ml-3 text-lg">{loadingMessage}</span>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header area */}
      <Header />
      
      <div className="flex-1 container mx-auto pt-6 px-4 md:px-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left sidebar area - hidden on mobile */}
          {!isMobile && (
            <div className="w-64 shrink-0">
              <Sidebar />
            </div>
          )}
          
          {/* Main content area with routes */}
          <div className="flex-1 flex flex-col overflow-x-hidden">
            <Suspense fallback={<LoadingSpinner />}>
              <Switch>
                {/* 각 라우트에 대해 언어별 경로 생성 */}
                {appRoutes.map((route) => (
                  <Route 
                    key={`${prefix}${route.path}`}
                    path={`${prefix}${route.path}`}
                  >
                    {(params) => (
                      <route.component {...params} {...route.props} />
                    )}
                  </Route>
                ))}
                
                {/* 404 페이지 처리 */}
                <Route path="*">
                  <NotFound />
                </Route>
              </Switch>
            </Suspense>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

/**
 * App Main Component
 * Contains all major context providers and initialization logic
 */
function App() {
  // App performance monitoring
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
  
  // Prefetch important data during app initialization
  useEffect(() => {
    const initializeDataAndCaches = async () => {
      try {
        // Start performance measurement
        const { startMeasure, endMeasure } = await import('./lib/performance');
        const initEventId = startMeasure('rendering', 'App Initialization');
        
        // Load core data required for app operation
        const { prefetchInitialData, prefetchCategories, preloadHeavyData } = await import('./lib/queryClient');
        
        // 1. First prefetch essential initial data (user data, etc.)
        await prefetchInitialData();
        
        // 2. Prefetch main category data (needed for home screen)
        prefetchCategories().catch(err => {
          console.warn('Error prefetching category data:', err);
        });
        
        // 3. Load heavy data in background (low priority)
        setTimeout(() => {
          preloadHeavyData().catch(err => {
            console.warn('Error loading background data:', err);
          });
        }, 3000); // Start 3 seconds after app initialization
        
        // End performance measurement
        endMeasure(initEventId);
      } catch (error) {
        console.error('Error during data initialization:', error);
      }
    };

    // Execute data initialization
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