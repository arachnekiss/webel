import React, { useEffect } from 'react';
import { Switch, Route } from 'wouter';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LocationProvider } from '@/contexts/LocationContext';
import { AuthProvider } from '@/hooks/use-auth';
import { useDeviceDetect } from './lib/useDeviceDetect';
import { ProtectedRoute, AdminRoute } from './lib/protected-route';

// Components
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';

// Pages
import Home from '@/pages/Home';
import NotFound from '@/pages/not-found';
import Services from '@/pages/Services';
import ServiceDetail from '@/pages/ServiceDetail';
import Resources from '@/pages/Resources';
import ResourceDetail from '@/pages/ResourceDetail';
// 이전 리소스 갤러리 제거
import UploadResource from '@/pages/UploadResource'; 
import ResourceUploadPage from '@/pages/ResourceUploadPage'; // 개선된 리소스 업로드 페이지
import ResourceUploadPageV2 from '@/pages/ResourceUploadPageV2'; // 통합 레이아웃 리소스 업로드 페이지
import ResourceManagementPage from '@/pages/ResourceManagementPage'; // 리소스 관리 페이지
import RegisterService from '@/pages/RegisterService'; 
import RegisterServiceUnified from '@/pages/RegisterServiceUnified'; // 통합된 서비스 등록 페이지
import Auctions from '@/pages/Auctions';
import AuctionDetail from '@/pages/AuctionDetail';
import AiAssembly from '@/pages/AiAssembly';
import RemoteSupport from '@/pages/RemoteSupport';
import Sponsor from '@/pages/Sponsor';
import About from '@/pages/About';
import FlashGames from '@/pages/FlashGames';
import Engineers from '@/pages/Engineers';
import AuthPage from '@/pages/auth-page';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminUserManagement from '@/pages/AdminUserManagement';
import AdminResourceManagement from '@/pages/AdminResourceManagement';
import AdminServiceManagement from '@/pages/AdminServiceManagement';
import RegisterPrinter from '@/pages/RegisterPrinter';
import PaymentPage from '@/pages/PaymentPage';
import PaymentResult from '@/pages/PaymentResult';

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
          <Switch>
            <Route path="/" component={Home}/>
            
            {/* Services routes - 카테고리별 서비스 목록 */}
            <Route path="/services/type/:type" component={Services}/>
            <Route path="/services/:id" component={ServiceDetail}/>
            
            {/* Resource routes with resource type categories */}
            <Route path="/resources/type/:type">
              {(params) => <Resources params={params} />}
            </Route>
            <Route path="/resources">
              {() => <Resources />}
            </Route>
            <Route path="/resources/:id" component={ResourceDetail}/>
            
            {/* 전문가용 리소스 갤러리 경로 제거 */}
            
            {/* Flash Games page */}
            <Route path="/flash-games">
              {() => <Resources type="flash_game" />}
            </Route>
            
            {/* Auctions routes */}
            <Route path="/auctions" component={Auctions}/>
            <Route path="/auctions/:id" component={AuctionDetail}/>
            
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
              {(params) => {
                const type = params.type as any;
                return <RegisterServiceUnified defaultType={type} />;
              }}
            </Route>
            <Route path="/services/register-old" component={RegisterService}/>
            <Route path="/services/register-old/:type" component={RegisterService}/>
            
            {/* Resource management pages */}
            <Route path="/resources/create" component={ResourceManagementPage}/>
            <Route path="/resources/manage/:id" component={ResourceManagementPage}/>
            
            {/* Resource upload pages */}
            <Route path="/resources/upload" component={ResourceUploadPage}/>
            <AdminRoute path="/admin/resources/upload" component={ResourceUploadPage}/>
            
            {/* Legacy Resource upload pages */}
            <Route path="/resources/upload-v2" component={ResourceUploadPageV2}/>
            <Route path="/resources/upload-v1" component={UploadResource}/>
            
            {/* Other pages */}
            <Route path="/ai-assembly" component={AiAssembly}/>
            <Route path="/remote-support" component={RemoteSupport}/>
            <Route path="/services/type/engineer" component={Engineers}/>
            <Route path="/sponsor" component={Sponsor}/>
            <Route path="/about" component={About}/>
            
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
            <ProtectedRoute path="/my/verification" component={() => {
              // 동적 임포트를 사용하여 필요할 때만 컴포넌트를 로드
              const UserVerification = React.lazy(() => import('@/pages/UserVerification'));
              return (
                <React.Suspense fallback={<div className="flex justify-center items-center min-h-[60vh]">로딩 중...</div>}>
                  <UserVerification />
                </React.Suspense>
              );
            }} />
            
            {/* Payment pages */}
            <Route path="/payment/service/:id">
              {(params) => <PaymentPage id={params.id} />}
            </Route>
            <Route path="/payment/success">
              <PaymentResult status="success" />
            </Route>
            <Route path="/payment/fail">
              <PaymentResult status="fail" />
            </Route>
            
            {/* Admin pages */}
            <AdminRoute path="/admin/dashboard" component={AdminDashboard} />
            <AdminRoute path="/admin/users" component={AdminUserManagement} />
            <AdminRoute path="/admin/resources" component={AdminResourceManagement} />
            <AdminRoute path="/admin/services" component={AdminServiceManagement} />
            {/* 이전 경로 호환성 유지 */}
            <AdminRoute path="/admin/engineers" component={AdminServiceManagement} />
            
            {/* Fallback to 404 */}
            <Route component={NotFound} />
          </Switch>
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
      <TooltipProvider>
        <LocationProvider>
          <AuthProvider>
            <Toaster />
            <Router />
          </AuthProvider>
        </LocationProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
