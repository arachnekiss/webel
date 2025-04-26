import React from 'react';
import { Link, useLocation } from 'wouter';
import { useDeviceDetect } from '@/lib/useDeviceDetect';
import { 
  Printer, 
  Lightbulb, 
  Video, 
  Building2, 
  Upload, 
  Code2, 
  Box, 
  FileText 
} from 'lucide-react';

interface CategoryProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

const categories: CategoryProps[] = [
  {
    id: '3d_printer',
    label: '근처 3D 프린터',
    icon: <Printer className="h-6 w-6" />,
    href: '/services/3d_printing'
  },
  {
    id: 'ai_assistant',
    label: 'AI 조립 비서',
    icon: <Lightbulb className="h-6 w-6" />,
    href: '/ai-assembly'
  },
  {
    id: 'remote_support',
    label: '조립 원격 지원',
    icon: <Video className="h-6 w-6" />,
    href: '/remote-support'
  },
  {
    id: 'manufacturers',
    label: '생산업체 찾기',
    icon: <Building2 className="h-6 w-6" />,
    href: '/services/manufacturers'
  },
  {
    id: 'hardware_design',
    label: '하드웨어 설계도',
    icon: <Upload className="h-6 w-6" />,
    href: '/resources/hardware_design'
  },
  {
    id: 'software',
    label: '소프트웨어',
    icon: <Code2 className="h-6 w-6" />,
    href: '/resources/software'
  },
  {
    id: '3d_modeling',
    label: '3D 모델링',
    icon: <Box className="h-6 w-6" />,
    href: '/resources/3d_model'
  },
  {
    id: 'free_content',
    label: '프리 콘텐츠',
    icon: <FileText className="h-6 w-6" />,
    href: '/resources/free_content'
  }
];

const CategoryNav: React.FC = () => {
  const [location] = useLocation();
  const { isMobile } = useDeviceDetect();

  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto hide-scrollbar py-4 space-x-1 md:space-x-3 md:justify-center">
          {categories.map((category) => {
            const isActive = location === category.href;
            
            return (
              <Link key={category.id} href={category.href}>
                <a
                  className={`flex flex-col items-center px-3 py-2 text-sm font-medium rounded-lg ${
                    isActive 
                      ? 'bg-blue-50 text-primary' 
                      : 'text-gray-600 hover:bg-gray-50'
                  } flex-shrink-0`}
                >
                  {category.icon}
                  <span className={isMobile ? 'text-xs' : ''}>{category.label}</span>
                </a>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;
