import React from 'react';
import CategoryNav from '@/components/layout/CategoryNav';
import HeroSection from '@/components/sections/HeroSection';
import LocationBasedServices from '@/components/sections/LocationBasedServices';
import FeaturedProduct from '@/components/sections/FeaturedProduct';
import AIAssistant from '@/components/sections/AIAssistant';

const Home: React.FC = () => {
  return (
    <>
      <div className="hidden md:block sticky top-0 z-10 bg-white shadow-sm">
        <CategoryNav type="resource" />
      </div>
      <div className="md:hidden sticky top-0 z-10 bg-white shadow-sm">
        <CategoryNav type="service" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-16">
        <HeroSection />
        <LocationBasedServices />
        <FeaturedProduct />
        <AIAssistant />
      </div>
    </>
  );
};

export default Home;
