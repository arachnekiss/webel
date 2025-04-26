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
    <section className={`rounded-3xl shadow-sm border border-slate-100 ${bg} overflow-hidden mb-20`}>
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
        <Link href={`/resources/${category}`}>
          <Button variant="outline" className="group md:self-start rounded-lg border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 transition-all">
            더 보기
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
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
                  {item.tags && item.tags.slice(0, 3).map((tag, tagIdx) => (
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
const FlashGamesSection: React.FC<FlashGamesSectionProps> = ({ games = [], isLoading = false }) => {
  return (
    <section className="rounded-3xl shadow-sm border border-slate-100 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden mb-16">
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
        <Link href="/flash-games">
          <Button variant="outline" className="group md:self-start rounded-lg border-indigo-200 bg-white/80 hover:border-indigo-400 hover:bg-indigo-50 text-indigo-700 transition-all">
            더 많은 게임
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-6">
        {isLoading ? (
          // 로딩 스켈레톤
          Array(5).fill(0).map((_, idx) => (
            <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-indigo-100 flex flex-col animate-pulse">
              <div className="w-full aspect-square bg-slate-200 rounded mb-3"></div>
              <div className="h-5 bg-slate-200 rounded mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            </div>
          ))
        ) : (
          [
            { 
              id: 'game1', 
              title: '테트리스', 
              description: '클래식 블록 퍼즐 게임', 
              imageUrl: 'https://images.unsplash.com/photo-1599409637219-c73b0d432145?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' 
            },
            { 
              id: 'game2', 
              title: '스네이크', 
              description: '뱀 키우기 게임', 
              imageUrl: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' 
            },
            { 
              id: 'game3', 
              title: '팩맨', 
              description: '미로 속 먹이 먹기', 
              imageUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' 
            },
            { 
              id: 'game4', 
              title: '스페이스 인베이더', 
              description: '외계인 침략을 막아라', 
              imageUrl: 'https://images.unsplash.com/photo-1506718468845-7578aa47600b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' 
            },
            { 
              id: 'game5', 
              title: '플래피 버드', 
              description: '장애물 피하기 게임', 
              imageUrl: 'https://images.unsplash.com/photo-1513002433973-e449363d9a68?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' 
            }
          ].map((game, idx) => (
            <Link key={idx} href={`/flash-games/${game.id}`}>
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
        )}
      </div>
    </section>
  );
};

const Home: React.FC = () => {
  // 하드웨어 설계도 데이터 가져오기
  const { data: hardwareDesigns, isLoading: isHardwareLoading } = useQuery({
    queryKey: ['/api/resources/type/hardware_design'],
    enabled: true,
  });

  // 소프트웨어 오픈소스 데이터 가져오기
  const { data: softwareResources, isLoading: isSoftwareLoading } = useQuery({
    queryKey: ['/api/resources/type/software'],
    enabled: true,
  });

  // 인공지능 모델 데이터 가져오기
  const { data: aiModels, isLoading: isAILoading } = useQuery({
    queryKey: ['/api/resources/type/ai_model'],
    enabled: true,
  });

  // 3D 모델링 파일 데이터 가져오기
  const { data: modelingFiles, isLoading: isModelingLoading } = useQuery({
    queryKey: ['/api/resources/type/3d_model'],
    enabled: true,
  });

  // 프리 콘텐츠 데이터 가져오기
  const { data: freeContents, isLoading: isFreeContentLoading } = useQuery({
    queryKey: ['/api/resources/type/free_content'],
    enabled: true,
  });

  return (
    <div className="pb-16">
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <CategoryNav type="resource" />
      </div>
      <HeroSection />
      
      {/* 하드웨어 설계도 섹션 */}
      <div className="max-w-7xl mx-auto px-4 pt-12">
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
      
      <div className="max-w-7xl mx-auto px-4 space-y-16">
        <LocationBasedServices />
        <AIAssistant />
      </div>
    </div>
  );
};

export default Home;
