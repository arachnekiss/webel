import { useEffect, useRef } from 'react';
import { measureRendering, startRouteChange, endRouteChange, logPerformanceSummary } from '@/lib/performance';
import { useLocation } from 'wouter';

/**
 * 컴포넌트 렌더링 성능을 측정하는 훅
 * 
 * @param componentName 성능 측정에 사용할 컴포넌트 이름
 * @returns void
 * 
 * @example
 * ```tsx
 * const ProductList = () => {
 *   usePerformanceTracking('ProductList');
 *   // ... 컴포넌트 코드
 * }
 * ```
 */
export function usePerformanceTracking(componentName: string): void {
  useEffect(() => {
    // 컴포넌트 마운트 시 측정 시작
    const cleanup = measureRendering(componentName);
    return cleanup;
  }, [componentName]);
}

/**
 * 라우트 변경을 추적하는 훅
 * 페이지 이동 시마다 성능을 측정
 * 
 * @returns void
 * 
 * @example
 * ```tsx
 * // App.tsx 혹은 라우팅 담당 컴포넌트에서 사용
 * const App = () => {
 *   useRouteChangeTracking();
 *   // ... 라우팅 로직
 * }
 * ```
 */
export function useRouteChangeTracking(): void {
  const [location] = useLocation();
  const prevLocationRef = useRef(location);
  
  useEffect(() => {
    const prevLocation = prevLocationRef.current;
    
    if (prevLocation !== location) {
      // 라우트 변경 완료 측정
      endRouteChange();
      
      // 새 라우트 변경 시작 측정
      startRouteChange(prevLocation, location);
      
      // 현재 위치 업데이트
      prevLocationRef.current = location;
    }
  }, [location]);
  
  // 첫 번째 렌더링에 대한 측정 시작
  useEffect(() => {
    startRouteChange('initial', location);
    
    return () => {
      endRouteChange();
    };
  }, []);
}

/**
 * 주기적으로 성능 통계를 로깅하는 훅
 * 개발 환경에서만 동작
 * 
 * @param intervalMs 로깅 간격 (밀리초)
 * @returns void
 */
export function usePerformanceLogging(intervalMs: number = 60000): void {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    
    // 처음 로딩 후 10초 후에 통계 출력
    const initialTimeoutId = setTimeout(() => {
      logPerformanceSummary();
    }, 10000);
    
    // 그 후 주기적으로 통계 출력
    const intervalId = setInterval(() => {
      logPerformanceSummary();
    }, intervalMs);
    
    return () => {
      clearTimeout(initialTimeoutId);
      clearInterval(intervalId);
    };
  }, [intervalMs]);
}

/**
 * 모든 성능 측정 기능을 통합한 훅
 * 컴포넌트 성능, 라우트 변경, 주기적 로깅을 모두 처리
 * 
 * @param componentName 컴포넌트 이름
 * @returns void
 * 
 * @example
 * ```tsx
 * const App = () => {
 *   usePerformanceMonitoring('App');
 *   // ... 앱 로직
 * }
 * ```
 */
export function usePerformanceMonitoring(componentName: string): void {
  usePerformanceTracking(componentName);
  useRouteChangeTracking();
  usePerformanceLogging();
}

export default usePerformanceMonitoring;