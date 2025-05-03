import React, { useEffect, Suspense, lazy } from 'react';
import { Switch, Route, useLocation } from 'wouter';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LocationProvider } from '@/contexts/LocationContext';
import { AuthProvider } from '@/hooks/use-auth';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { useDeviceDetect } from './lib/useDeviceDetect';
import { ProtectedRoute, AdminRoute } from './lib/protected-route';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supportedLanguages } from './lib/i18n';

// 컴포넌트
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';

// 로딩 스피너 인라인 구현
const LoadingSpinner = ({ 
  size = 'md', 
  message
}: { 
  size?: 'sm' | 'md' | 'lg'; 
  message?: string;
}) => {
  const { t } = useTranslation();
  const defaultMessage = t('common.loading');
  
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }[size];

  return (
    <div className="flex flex-col items-center justify-center w-full py-12">
      <Loader2 className={`${sizeClass} animate-spin text-primary mb-4`} />
      <p className="text-muted-foreground text-center">{message || defaultMessage}</p>
    </div>
  );
};

// Lazy 로딩으로 페이지 컴포넌트 불러오기
const Home = lazy(() => import('@/pages/Home'));
const NotFound = lazy(() => import('@/pages/not-found'));
const Services = lazy(() => import('@/pages/Services'));
const ServiceDetail = lazy(() => import('@/pages/ServiceDetail'));
const Resources = lazy(() => import('@/pages/Resources'));
const ResourceDetail = lazy(() => import('@/pages/ResourceDetail'));
const UploadResource = lazy(() => import('@/pages/UploadResource'));
const ResourceUploadPage = lazy(() => import('@/pages/ResourceUploadPage'));
const ResourceUploadPageV2 = lazy(() => import('@/pages/ResourceUploadPageV2'));
const ResourceManagementPage = lazy(() => import('@/pages/ResourceManagementPage'));
const RegisterService = lazy(() => import('@/pages/RegisterService'));
const RegisterServiceUnified = lazy(() => import('@/pages/RegisterServiceUnified'));
const Auctions = lazy(() => import('@/pages/Auctions'));
const AuctionDetail = lazy(() => import('@/pages/AuctionDetail'));
const AiAssembly = lazy(() => import('@/pages/AiAssembly'));
const RemoteSupport = lazy(() => import('@/pages/RemoteSupport'));
const Sponsor = lazy(() => import('@/pages/Sponsor'));
const About = lazy(() => import('@/pages/About'));
const Engineers = lazy(() => import('@/pages/Engineers'));
const AuthPage = lazy(() => import('@/pages/auth-page'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const AdminUserManagement = lazy(() => import('@/pages/AdminUserManagement'));
const AdminResourceManagement = lazy(() => import('@/pages/AdminResourceManagement'));
const AdminServiceManagement = lazy(() => import('@/pages/AdminServiceManagement'));
const PaymentPage = lazy(() => import('@/pages/PaymentPage'));
const PaymentResult = lazy(() => import('@/pages/PaymentResult'));
const UserVerification = lazy(() => import('@/pages/UserVerification'));

import { usePageScroll } from '@/hooks/use-page-scroll';

// LanguageRoute 컴포넌트 생성 - 언어 경로 접두사를 처리하는 래퍼
const LanguageRoute = ({
  path,
  children
}: {
  path: string;
  children: (params: any) => React.ReactNode;
}) => {
  const { t } = useTranslation();
  
  // 기본 경로와 언어 경로 버전 모두 지원
  return (
    <>
      <Route path={path}>
        {children}
      </Route>
      {supportedLanguages.map(lang => (
        <Route key={lang.code} path={`/${lang.code}${path}`}>
          {(params) => children(params)}
        </Route>
      ))}
    </>
  );
};

function Router() {
  const { isMobile } = useDeviceDetect();
  const { t } = useTranslation();
  
  // 성능 모니터링 적용
  useEffect(() => {
    // 성능 측정 직접 구현
    const initializePerformance = async () => {
      const { measureRendering } = await import('./lib/performance');
      return measureRendering('Router');
    };
    
    // 성능 측정 초기화
    let cleanup = () => {};
    initializePerformance().then(cleanupFn => {
      cleanup = cleanupFn;
    });
    
    return () => cleanup();
  }, []);
  
  // 새로운 페이지 스크롤 관리 훅 적용
  usePageScroll();
  
  // 추가적인 스크롤 관리를 위한 이벤트 리스너
  useEffect(() => {
    // 강제로 스크롤을 최상단으로 이동시키는 함수
    function resetScroll() {
      // auto 동작으로 변경하여 즉시 스크롤됨 (smooth는 중간에 중단될 수 있음)
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto'
      });
      
      // 백업으로 기존 방식도 함께 사용
      window.scrollTo(0, 0);
      
      // document.body와 document.documentElement에도 직접 적용
      if (document.body) {
        document.body.scrollTop = 0;
      }
      
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      
      // 스크롤 위치 강제 고정 (추가 안전장치는 일단 주석처리)
      // 이 부분이 문제를 일으킬 수 있어 비활성화합니다
      /*
      const preventScroll = (e: Event) => {
        window.scrollTo(0, 0);
        e.preventDefault();
        e.stopPropagation();
      };
      
      // 스크롤 이벤트를 일시적으로 차단 (100ms 동안)
      window.addEventListener('scroll', preventScroll, { passive: false });
      setTimeout(() => {
        window.removeEventListener('scroll', preventScroll);
      }, 100);
      */
    }
    
    // 모든 가능한 이벤트에 대한 스크롤 리셋 처리
    function handleRouteChange() {
      // 즉시 스크롤 초기화
      resetScroll();
      
      // 여러 타이밍에 추가 실행 (4중 안전장치)
      setTimeout(resetScroll, 0);
      setTimeout(resetScroll, 50);
      setTimeout(resetScroll, 100);
      setTimeout(resetScroll, 300);
      
      // 추가 안전장치: 라우트 변경이 완료된 후 최종 확인 (주석 처리)
      /*
      setTimeout(() => {
        // 만약 스크롤이 여전히 0이 아니라면 강제로 다시 이동
        if (window.scrollY !== 0 || document.documentElement.scrollTop !== 0 || document.body.scrollTop !== 0) {
          console.log('페이지 스크롤 강제 리셋', window.scrollY, document.documentElement.scrollTop, document.body.scrollTop);
          resetScroll();
        }
      }, 500);
      */
    }
    
    // 이벤트 리스너 등록 - 다양한 이벤트 캡처
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('pushstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    
    // 페이지 로드 시 강제 스크롤 초기화
    resetScroll();
    
    // MutationObserver 부분도 문제가 될 수 있어 주석 처리합니다
    /*
    // MutationObserver로 DOM 변경 모니터링
    const observer = new MutationObserver((mutations) => {
      let shouldCheckScroll = false;
      
      // DOM 변경이 발생했는지 확인
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldCheckScroll = true;
          break;
        }
      }
      
      // 페이지 콘텐츠 변경 시 스크롤 확인
      if (shouldCheckScroll) {
        setTimeout(() => {
          if (window.scrollY !== 0) {
            resetScroll();
          }
        }, 50);
      }
    });
    
    // 전체 문서 변경 모니터링
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    */
    // 더 단순한 방식으로 구현
    const observer = { disconnect: () => {} };
    
    // 클린업 함수
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('pushstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
      observer.disconnect();
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
            <Suspense fallback={<LoadingSpinner size="lg" message="페이지를 불러오는 중입니다..." />}>
              <Switch>
                {/* 기본 루트 라우트 (언어는 Home 내부에서 처리됨) */}
                <Route path="/">
                  {() => <Home />}
                </Route>

                {/* 언어 경로만 있는 경우 (예: /en, /ko, /ja) */}
                <Route path="/:lang">
                  {(params) => {
                    const { lang } = params;
                    // 지원되는 언어인지 확인
                    const isLanguage = supportedLanguages.some(l => l.code === lang);
                    return isLanguage ? <Home /> : <NotFound />;
                  }}
                </Route>
                
                {/* Services routes - 카테고리별 서비스 목록 */}
                <LanguageRoute path="/services/type/:type">
                  {(params) => <Services type={params.type} />}
                </LanguageRoute>
                <LanguageRoute path="/services/:id">
                  {(params) => <ServiceDetail id={params.id} />}
                </LanguageRoute>
                
                {/* Resource routes with resource type categories */}
                <LanguageRoute path="/resources/type/:type">
                  {(params) => <Resources params={params} />}
                </LanguageRoute>
                <LanguageRoute path="/resources">
                  {(params) => <Resources />}
                </LanguageRoute>
                <LanguageRoute path="/resources/:id">
                  {(params) => <ResourceDetail id={params.id} />}
                </LanguageRoute>
                
                {/* 플래시 게임 페이지 (띄어쓰기 수정) */}
                <LanguageRoute path="/flash-game">
                  {() => <Resources type="flash_game" />}
                </LanguageRoute>
                
                {/* Auctions routes */}
                <LanguageRoute path="/auctions">
                  {() => <Auctions />}
                </LanguageRoute>
                <LanguageRoute path="/auctions/:id">
                  {(params) => <AuctionDetail id={params.id} />}
                </LanguageRoute>
                
                {/* Register pages - 3D 프린터 등록을 포함한 서비스 등록 페이지 통합 */}
                <LanguageRoute path="/register-printer">
                  {() => <RegisterServiceUnified defaultType="3d_printing" />}
                </LanguageRoute>
                <LanguageRoute path="/services/register">
                  {() => <RegisterServiceUnified />}
                </LanguageRoute>
                <LanguageRoute path="/services/register/3d_printing">
                  {() => <RegisterServiceUnified defaultType="3d_printing" />}
                </LanguageRoute>
                <LanguageRoute path="/services/register/:type">
                  {(params) => <RegisterServiceUnified defaultType={params.type} />}
                </LanguageRoute>
                <LanguageRoute path="/services/register-old">
                  {() => <RegisterService />}
                </LanguageRoute>
                <LanguageRoute path="/services/register-old/:type">
                  {(params) => <RegisterService type={params.type} />}
                </LanguageRoute>
                
                {/* Resource management pages */}
                <LanguageRoute path="/resources/create">
                  {() => <ResourceManagementPage />}
                </LanguageRoute>
                <LanguageRoute path="/resources/manage/:id">
                  {(params) => <ResourceManagementPage id={params.id} />}
                </LanguageRoute>
                
                {/* Resource upload pages */}
                <LanguageRoute path="/resources/upload">
                  {() => <ResourceUploadPage />}
                </LanguageRoute>
                <AdminRoute path="/admin/resources/upload">
                  {() => <ResourceUploadPage />}
                </AdminRoute>
                
                {/* Legacy Resource upload pages */}
                <LanguageRoute path="/resources/upload-v2">
                  {() => <ResourceUploadPageV2 />}
                </LanguageRoute>
                <LanguageRoute path="/resources/upload-v1">
                  {() => <UploadResource />}
                </LanguageRoute>
                
                {/* Other pages */}
                <LanguageRoute path="/ai-assembly">
                  {() => <AiAssembly />}
                </LanguageRoute>
                <LanguageRoute path="/remote-support">
                  {() => <RemoteSupport />}
                </LanguageRoute>
                <LanguageRoute path="/services/type/engineer">
                  {() => <Engineers />}
                </LanguageRoute>
                <LanguageRoute path="/sponsor">
                  {() => <Sponsor />}
                </LanguageRoute>
                <LanguageRoute path="/about">
                  {() => <About />}
                </LanguageRoute>
                
                {/* Auth pages */}
                <LanguageRoute path="/auth">
                  {() => <AuthPage />}
                </LanguageRoute>
                <LanguageRoute path="/login">
                  {() => <AuthPage initialTab="login" />}
                </LanguageRoute>
                <LanguageRoute path="/register">
                  {() => <AuthPage initialTab="register" />}
                </LanguageRoute>
                
                {/* User verification pages */}
                <LanguageRoute path="/my/verification">
                  {() => <ProtectedRoute>
                    {() => <UserVerification />}
                  </ProtectedRoute>}
                </LanguageRoute>
                
                {/* Payment pages */}
                <LanguageRoute path="/payment/service/:id">
                  {(params) => <PaymentPage id={params.id} />}
                </LanguageRoute>
                <LanguageRoute path="/payment/success">
                  {() => <PaymentResult status="success" />}
                </LanguageRoute>
                <LanguageRoute path="/payment/fail">
                  {() => <PaymentResult status="fail" />}
                </LanguageRoute>
                
                {/* Admin pages */}
                <LanguageRoute path="/admin/dashboard">
                  {() => (
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  )}
                </LanguageRoute>
                <LanguageRoute path="/admin/users">
                  {() => (
                    <AdminRoute>
                      <AdminUserManagement />
                    </AdminRoute>
                  )}
                </LanguageRoute>
                <LanguageRoute path="/admin/resources">
                  {() => (
                    <AdminRoute>
                      <AdminResourceManagement />
                    </AdminRoute>
                  )}
                </LanguageRoute>
                <LanguageRoute path="/admin/services">
                  {() => (
                    <AdminRoute>
                      <AdminServiceManagement />
                    </AdminRoute>
                  )}
                </LanguageRoute>
                
                {/* 이전 경로 호환성 유지 */}
                <LanguageRoute path="/admin/engineers">
                  {() => (
                    <AdminRoute>
                      <AdminServiceManagement />
                    </AdminRoute>
                  )}
                </LanguageRoute>
                
                {/* Fallback to 404 - Support both default and language-based paths */}
                <Route>
                  {() => <NotFound />}
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

function App() {
  // 앱 성능 모니터링 적용 - 간소화된 방식으로 변경
  useEffect(() => {
    // 성능 측정 직접 구현 (훅 대신)
    const initializePerformance = async () => {
      const { measureRendering } = await import('./lib/performance');
      return measureRendering('App');
    };
    
    // 성능 측정 초기화 및 클린업 함수 반환
    let cleanup = () => {};
    initializePerformance().then(cleanupFn => {
      cleanup = cleanupFn;
    });
    
    return () => cleanup();
  }, []);
  
  // 앱 초기화 시 중요 데이터 프리페치
  useEffect(() => {
    // 비동기 프리페치 함수 호출
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
        // React 18의 useTransition과 유사한 역할로 사용자 인터페이스 방해 없이 데이터 로드
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
