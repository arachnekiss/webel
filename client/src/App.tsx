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
import { Switch, Route, useLocation } from 'wouter';

// 컴포넌트
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import { appRoutes } from './lib/routes-config';

// 서비스 타입 정의
import { ServiceType } from '@shared/schema';

// 페이지 컴포넌트 직접 가져오기 (하드코딩된 라우트에서 사용)
import Home from './pages/Home';
import Resources from './pages/Resources';
import Services from './pages/Services';

// 동적으로 로드되는 컴포넌트들
const ResourceDetail = lazy(() => import('./pages/ResourceDetail'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const ResourceManagementPage = lazy(() => import('./pages/ResourceManagementPage'));
const ResourceUploadPage = lazy(() => import('./pages/ResourceUploadPage'));
const ResourceUploadPageV2 = lazy(() => import('./pages/ResourceUploadPageV2'));
const RegisterServiceUnified = lazy(() => import('./pages/RegisterServiceUnified'));

// 404 페이지
const NotFound = lazy(() => import('./pages/not-found'));

/**
 * Main Router Component
 * Handles app layout and language-specific routing
 */
function Router() {
  const { isMobile } = useDeviceDetect();
  const { language } = useLanguage();
  const [location] = useLocation();
  
  // 로딩 상태 표시 메시지 - 다국어 지원
  const loadingMessage = language === 'ko' 
    ? '페이지를 불러오는 중입니다...' 
    : language === 'jp' 
      ? 'ページを読み込んでいます...' 
      : 'Loading page...';
  
  // Apply scroll management hook
  usePageScroll();
  
  // 스크롤 초기화
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  // 언어에 따른 경로 접두사 설정
  const prefix = language === 'ko' ? '' : `/${language}`;
  
  // 디버깅 정보
  console.log(`[Router] Path: ${location}, Language: ${language}, Prefix: ${prefix}`);
  
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
                {/* 홈 페이지 경로 */}
                <Route path={`${prefix}/`}>
                  <Home />
                </Route>
                
                {/* ============= RESOURCES ROUTES ============= */}
                {/* 리소스 기본 페이지 */}
                <Route path={`${prefix}/resources`}>
                  <Resources />
                </Route>
                
                {/* 리소스 업로드 및 관리 고정 경로 (순서 중요) */}
                <Route path={`${prefix}/resources/create`}>
                  <Suspense fallback={<div>Loading...</div>}>
                    <ResourceManagementPage />
                  </Suspense>
                </Route>
                
                <Route path={`${prefix}/resources/upload`}>
                  <Suspense fallback={<div>Loading...</div>}>
                    <ResourceUploadPage />
                  </Suspense>
                </Route>
                
                <Route path={`${prefix}/resources/upload-v2`}>
                  <Suspense fallback={<div>Loading...</div>}>
                    <ResourceUploadPageV2 />
                  </Suspense>
                </Route>
                
                {/* 리소스 타입별 페이지 - 하드코딩 경로 */}
                <Route path={`${prefix}/resources/type/hardware_design`}>
                  <Resources type="hardware_design" />
                </Route>
                <Route path={`${prefix}/resources/type/software`}>
                  <Resources type="software" />
                </Route>
                <Route path={`${prefix}/resources/type/3d_model`}>
                  <Resources type="3d_model" />
                </Route>
                <Route path={`${prefix}/resources/type/ai_model`}>
                  <Resources type="ai_model" />
                </Route>
                <Route path={`${prefix}/resources/type/free_content`}>
                  <Resources type="free_content" />
                </Route>
                <Route path={`${prefix}/resources/type/flash_game`}>
                  <Resources type="flash_game" />
                </Route>
                
                {/* 리소스 타입 동적 경로 */}
                <Route path={`${prefix}/resources/type/:type`}>
                  {params => <Resources type={params.type} />}
                </Route>
                
                {/* 리소스 관리 동적 경로 */}
                <Route path={`${prefix}/resources/manage/:id`}>
                  <Suspense fallback={<div>Loading...</div>}>
                    <ResourceManagementPage />
                  </Suspense>
                </Route>
                
                {/* 리소스 세부 정보 동적 경로 */}
                <Route path={`${prefix}/resources/:id`}>
                  <Suspense fallback={<div>Loading...</div>}>
                    <ResourceDetail />
                  </Suspense>
                </Route>
                
                {/* ============= SERVICES ROUTES ============= */}
                {/* 서비스 기본 페이지 */}
                <Route path={`${prefix}/services`}>
                  <Services />
                </Route>
                
                {/* 서비스 등록 관련 경로 (별도로 처리) - 순서 유의! */}
                {/* 서비스 등록 - 특수 경로 */}
                <Route path={`${prefix}/register-printer`}>
                  <Suspense fallback={<div>Loading...</div>}>
                    <RegisterServiceUnified defaultType="3d_printing" />
                  </Suspense>
                </Route>
                
                {/* 서비스 타입별 페이지 - 하드코딩 경로 */}
                <Route path={`${prefix}/services/type/3d_printing`}>
                  <Services type="3d_printing" />
                </Route>
                <Route path={`${prefix}/services/type/manufacturing`}>
                  <Services type="manufacturing" />
                </Route>
                <Route path={`${prefix}/services/type/engineer`}>
                  <Services type="engineer" />
                </Route>
                
                {/* 서비스 타입 동적 경로 */}
                <Route path={`${prefix}/services/type/:type`}>
                  {params => <Services type={params.type} />}
                </Route>
                
                {/* 서비스 등록 고정 경로 - 타입별 */}
                <Route path={`${prefix}/services/register/3d_printing`}>
                  <Suspense fallback={<div>Loading...</div>}>
                    <RegisterServiceUnified defaultType="3d_printing" />
                  </Suspense>
                </Route>
                
                <Route path={`${prefix}/services/register/engineer`}>
                  <Suspense fallback={<div>Loading...</div>}>
                    <RegisterServiceUnified defaultType="engineer" />
                  </Suspense>
                </Route>
                
                <Route path={`${prefix}/services/register/manufacturing`}>
                  <Suspense fallback={<div>Loading...</div>}>
                    <RegisterServiceUnified defaultType="manufacturing" />
                  </Suspense>
                </Route>
                
                {/* 서비스 등록 동적 경로 (params 처리) */}
                <Route path={`${prefix}/services/register/:type`}>
                  {params => (
                    <Suspense fallback={<div>Loading...</div>}>
                      <RegisterServiceUnified defaultType={params.type as ServiceType} />
                    </Suspense>
                  )}
                </Route>
                
                {/* 서비스 등록 베이스 경로 (맨 마지막에) */}
                <Route path={`${prefix}/services/register`}>
                  <Suspense fallback={<div>Loading...</div>}>
                    <RegisterServiceUnified />
                  </Suspense>
                </Route>
                
                {/* 서비스 세부 정보 동적 경로 */}
                <Route path={`${prefix}/services/:id`}>
                  <Suspense fallback={<div>Loading...</div>}>
                    <ServiceDetail />
                  </Suspense>
                </Route>
                
                {/* 관리자 경로 별도 처리 */}
                {appRoutes
                  .filter(route => 
                    route.path.startsWith('/admin/')
                  )
                  .map(route => (
                    <Route 
                      key={`admin-${prefix}${route.path}`}
                      path={`${prefix}${route.path}`}
                    >
                      <Suspense fallback={<div>Loading admin page...</div>}>
                        <route.component {...route.props} />
                      </Suspense>
                    </Route>
                  ))
                }
                
                {/* 다른 일반 페이지는 appRoutes에서 가져온 정적 경로로 처리 */}
                {appRoutes
                  .filter(route => 
                    !route.path.includes(':') && 
                    !route.path.startsWith('/resources') && 
                    !route.path.startsWith('/services') && 
                    !route.path.startsWith('/admin/') && 
                    route.path !== '/' &&
                    route.path !== '/register-printer'
                  )
                  .map(route => (
                    <Route 
                      key={`static-${prefix}${route.path}`}
                      path={`${prefix}${route.path}`}
                    >
                      <route.component {...route.props} />
                    </Route>
                  ))
                }
                
                {/* 404 페이지 처리 */}
                <Route path="*">
                  <Suspense fallback={<div>Loading...</div>}>
                    <NotFound />
                  </Suspense>
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