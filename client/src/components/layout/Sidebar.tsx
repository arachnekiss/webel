import React from 'react';
import { useLocation } from 'wouter';
import { 
  Printer, 
  Lightbulb, 
  Video, 
  Building2, 
  Heart
} from 'lucide-react';
import { Link } from 'wouter';
import { useDeviceDetect } from '@/lib/useDeviceDetect';

interface SidebarItemProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

// 서비스 카테고리
const serviceItems: SidebarItemProps[] = [
  {
    id: '3d_printer',
    label: '근처 3D 프린터',
    icon: <Printer className="h-5 w-5" />,
    href: '/services/3d_printing'
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
    href: '/services/manufacturers'
  },
  {
    id: 'sponsor',
    label: 'Webel 후원하기',
    icon: <Heart className="h-5 w-5" />,
    href: '/sponsor'
  }
];

const Sidebar: React.FC = () => {
  const [location] = useLocation();
  const { isMobile } = useDeviceDetect();
  
  if (isMobile) return null; // 모바일에서는 사이드바를 표시하지 않음
  
  return (
    <div className="hidden md:block w-56 bg-white border-r min-h-screen pt-6">
      <div className="px-4 mb-6">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">서비스</h2>
      </div>
      <nav className="space-y-1 px-2">
        {serviceItems.map((item) => {
          const isActive = location === item.href;
          
          return (
            <Link key={item.id} href={item.href}>
              <div
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                  isActive 
                    ? 'bg-blue-50 text-primary' 
                    : 'text-gray-600 hover:bg-gray-50'
                } cursor-pointer transition-colors`}
              >
                <div className="mr-3">
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;