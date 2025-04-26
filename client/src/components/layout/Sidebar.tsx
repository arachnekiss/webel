import React from 'react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { 
  Printer, 
  Lightbulb, 
  Video, 
  Building2, 
  Heart,
  CircuitBoard,
  Hammer,
  PanelLeft,
  ShoppingCart,
  Wrench,
  Star,
  Truck
} from 'lucide-react';
import { Link } from 'wouter';
import { useDeviceDetect } from '@/lib/useDeviceDetect';

interface SidebarItemProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  count?: number;
}

interface SidebarSectionProps {
  title: string;
  items: SidebarItemProps[];
}

// 서비스 카테고리
const categories: SidebarSectionProps[] = [
  {
    title: '서비스 검색',
    items: [
      {
        id: '3d_printer',
        label: '3D 프린팅 서비스',
        icon: <Printer className="h-4 w-4" />,
        href: '/services/3d_printing',
        count: 28
      },
      {
        id: 'electronics',
        label: '전자제품 제작/수리',
        icon: <CircuitBoard className="h-4 w-4" />,
        href: '/services/electronics',
        count: 14
      },
      {
        id: 'woodworking',
        label: '목공 서비스',
        icon: <Hammer className="h-4 w-4" />,
        href: '/services/woodworking',
        count: 9
      },
      {
        id: 'metalworking',
        label: '금속가공',
        icon: <PanelLeft className="h-4 w-4" />,
        href: '/services/metalworking',
        count: 12
      },
      {
        id: 'manufacturing',
        label: '대량생산 업체',
        icon: <Truck className="h-4 w-4" />,
        href: '/services/manufacturing',
        count: 6
      }
    ]
  },
  {
    title: '서비스 요청',
    items: [
      {
        id: 'request_service',
        label: '제작 견적 요청하기',
        icon: <ShoppingCart className="h-4 w-4" />,
        href: '/auctions'
      }
    ]
  },
  {
    title: '지원 서비스',
    items: [
      {
        id: 'ai_assistant',
        label: 'AI 조립 도우미',
        icon: <Lightbulb className="h-4 w-4" />,
        href: '/ai-assembly'
      },
      {
        id: 'remote_support',
        label: '실시간 원격 지원',
        icon: <Video className="h-4 w-4" />,
        href: '/remote-support'
      },
      {
        id: 'repair',
        label: '수리 서비스',
        icon: <Wrench className="h-4 w-4" />,
        href: '/services/repair'
      }
    ]
  },
  {
    title: '추천',
    items: [
      {
        id: 'featured',
        label: '추천 서비스 제공자',
        icon: <Star className="h-4 w-4" />,
        href: '/services/featured',
        count: 5
      },
      {
        id: 'sponsor',
        label: 'Webel 후원하기',
        icon: <Heart className="h-4 w-4" />,
        href: '/sponsor'
      }
    ]
  }
];

const Sidebar: React.FC = () => {
  const [location] = useLocation();
  const { isMobile } = useDeviceDetect();
  
  if (isMobile) return null; // 모바일에서는 사이드바를 표시하지 않음
  
  return (
    <div className="h-full bg-slate-100 border-r border-slate-200 pt-4 overflow-y-auto no-scrollbar w-full">
      {categories.map((section, sectionIndex) => (
        <div key={sectionIndex} className="px-4 mb-6">
          <h2 className="ml-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            {section.title}
          </h2>
          <nav>
            {section.items.map((item) => {
              const isActive = location === item.href;
              
              return (
                <Link key={item.id} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2 text-sm mb-1 cursor-pointer transition-colors",
                      isActive 
                        ? "bg-blue-50 text-blue-700 font-medium" 
                        : "text-slate-700 hover:bg-slate-200/70 hover:text-slate-900"
                    )}
                  >
                    <div className="flex items-center">
                      <div className={cn(
                        "w-6 h-6 flex items-center justify-center mr-2.5",
                        isActive ? "text-blue-600" : "text-slate-500"
                      )}>
                        {item.icon}
                      </div>
                      <span>{item.label}</span>
                    </div>
                    
                    {item.count !== undefined && (
                      <div className={cn(
                        "text-xs rounded-full py-0.5 px-2", 
                        isActive 
                          ? "bg-blue-100 text-blue-800" 
                          : "bg-slate-200 text-slate-600"
                      )}>
                        {item.count}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;