import { useEffect } from 'react';
import { useLocation as useWouterLocation } from 'wouter';

/**
 * 페이지 이동 시 스크롤을 최상단으로 이동시키는 커스텀 훅
 * 성능 최적화와 즉각적인 UI 응답을 위해 수정된 버전
 */
export function usePageScroll() {
  const [location] = useWouterLocation();

  // 스크롤을 상단으로 이동시키는 함수 - 최적화 버전
  function resetScroll() {
    // 최대한 빠르게 동작하도록 auto behavior 사용
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto' // smooth 대신 auto로 즉시 이동
    });
  }
  
  // 페이지 전환 시 스크롤을 위로 이동 - 성능 최적화
  useEffect(() => {
    // 지연 없이 즉시 실행 (0ms)
    resetScroll();
    
    // 단일 백업 타임아웃 (렌더링 이후 한 번만 체크)
    const timeout = setTimeout(resetScroll, 50);
    
    // 메모리 누수 방지
    return () => {
      clearTimeout(timeout);
    };
  }, [location]); // 위치 변경 시에만 실행
}