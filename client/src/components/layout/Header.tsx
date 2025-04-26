import React, { useState } from 'react';
import { Link } from 'wouter';
import { useDeviceDetect } from '@/lib/useDeviceDetect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const Header = () => {
  const { isMobile } = useDeviceDetect();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L4 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A1.002 1.002 0 0118 6v2a1 1 0 11-2 0v-.277l-.254.145a1 1 0 11-.992-1.736l.23-.132-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.58V12a1 1 0 11-2 0v-1.42l-1.246-.712a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.42l1.246.712a1 1 0 11-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1 1 0 01-.504.868l-1.75 1a1 1 0 11-.992-1.736L16 13.42V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01-.372-1.364z" clipRule="evenodd"></path>
              </svg>
              <span className="text-2xl font-bold text-primary">Webel</span>
            </div>
          </Link>
          
          {/* Search Bar - Desktop */}
          {!isMobile && (
            <div className="hidden md:block flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Input 
                  type="text" 
                  placeholder="하드웨어, 소프트웨어, 3D 프린터 등을 검색하세요" 
                  className="w-full py-2 px-4 border border-gray-300 rounded-full" 
                />
                <Button 
                  variant="ghost" 
                  className="absolute right-1 top-0 h-full rounded-full" 
                  size="icon"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
          
          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/login">
              <div className="text-gray-600 hover:text-primary transition-colors cursor-pointer">로그인</div>
            </Link>
            <Link href="/register">
              <div className="text-gray-600 hover:text-primary transition-colors cursor-pointer">회원가입</div>
            </Link>
            <Link href="/sponsor">
              <Button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors">
                Webel 후원하기
              </Button>
            </Link>
          </nav>
          
          {/* Mobile Menu Button */}
          {isMobile && (
            <button 
              className="md:hidden text-gray-500 hover:text-primary focus:outline-none" 
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Search Bar - Mobile */}
        {isMobile && (
          <div className="md:hidden py-3">
            <div className="relative">
              <Input 
                type="text" 
                placeholder="검색" 
                className="w-full py-2 px-4 border border-gray-300 rounded-full" 
              />
              <Button 
                variant="ghost" 
                className="absolute right-1 top-0 h-full rounded-full" 
                size="icon"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Mobile Navigation Menu */}
        {isMobile && isMobileMenuOpen && (
          <nav className="md:hidden py-3 space-y-3">
            <Link href="/login">
              <div className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded cursor-pointer">로그인</div>
            </Link>
            <Link href="/register">
              <div className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded cursor-pointer">회원가입</div>
            </Link>
            <Link href="/sponsor">
              <div className="block px-4 py-2 bg-primary text-white rounded cursor-pointer">Webel 후원하기</div>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
