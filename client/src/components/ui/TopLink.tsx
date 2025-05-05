import React from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { language, translateUrl } = useLanguage();
  
  // 링크 경로에 현재 언어 접두사 추가
  const localizedHref = translateUrl(href);
  
  // 디버깅 목적으로 경로 변환 로깅
  console.log(`[TopLink] Original: ${href}, Localized: ${localizedHref}`);
  
  // 현재 위치와 링크 경로가 같은지 확인 (활성화 상태 표시용)
  const isActive = location === localizedHref || (localizedHref !== '/' && location.startsWith(localizedHref));
  
  // SPA 네비게이션을 위한 navigate 함수 가져오기
  const [, navigate] = useLocation();
  
  // 클릭 핸들러 - SPA 방식으로 처리 개선
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
    
    // 외부 링크인 경우 기본 동작 허용
    if (isExternalLink) {
      return;
    }
    
    // 내부 링크에 대한 SPA 방식 처리
    event.preventDefault();
    
    // 현재 language 상태에 맞게 URL 변환 후 이동
    console.log(`[TopLink] Navigating to: ${localizedHref} (language: ${language})`);
    
    try {
      // forceReload가 true인 경우에만 페이지 전체 리로드, 그렇지 않으면 SPA 방식으로 이동
      if (forceReload) {
        setTimeout(() => {
          window.location.href = localizedHref;
        }, 10);
      } else {
        navigate(localizedHref);
      }
    } catch (error) {
      console.error('[TopLink] Navigation error:', error);
      // 에러 발생 시 window.location으로 폴백
      window.location.href = localizedHref;
    }
    
    // 브라우저 캐시로 인한 이슈 해결을 위한 안전 장치
    setTimeout(() => {
      document.body.classList.remove('page-transitioning');
    }, 1000);
    
    return false;
  };
  
  return (
    <a
      href={localizedHref}
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