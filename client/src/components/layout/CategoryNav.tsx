import React from 'react';
import { useLocation } from 'wouter';
import { useDeviceDetect } from '@/lib/useDeviceDetect';
import { useLanguage } from '@/contexts/LanguageContext';
import TopLink from '@/components/ui/TopLink';
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
  labelKey: string; // 번역 키
  icon: React.ReactNode;
  href: string;
}

// 서비스 카테고리 (사이드바용)
const serviceCategories: CategoryProps[] = [
  {
    id: '3d_printer',
    labelKey: 'nav.3d_printer',
    icon: <Printer className="h-5 w-5" />,
    href: '/services/type/3d_printing'
  },
  {
    id: 'ai_assistant',
    labelKey: 'nav.ai_assistant',
    icon: <Lightbulb className="h-5 w-5" />,
    href: '/ai-assembly'
  },
  {
    id: 'remote_support',
    labelKey: 'nav.remote_support',
    icon: <Video className="h-5 w-5" />,
    href: '/remote-support'
  },
  {
    id: 'manufacturers',
    labelKey: 'nav.manufacturers',
    icon: <Building2 className="h-5 w-5" />,
    href: '/services/type/manufacturing'
  },
  {
    id: 'sponsor',
    labelKey: 'nav.sponsor',
    icon: <Heart className="h-5 w-5" />,
    href: '/sponsor'
  }
];

// 리소스 카테고리 (상단 네비게이션용)
const resourceCategories: CategoryProps[] = [
  {
    id: 'home',
    labelKey: 'nav.home',
    icon: <Home className="h-5 w-5" />,
    href: '/'
  },
  {
    id: 'all_resources',
    labelKey: 'nav.all_resources',
    icon: <Layers className="h-5 w-5" />,
    href: '/resources'
  },
  {
    id: 'hardware_design',
    labelKey: 'nav.hardware_design',
    icon: <Upload className="h-5 w-5" />,
    href: '/resources/type/hardware_design'
  },
  {
    id: 'software',
    labelKey: 'nav.software',
    icon: <Code2 className="h-5 w-5" />,
    href: '/resources/type/software'
  },
  {
    id: 'ai_model',
    labelKey: 'nav.ai_model',
    icon: <Cpu className="h-5 w-5" />,
    href: '/resources/type/ai_model'
  },
  {
    id: '3d_modeling',
    labelKey: 'nav.modeling_file',
    icon: <Box className="h-5 w-5" />,
    href: '/resources/type/3d_model'
  },
  {
    id: 'free_content',
    labelKey: 'nav.free_content',
    icon: <FileText className="h-5 w-5" />,
    href: '/resources/type/free_content'
  },
  {
    id: 'flash_game',
    labelKey: 'nav.flash_game',
    icon: <Gamepad2 className="h-5 w-5" />,
    href: '/resources/type/flash_game'
  }
];

interface CategoryNavProps {
  type: 'service' | 'resource';
}

// 기본값을 제공하는 컴포넌트
const CategoryNav: React.FC<Partial<CategoryNavProps>> = ({ type = 'resource' }) => {
  const [location] = useLocation();
  const { isMobile } = useDeviceDetect();
  const { t, formatUrl } = useLanguage();
  
  // 타입에 따라 적절한 카테고리 선택
  const categoriesToShow = type === 'service' ? serviceCategories : resourceCategories;

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="container mx-auto px-4">
        <div className={`flex overflow-x-auto hide-scrollbar py-3 space-x-1 md:space-x-1 ${type === 'resource' ? 'md:justify-center' : ''}`}>
          {categoriesToShow.map((category: CategoryProps) => {
            const isActive = location === category.href;
            
            return (
              <TopLink
                key={category.id}
                href={formatUrl(category.href)}
                showLoadingIndicator={true}
                onClick={(e) => {
                  // 클릭 시 페이지 전환 효과
                  document.body.classList.add('page-transitioning');
                }}
              >
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
                    {t(category.labelKey)}
                  </span>
                </div>
              </TopLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;
