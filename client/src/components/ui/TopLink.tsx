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
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * 전통적인 웹사이트 방식의 페이지 전환을 지원하는 링크
 * SPA 라우팅 대신 실제 페이지 이동과 같은 경험을 제공합니다.
 */
const TopLink: React.FC<TopLinkProps> = ({ 
  href, 
  children, 
  className,
  onClick,
  ...props 
}) => {
  const [location] = useLocation();
  
  // 현재 위치와 링크 경로가 같은지 확인 (활성화 상태 표시용)
  const isActive = location === href || (href !== '/' && location.includes(href));
  
  // rel="prefetch" 속성을 사용하여 링크 미리 로드
  // target="_self"를 사용하여 현재 창에서 이동 (SPA 동작을 유지하면서 새로운 로딩 경험 제공)
  return (
    <a
      href={href}
      className={`${className || ''} ${isActive ? 'active-link' : ''}`}
      onClick={onClick}
      rel="prefetch"
      {...props}
    >
      {children}
    </a>
  );
};

export default TopLink;