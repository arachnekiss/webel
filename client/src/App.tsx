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
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* 헤더 영역 */}
      <Header />
      
      <div className="flex-1 flex relative">
        {/* 왼쪽 사이드바 영역 - 모바일에서는 숨김 */}
        {!isMobile && <Sidebar />}
        
        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1 flex flex-col w-full overflow-x-hidden"
             style={{ paddingLeft: !isMobile ? '240px' : '0' }}>
          <Switch>
            <Route path="/" component={Home}/>
            
            {/* Services routes */}
            <Route path="/services" component={Services}/>
            <Route path="/services/type/:type" component={Services}/>
            <Route path="/services/:id(\d+)" component={ServiceDetail}/>
            
            {/* Resource routes with resource type categories */}
            <Route path="/resources/type/:type" component={Resources}/>
            <Route path="/resources" component={Resources}/>
            <Route path="/resources/:id(\d+)" component={ResourceDetail}/>
            
            {/* Flash Games routes */}
            <Route path="/flash-games" component={Resources}/>
            <Route path="/flash-games/:id" component={ResourceDetail}/>
            
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
