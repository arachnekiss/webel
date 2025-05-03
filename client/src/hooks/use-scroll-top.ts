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
    // 경로가 변경되었을 때만 스크롤을 맨 위로 이동시킵니다
    if (prevLocationRef.current !== location) {
      window.scrollTo(0, 0);
      prevLocationRef.current = location;
    }
  }, [location]);
}