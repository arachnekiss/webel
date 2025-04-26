import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import HeroSection from '@/components/sections/HeroSection';
import LocationBasedServices from '@/components/sections/LocationBasedServices';
import FeaturedProduct from '@/components/sections/FeaturedProduct';
import AIAssistant from '@/components/sections/AIAssistant';
import CategoryNav from '@/components/layout/CategoryNav';
import { 
  ArrowRight, 
  Box, 
  Cpu, 
  Code2, 
  Upload, 
  FileText, 
  Gamepad2, 
  Download 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// 리소스 카테고리 섹션 타입 정의
interface ResourceCategorySectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  items?: any[];
  category: string;
  isLoading?: boolean;
  bg?: string;
}

// 리소스 카테고리 섹션 컴포넌트
const ResourceCategorySection: React.FC<ResourceCategorySectionProps> = ({ 
  title, 
  description, 
  icon, 
  items = [], 
  category, 
  isLoading = false,
  bg = "bg-white"
}) => {
  return (
    <section className={`rounded-3xl shadow-sm border border-slate-100 ${bg} overflow-hidden mb-20 w-full`}>
      <div className="px-6 py-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 mr-3">
            {icon}
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">{title}</h2>
            <p className="text-slate-500 text-sm mt-1">{description}</p>
          </div>
        </div>
        <Link href={`/resources/type/${category}`}>
          <Button variant="outline" className="group md:self-start rounded-lg border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 transition-all">
            더 보기
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6 p-6">
        {isLoading ? (
          // 로딩 스켈레톤
          Array(3).fill(0).map((_, idx) => (
            <div key={idx} className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col h-full animate-pulse">
              <div className="w-full aspect-[4/3] bg-slate-200 rounded-lg mb-4"></div>
              <div className="h-6 bg-slate-200 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded mb-4 w-1/2"></div>
              <div className="flex gap-2 mb-4">
                <div className="h-6 bg-slate-200 rounded-full w-16"></div>
                <div className="h-6 bg-slate-200 rounded-full w-20"></div>
              </div>
              <div className="mt-auto">
                <div className="h-10 bg-slate-200 rounded-lg"></div>
              </div>
            </div>
          ))
        ) : (
          items && items.map((item, idx) => (
            <Link key={idx} href={`/resources/${item.id}`}>
              <div className="group bg-white hover:bg-slate-50 rounded-xl p-5 border border-slate-200 hover:border-slate-300 flex flex-col h-full cursor-pointer transition-all hover:shadow-md">
                <div className="w-full aspect-[4/3] bg-slate-100 rounded-lg mb-4 overflow-hidden">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Box className="h-12 w-12 text-slate-300" />
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-slate-800 mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{item.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.tags && item.tags.slice(0, 3).map((tag: string, tagIdx: number) => (
                    <span key={tagIdx} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-auto">
                  <Button 
                    variant="outline" 
                    className="w-full group/btn flex items-center justify-center gap-2 border-slate-200"
                  >
                    <Download className="h-4 w-4" />
                    <span>다운로드</span>
                  </Button>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
};

// 플래시 게임 타입 정의
interface FlashGame {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
}

interface FlashGamesSectionProps {
  games?: FlashGame[];
  isLoading?: boolean;
}

// 플래시 게임 섹션 컴포넌트
const FlashGamesSection: React.FC<FlashGamesSectionProps> = ({ isLoading = false }) => {
  // 플래시 게임 데이터 가져오기
  const { data: flashGames = [], isLoading: isGamesLoading } = useQuery<any[]>({
    queryKey: ['/api/resources/type/flash_game'],
    enabled: true,
  });

  return (
    <section className="rounded-3xl shadow-sm border border-slate-100 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden mb-16 w-full">
      <div className="px-6 py-6 border-b border-indigo-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 mr-3">
            <Gamepad2 className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">플래시 게임</h2>
            <p className="text-slate-500 text-sm mt-1">인기 플래시 게임을 Webel에서 바로 즐겨보세요</p>
          </div>
        </div>
        <Link href="/resources/type/flash_game">
          <Button variant="outline" className="group md:self-start rounded-lg border-indigo-200 bg-white/80 hover:border-indigo-400 hover:bg-indigo-50 text-indigo-700 transition-all">
            더 많은 게임
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4 p-6">
        {isGamesLoading || isLoading ? (
          // 로딩 스켈레톤
          Array(5).fill(0).map((_, idx) => (
            <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-indigo-100 flex flex-col animate-pulse">
              <div className="w-full aspect-square bg-slate-200 rounded mb-3"></div>
              <div className="h-5 bg-slate-200 rounded mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            </div>
          ))
        ) : flashGames.length > 0 ? (
          flashGames.slice(0, 5).map((game, idx) => (
            <Link key={idx} href={`/resources/${game.id}`}>
              <div className="group bg-white/80 backdrop-blur-sm hover:bg-white rounded-xl p-4 border border-indigo-100 hover:border-indigo-300 flex flex-col cursor-pointer transition-all hover:shadow-md">
                <div className="w-full aspect-square bg-indigo-50 rounded mb-3 overflow-hidden">
                  {game.imageUrl ? (
                    <img 
                      src={game.imageUrl} 
                      alt={game.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Gamepad2 className="h-10 w-10 text-indigo-200" />
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{game.title}</h3>
                <p className="text-slate-500 text-xs">{game.description}</p>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-5 text-center py-10">
            <Gamepad2 className="h-12 w-12 mx-auto text-indigo-200 mb-4" />
            <h3 className="text-lg font-bold mb-2">아직 등록된 게임이 없습니다</h3>
            <p className="text-slate-500">곧 다양한 HTML5 기반 게임들이 추가될 예정입니다!</p>
          </div>
        )}
      </div>
    </section>
  );
};

const Home: React.FC = () => {
  // 하드웨어 설계도 데이터 가져오기
  const { data: hardwareDesigns = [], isLoading: isHardwareLoading } = useQuery<any[]>({
    queryKey: ['/api/resources/type/hardware_design'],
    enabled: true,
  });

  // 소프트웨어 오픈소스 데이터 가져오기
  const { data: softwareResources = [], isLoading: isSoftwareLoading } = useQuery<any[]>({
    queryKey: ['/api/resources/type/software'],
    enabled: true,
  });

  // 인공지능 모델 데이터 가져오기
  const { data: aiModels = [], isLoading: isAILoading } = useQuery<any[]>({
    queryKey: ['/api/resources/type/ai_model'],
    enabled: true,
  });

  // 3D 모델링 파일 데이터 가져오기
  const { data: modelingFiles = [], isLoading: isModelingLoading } = useQuery<any[]>({
    queryKey: ['/api/resources/type/3d_model'],
    enabled: true,
  });

  // 프리 콘텐츠 데이터 가져오기
  const { data: freeContents = [], isLoading: isFreeContentLoading } = useQuery<any[]>({
    queryKey: ['/api/resources/type/free_content'],
    enabled: true,
  });

  return (
    <div className="pb-16">
      <HeroSection />
      
      {/* 하드웨어 설계도 섹션 */}
      <div className="container pt-12">
        <ResourceCategorySection 
          title="하드웨어 설계도" 
          description="혁신적인 하드웨어 설계도를 살펴보세요" 
          icon={<Upload className="h-5 w-5 text-slate-600" />}
          items={hardwareDesigns?.slice(0, 6)} 
          category="hardware_design"
          isLoading={isHardwareLoading}
        />
        
        {/* 소프트웨어 오픈소스 섹션 */}
        <ResourceCategorySection 
          title="소프트웨어 오픈소스" 
          description="다양한 오픈소스 소프트웨어 프로젝트" 
          icon={<Code2 className="h-5 w-5 text-slate-600" />}
          items={softwareResources?.slice(0, 6)} 
          category="software"
          isLoading={isSoftwareLoading}
          bg="bg-gradient-to-br from-slate-50 to-slate-100"
        />
        
        {/* 인공지능 모델 섹션 */}
        <ResourceCategorySection 
          title="인공지능 모델" 
          description="최신 AI 모델과 학습 데이터셋" 
          icon={<Cpu className="h-5 w-5 text-slate-600" />}
          items={aiModels?.slice(0, 6)} 
          category="ai_model"
          isLoading={isAILoading}
        />
        
        {/* 3D 모델링 파일 섹션 */}
        <ResourceCategorySection 
          title="3D 모델링 파일" 
          description="3D 프린팅용 모델 파일 라이브러리" 
          icon={<Box className="h-5 w-5 text-slate-600" />}
          items={modelingFiles?.slice(0, 6)} 
          category="3d_model"
          isLoading={isModelingLoading}
          bg="bg-gradient-to-br from-slate-50 to-slate-100"
        />
        
        {/* 프리 콘텐츠 섹션 */}
        <ResourceCategorySection 
          title="프리 콘텐츠" 
          description="자유롭게 이용 가능한 다양한 콘텐츠" 
          icon={<FileText className="h-5 w-5 text-slate-600" />}
          items={freeContents?.slice(0, 6)} 
          category="free_content"
          isLoading={isFreeContentLoading}
        />
        
        {/* 플래시 게임 섹션 */}
        <FlashGamesSection isLoading={false} />
      </div>
      
      <div className="container space-y-16">
        <LocationBasedServices />
        <AIAssistant />
      </div>
    </div>
  );
};

export default Home;
