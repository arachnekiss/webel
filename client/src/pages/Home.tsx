import React from 'react';
import CategoryNav from '@/components/layout/CategoryNav';
import HeroSection from '@/components/sections/HeroSection';
import LocationBasedServices from '@/components/sections/LocationBasedServices';
import FreeResources from '@/components/sections/FreeResources';
import FeaturedProduct from '@/components/sections/FeaturedProduct';
import AIAssistant from '@/components/sections/AIAssistant';

const Home: React.FC = () => {
  return (
    <>
      <div className="hidden md:block">
        <CategoryNav type="resource" />
      </div>
      <div className="md:hidden">
        <CategoryNav type="service" />
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <HeroSection />
        <LocationBasedServices />
        <FreeResources />
        <FeaturedProduct />
        <AIAssistant />
      </div>
    </>
  );
};

export default Home;
