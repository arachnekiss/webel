import React from 'react';
import { Link, useLocation } from 'wouter';
import { useDeviceDetect } from '@/lib/useDeviceDetect';
import { cn } from '@/lib/utils';
import { 
  Printer, 
  Lightbulb, 
  Video, 
  Building2, 
  Heart,
  Upload, 
  Code2, 
  Box, 
  FileText,
  Cpu,
  Gamepad2,
  Hammer,
  PanelLeft,
  ShoppingCart,
  LayoutGrid,
  CircuitBoard,
  BrainCircuit,
  BookOpen,
  Joystick
} from 'lucide-react';

interface CategoryProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

// 서비스 카테고리 (사이드바용)
const serviceCategories: CategoryProps[] = [
  {
    id: '3d_printer',
    label: '근처 3D 프린터',
    icon: <Printer className="h-5 w-5" />,
    href: '/services/3d_printing'
  },
  {
    id: 'electronics',
    label: '전자 제품 조립',
    icon: <CircuitBoard className="h-5 w-5" />,
    href: '/services/electronics'
  },
  {
    id: 'woodworking',
    label: '목공 서비스',
    icon: <Hammer className="h-5 w-5" />,
    href: '/services/woodworking'
  },
  {
    id: 'metalworking',
    label: '금속 가공',
    icon: <PanelLeft className="h-5 w-5" />,
    href: '/services/metalworking'
  },
  {
    id: 'manufacturing',
    label: '생산업체 찾기',
    icon: <Building2 className="h-5 w-5" />,
    href: '/services/manufacturing'
  },
  {
    id: 'ai_assistant',
    label: 'AI 조립 비서',
    icon: <Lightbulb className="h-5 w-5" />,
    href: '/ai-assembly'
  },
  {
    id: 'remote_support',
    label: '조립 원격 지원',
    icon: <Video className="h-5 w-5" />,
    href: '/remote-support'
  },
  {
    id: 'request_service',
    label: '제작 견적 요청',
    icon: <ShoppingCart className="h-5 w-5" />,
    href: '/auctions'
  },
  {
    id: 'sponsor',
    label: 'Webel 후원하기',
    icon: <Heart className="h-5 w-5" />,
    href: '/sponsor'
  }
];

// 리소스 카테고리 (상단 네비게이션용) - 요청한 순서대로 배치
const resourceCategories: CategoryProps[] = [
  {
    id: 'all_resources',
    label: '스토어 홈',
    icon: <LayoutGrid className="h-4 w-4" />,
    href: '/'
  },
  {
    id: 'hardware_design',
    label: '하드웨어 설계도',
    icon: <CircuitBoard className="h-4 w-4" />,
    href: '/resources/hardware_design'
  },
  {
    id: 'software',
    label: '소프트웨어 오픈소스',
    icon: <Code2 className="h-4 w-4" />,
    href: '/resources/software'
  },
  {
    id: 'ai_model',
    label: 'AI 모델',
    icon: <BrainCircuit className="h-4 w-4" />,
    href: '/resources/ai_model'
  },
  {
    id: '3d_model',
    label: '3D 모델링 파일',
    icon: <Box className="h-4 w-4" />,
    href: '/resources/3d_model'
  },
  {
    id: 'free_content',
    label: '프리 콘텐츠',
    icon: <BookOpen className="h-4 w-4" />,
    href: '/resources/free_content'
  },
  {
    id: 'flash_game',
    label: '플래시 게임',
    icon: <Joystick className="h-4 w-4" />,
    href: '/resources/flash_game'
  },
  {
    id: 'services',
    label: '서비스 찾기',
    icon: <Printer className="h-4 w-4" />,
    href: '/services'
  }
];

interface CategoryNavProps {
  type: 'service' | 'resource';
}

// 기본값을 제공하는 컴포넌트
const CategoryNav: React.FC<Partial<CategoryNavProps>> = ({ type = 'resource' }) => {
  const [location] = useLocation();
  const { isMobile } = useDeviceDetect();
  
  // 타입에 따라 적절한 카테고리 선택
  const categoriesToShow = type === 'service' ? serviceCategories : resourceCategories;

  // Steam/Tindie 스타일 네비게이션
  if (type === 'resource') {
    return (
      <div className="bg-slate-900 text-white border-b border-slate-700">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex overflow-x-auto no-scrollbar">
            {categoriesToShow.map((category) => {
              const isActive = location === category.href;
              
              return (
                <Link key={category.id} href={category.href}>
                  <div className={cn(
                    "px-4 py-2.5 flex items-center gap-2 text-sm whitespace-nowrap transition-colors relative",
                    isActive 
                      ? "text-blue-300 font-medium" 
                      : "text-slate-300 hover:text-white"
                  )}>
                    {/* Steam 스타일 액티브 인디케이터 */}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500"></div>
                    )}
                    <span className="hidden md:inline-flex">{category.icon}</span>
                    <span className={isMobile ? "text-xs" : ""}>{category.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 서비스용 사이드바 스타일 (기존 유지)
  return (
    <div className="bg-white">
      <div className="py-2">
        <div className="flex flex-col space-y-1">
          {categoriesToShow.map((category) => {
            const isActive = location === category.href;
            
            return (
              <Link key={category.id} href={category.href}>
                <div
                  className={cn(
                    "flex items-center px-4 py-2.5 text-sm font-medium border-l-2",
                    isActive 
                      ? "bg-blue-50 text-blue-700 border-l-blue-500" 
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 border-l-transparent"
                  )}
                >
                  <div className="w-6 h-6 flex items-center justify-center mr-3 text-slate-600">
                    {category.icon}
                  </div>
                  <span>{category.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;
