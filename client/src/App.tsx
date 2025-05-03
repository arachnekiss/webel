import React from 'react';
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

import { useScrollTop } from '@/hooks/use-scroll-top';
import { useEffect } from 'react';

function Router() {
  const { isMobile } = useDeviceDetect();
  
  // 페이지 전환 시 스크롤을 맨 위로 이동시키는 훅 적용
  useScrollTop();
  
  // 강화된 페이지 전환 스크롤 처리 - 추가 안전장치
  useEffect(() => {
    // 이전 라우트와 현재 라우트를 기록하는 함수
    function handleRouteChange() {
      // 페이지 전환 시 스크롤을 최상단으로 이동
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto'
      });
    }
    
    // 이벤트 리스너 등록
    window.addEventListener('popstate', handleRouteChange);
    
    // 클린업 함수
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
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
