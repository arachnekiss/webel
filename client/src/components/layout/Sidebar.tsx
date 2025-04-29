import React from 'react';
import { useLocation } from 'wouter';
import { 
  Printer, 
  Lightbulb, 
  Video, 
  Building2, 
  Heart,
  GanttChart,
  Wrench
} from 'lucide-react';
import { Link } from 'wouter';
import { useDeviceDetect } from '@/lib/useDeviceDetect';
import { useAuth } from '@/hooks/use-auth';

// 모든 컴포넌트에서 접근할 수 있도록 타입과 항목을 export
export interface SidebarItemProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

// 서비스 카테고리
export const serviceItems: SidebarItemProps[] = [
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
    id: 'engineers',
    label: '엔지니어 찾기',
    icon: <Wrench className="h-5 w-5" />,
    href: '/services/type/engineer'
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

const Sidebar: React.FC = () => {
  const [location] = useLocation();
  const { isMobile } = useDeviceDetect();
  const { isAdmin } = useAuth();
  
  if (isMobile) return null; // 모바일에서는 사이드바를 표시하지 않음
  
  return (
    <aside className="hidden md:block w-full py-4 rounded-xl">
      <div className="px-6">
        <h2 className="text-lg font-bold text-slate-800">서비스</h2>
        <p className="text-slate-500 text-sm mt-1">하드웨어 및 조립 관련 서비스</p>
        <div className="mt-3 h-px bg-gradient-to-r from-primary/20 to-transparent"></div>
      </div>
      
      <nav className="px-4 py-4">
        {serviceItems.map((item) => {
          const isActive = location === item.href || (item.href !== '/' && location.startsWith(item.href));
          
          return (
            <Link key={item.id} href={item.href}>
              <div
                className={`flex items-center px-4 py-3 my-1 rounded-lg text-sm ${
                  isActive 
                    ? 'bg-primary/5 text-primary font-medium' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-primary'
                } cursor-pointer transition-all`}
              >
                <div className={`mr-3 transition-transform duration-300 ${isActive ? 'text-primary scale-110' : 'text-slate-500'}`}>
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
        
        {/* 관리자 메뉴 */}
        {isAdmin && (
          <>
            <div className="mt-6 mb-3 px-4">
              <div className="h-px bg-slate-200"></div>
              <h3 className="text-sm font-semibold text-slate-800 mt-3">관리자 메뉴</h3>
            </div>
            <Link href="/admin/dashboard">
              <div className={`flex items-center px-4 py-3 my-1 rounded-lg text-sm ${
                location === '/admin/dashboard' 
                  ? 'bg-primary/5 text-primary font-medium' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-primary'
              } cursor-pointer transition-all`}>
                <div className={`mr-3 transition-transform duration-300 ${location === '/admin/dashboard' ? 'text-primary scale-110' : 'text-slate-500'}`}>
                  <GanttChart className="h-5 w-5" />
                </div>
                <span>관리자 대시보드</span>
              </div>
            </Link>
          </>
        )}
      </nav>
      
      <div className="px-6 mt-2 space-y-4">
        <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
          <h3 className="font-medium text-slate-800 mb-2">3D 프린팅 시작하기</h3>
          <p className="text-sm text-slate-600 mb-3">가까운 3D 프린터를 활용하여 디자인을 현실로 만들어보세요.</p>
          <Link href="/services/type/3d_printing">
            <div className="text-primary text-sm font-medium hover:underline">서비스 찾기 →</div>
          </Link>
        </div>
        
        <div className="p-5 rounded-xl bg-gradient-to-br from-green-50 to-teal-50 border border-green-100">
          <h3 className="font-medium text-slate-800 mb-2">내 프린터 등록하기</h3>
          <p className="text-sm text-slate-600 mb-3">보유하신 3D 프린터로 서비스를 제공하고 수익을 창출하세요.</p>
          <Link href="/register-printer">
            <div className="text-primary text-sm font-medium hover:underline">프린터 등록하기 →</div>
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;