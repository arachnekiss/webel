import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Printer, 
  Lightbulb, 
  Video, 
  Building2, 
  Heart,
  MapPin,
  Wrench,
  ChevronRight,
  ShoppingBag,
  Users,
  RotateCcw,
  Newspaper,
  Map
} from 'lucide-react';
import { Link } from 'wouter';
import { useDeviceDetect } from '@/lib/useDeviceDetect';

// 서비스 카테고리
const serviceItems = [
  {
    id: 'printing_services',
    label: '프린팅 서비스',
    icon: <Printer className="h-5 w-5" />,
    href: '/services',
    subItems: [
      { id: '3d_printing', label: '3D 프린팅', href: '/services/3d_printing' },
      { id: 'electronics', label: '전자부품 제작', href: '/services/electronics' },
      { id: 'woodworking', label: '목공예', href: '/services/woodworking' },
      { id: 'metalworking', label: '금속공예', href: '/services/metalworking' },
      { id: 'manufacturing', label: '제조업', href: '/services/manufacturing' }
    ]
  },
  {
    id: 'nearby_services',
    label: '내 주변 서비스',
    icon: <MapPin className="h-5 w-5" />,
    href: '/services/nearby',
    badge: 'HOT'
  },
  {
    id: 'ai_assistant',
    label: 'AI 조립 비서',
    icon: <Lightbulb className="h-5 w-5" />,
    href: '/ai-assembly',
    badge: 'NEW'
  },
  {
    id: 'remote_support',
    label: '원격 조립 지원',
    icon: <Video className="h-5 w-5" />,
    href: '/remote-support'
  },
  {
    id: 'tools',
    label: '공구 대여 서비스',
    icon: <Wrench className="h-5 w-5" />,
    href: '/services/tools'
  },
  {
    id: 'auctions',
    label: '경매',
    icon: <ShoppingBag className="h-5 w-5" />,
    href: '/auctions'
  },
  {
    id: 'manufacturers',
    label: '생산업체 찾기',
    icon: <Building2 className="h-5 w-5" />,
    href: '/services/manufacturers'
  }
];

// 추가 카테고리
const additionalItems = [
  {
    id: 'community',
    label: '커뮤니티',
    icon: <Users className="h-5 w-5" />,
    href: '/community',
  },
  {
    id: 'recycling',
    label: '재활용 센터',
    icon: <RotateCcw className="h-5 w-5" />,
    href: '/recycling',
  },
  {
    id: 'news',
    label: '제작 뉴스',
    icon: <Newspaper className="h-5 w-5" />,
    href: '/news',
  },
  {
    id: 'sponsor',
    label: 'Webel 후원하기',
    icon: <Heart className="h-5 w-5" />,
    href: '/sponsor'
  }
];

const Sidebar = () => {
  const [location] = useLocation();
  const { isMobile } = useDeviceDetect();
  const [expandedItems, setExpandedItems] = useState({
    printing_services: true
  });
  
  // 카테고리 확장/축소 토글
  const toggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  return (
    <div className="pt-2 pb-6 overflow-y-auto max-h-screen no-scrollbar">
      {/* 서비스 카테고리 */}
      <div className="px-4 mb-4">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider px-4 py-2">서비스</h2>
      </div>
      
      <nav className="space-y-0.5">
        {serviceItems.map((item) => {
          const isActive = location === item.href || 
            (item.subItems && item.subItems.some(sub => location === sub.href));
          const isExpanded = expandedItems[item.id];
          
          return (
            <div key={item.id}>
              {/* 메인 아이템 */}
              {item.subItems ? (
                <div 
                  className={`flex items-center justify-between px-4 py-2.5 mx-2 rounded-md cursor-pointer transition-colors
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => toggleExpand(item.id)}
                >
                  <div className="flex items-center">
                    <div className={`mr-3 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                      {item.icon}
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <span className={`ml-2 px-1.5 py-0.5 text-xs font-medium rounded 
                        ${item.badge === 'NEW' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <ChevronRight 
                    className={`h-4 w-4 text-gray-400 transform transition-transform duration-200 
                      ${isExpanded ? 'rotate-90' : ''}`} 
                  />
                </div>
              ) : (
                <Link href={item.href}>
                  <div 
                    className={`flex items-center px-4 py-2.5 mx-2 rounded-md cursor-pointer transition-colors
                      ${isActive 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <div className={`mr-3 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                      {item.icon}
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <span className={`ml-2 px-1.5 py-0.5 text-xs font-medium rounded 
                        ${item.badge === 'NEW' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              )}
              
              {/* 서브 아이템 */}
              {item.subItems && isExpanded && (
                <div className="mt-1 ml-10 pl-2 border-l border-gray-200 space-y-1">
                  {item.subItems.map(subItem => {
                    const isSubActive = location === subItem.href;
                    
                    return (
                      <Link href={subItem.href} key={subItem.id}>
                        <div 
                          className={`py-1.5 pl-4 text-sm rounded-md cursor-pointer 
                            ${isSubActive 
                              ? 'text-blue-700 font-medium' 
                              : 'text-gray-600 hover:text-gray-900'}`}
                        >
                          {subItem.label}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      
      {/* 추가 카테고리 */}
      <div className="mt-6">
        <div className="px-4 mb-2">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider px-4 py-2">더 보기</h2>
        </div>
        
        <nav className="space-y-0.5">
          {additionalItems.map((item) => {
            const isActive = location === item.href;
            
            return (
              <Link key={item.id} href={item.href}>
                <div 
                  className={`flex items-center px-4 py-2.5 mx-2 rounded-md cursor-pointer transition-colors
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <div className={`mr-3 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* 지역 지도 */}
      <div className="mt-6 px-6">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center mb-2">
            <Map className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-sm font-medium text-gray-800">근처 제작소 지도</h3>
          </div>
          <p className="text-xs text-gray-600 mb-3">현재 위치 주변의 모든 3D 프린터, 공구, 작업장을 찾아보세요</p>
          <Link href="/services/map">
            <div className="text-xs bg-blue-600 text-white py-2 px-3 rounded text-center cursor-pointer hover:bg-blue-700 transition-colors">
              지도 보기
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;