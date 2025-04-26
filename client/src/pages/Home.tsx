import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import HeroSection from '@/components/sections/HeroSection';
import LocationBasedServices from '@/components/sections/LocationBasedServices';
import FeaturedProduct from '@/components/sections/FeaturedProduct';
import AIAssistant from '@/components/sections/AIAssistant';
import { Button } from '@/components/ui/button';
import { HardDrive, Code, Brain, Box, File, Gamepad, ArrowRight, Download } from 'lucide-react';
import { Resource } from '@shared/schema';

// 리소스 카테고리 정의
const resourceCategories = [
  { id: 'hardware_design', label: '하드웨어 설계도', icon: <HardDrive className="h-5 w-5" />, href: '/resources/hardware_design' },
  { id: 'software', label: '소프트웨어 오픈소스', icon: <Code className="h-5 w-5" />, href: '/resources/software' },
  { id: 'ai_model', label: 'AI 모델', icon: <Brain className="h-5 w-5" />, href: '/resources/ai_model' },
  { id: '3d_model', label: '3D 모델링', icon: <Box className="h-5 w-5" />, href: '/resources/3d_model' },
  { id: 'free_content', label: '프리 콘텐츠', icon: <File className="h-5 w-5" />, href: '/resources/free_content' },
  { id: 'flash_game', label: '플래시 게임', icon: <Gamepad className="h-5 w-5" />, href: '/resources/flash_game' }
];

// 리소스 섹션 컴포넌트
const ResourceSection: React.FC<{ 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  href: string;
  resources: Resource[];
  isFlashGame?: boolean;
}> = ({ title, description, icon, href, resources, isFlashGame }) => {
  return (
    <section className="pt-10 pb-12 first:pt-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="mb-4 md:mb-0">
          <div className="flex items-center mb-2">
            <div className="bg-blue-50 p-2 rounded-md mr-3">
              {icon}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          </div>
          <p className="text-gray-600 max-w-2xl">{description}</p>
        </div>
        <Link href={href}>
          <Button variant="outline" className="group border-blue-200 text-blue-700 hover:bg-blue-50">
            더 보기
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.slice(0, 3).map((resource) => (
          <Link key={resource.id} href={`/resources/${resource.id}`}>
            <div className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all border border-gray-100 h-full cursor-pointer">
              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                {resource.imageUrl ? (
                  <img 
                    src={resource.imageUrl} 
                    alt={resource.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="text-gray-400 flex items-center flex-col">
                      {icon}
                      <span className="text-sm mt-2">No image</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-5">
                <h3 className="font-semibold text-lg text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {resource.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                  {resource.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {resource.tags && resource.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                
                {isFlashGame ? (
                  <Button size="sm" className="mt-2 w-full bg-green-600 hover:bg-green-700">
                    <Gamepad className="h-4 w-4 mr-2" />
                    게임 플레이하기
                  </Button>
                ) : (
                  <Button size="sm" className="mt-2 w-full">
                    <Download className="h-4 w-4 mr-2" />
                    다운로드
                  </Button>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

// 게임 섹션용 별도 컴포넌트
const FlashGamesSection: React.FC<{
  resources: Resource[];
}> = ({ resources }) => {
  return (
    <section className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white rounded-2xl overflow-hidden shadow-xl my-16">
      <div className="p-8 md:p-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center mb-3">
              <Gamepad className="h-7 w-7 text-purple-300 mr-3" />
              <h2 className="text-3xl font-bold">플래시 게임 컬렉션</h2>
            </div>
            <p className="text-purple-200 max-w-2xl">
              웹브라우저에서 바로 플레이할 수 있는 다양한 게임을 즐겨보세요. 모든 게임은 Webel 플랫폼에서 직접 실행됩니다.
            </p>
          </div>
          <Link href="/resources/flash_game">
            <Button className="bg-white text-purple-900 hover:bg-purple-50">
              모든 게임 보기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {resources.slice(0, 4).map((game) => (
            <Link key={game.id} href={`/resources/${game.id}`}>
              <div className="group bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-white/20 transition-all border border-white/10 cursor-pointer">
                <div className="aspect-square overflow-hidden">
                  {game.imageUrl ? (
                    <img 
                      src={game.imageUrl} 
                      alt={game.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-purple-800/50">
                      <Gamepad className="h-12 w-12 text-purple-300" />
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-medium text-white mb-1 group-hover:text-purple-200">
                    {game.title}
                  </h3>
                  <div className="mt-3 flex justify-center">
                    <Button size="sm" className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-0">
                      <Gamepad className="h-4 w-4 mr-2" />
                      플레이
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

const Home: React.FC = () => {
  // 하드웨어 설계도
  const { data: hardwareDesigns = [] } = useQuery<Resource[]>({
    queryKey: ['/api/resources/type/hardware_design'],
    select: (data) => data.slice(0, 3)
  });
  
  // 소프트웨어 오픈소스
  const { data: softwareResources = [] } = useQuery<Resource[]>({
    queryKey: ['/api/resources/type/software'],
    select: (data) => data.slice(0, 3)
  });
  
  // AI 모델
  const { data: aiModels = [] } = useQuery<Resource[]>({
    queryKey: ['/api/resources/type/ai_model'],
    select: (data) => data.slice(0, 3)
  });
  
  // 3D 모델링 파일
  const { data: modelingFiles = [] } = useQuery<Resource[]>({
    queryKey: ['/api/resources/type/3d_model'],
    select: (data) => data.slice(0, 3)
  });
  
  // 프리 콘텐츠
  const { data: freeContent = [] } = useQuery<Resource[]>({
    queryKey: ['/api/resources/type/free_content'],
    select: (data) => data.slice(0, 3)
  });
  
  // 플래시 게임
  const { data: flashGames = [] } = useQuery<Resource[]>({
    queryKey: ['/api/resources/type/flash_game'],
    select: (data) => data.slice(0, 4)
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-20">
      <HeroSection />
      <LocationBasedServices />
      <AIAssistant />
      
      <div className="py-12 space-y-8">
        {/* 하드웨어 설계도 */}
        <ResourceSection 
          title="하드웨어 설계도" 
          description="DIY 제작을 위한 고품질 하드웨어 설계도를 찾아보세요. PCB 디자인부터 3D 프린팅용 파일까지 다양한 설계도가 준비되어 있습니다."
          icon={<HardDrive className="h-6 w-6 text-blue-600" />}
          href="/resources/hardware_design"
          resources={hardwareDesigns}
        />
        
        {/* 소프트웨어 오픈소스 */}
        <ResourceSection 
          title="소프트웨어 오픈소스" 
          description="오픈소스 라이브러리, 개발 도구, 앱 소스코드 등을 찾아보세요. 모든 소프트웨어 리소스는 자유롭게 사용할 수 있습니다."
          icon={<Code className="h-6 w-6 text-blue-600" />}
          href="/resources/software"
          resources={softwareResources}
        />
        
        {/* AI 모델 */}
        <ResourceSection 
          title="AI 모델" 
          description="미리 학습된 AI 모델을 다운로드하고 자신의 프로젝트에 활용해보세요. 다양한 딥러닝, 머신러닝 모델이 제공됩니다."
          icon={<Brain className="h-6 w-6 text-blue-600" />}
          href="/resources/ai_model"
          resources={aiModels}
        />
        
        {/* 3D 모델링 파일 */}
        <ResourceSection 
          title="3D 모델링 파일" 
          description="3D 프린팅을 위한 다양한 모델 파일을 찾아보세요. STL, OBJ 등 다양한 포맷으로 제공됩니다."
          icon={<Box className="h-6 w-6 text-blue-600" />}
          href="/resources/3d_model"
          resources={modelingFiles}
        />
        
        {/* 프리 콘텐츠 */}
        <ResourceSection 
          title="프리 콘텐츠" 
          description="창작물, 교육 자료, 미디어 등 다양한 무료 콘텐츠를 이용해보세요."
          icon={<File className="h-6 w-6 text-blue-600" />}
          href="/resources/free_content"
          resources={freeContent}
        />
      </div>
      
      {/* 플래시 게임 섹션 */}
      {flashGames.length > 0 && (
        <FlashGamesSection resources={flashGames} />
      )}
    </div>
  );
};

export default Home;
