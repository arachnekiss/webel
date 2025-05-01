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
import UploadResource from '@/pages/UploadResource'; 
import ResourceUploadPage from '@/pages/ResourceUploadPage'; // 개선된 리소스 업로드 페이지
import ResourceUploadPageV2 from '@/pages/ResourceUploadPageV2'; // 통합 레이아웃 리소스 업로드 페이지
import RegisterService from '@/pages/RegisterService'; 
import RegisterServiceUnified from '@/pages/RegisterServiceUnified'; // 통합된 서비스 등록 페이지
import Auctions from '@/pages/Auctions';
import AuctionDetail from '@/pages/AuctionDetail';
import AiAssembly from '@/pages/AiAssembly';
import RemoteSupport from '@/pages/RemoteSupport';
import Sponsor from '@/pages/Sponsor';
import FlashGames from '@/pages/FlashGames';
import Engineers from '@/pages/Engineers';
import AuthPage from '@/pages/auth-page';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminUserManagement from '@/pages/AdminUserManagement';
import AdminResourceManagement from '@/pages/AdminResourceManagement';
import AdminEngineerManagement from '@/pages/AdminEngineerManagement';
import RegisterPrinter from '@/pages/RegisterPrinter';

function Router() {
  const { isMobile } = useDeviceDetect();

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
            
            {/* Services routes */}
            <Route path="/services" component={Services}/>
            <Route path="/services/type/:type" component={Services}/>
            <Route path="/services/:id(\d+)" component={ServiceDetail}/>
            
            {/* Resource routes with resource type categories */}
            <Route path="/resources/type/:type">
              {(params) => <Resources params={params} />}
            </Route>
            <Route path="/resources">
              {() => <Resources />}
            </Route>
            <Route path="/resources/:id(\d+)" component={ResourceDetail}/>
            
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
              {(params) => <RegisterServiceUnified defaultType={params.type} />}
            </Route>
            <Route path="/services/register-old" component={RegisterService}/>
            <Route path="/services/register-old/:type" component={RegisterService}/>
            
            {/* Resource upload pages */}
            <Route path="/resources/upload" component={ResourceUploadPageV2}/>
            <AdminRoute path="/admin/resources/upload" component={ResourceUploadPageV2}/>
            <Route path="/resources/upload-old" component={ResourceUploadPage}/>
            <AdminRoute path="/resources/upload-v1" component={UploadResource}/>
            
            {/* Other pages */}
            <Route path="/ai-assembly" component={AiAssembly}/>
            <Route path="/remote-support" component={RemoteSupport}/>
            <Route path="/services/type/engineer" component={Engineers}/>
            <Route path="/sponsor" component={Sponsor}/>
            
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
            
            {/* Admin pages */}
            <AdminRoute path="/admin/dashboard" component={AdminDashboard} />
            <AdminRoute path="/admin/users" component={AdminUserManagement} />
            <AdminRoute path="/admin/resources" component={AdminResourceManagement} />
            <AdminRoute path="/admin/engineers" component={AdminEngineerManagement} />
            
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
