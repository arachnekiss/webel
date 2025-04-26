import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useDeviceDetect } from '@/lib/useDeviceDetect';

const HeroSection: React.FC = () => {
  const { isMobile } = useDeviceDetect();
  
  return (
    <section className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl overflow-hidden shadow-lg mb-10">
      <div className="md:flex">
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
            엔지니어, 소비자, 제조업체를 연결하는 혁신적인 생태계
          </h2>
          <p className="text-blue-50 mb-6">
            Webel은 AI 기반 실시간 매칭으로 가까운 3D 프린터, 엔지니어, 제조업체와 연결해 드립니다. 
            자동화된 리소스 관리와 커스터마이징으로 원하는 서비스를 쉽고 빠르게 찾아보세요.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/services/3d_printing">
              <Button className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors">
                서비스 시작하기
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" className="px-6 py-3 bg-blue-400 bg-opacity-30 text-white font-medium rounded-lg border border-white border-opacity-30 hover:bg-opacity-40 transition-colors">
                더 알아보기
              </Button>
            </Link>
          </div>
        </div>
        {!isMobile && (
          <div className="md:w-1/2 p-6 hidden md:block">
            <img 
              src="https://images.unsplash.com/photo-1581094794329-c8112a89f47e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="3D 프린팅 및 제조 생태계" 
              className="w-full h-full object-cover rounded-xl" 
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
