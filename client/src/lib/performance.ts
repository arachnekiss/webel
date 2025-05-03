/**
 * 성능 모니터링 및 분석 모듈
 * 애플리케이션의 다양한 성능 지표를 추적하고 보고하는 시스템
 */

// 성능 이벤트 유형 정의
type PerformanceEventType = 
  | 'api_request'      // API 요청 성능
  | 'rendering'        // 컴포넌트 렌더링 성능
  | 'resource_load'    // 리소스 로딩 성능
  | 'route_change'     // 라우트 변경 성능
  | 'user_interaction' // 사용자 상호작용 성능
  | 'cache_hit'        // 캐시 적중 성능
  | 'db_operation';    // 데이터베이스 작업 성능

// 성능 측정 데이터 인터페이스
interface PerformanceData {
  type: PerformanceEventType;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

// 성능 측정 집계 데이터 (분석용)
interface PerformanceAggregate {
  count: number;
  totalDuration: number;
  minDuration: number;
  maxDuration: number;
  avgDuration: number;
}

// 성능 이벤트 인스턴스를 저장
const performanceEvents: PerformanceData[] = [];

// 집계된 성능 데이터 (이벤트 유형별로 인덱싱)
const performanceAggregates: Record<string, PerformanceAggregate> = {};

// 주요 측정 지표의 임계값 설정
const thresholds = {
  api_request: 1000,    // API 요청은 1초 이내
  rendering: 50,        // 렌더링은 50ms 이내
  route_change: 300,    // 라우트 변경은 300ms 이내
  user_interaction: 100 // 사용자 상호작용은 100ms 이내
};

/**
 * 성능 측정 시작
 * @param type 이벤트 유형
 * @param name 이벤트 이름
 * @param metadata 추가 메타데이터
 * @returns 이벤트 ID
 */
export function startMeasure(
  type: PerformanceEventType,
  name: string,
  metadata?: Record<string, any>
): number {
  const eventId = performanceEvents.length;
  
  performanceEvents.push({
    type,
    name,
    startTime: performance.now(),
    metadata
  });
  
  return eventId;
}

/**
 * 성능 측정 종료
 * @param eventId 이벤트 ID
 * @returns 측정된 지속 시간 (ms)
 */
export function endMeasure(eventId: number): number | undefined {
  const event = performanceEvents[eventId];
  
  if (!event) {
    console.warn(`Performance event with id ${eventId} not found`);
    return undefined;
  }
  
  if (event.endTime !== undefined) {
    console.warn(`Performance event ${event.name} already ended`);
    return event.duration;
  }
  
  event.endTime = performance.now();
  event.duration = event.endTime - event.startTime;
  
  // 성능 데이터 집계 업데이트
  updateAggregate(event);
  
  // 성능 임계값 확인 및 느린 작업 로깅
  checkThresholds(event);
  
  return event.duration;
}

/**
 * 특정 작업의 성능을 측정하는 Wrapper 함수
 * @param type 이벤트 유형
 * @param name 이벤트 이름
 * @param fn 측정할 함수
 * @param metadata 추가 메타데이터
 * @returns 원본 함수의 반환값
 */
export async function measurePerformance<T>(
  type: PerformanceEventType,
  name: string,
  fn: () => Promise<T> | T,
  metadata?: Record<string, any>
): Promise<T> {
  const eventId = startMeasure(type, name, metadata);
  
  try {
    const result = await fn();
    endMeasure(eventId);
    return result;
  } catch (error) {
    // 에러 발생 시에도 측정 종료
    const duration = endMeasure(eventId);
    
    // 메타데이터에 에러 정보 추가
    if (performanceEvents[eventId]) {
      performanceEvents[eventId].metadata = {
        ...performanceEvents[eventId].metadata,
        error: error instanceof Error ? error.message : String(error),
        hasError: true
      };
    }
    
    throw error;
  }
}

/**
 * API 요청 성능 측정 전용 Wrapper
 * @param name API 요청 이름/URL
 * @param fn API 호출 함수
 * @param metadata 추가 메타데이터
 * @returns API 응답
 */
export async function measureApiCall<T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  return measurePerformance('api_request', name, fn, metadata);
}

/**
 * 컴포넌트 렌더링 성능 측정 유틸리티
 * React 컴포넌트에서 useEffect 내에서 사용
 * @param componentName 컴포넌트 이름
 * @returns 클린업 함수
 */
export function measureRendering(componentName: string): () => void {
  const eventId = startMeasure('rendering', `Render ${componentName}`);
  
  return () => {
    endMeasure(eventId);
  };
}

/**
 * 성능 통계 데이터 가져오기
 * @returns 집계된 성능 통계
 */
export function getPerformanceStats(): Record<string, PerformanceAggregate> {
  return { ...performanceAggregates };
}

/**
 * 특정 이벤트 유형의 성능 통계 가져오기
 * @param type 이벤트 유형
 * @returns 특정 유형의 성능 통계
 */
export function getStatsByType(type: PerformanceEventType): PerformanceAggregate | undefined {
  return performanceAggregates[type];
}

/**
 * 최근 성능 이벤트 목록 가져오기
 * @param limit 가져올 최대 이벤트 수
 * @returns 최근 성능 이벤트 목록
 */
export function getRecentEvents(limit: number = 20): PerformanceData[] {
  return [...performanceEvents]
    .filter(event => event.duration !== undefined)
    .sort((a, b) => (b.startTime || 0) - (a.startTime || 0))
    .slice(0, limit);
}

/**
 * 특정 유형의 평균 성능 가져오기
 * @param type 이벤트 유형
 * @returns 평균 지속 시간 (ms)
 */
export function getAverageDuration(type: PerformanceEventType): number {
  const aggregate = performanceAggregates[type];
  return aggregate ? aggregate.avgDuration : 0;
}

/**
 * 모든 성능 측정 데이터 초기화
 */
export function resetPerformanceData(): void {
  performanceEvents.length = 0;
  Object.keys(performanceAggregates).forEach(key => {
    delete performanceAggregates[key];
  });
}

// 성능 데이터 집계 업데이트 (내부 유틸리티)
function updateAggregate(event: PerformanceData): void {
  if (event.duration === undefined) return;
  
  const key = `${event.type}:${event.name}`;
  
  if (!performanceAggregates[key]) {
    performanceAggregates[key] = {
      count: 0,
      totalDuration: 0,
      minDuration: Infinity,
      maxDuration: 0,
      avgDuration: 0
    };
  }
  
  const aggregate = performanceAggregates[key];
  aggregate.count++;
  aggregate.totalDuration += event.duration;
  aggregate.minDuration = Math.min(aggregate.minDuration, event.duration);
  aggregate.maxDuration = Math.max(aggregate.maxDuration, event.duration);
  aggregate.avgDuration = aggregate.totalDuration / aggregate.count;
  
  // 유형별 집계도 업데이트
  const typeKey = event.type;
  
  if (!performanceAggregates[typeKey]) {
    performanceAggregates[typeKey] = {
      count: 0,
      totalDuration: 0,
      minDuration: Infinity,
      maxDuration: 0,
      avgDuration: 0
    };
  }
  
  const typeAggregate = performanceAggregates[typeKey];
  typeAggregate.count++;
  typeAggregate.totalDuration += event.duration;
  typeAggregate.minDuration = Math.min(typeAggregate.minDuration, event.duration);
  typeAggregate.maxDuration = Math.max(typeAggregate.maxDuration, event.duration);
  typeAggregate.avgDuration = typeAggregate.totalDuration / typeAggregate.count;
}

// 성능 임계값 확인 및 느린 작업 로깅 (내부 유틸리티)
function checkThresholds(event: PerformanceData): void {
  if (event.duration === undefined) return;
  
  const threshold = thresholds[event.type as keyof typeof thresholds];
  
  if (threshold && event.duration > threshold) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `📉 Slow ${event.type}: "${event.name}" took ${event.duration.toFixed(2)}ms ` +
        `(threshold: ${threshold}ms)`,
        event.metadata || {}
      );
    }
    
    // 추가적인 알림이나 기록 로직을 여기에 구현 가능
  }
}

// 브라우저 성능 API를 사용한 측정 (내부 유틸리티)
function getResourceLoadTime(resourceName: string): number | null {
  if (!window.performance || !window.performance.getEntriesByType) {
    return null;
  }
  
  const resources = window.performance.getEntriesByType('resource');
  const resource = resources.find(r => r.name.includes(resourceName));
  
  if (!resource) return null;
  
  return (resource as PerformanceResourceTiming).duration;
}

// 내비게이션 측정 시작 (라우팅 변경 시 호출)
let currentRouteEventId: number | null = null;

/**
 * 라우트 변경 시작 측정
 * @param fromRoute 이전 라우트
 * @param toRoute 새 라우트
 */
export function startRouteChange(fromRoute: string, toRoute: string): void {
  if (currentRouteEventId !== null) {
    endMeasure(currentRouteEventId);
  }
  
  currentRouteEventId = startMeasure('route_change', `${fromRoute} → ${toRoute}`, {
    fromRoute,
    toRoute
  });
}

/**
 * 라우트 변경 완료 측정
 */
export function endRouteChange(): void {
  if (currentRouteEventId !== null) {
    endMeasure(currentRouteEventId);
    currentRouteEventId = null;
  }
}

/**
 * 성능 분석 요약 출력 (개발 모드에서만 표시)
 */
export function logPerformanceSummary(): void {
  if (process.env.NODE_ENV === 'production') return;
  
  // 이벤트 유형별 요약
  Object.entries(performanceAggregates)
    .filter(([key]) => !key.includes(':')) // 유형별 집계만 필터링
    .forEach(([type, stats]) => {
      console.log(
        `📊 Performance (${type}): ${stats.count} events, ` +
        `avg: ${stats.avgDuration.toFixed(2)}ms, ` +
        `min: ${stats.minDuration.toFixed(2)}ms, ` +
        `max: ${stats.maxDuration.toFixed(2)}ms`
      );
    });
  
  // 느린 API 호출 식별
  const apiStats = Object.entries(performanceAggregates)
    .filter(([key]) => key.startsWith('api_request:'))
    .sort(([, a], [, b]) => b.avgDuration - a.avgDuration)
    .slice(0, 5);
  
  if (apiStats.length > 0) {
    console.log('🔍 Slowest API calls:');
    apiStats.forEach(([key, stats]) => {
      const name = key.split(':')[1];
      console.log(
        `  - ${name}: avg ${stats.avgDuration.toFixed(2)}ms ` +
        `(called ${stats.count} times)`
      );
    });
  }
}

// 성능 로그 자동 출력 (개발 모드에서 30초마다)
if (process.env.NODE_ENV !== 'production') {
  setInterval(() => {
    if (Object.keys(performanceAggregates).length > 0) {
      logPerformanceSummary();
    }
  }, 30000);
}