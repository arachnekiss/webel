import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CategoryNav from '@/components/layout/CategoryNav';
import HeroSection from '@/components/sections/HeroSection';
import LocationBasedServices from '@/components/sections/LocationBasedServices';
import FreeResources from '@/components/sections/FreeResources';
import FeaturedProduct from '@/components/sections/FeaturedProduct';
import AIAssistant from '@/components/sections/AIAssistant';
import ReverseAuction from '@/components/sections/ReverseAuction';
import SponsorshipBanner from '@/components/sections/SponsorshipBanner';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CategoryNav />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <HeroSection />
        <LocationBasedServices />
        <FreeResources />
        <FeaturedProduct />
        <AIAssistant />
        <ReverseAuction />
        <SponsorshipBanner />
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
