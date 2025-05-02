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
        <div className="flex gap-3">
          {/* 업로드 버튼 제거 - 관리자 대시보드로 통합 */}
          <Link href={`/resources/type/${category}`}>
            <Button variant="outline" className="group rounded-lg border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 transition-all">
              더 보기
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
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

// 플래시 게임 섹션 컴포넌트 - 제거됨

const Home: React.FC = () => {
  // API 응답 타입 정의 (items와 meta 구조)
  interface ResourceResponse {
    items: any[];
    meta: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }

  // 하드웨어 설계도 데이터 가져오기
  const { data: hardwareDesignsData, isLoading: isHardwareLoading } = useQuery<ResourceResponse>({
    queryKey: ['/api/resources/type/hardware_design'],
    enabled: true,
  });
  const hardwareDesigns = hardwareDesignsData?.items || [];

  // 소프트웨어 오픈소스 데이터 가져오기
  const { data: softwareResourcesData, isLoading: isSoftwareLoading } = useQuery<ResourceResponse>({
    queryKey: ['/api/resources/type/software'],
    enabled: true,
  });
  const softwareResources = softwareResourcesData?.items || [];

  // 인공지능 모델 데이터 가져오기
  const { data: aiModelsData, isLoading: isAILoading } = useQuery<ResourceResponse>({
    queryKey: ['/api/resources/type/ai_model'],
    enabled: true,
  });
  const aiModels = aiModelsData?.items || [];

  // 3D 모델링 파일 데이터 가져오기
  const { data: modelingFilesData, isLoading: isModelingLoading } = useQuery<ResourceResponse>({
    queryKey: ['/api/resources/type/3d_model'],
    enabled: true,
  });
  const modelingFiles = modelingFilesData?.items || [];

  // 프리 콘텐츠 데이터 로딩 제거됨

  return (
    <div className="pb-16">
      <HeroSection />
      
      {/* 하드웨어 설계도 섹션 */}
      <div className="pt-8">
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
        
        {/* 프리 콘텐츠와 플래시 게임 섹션 제거됨 */}
      </div>
      
      <div className="space-y-12">
        <LocationBasedServices />
        <AIAssistant />
      </div>
    </div>
  );
};

export default Home;
