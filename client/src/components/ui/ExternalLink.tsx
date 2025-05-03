import React from 'react';
import { Link as WouterLink } from 'wouter';

interface ExternalLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  forceReload?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * 확장된 링크 컴포넌트
 * forceReload가 true일 경우 페이지 전체 새로고침을 수행하는 링크를 생성
 */
const ExternalLink: React.FC<ExternalLinkProps> = ({
  href,
  children,
  className = '',
  activeClassName = '',
  forceReload = true,
  onClick
}) => {
  // 링크 클릭 핸들러
  const handleClick = (e: React.MouseEvent) => {
    // 추가 onClick 핸들러가 있으면 먼저 실행
    if (onClick) {
      onClick(e);
    }

    // 기본 SPA 링크 동작 방지 및 전체 페이지 로드
    if (forceReload) {
      e.preventDefault();
      window.location.href = href;
    }
  };

  // 기존 wouter Link 사용, 단 forceReload가 true일 경우 onClick으로 페이지 이동 처리
  return (
    <WouterLink 
      href={href} 
      className={className} 
      activeClass={activeClassName}
      onClick={handleClick}
    >
      {children}
    </WouterLink>
  );
};

export default ExternalLink;