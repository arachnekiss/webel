import React from 'react';
import { Link, useLocation } from 'wouter';
import { useDeviceDetect } from '@/lib/useDeviceDetect';
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
  Layers,
  Cpu,
  Gamepad2,
  Home
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
    href: '/services/type/3d_printing'
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
    id: 'manufacturers',
    label: '생산업체 찾기',
    icon: <Building2 className="h-5 w-5" />,
    href: '/services/type/manufacturers'
  },
  {
    id: 'sponsor',
    label: 'Webel 후원하기',
    icon: <Heart className="h-5 w-5" />,
    href: '/sponsor'
  }
];

// 리소스 카테고리 (상단 네비게이션용)
const resourceCategories: CategoryProps[] = [
  {
    id: 'home',
    label: '홈',
    icon: <Home className="h-5 w-5" />,
    href: '/'
  },
  {
    id: 'all_resources',
    label: '전체 리소스',
    icon: <Layers className="h-5 w-5" />,
    href: '/resources'
  },
  {
    id: 'hardware_design',
    label: '하드웨어 설계도',
    icon: <Upload className="h-5 w-5" />,
    href: '/resources/type/hardware_design'
  },
  {
    id: 'software',
    label: '소프트웨어 오픈소스',
    icon: <Code2 className="h-5 w-5" />,
    href: '/resources/type/software'
  },
  {
    id: 'ai_model',
    label: '인공지능 모델',
    icon: <Cpu className="h-5 w-5" />,
    href: '/resources/type/ai_model'
  },
  {
    id: '3d_modeling',
    label: '3D 모델링 파일',
    icon: <Box className="h-5 w-5" />,
    href: '/resources/type/3d_model'
  },
  {
    id: 'free_content',
    label: '프리 콘텐츠',
    icon: <FileText className="h-5 w-5" />,
    href: '/resources/type/free_content'
  },
  {
    id: 'flash_game',
    label: '플래시 게임',
    icon: <Gamepad2 className="h-5 w-5" />,
    href: '/flash-games'
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

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="container mx-auto px-4">
        <div className={`flex overflow-x-auto hide-scrollbar py-3 space-x-1 md:space-x-1 ${type === 'resource' ? 'md:justify-center' : ''}`}>
          {categoriesToShow.map((category: CategoryProps) => {
            const isActive = location === category.href;
            
            return (
              <Link key={category.id} href={category.href}>
                <div
                  className={`flex ${type === 'service' ? 'flex-row' : 'flex-col'} items-center px-4 py-2 text-sm font-medium rounded-lg 
                    ${isActive 
                      ? 'bg-primary/5 text-primary border border-primary/20' 
                      : 'text-slate-600 hover:bg-slate-50 border border-transparent'}
                    flex-shrink-0 cursor-pointer transition-all duration-200`}
                >
                  <div className={`${isActive ? 'text-primary' : 'text-slate-500'} mb-1`}>
                    {category.icon}
                  </div>
                  <span className={`${type === 'service' ? 'ml-2' : ''} ${isMobile ? 'text-xs' : 'text-xs'}`}>
                    {category.label}
                  </span>
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
