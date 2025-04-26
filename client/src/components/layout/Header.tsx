import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useDeviceDetect } from '@/lib/useDeviceDetect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  ChevronDown, 
  User, 
  ShoppingCart, 
  Bell, 
  Menu, 
  Heart,
  HardDrive,
  Code,
  Brain,
  Box,
  File,
  Gamepad
} from 'lucide-react';


// 리소스 카테고리 정의 - 원하는 순서로
const resourceCategories = [
  { id: 'hardware_design', label: '하드웨어 설계도', icon: <HardDrive className="h-4 w-4 mr-2" />, href: '/resources/hardware_design' },
  { id: 'software', label: '소프트웨어 오픈소스', icon: <Code className="h-4 w-4 mr-2" />, href: '/resources/software' },
  { id: 'ai_model', label: 'AI 모델', icon: <Brain className="h-4 w-4 mr-2" />, href: '/resources/ai_model' },
  { id: '3d_model', label: '3D 모델링', icon: <Box className="h-4 w-4 mr-2" />, href: '/resources/3d_model' },
  { id: 'free_content', label: '프리 콘텐츠', icon: <File className="h-4 w-4 mr-2" />, href: '/resources/free_content' },
  { id: 'flash_game', label: '플래시 게임', icon: <Gamepad className="h-4 w-4 mr-2" />, href: '/resources/flash_game' }
];

const Header = () => {
  const { isMobile } = useDeviceDetect();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50">
      {/* 상단 바 - 로고, 검색, 사용자 메뉴 */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-800 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 lg:py-2">
          <div className="flex items-center justify-between">
            {/* 로고 */}
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L4 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A1.002 1.002 0 0118 6v2a1 1 0 11-2 0v-.277l-.254.145a1 1 0 11-.992-1.736l.23-.132-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.58V12a1 1 0 11-2 0v-1.42l-1.246-.712a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.42l1.246.712a1 1 0 11-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1 1 0 01-.504.868l-1.75 1a1 1 0 11-.992-1.736L16 13.42V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01-.372-1.364z" clipRule="evenodd"></path>
                </svg>
                <span className="text-xl font-bold text-white">Webel</span>
              </div>
            </Link>
            
            {/* 검색바 - 데스크탑 */}
            <div className="hidden lg:block flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Input 
                  type="text" 
                  placeholder="하드웨어, 소프트웨어, 3D 프린터 등을 검색하세요" 
                  className="w-full py-2 px-4 bg-blue-600 border border-blue-500 text-white rounded placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400" 
                />
                <Button 
                  variant="ghost" 
                  className="absolute right-1 top-0 h-full rounded text-blue-200 hover:text-white hover:bg-blue-700" 
                  size="icon"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* 네비게이션 아이콘 - 데스크탑 */}
            <nav className="hidden md:flex items-center space-x-4">
              <Link href="/wishlist">
                <Button variant="ghost" className="text-white hover:bg-blue-600" size="icon">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/cart">
                <Button variant="ghost" className="text-white hover:bg-blue-600" size="icon">
                  <ShoppingCart className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/notifications">
                <Button variant="ghost" className="text-white hover:bg-blue-600" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
              </Link>
              
              <div className="flex items-center border-l border-blue-600 pl-4 ml-2">
                <Link href="/login">
                  <Button variant="ghost" className="flex items-center text-white space-x-1 hover:bg-blue-600">
                    <User className="h-5 w-5 mr-1" />
                    <span>로그인</span>
                  </Button>
                </Link>
              </div>
              
              <Link href="/sponsor">
                <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-medium hover:from-orange-600 hover:to-yellow-600 border-0 shadow-md">
                  Webel 후원하기
                </Button>
              </Link>
            </nav>
            
            {/* 모바일 메뉴 버튼 */}
            {isMobile && (
              <button 
                className="md:hidden text-white hover:bg-blue-600 p-2 rounded-md focus:outline-none" 
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            )}
          </div>
          
          {/* 모바일 검색바 */}
          {isMobile && (
            <div className="mt-3 md:hidden">
              <div className="relative">
                <Input 
                  type="text" 
                  placeholder="검색" 
                  className="w-full py-2 px-4 bg-blue-600 border border-blue-500 text-white rounded placeholder-blue-300" 
                />
                <Button 
                  variant="ghost" 
                  className="absolute right-1 top-0 h-full rounded text-blue-200" 
                  size="icon"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 카테고리 내비게이션 바 */}
      <div className="bg-white shadow">
        <div className="container mx-auto overflow-x-auto px-4">
          <div className="flex items-center h-12 space-x-8">
            {resourceCategories.map((category) => (
              <Link key={category.id} href={category.href}>
                <div 
                  className={`flex items-center whitespace-nowrap py-3 border-b-2 font-medium text-sm cursor-pointer transition-colors
                    ${location === category.href 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-gray-600 hover:text-blue-500 hover:border-blue-300'}`}
                >
                  {category.icon}
                  {category.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      {/* 모바일 네비게이션 메뉴 */}
      {isMobile && isMobileMenuOpen && (
        <nav className="md:hidden py-3 bg-white shadow-lg border-t border-gray-200">
          <div className="space-y-1 px-4">
            <Link href="/login">
              <div className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded cursor-pointer flex items-center">
                <User className="h-5 w-5 mr-2" />
                로그인
              </div>
            </Link>
            <Link href="/register">
              <div className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded cursor-pointer flex items-center">
                <User className="h-5 w-5 mr-2" />
                회원가입
              </div>
            </Link>
            <Link href="/wishlist">
              <div className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded cursor-pointer flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                관심 목록
              </div>
            </Link>
            <Link href="/cart">
              <div className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded cursor-pointer flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                장바구니
              </div>
            </Link>
            <Link href="/sponsor">
              <div className="block px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded cursor-pointer flex items-center">
                Webel 후원하기
              </div>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
