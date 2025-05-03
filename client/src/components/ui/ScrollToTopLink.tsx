import React, { useCallback } from 'react';
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
  // 스크롤을 최상단으로 올리는 함수
  const scrollToTop = useCallback(() => {
    // setTimeout을 충분히 길게 주어 DOM 업데이트 후 스크롤이 이동하도록 함
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto'
      });
    }, 100);
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    // 클릭 후 스크롤 이동
    scrollToTop();
    
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