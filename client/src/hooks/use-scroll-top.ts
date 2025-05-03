import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

/**
 * 페이지 전환 시 스크롤을 최상단으로 이동시키는 훅
 * wouter의 useLocation과 함께 사용됩니다.
 */
export function useScrollTop() {
  const [location] = useLocation();
  const prevLocationRef = useRef(location);

  useEffect(() => {
    // 경로가 변경되었을 때 스크롤을 맨 위로 이동
    if (prevLocationRef.current !== location) {
      // 스크롤 이동을 확실히 하기 위해 setTimeout 사용
      // 브라우저에서 DOM 업데이트가 완료된 후 스크롤 이동
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant' // 즉시 이동 (smooth로 설정하면 부드럽게 스크롤)
        });
      }, 0);
      
      prevLocationRef.current = location;
    }
  }, [location]);
  
  // 모든 내부 링크 클릭 시 스크롤 이동을 위한 전역 이벤트 리스너
  useEffect(() => {
    // 내부 링크 클릭 감지 함수
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      // a 태그이고 내부 링크인 경우
      if (link && link.getAttribute('href')?.startsWith('/')) {
        // 다음 틱에서 스크롤 이동 (DOM 업데이트 후)
        setTimeout(() => {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant'
          });
        }, 0);
      }
    };
    
    // 문서 전체에 클릭 이벤트 리스너 추가
    document.addEventListener('click', handleLinkClick);
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);
}