import React from 'react';
import { useLocation } from 'wouter';

/**
 * 전통적인 웹사이트 방식의 페이지 전환을 위한 링크 컴포넌트
 * 이 컴포넌트는 SPA 방식이 아닌 실제 페이지 이동처럼 동작합니다.
 */
interface TopLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  prefetch?: boolean;
  showLoadingIndicator?: boolean;
}

/**
 * 전통적인 웹사이트 방식의 페이지 전환을 지원하는 링크
 * SPA 라우팅 대신 실제 페이지 이동과 같은 경험을 제공합니다.
 */
const TopLink: React.FC<TopLinkProps> = ({ 
  href, 
  children, 
  className = '',
  activeClassName = 'active-link',
  onClick,
  prefetch = true,
  showLoadingIndicator = false,
  ...props 
}) => {
  const [location] = useLocation();
  
  // 현재 위치와 링크 경로가 같은지 확인 (활성화 상태 표시용)
  const isActive = location === href || (href !== '/' && location.startsWith(href));
  
  // 클릭 핸들러
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // 사용자 정의 onClick 핸들러가 있으면 실행
    if (onClick) {
      onClick(event);
    }
    
    // 로딩 인디케이터 표시 옵션이 켜져있으면 로딩 UI 표시
    if (showLoadingIndicator && !event.defaultPrevented) {
      // 페이지 이동 전 로딩 인디케이터 표시를 위한 클래스 추가
      document.body.classList.add('page-transitioning');
      
      // 일정 시간 후에 페이지 이동이 완료되지 않았다면 로딩 클래스 제거
      setTimeout(() => {
        document.body.classList.remove('page-transitioning');
      }, 5000); // 5초 타임아웃
    }
  };
  
  return (
    <a
      href={href}
      className={`${className} ${isActive ? activeClassName : ''}`}
      onClick={handleClick}
      rel={prefetch ? "prefetch" : undefined}
      {...props}
    >
      {children}
    </a>
  );
};

export default TopLink;