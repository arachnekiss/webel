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
            창작자와 메이커를 위한 오픈 리소스 플랫폼
          </h2>
          <p className="text-blue-50 mb-6">
            Webel에서 다양한 하드웨어 설계도, 소프트웨어, 3D 모델 등의 리소스를 찾고 
            근처의 3D 프린터와 제작 서비스에 쉽게 연결하세요. 
            만들고 싶은 모든 것을 가능하게 하는 커뮤니티에 참여하세요.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/resources">
              <Button className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors">
                리소스 찾기
              </Button>
            </Link>
            <Link href="/services/3d_printing">
              <Button variant="outline" className="px-6 py-3 bg-blue-400 bg-opacity-30 text-white font-medium rounded-lg border border-white border-opacity-30 hover:bg-opacity-40 transition-colors">
                근처 3D 프린터 찾기
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
