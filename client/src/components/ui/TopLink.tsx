import React from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * 전통적인 웹사이트 방식의 페이지 전환을 위한 링크 컴포넌트
 * 이 컴포넌트는 SPA 방식이 아닌 실제 페이지 이동처럼 동작합니다.
 * 현재 언어에 따라 URL을 자동으로 변환합니다.
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
  const { formatUrl } = useLanguage();
  
  // 현재 위치와 링크 경로가 같은지 확인 (활성화 상태 표시용)
  const isActive = location === href || (href !== '/' && location.startsWith(href));
  
  // 클릭 핸들러
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // 외부 링크인 경우 기본 동작 허용
    const isExternalLink = href.startsWith('http://') || href.startsWith('https://');
    
    // 사용자 정의 onClick 핸들러가 있으면 실행
    if (onClick) {
      onClick(event);
      if (event.defaultPrevented) {
        return;
      }
    }
    
    // 로딩 인디케이터 표시가 켜져 있으면 로딩 UI 표시
    if (showLoadingIndicator) {
      document.body.classList.add('page-transitioning');
    }
    
    // 페이지 이동 시 스크롤 맨 위로 이동
    window.scrollTo(0, 0);
    
    // 외부 링크거나 강제 리로드가 아닌 경우 기본 동작 허용
    if (isExternalLink || !forceReload) {
      return;
    }
    
    // 내부 링크에서 강제 리로드가 설정된 경우
    if (forceReload) {
      // 기본 이벤트를 방지하고 window.location으로 페이지 이동
      event.preventDefault();
      
      // URL을 현재 언어에 맞게 변환
      const formattedUrl = isExternalLink ? href : formatUrl(href);
      
      // 짧은 딜레이 후 페이지 이동 (로딩 인디케이터가 표시될 수 있도록)
      setTimeout(() => {
        window.location.href = formattedUrl;
      }, 10);
      
      return false;
    }
    
    // 브라우저 캐시로 인한 이슈 해결을 위한 안전 장치
    setTimeout(() => {
      document.body.classList.remove('page-transitioning');
    }, 1000);
  };
  
  // 외부 링크가 아닌 경우 언어에 따라 URL 변환
  const formattedHref = href.startsWith('http://') || href.startsWith('https://') ? href : formatUrl(href);
  
  return (
    <a
      href={formattedHref}
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