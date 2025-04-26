import React from 'react';
import { Switch, Route } from 'wouter';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LocationProvider } from '@/contexts/LocationContext';
import { useDeviceDetect } from './lib/useDeviceDetect';

// Components
import Header from '@/components/layout/Header';
import CategoryNav from '@/components/layout/CategoryNav';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';

// Pages
import Home from '@/pages/Home';
import NotFound from '@/pages/not-found';
import Services from '@/pages/Services';
import ServiceDetail from '@/pages/ServiceDetail';
import Resources from '@/pages/Resources';
import ResourceDetail from '@/pages/ResourceDetail';
import Auctions from '@/pages/Auctions';
import AuctionDetail from '@/pages/AuctionDetail';
import AiAssembly from '@/pages/AiAssembly';
import RemoteSupport from '@/pages/RemoteSupport';
import Sponsor from '@/pages/Sponsor';

function Router() {
  const { isMobile, isTablet } = useDeviceDetect();
  
  // 모바일 기기에서는 사이드바를 표시하지 않음
  const showSidebar = !isMobile && !isTablet;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* 상단 헤더 영역 - Fixed position to mimic Steam/Tindie */}
      <div className="sticky top-0 z-50 shadow-sm">
        <Header />
        <CategoryNav type="resource" />
      </div>
      
      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="flex">
          {/* 데스크톱에서만 사이드바 표시 */}
          {showSidebar && (
            <div className="w-64 flex-shrink-0">
              <div className="sticky top-[105px] h-[calc(100vh-115px)] overflow-y-auto pr-4">
                <Sidebar />
              </div>
            </div>
          )}
          
          {/* 메인 콘텐츠 */}
          <div className={`flex-1 ${showSidebar ? 'pl-6' : ''}`}>
            <div className="rounded-lg bg-white shadow-sm min-h-[calc(100vh-130px)]">
              <Switch>
                <Route path="/" component={Home}/>
                
                {/* Services routes */}
                <Route path="/services" component={Services}/>
                <Route path="/services/:id" component={ServiceDetail}/>
                <Route path="/services/:type" component={Services}/>
                
                {/* Resources routes */}
                <Route path="/resources" component={Resources}/>
                <Route path="/resources/:id" component={ResourceDetail}/>
                <Route path="/resources/:type" component={Resources}/>
                
                {/* Auctions routes */}
                <Route path="/auctions" component={Auctions}/>
                <Route path="/auctions/:id" component={AuctionDetail}/>
                
                {/* Other pages */}
                <Route path="/ai-assembly" component={AiAssembly}/>
                <Route path="/remote-support" component={RemoteSupport}/>
                <Route path="/sponsor" component={Sponsor}/>
                
                {/* Fallback to 404 */}
                <Route component={NotFound} />
              </Switch>
            </div>
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
          <Toaster />
          <Router />
        </LocationProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
