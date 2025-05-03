import React, { useCallback } from 'react';
import { useLocation, Link as WouterLink } from 'wouter';

/**
 * 페이지 이동 시 스크롤을 강제로 상단으로 이동시키는 Link 컴포넌트
 * (기존 ScrollToTopLink를 대체합니다)
 */
interface TopLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

const TopLink: React.FC<TopLinkProps> = ({ 
  href, 
  children, 
  className,
  onClick,
  ...props 
}) => {
  const [, setLocation] = useLocation();
  
  // 스크롤을 처리하는 함수
  const scrollToTop = useCallback(() => {
    // 즉시 스크롤 초기화
    window.scrollTo(0, 0);
    
    // 추가 안전장치 (지연된 스크롤 복원)
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  }, []);

  // 클릭 처리 함수 - 속도 최적화
  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); // 기본 동작 방지
    
    // 위치 변경을 먼저 실행하여 빠르게 UI 전환
    setLocation(href);
    
    // 위치 변경 후 스크롤 초기화
    scrollToTop();
    
    // 사용자가 제공한 onClick 처리
    if (onClick) {
      onClick(e);
    }
  }, [href, onClick, scrollToTop, setLocation]);

  // 직접 <a> 태그를 사용하여 더 많은 제어권 확보
  return (
    <a
      href={href}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  );
};

export default TopLink;