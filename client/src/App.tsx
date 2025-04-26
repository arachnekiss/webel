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
  const { isMobile } = useDeviceDetect();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 상단 네비게이션 영역 */}
      <Header />
      
      {/* 메인 컨텐츠 영역 */}
      <div className="flex flex-1 w-full max-w-[1920px] mx-auto">
        {/* 사이드바는 모바일에서만 숨김 */}
        <div className="flex-shrink-0 hidden md:block w-64 pt-4 bg-white border-r border-slate-200 min-h-screen">
          <Sidebar />
        </div>
        
        {/* 메인 콘텐츠 */}
        <div className="flex-1 min-w-0 pb-10">
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
            
            {/* Flash Games route */}
            <Route path="/flash-games" component={Resources}/>
            
            {/* Other pages */}
            <Route path="/ai-assembly" component={AiAssembly}/>
            <Route path="/remote-support" component={RemoteSupport}/>
            <Route path="/sponsor" component={Sponsor}/>
            
            {/* Fallback to 404 */}
            <Route component={NotFound} />
          </Switch>
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
