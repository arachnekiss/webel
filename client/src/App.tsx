import React, { useEffect, Suspense, lazy } from 'react';
import { Switch, Route } from 'wouter';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LocationProvider } from '@/contexts/LocationContext';
import { AuthProvider } from '@/hooks/use-auth';
import { useDeviceDetect } from './lib/useDeviceDetect';
import { ProtectedRoute, AdminRoute } from './lib/protected-route';
import { Loader2 } from 'lucide-react';
import { ThemeProvider } from 'next-themes';

// 컴포넌트
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';

// 로딩 스피너 인라인 구현
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

function Router() {
  const { isMobile } = useDeviceDetect();
  
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
    <div className="min-h-screen flex flex-col bg-slate-50">
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
                <Route path="/">
                  {() => <Home />}
                </Route>
                
                {/* Services routes - 카테고리별 서비스 목록 */}
                <Route path="/services/type/:type">
                  {(params) => <Services type={params.type} />}
                </Route>
                <Route path="/services/:id">
                  {(params) => <ServiceDetail id={params.id} />}
                </Route>
                
                {/* Resource routes with resource type categories */}
                <Route path="/resources/type/:type">
                  {(params) => <Resources params={params} />}
                </Route>
                <Route path="/resources">
                  {() => <Resources />}
                </Route>
                <Route path="/resources/:id">
                  {(params) => <ResourceDetail id={params.id} />}
                </Route>
                
                {/* 플래시 게임 페이지 (띄어쓰기 수정) */}
                <Route path="/flash-game">
                  {() => <Resources type="flash_game" />}
                </Route>
                
                {/* Auctions routes */}
                <Route path="/auctions">
                  {() => <Auctions />}
                </Route>
                <Route path="/auctions/:id">
                  {(params) => <AuctionDetail id={params.id} />}
                </Route>
                
                {/* Register pages - 3D 프린터 등록을 포함한 서비스 등록 페이지 통합 */}
                <Route path="/register-printer">
                  {() => <RegisterServiceUnified defaultType="3d_printing" />}
                </Route>
                <Route path="/services/register">
                  {() => <RegisterServiceUnified />}
                </Route>
                <Route path="/services/register/3d_printing">
                  {() => <RegisterServiceUnified defaultType="3d_printing" />}
                </Route>
                <Route path="/services/register/:type">
                  {(params) => <RegisterServiceUnified defaultType={params.type} />}
                </Route>
                <Route path="/services/register-old">
                  {() => <RegisterService />}
                </Route>
                <Route path="/services/register-old/:type">
                  {(params) => <RegisterService type={params.type} />}
                </Route>
                
                {/* Resource management pages */}
                <Route path="/resources/create">
                  {() => <ResourceManagementPage />}
                </Route>
                <Route path="/resources/manage/:id">
                  {(params) => <ResourceManagementPage id={params.id} />}
                </Route>
                
                {/* Resource upload pages */}
                <Route path="/resources/upload">
                  {() => <ResourceUploadPage />}
                </Route>
                <AdminRoute path="/admin/resources/upload">
                  {() => <ResourceUploadPage />}
                </AdminRoute>
                
                {/* Legacy Resource upload pages */}
                <Route path="/resources/upload-v2">
                  {() => <ResourceUploadPageV2 />}
                </Route>
                <Route path="/resources/upload-v1">
                  {() => <UploadResource />}
                </Route>
                
                {/* Other pages */}
                <Route path="/ai-assembly">
                  {() => <AiAssembly />}
                </Route>
                <Route path="/remote-support">
                  {() => <RemoteSupport />}
                </Route>
                <Route path="/services/type/engineer">
                  {() => <Engineers />}
                </Route>
                <Route path="/sponsor">
                  {() => <Sponsor />}
                </Route>
                <Route path="/about">
                  {() => <About />}
                </Route>
                
                {/* Auth pages */}
                <Route path="/auth">
                  {() => <AuthPage />}
                </Route>
                <Route path="/login">
                  {() => <AuthPage initialTab="login" />}
                </Route>
                <Route path="/register">
                  {() => <AuthPage initialTab="register" />}
                </Route>
                
                {/* User verification pages */}
                <Route path="/my/verification">
                  {() => <ProtectedRoute>
                    {() => <UserVerification />}
                  </ProtectedRoute>}
                </Route>
                
                {/* Payment pages */}
                <Route path="/payment/service/:id">
                  {(params) => <PaymentPage id={params.id} />}
                </Route>
                <Route path="/payment/success">
                  {() => <PaymentResult status="success" />}
                </Route>
                <Route path="/payment/fail">
                  {() => <PaymentResult status="fail" />}
                </Route>
                
                {/* Admin pages */}
                <Route path="/admin/dashboard">
                  {() => (
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  )}
                </Route>
                <Route path="/admin/users">
                  {() => (
                    <AdminRoute>
                      <AdminUserManagement />
                    </AdminRoute>
                  )}
                </Route>
                <Route path="/admin/resources">
                  {() => (
                    <AdminRoute>
                      <AdminResourceManagement />
                    </AdminRoute>
                  )}
                </Route>
                <Route path="/admin/services">
                  {() => (
                    <AdminRoute>
                      <AdminServiceManagement />
                    </AdminRoute>
                  )}
                </Route>
                
                {/* 이전 경로 호환성 유지 */}
                <Route path="/admin/engineers">
                  {() => (
                    <AdminRoute>
                      <AdminServiceManagement />
                    </AdminRoute>
                  )}
                </Route>
                
                {/* Fallback to 404 */}
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
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <LocationProvider>
            <AuthProvider>
              <Toaster />
              <Router />
            </AuthProvider>
          </LocationProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
