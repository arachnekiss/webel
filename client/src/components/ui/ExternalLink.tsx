import React from 'react';
import { useLocation } from 'wouter';

interface ExternalLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  forceReload?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  showLoadingIndicator?: boolean;
}

/**
 * 확장된 링크 컴포넌트
 * forceReload가 true일 경우 페이지 전체 새로고침을 수행하는 링크를 생성
 */
const ExternalLink: React.FC<ExternalLinkProps> = ({
  href,
  children,
  className = '',
  activeClassName = 'active',
  forceReload = true,
  showLoadingIndicator = false,
  onClick
}) => {
  const [location] = useLocation();
  
  // 현재 위치와 링크 경로가 같은지 확인 (활성화 상태 표시용)
  const isActive = location === href || (href !== '/' && location.startsWith(href));
  
  // 링크 클릭 핸들러
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // 추가 onClick 핸들러가 있으면 먼저 실행
    if (onClick) {
      onClick(e);
    }

    // 기본 SPA 링크 동작 방지 및 전체 페이지 로드
    if (forceReload && !e.defaultPrevented) {
      e.preventDefault();
      
      // 로딩 인디케이터 표시 옵션이 켜져있으면 로딩 UI 표시
      if (showLoadingIndicator) {
        document.body.classList.add('page-transitioning');
      }
      
      // 약간의 딜레이 후 페이지 이동 - 로딩 UI가 표시될 시간을 주기 위함
      setTimeout(() => {
        window.location.href = href;
      }, 50);
    }
  };

  // a 태그 직접 사용 (wouter Link 대신)
  return (
    <a 
      href={href} 
      className={`${className} ${isActive ? activeClassName : ''}`}
      onClick={handleClick}
    >
      {children}
    </a>
  );
};

export default ExternalLink;