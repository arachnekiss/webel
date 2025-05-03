import React from 'react';
import { Link } from 'wouter';

/**
 * 페이지 이동 시 스크롤을 자동으로 상단으로 이동시키는 Link 컴포넌트
 */
interface ScrollToTopLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

const ScrollToTopLink: React.FC<ScrollToTopLinkProps> = ({ 
  href, 
  children, 
  className,
  onClick,
  ...props 
}) => {
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    // 클릭 시 window 스크롤 위치를 상단으로 이동
    window.scrollTo(0, 0);
    
    // 기존에 onClick prop이 있으면 실행
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <Link href={href}>
      <div
        className={`cursor-pointer ${className || ''}`}
        onClick={handleClick}
        {...props}
      >
        {children}
      </div>
    </Link>
  );
};

export default ScrollToTopLink;