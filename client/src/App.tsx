import React from 'react';
import { Switch, Route } from 'wouter';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LocationProvider } from '@/contexts/LocationContext';

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
  return (
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
