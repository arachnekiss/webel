import React, { useState } from 'react';
import { Link } from 'wouter';
import { useDeviceDetect } from '@/lib/useDeviceDetect';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  User, 
  ShoppingCart, 
  Heart, 
  Menu, 
  Bell, 
  MessagesSquare,
  CircuitBoard
} from 'lucide-react';

const Header = () => {
  const { isMobile } = useDeviceDetect();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-slate-900 text-white">
      {/* Top Nav - Tindie/Steam style */}
      <div className="border-b border-slate-700">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="w-9 h-9 flex items-center justify-center bg-blue-600 rounded-lg">
                  <CircuitBoard className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Webel</span>
              </div>
            </Link>
            
            {/* Search Bar */}
            <div className={cn(
              "relative mx-4",
              isMobile ? "flex-1 max-w-xs" : "flex-1 max-w-xl"
            )}>
              <div className="relative flex items-center">
                <Search className="absolute left-3 h-5 w-5 text-slate-500" />
                <Input 
                  type="text" 
                  placeholder={isMobile ? "검색" : "하드웨어, 소프트웨어, 3D 프린터 등을 검색하세요"} 
                  className="w-full py-2 pl-10 pr-4 bg-slate-800 border-slate-700 focus:border-blue-500 text-white placeholder-slate-400 rounded-full" 
                />
              </div>
            </div>
            
            {/* Navigation - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/messages">
                <div className="w-9 h-9 flex items-center justify-center hover:bg-slate-800 rounded-full transition-colors">
                  <MessagesSquare className="h-5 w-5 text-slate-300" />
                </div>
              </Link>
              <Link href="/notifications">
                <div className="w-9 h-9 flex items-center justify-center hover:bg-slate-800 rounded-full transition-colors">
                  <Bell className="h-5 w-5 text-slate-300" />
                </div>
              </Link>
              <Link href="/wishlist">
                <div className="w-9 h-9 flex items-center justify-center hover:bg-slate-800 rounded-full transition-colors">
                  <Heart className="h-5 w-5 text-slate-300" />
                </div>
              </Link>
              <Link href="/cart">
                <div className="w-9 h-9 flex items-center justify-center hover:bg-slate-800 rounded-full transition-colors">
                  <ShoppingCart className="h-5 w-5 text-slate-300" />
                </div>
              </Link>
              <div className="h-6 border-l border-slate-700"></div>
              <Link href="/login">
                <div className="flex items-center hover:text-blue-400 transition-colors">
                  <User className="h-5 w-5 mr-1.5" />
                  <span className="text-sm font-medium">로그인</span>
                </div>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm h-8">
                  가입하기
                </Button>
              </Link>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <Link href="/cart">
                <div className="w-9 h-9 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-slate-300" />
                </div>
              </Link>
              <button 
                className="ml-2 w-9 h-9 flex items-center justify-center" 
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
              >
                <Menu className="h-6 w-6 text-slate-300" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {isMobile && isMobileMenuOpen && (
        <div className="md:hidden border-b border-slate-700">
          <nav className="max-w-screen-xl mx-auto px-4 py-3 space-y-2">
            <Link href="/login">
              <div className="flex items-center px-4 py-2 hover:bg-slate-800 rounded">
                <User className="h-5 w-5 mr-3 text-slate-400" />
                <span>로그인 / 가입하기</span>
              </div>
            </Link>
            <Link href="/notifications">
              <div className="flex items-center px-4 py-2 hover:bg-slate-800 rounded">
                <Bell className="h-5 w-5 mr-3 text-slate-400" />
                <span>알림</span>
              </div>
            </Link>
            <Link href="/wishlist">
              <div className="flex items-center px-4 py-2 hover:bg-slate-800 rounded">
                <Heart className="h-5 w-5 mr-3 text-slate-400" />
                <span>찜 목록</span>
              </div>
            </Link>
            <Link href="/messages">
              <div className="flex items-center px-4 py-2 hover:bg-slate-800 rounded">
                <MessagesSquare className="h-5 w-5 mr-3 text-slate-400" />
                <span>메시지</span>
              </div>
            </Link>
            <Link href="/sponsor">
              <div className="flex items-center px-4 py-2 text-blue-400 hover:bg-slate-800 rounded">
                <Heart className="h-5 w-5 mr-3 fill-blue-400" />
                <span>Webel 후원하기</span>
              </div>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
