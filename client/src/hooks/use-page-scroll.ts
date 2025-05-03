import { useEffect } from 'react';
import { useLocation as useWouterLocation } from 'wouter';

/**
 * 페이지 이동 시 스크롤을 최상단으로 이동시키는 커스텀 훅
 * 여러 가지 방법으로 스크롤을 제어합니다.
 */
export function usePageScroll() {
  const [location] = useWouterLocation();

  // 우선 즉시 스크롤을 상단으로 이동
  function resetScroll() {
    window.scrollTo(0, 0);
  }
  
  // 페이지 전환 시 스크롤을 강제로 위로 이동
  useEffect(() => {
    // 즉시 스크롤 이동
    resetScroll();
    
    // 여러 타이밍에 동작하는 3중 안전장치
    const timeouts = [
      setTimeout(resetScroll, 0), 
      setTimeout(resetScroll, 100),
      setTimeout(resetScroll, 300)
    ];
    
    // 메모리 누수 방지를 위한 클린업
    return () => {
      timeouts.forEach(id => clearTimeout(id));
    };
  }, [location]); // 위치 변경 시에만 실행
}