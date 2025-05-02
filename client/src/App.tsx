import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Switch, Route } from 'wouter';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LocationProvider } from '@/contexts/LocationContext';
import { AuthProvider } from '@/hooks/use-auth';
import { useDeviceDetect } from './lib/useDeviceDetect';

// Components
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Pages
import NotFound from '@/pages/not-found';
import Home from '@/pages/Home';
import Services from '@/pages/Services';
import ServiceDetail from '@/pages/ServiceDetail';
import Resources from '@/pages/Resources';
import ResourceDetail from '@/pages/ResourceDetail';
import ResourceManagementPage from '@/pages/ResourceManagementPage';
import RegisterServiceUnified from '@/pages/RegisterServiceUnified';
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
import AdminServiceManagement from '@/pages/AdminServiceManagement';
import RegisterPrinter from '@/pages/RegisterPrinter';
import PaymentPage from '@/pages/PaymentPage';
import PaymentResult from '@/pages/PaymentResult';

function Router() {
  const { isMobile } = useDeviceDetect();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <div className="flex-1 container mx-auto pt-6 px-4 md:px-6">
        <div className="flex flex-col md:flex-row gap-8">
          {!isMobile && (
            <div className="w-64 shrink-0">
              <Sidebar />
            </div>
          )}

          <div className="flex-1 flex flex-col overflow-x-hidden">
            <ErrorBoundary fallback={<div>에러가 발생했습니다</div>}>
              <Suspense fallback={<LoadingSpinner />}>
                <Switch>
                  <Route path="/" component={Home} />
                  <Route path="/services/type/:type" component={Services} />
                  <Route path="/services/:id" component={ServiceDetail} />
                  <Route path="/resources/type/:type">
                    {(params) => <Resources params={params} />}
                  </Route>
                  <Route path="/resources">
                    {() => <Resources />}
                  </Route>
                  <Route path="/resources/:id" component={ResourceDetail} />
                  <Route path="/flash-games">
                    {() => <Resources type="flash_game" />}
                  </Route>
                  <Route path="/auctions" component={Auctions} />
                  <Route path="/auctions/:id" component={AuctionDetail} />
                  <Route path="/register-printer">
                    {() => <RegisterServiceUnified defaultType="3d_printing" />}
                  </Route>
                  <Route path="/services/register">
                    {() => <RegisterServiceUnified />}
                  </Route>
                  <Route path="/services/register/:type">
                    {(params) => <RegisterServiceUnified defaultType={params.type} />}
                  </Route>
                  <Route path="/resources/create" component={ResourceManagementPage} />
                  <Route path="/resources/manage/:id" component={ResourceManagementPage} />
                  <Route path="/ai-assembly" component={AiAssembly} />
                  <Route path="/remote-support" component={RemoteSupport} />
                  <Route path="/services/type/engineer" component={Engineers} />
                  <Route path="/sponsor" component={Sponsor} />
                  <Route path="/auth" component={AuthPage} />
                  <Route path="/login">
                    {() => <AuthPage initialTab="login" />}
                  </Route>
                  <Route path="/register">
                    {() => <AuthPage initialTab="register" />}
                  </Route>
                  <Route path="/payment/service/:id">
                    {(params) => <PaymentPage id={params.id} />}
                  </Route>
                  <Route path="/payment/success">
                    <PaymentResult status="success" />
                  </Route>
                  <Route path="/payment/fail">
                    <PaymentResult status="fail" />
                  </Route>
                  <Route path="/admin/dashboard" component={AdminDashboard} />
                  <Route path="/admin/users" component={AdminUserManagement} />
                  <Route path="/admin/resources" component={AdminResourceManagement} />
                  <Route path="/admin/services" component={AdminServiceManagement} />
                  <Route component={NotFound} />
                </Switch>
              </Suspense>
            </ErrorBoundary>
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