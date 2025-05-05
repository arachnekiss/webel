import React from 'react';
import TopLink from '@/components/ui/TopLink';
import { Button } from '@/components/ui/button';
import { useDeviceDetect } from '@/lib/useDeviceDetect';
import { ArrowRight, Search, MapPin, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const HeroSection: React.FC = () => {
  const { isMobile } = useDeviceDetect();
  const { language } = useLanguage();
  
  // Company types for each language
  const companyTypes = {
    ko: ["제작업체", "개인 제작자", "유통업체", "제조 회사", "스타트업"],
    en: ["Manufacturers", "Individual Creators", "Distributors", "Production Companies", "Startups"],
    jp: ["製作会社", "個人制作者", "流通業者", "製造会社", "スタートアップ"]
  };

  return (
    <section className="relative overflow-hidden rounded-3xl hero-section w-full">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581094794329-c8112a89f47e?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80')] opacity-15 mix-blend-overlay bg-center bg-cover"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
      </div>
      
      {/* Main content */}
      <div className="relative z-10 container py-16 md:py-24 lg:py-32">
        <div className="md:max-w-3xl">
          <div className="inline-block px-3 py-1 mb-6 rounded-full bg-blue-400/20 backdrop-blur-sm border border-blue-300/20">
            <span className="text-xs font-medium text-white flex items-center">
              <Sparkles className="h-3 w-3 mr-1" />
              {language === 'ko' ? '하드웨어 설계도부터 소프트웨어, 3D 모델까지 한 곳에서' : 
               language === 'jp' ? 'ハードウェア設計からソフトウェア、3Dモデルまで一ヶ所で' : 
               'From hardware designs to software and 3D models, all in one place'}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            {language === 'ko' ? (
              <>
                창작자와 엔지니어를 위한<br/>
                <span className="text-cyan-300">오픈 리소스 플랫폼</span>
              </>
            ) : language === 'jp' ? (
              <>
                創作者とエンジニアのための<br/>
                <span className="text-cyan-300">オープンリソースプラットフォーム</span>
              </>
            ) : (
              <>
                Open Resource Platform for<br/>
                <span className="text-cyan-300">Creators and Engineers</span>
              </>
            )}
          </h1>
          
          <p className="text-blue-50 text-lg md:text-xl mb-8 max-w-2xl">
            {language === 'ko' ? 
              'Webel에서 다양한 리소스를 찾고 근처의 3D 프린터와 제작 서비스에 쉽게 연결하세요. 만들고 싶은 모든 것을 가능하게 하는 커뮤니티에 참여하세요.' : 
             language === 'jp' ? 
              'Webelで様々なリソースを探し、近くの3Dプリンターや制作サービスに簡単に接続しましょう。作りたいすべてのものを可能にするコミュニティに参加しましょう。' : 
              'Find various resources on Webel and easily connect with nearby 3D printers and manufacturing services. Join a community that makes everything you want to create possible.'}
          </p>
          
          <div className="flex flex-wrap gap-5">
            <TopLink href="/resources" forceReload={false}>
              <Button className="group px-6 py-6 bg-white text-blue-600 font-medium rounded-xl hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300 text-base">
                <Search className="h-5 w-5 mr-2" />
                {language === 'ko' ? '리소스 찾기' : 
                 language === 'jp' ? 'リソースを探す' : 
                 'Find Resources'}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </TopLink>
            <TopLink href="/services/type/3d_printing" forceReload={false}>
              <Button variant="outline" className="group px-6 py-6 bg-blue-500/30 text-white backdrop-blur-sm font-medium rounded-xl border-2 border-white/20 hover:bg-blue-500/40 hover:border-white/30 shadow-lg transition-all duration-300 text-base">
                <MapPin className="h-5 w-5 mr-2" />
                {language === 'ko' ? '근처 3D 프린터 찾기' : 
                 language === 'jp' ? '近くの3Dプリンターを探す' : 
                 'Find Nearby 3D Printers'}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </TopLink>
          </div>
          
          {/* Participant section removed */}
        </div>
      </div>
      
      {/* Brand logos or trust indicators at the bottom */}
      <div className="relative z-10 bg-white/10 backdrop-blur-lg border-t border-white/10 py-4">
        <div className="container">
          <div className="text-center text-white/70 text-sm">
            <span>
              {language === 'ko' ? '다양한 업체와 개인 제작자 참여 중' : 
               language === 'jp' ? '様々な企業や個人製作者が参加中' : 
               'Various companies and individual creators participating'}
            </span>
            <div className="mt-2 flex justify-center items-center space-x-8 opacity-70">
              {companyTypes[language as keyof typeof companyTypes].map((name, idx) => (
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
