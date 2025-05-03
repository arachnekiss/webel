import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useDeviceDetect } from '@/lib/useDeviceDetect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CategoryNav from './CategoryNav';
import { useAuth } from '@/hooks/use-auth';
import { serviceItems } from './Sidebar';
import { useToast } from '@/hooks/use-toast';
import ScrollToTopLink from '@/components/ui/ScrollToTopLink';
import { 
  Search, 
  MenuIcon, 
  X, 
  ChevronDown,
  Layers, 
  Upload, 
  Code2, 
  Box, 
  FileText,
  Cpu,
  Gamepad2
} from 'lucide-react';

// 리소스 카테고리 아이템
const resourceCategories = [
  {
    id: 'hardware_design',
    label: '하드웨어 설계도',
    icon: <Upload className="h-4 w-4" />,
    href: '/resources/type/hardware_design'
  },
  {
    id: 'software',
    label: '소프트웨어 오픈소스',
    icon: <Code2 className="h-4 w-4" />,
    href: '/resources/type/software'
  },
  {
    id: 'ai_model',
    label: 'AI 모델',
    icon: <Cpu className="h-4 w-4" />,
    href: '/resources/type/ai_model'
  },
  {
    id: '3d_model',
    label: '3D 모델링 파일',
    icon: <Box className="h-4 w-4" />,
    href: '/resources/type/3d_model'
  },
  {
    id: 'free_content',
    label: '프리 콘텐츠',
    icon: <FileText className="h-4 w-4" />,
    href: '/resources/type/free_content'
  },
  {
    id: 'flash_game',
    label: '플래시 게임',
    icon: <Gamepad2 className="h-4 w-4" />,
    href: '/resources/type/flash_game'
  }
];

const Header: React.FC = () => {
  const [location, navigate] = useLocation();
  const { isMobile } = useDeviceDetect();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logoutMutation, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };
  
  const handleNavigate = (path: string) => {
    // 페이지 이동 후 메뉴 닫기
    if (isMobile) setIsMobileMenuOpen(false);
    
    // 스크롤을 맨 위로 이동
    window.scrollTo(0, 0);
    
    navigate(path); // wouter의 navigate 함수 사용
  };
  
  // 검색 처리 함수
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // 검색어가 없으면 아무 작업도 하지 않음
    if (!searchTerm.trim()) {
      return;
    }
    
    // 검색 결과 페이지로 이동
    handleNavigate(`/resources?search=${encodeURIComponent(searchTerm.trim())}`);
  };

  return (
    <header className="relative z-50 w-full">
      {/* 상단 헤더 - 로고, 검색, 로그인 */}
      <div className="bg-white border-b border-slate-100 py-3 md:py-3">
        <div className="container">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* 로고 영역 */}
            <div className="flex items-center">
              {/* Logo */}
              <ScrollToTopLink href="/">
                <div className="flex items-center space-x-2 cursor-pointer">
                  <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L4 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A1.002 1.002 0 0118 6v2a1 1 0 11-2 0v-.277l-.254.145a1 1 0 11-.992-1.736l.23-.132-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.58V12a1 1 0 11-2 0v-1.42l-1.246-.712a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.42l1.246.712a1 1 0 11-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1 1 0 01-.504.868l-1.75 1a1 1 0 11-.992-1.736L16 13.42V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01-.372-1.364z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-2xl font-bold text-primary">Webel</span>
                </div>
              </ScrollToTopLink>
            </div>
              
            {/* Search Bar - Desktop */}
            <div className="hidden md:block flex-1 mx-4" style={{ maxWidth: "800px" }}>
              <form onSubmit={handleSearch} className="flex items-center">
                <div className="relative flex-grow">
                  <Input 
                    type="text" 
                    placeholder="하드웨어, 소프트웨어, 3D 프린터 등을 검색하세요" 
                    className="w-full py-2 pr-3 pl-4 border border-slate-200 rounded-l-full bg-slate-50 focus:bg-white" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button 
                  type="submit"
                  variant="default" 
                  className="h-10 w-12 rounded-r-full bg-primary hover:bg-primary/90 flex items-center justify-center" 
                >
                  <Search className="h-5 w-5" />
                </Button>
              </form>
            </div>
            
            {/* 로그인/회원가입 또는 사용자 메뉴 */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="text-slate-600 font-medium">
                    {user.fullName || user.username}님
                  </div>
                  <Button 
                    variant="outline" 
                    className="border-slate-200 text-slate-600"
                    onClick={() => logoutMutation.mutate()}
                  >
                    로그아웃
                  </Button>
                  {isAdmin && (
                    <ScrollToTopLink href="/admin/dashboard">
                      <Button variant="secondary">관리자 대시보드</Button>
                    </ScrollToTopLink>
                  )}
                </div>
              ) : (
                <>
                  <ScrollToTopLink href="/login">
                    <div className="text-slate-600 hover:text-primary transition-colors cursor-pointer text-sm">로그인</div>
                  </ScrollToTopLink>
                  <ScrollToTopLink href="/register">
                    <div className="text-slate-600 hover:text-primary transition-colors cursor-pointer text-sm">회원가입</div>
                  </ScrollToTopLink>
                </>
              )}
              <ScrollToTopLink href="/sponsor">
                <Button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm">
                  Webel 후원하기
                </Button>
              </ScrollToTopLink>
            </div>
            
            {/* Mobile 메뉴 버튼 */}
            {isMobile && (
              <div className="flex items-center">
                <button 
                  className="ml-auto text-slate-500 hover:text-primary focus:outline-none" 
                  onClick={toggleMobileMenu}
                  aria-label="Toggle mobile menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <MenuIcon className="h-6 w-6" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 하단 헤더 - 네비게이션 메뉴 */}
      <div className="hidden md:block bg-white border-b border-slate-200 shadow-sm">
        <div className="container">
          <nav className="flex items-center justify-center py-2">
            <ScrollToTopLink href="/">
              <div className={`px-4 py-2 font-medium rounded-md cursor-pointer transition-colors ${location === '/' ? 'text-primary' : 'text-slate-600 hover:text-primary'}`}>
                홈
              </div>
            </ScrollToTopLink>
            
            <ScrollToTopLink href="/resources">
              <div className={`px-4 py-2 font-medium rounded-md cursor-pointer transition-colors ${location === '/resources' ? 'text-primary' : 'text-slate-600 hover:text-primary'}`}>
                <div className="flex items-center">
                  <Layers className="h-4 w-4 mr-1" />
                  모든 리소스
                </div>
              </div>
            </ScrollToTopLink>
            
            {/* 직접 리소스 카테고리 링크 (데스크탑) */}
            {resourceCategories.map(category => (
              <ScrollToTopLink key={category.id} href={category.href}>
                <div className={`flex items-center px-4 py-2 font-medium rounded-md cursor-pointer transition-colors ${
                  location === category.href || (category.href !== '/' && location.includes(category.href)) ? 'text-primary' : 'text-slate-600 hover:text-primary'
                }`}>
                  <span className="mr-1">{category.icon}</span>
                  <span>{category.label}</span>
                </div>
              </ScrollToTopLink>
            ))}
          </nav>
        </div>
      </div>
      
      {/* 모바일 메뉴 */}
      {isMobile && isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg z-50 border-b border-slate-200">
          <div className="p-4 space-y-4">
            {/* 검색창 */}
            <form onSubmit={handleSearch} className="flex items-center w-full">
              <div className="relative flex-grow">
                <Input 
                  type="text" 
                  placeholder="검색어를 입력하세요" 
                  className="w-full py-2 pr-3 pl-4 border border-slate-300 rounded-l-full" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button 
                type="submit"
                variant="default" 
                className="h-10 w-12 rounded-r-full bg-primary hover:bg-primary/90 flex items-center justify-center"
              >
                <Search className="h-5 w-5" />
              </Button>
            </form>
            
            {/* 메뉴 아이템 */}
            <nav className="space-y-3">
              <div 
                onClick={() => handleNavigate('/')}
                className={`block px-4 py-2 ${location === '/' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'} rounded cursor-pointer`}
              >
                홈
              </div>
              
              <div 
                onClick={() => handleNavigate('/resources')}
                className={`flex items-center px-4 py-2 ${
                  location === '/resources'
                  ? 'bg-primary/10 text-primary' 
                  : 'text-slate-600 hover:bg-slate-50'
                } rounded cursor-pointer`}
              >
                <span className="mr-2"><Layers className="h-4 w-4" /></span>
                <span>모든 리소스</span>
              </div>
              
              {/* 모바일용 리소스 카테고리 메뉴 */}
              {resourceCategories.map(category => (
                <div 
                  key={category.id}
                  onClick={() => handleNavigate(category.href)}
                  className={`flex items-center px-4 py-2 ${
                    location === category.href || (category.href !== '/' && location.includes(category.href)) 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-slate-600 hover:bg-slate-50'
                  } rounded cursor-pointer`}
                >
                  <span className="mr-2">{category.icon}</span>
                  <span>{category.label}</span>
                </div>
              ))}
              
              <div className="h-px bg-slate-100 my-2"></div>
              
              <div className="px-4 py-2 text-slate-800 font-semibold">
                서비스
              </div>
              
              {/* 모바일용 서비스 카테고리 메뉴 */}
              {serviceItems.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => handleNavigate(item.href)}
                  className={`flex items-center px-4 py-2 ${
                    location === item.href || (item.href !== '/' && location.includes(item.href)) 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-slate-600 hover:bg-slate-50'
                  } rounded cursor-pointer`}
                >
                  <span className="mr-2">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
              <div className="h-px bg-slate-100 my-2"></div>
              {user ? (
                <>
                  <div className="px-4 py-2 text-slate-600 font-medium">
                    {user.fullName || user.username}님
                  </div>
                  <div 
                    className="block px-4 py-2 text-slate-600 hover:bg-slate-50 rounded cursor-pointer"
                    onClick={() => {
                      logoutMutation.mutate();
                      if (isMobile) setIsMobileMenuOpen(false);
                    }}
                  >
                    로그아웃
                  </div>
                  {isAdmin && (
                    <div 
                      onClick={() => handleNavigate('/admin/dashboard')}
                      className="block px-4 py-2 bg-slate-200 text-slate-800 rounded cursor-pointer"
                    >
                      관리자 대시보드
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div 
                    onClick={() => handleNavigate('/login')}
                    className="block px-4 py-2 text-slate-600 hover:bg-slate-50 rounded cursor-pointer"
                  >
                    로그인
                  </div>
                  <div 
                    onClick={() => handleNavigate('/register')}
                    className="block px-4 py-2 text-slate-600 hover:bg-slate-50 rounded cursor-pointer"
                  >
                    회원가입
                  </div>
                </>
              )}
              <div 
                onClick={() => handleNavigate('/sponsor')}
                className="block px-4 py-2 bg-primary text-white rounded cursor-pointer"
              >
                Webel 후원하기
              </div>
            </nav>
          </div>
        </div>
      )}
      
      {/* 중복 제거: 카테고리 네비게이션은 Home.tsx에서 필요한 경우에만 추가 */}
    </header>
  );
};

export default Header;