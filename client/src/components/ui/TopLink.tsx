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
  forceReload?: boolean;
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
  forceReload = true, // 기본값으로 페이지 새로고침 활성화
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
    
    // 새로운 페이지를 로드하도록 설정된 경우
    if (forceReload && !event.defaultPrevented) {
      // 기본 이벤트를 방지하고 window.location을 통해 페이지 전체 로드
      event.preventDefault();
      
      // 로딩 인디케이터 표시 옵션이 켜져있으면 로딩 UI 표시
      if (showLoadingIndicator) {
        // 페이지 이동 전 로딩 인디케이터 표시를 위한 클래스 추가
        document.body.classList.add('page-transitioning');
      }
      
      // 페이지 이동 시 스크롤을 맨 위로 이동 (딜레이 없이 즉시 실행)
      window.scrollTo(0, 0);
      
      // 페이지 이동 즉시 실행 (딜레이 제거)
      window.location.href = href;
      
      return false;
    }
    
    // forceReload가 false이거나 이미 event.preventDefault()가 호출된 경우
    if (showLoadingIndicator && !event.defaultPrevented) {
      // 페이지 이동 전 로딩 인디케이터 표시를 위한 클래스 추가
      document.body.classList.add('page-transitioning');
      
      // 페이지 이동 시 스크롤을 맨 위로 이동
      window.scrollTo(0, 0);
      
      // 페이지 이동이 너무 오래 걸리는 경우를 위한 안전 장치 (훨씬 짧은 타임아웃)
      setTimeout(() => {
        document.body.classList.remove('page-transitioning');
      }, 1500); // 1.5초로 대폭 감소
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