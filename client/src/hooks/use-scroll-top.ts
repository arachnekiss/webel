import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

// 스크롤을 최상단으로 이동시키는 함수
function scrollToTop(behavior: ScrollBehavior = 'instant') {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior
  });
}

/**
 * 페이지 전환 시 스크롤을 최상단으로 이동시키는 훅
 * wouter의 useLocation과 함께 사용됩니다.
 */
export function useScrollTop() {
  const [location] = useLocation();
  const prevLocationRef = useRef(location);

  // 경로 변경 감지 및 링크 클릭 이벤트 처리를 위한 단일 useEffect
  useEffect(() => {
    // 경로 변경 시 스크롤 이동
    if (prevLocationRef.current !== location) {
      // DOM 업데이트 후 스크롤 이동을 위해 setTimeout 사용
      setTimeout(() => scrollToTop(), 0);
      prevLocationRef.current = location;
    }
    
    // 내부 링크 클릭 감지 함수
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      // a 태그이고 내부 링크인 경우
      if (link && link.getAttribute('href')?.startsWith('/')) {
        // DOM 업데이트 후 스크롤 이동
        setTimeout(() => scrollToTop(), 0);
      }
    };
    
    // 문서 전체에 클릭 이벤트 리스너 추가
    document.addEventListener('click', handleLinkClick);
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, [location]); // location 의존성 추가하여 경로 변경 감지
}