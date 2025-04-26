import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useDeviceDetect } from '@/lib/useDeviceDetect';
import { ArrowRight, Search, MapPin, Sparkles } from 'lucide-react';

const HeroSection: React.FC = () => {
  const { isMobile } = useDeviceDetect();
  
  return (
    <section className="relative overflow-hidden rounded-3xl">
      {/* 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581094794329-c8112a89f47e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80')] opacity-15 mix-blend-overlay bg-center bg-cover"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
      </div>
      
      {/* 메인 컨텐츠 */}
      <div className="relative z-10 container mx-auto px-6 py-16 md:py-24">
        <div className="md:max-w-2xl">
          <div className="inline-block px-3 py-1 mb-6 rounded-full bg-blue-400/20 backdrop-blur-sm border border-blue-300/20">
            <span className="text-xs font-medium text-white flex items-center">
              <Sparkles className="h-3 w-3 mr-1" />
              하드웨어 디자인부터 소프트웨어, 3D 모델까지 한 곳에서
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            창작자와 엔지니어를 위한<br/>
            <span className="text-cyan-300">오픈 리소스 플랫폼</span>
          </h1>
          
          <p className="text-blue-50 text-lg md:text-xl mb-8 max-w-xl">
            Webel에서 다양한 리소스를 찾고 근처의 3D 프린터와 제작 서비스에 쉽게 연결하세요. 
            만들고 싶은 모든 것을 가능하게 하는 커뮤니티에 참여하세요.
          </p>
          
          <div className="flex flex-wrap gap-5">
            <Link href="/resources">
              <Button className="group px-6 py-6 bg-white text-blue-600 font-medium rounded-xl hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300 text-base">
                <Search className="h-5 w-5 mr-2" />
                리소스 찾기
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/services/3d_printing">
              <Button variant="outline" className="group px-6 py-6 bg-blue-500/30 text-white backdrop-blur-sm font-medium rounded-xl border-2 border-white/20 hover:bg-blue-500/40 hover:border-white/30 shadow-lg transition-all duration-300 text-base">
                <MapPin className="h-5 w-5 mr-2" />
                근처 3D 프린터 찾기
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
          
          <div className="mt-10 flex items-center">
            <div className="flex -space-x-2">
              {["https://i.pravatar.cc/100?img=1", "https://i.pravatar.cc/100?img=2", "https://i.pravatar.cc/100?img=3"].map((url, idx) => (
                <div key={idx} className="w-8 h-8 rounded-full border-2 border-blue-600 overflow-hidden">
                  <img src={url} alt="사용자" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="ml-3 text-sm text-blue-100">
              <span className="font-medium">5,000+</span> 메이커들이 이미 참여 중
            </div>
          </div>
        </div>
      </div>
      
      {/* 하단 부분에 추가된 브랜드 로고나 신뢰 지표 */}
      <div className="relative z-10 bg-white/10 backdrop-blur-lg border-t border-white/10 py-4">
        <div className="container mx-auto px-6">
          <div className="text-center text-white/70 text-sm">
            <span>다양한 업체와 개인 제작자 참여 중</span>
            <div className="mt-2 flex justify-center items-center space-x-8 opacity-70">
              {["제작업체", "개인 제작자", "유통업체", "제조 회사", "스타트업"].map((name, idx) => (
                <span key={idx} className="font-medium">{name}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
