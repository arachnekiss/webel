import NodeCache from 'node-cache';

// 캐시 만료 시간 설정 (초 단위)
const DEFAULT_TTL = 300; // 5분
const SHORT_TTL = 60; // 1분
const LONG_TTL = 1800; // 30분
const VERY_LONG_TTL = 7200; // 2시간

// 전체 캐시 인스턴스 (일반 데이터)
export const cache = new NodeCache({
  stdTTL: DEFAULT_TTL,
  checkperiod: 60,
  useClones: false, // 성능 향상을 위해 객체 복제 비활성화
});

// 카테고리 데이터 등 자주 사용되는 데이터를 위한 캐시
export const staticCache = new NodeCache({
  stdTTL: VERY_LONG_TTL,
  checkperiod: 120,
  useClones: false,
});

// 사용자별 데이터 캐시 (짧은 TTL)
export const userCache = new NodeCache({
  stdTTL: SHORT_TTL,
  checkperiod: 30,
  useClones: false,
});

/**
 * 캐시 키 생성 유틸리티 함수
 * @param prefix 캐시 키 접두사
 * @param params 캐시 키 생성에 사용될 파라미터들
 */
export function generateCacheKey(prefix: string, params: Record<string, any> = {}): string {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result: Record<string, any>, key) => {
      if (params[key] !== undefined && params[key] !== null) {
        result[key] = params[key];
      }
      return result;
    }, {});

  const paramsString = Object.keys(sortedParams).length
    ? `-${JSON.stringify(sortedParams)}`
    : '';

  return `${prefix}${paramsString}`;
}

/**
 * 특정 접두사로 시작하는 모든 캐시 항목 삭제
 * @param prefix 캐시 키 접두사
 * @param cacheInstance 사용할 캐시 인스턴스 (기본값: 일반 캐시)
 */
export function clearCacheByPrefix(prefix: string, cacheInstance = cache): void {
  const keys = cacheInstance.keys();
  const matchingKeys = keys.filter(key => key.startsWith(prefix));
  
  if (matchingKeys.length > 0) {
    cacheInstance.del(matchingKeys);
    console.log(`캐시 삭제: ${prefix} 접두사 항목 ${matchingKeys.length}개`);
  }
}

/**
 * 모든 캐시 인스턴스 초기화
 */
export function clearAllCaches(): void {
  cache.flushAll();
  staticCache.flushAll();
  userCache.flushAll();
  console.log('모든 캐시가 초기화되었습니다.');
}

/**
 * 인메모리 캐시 상태 확인
 */
export function getCacheStats(): Record<string, any> {
  return {
    general: {
      keys: cache.keys().length,
      stats: cache.getStats(),
    },
    static: {
      keys: staticCache.keys().length,
      stats: staticCache.getStats(),
    },
    user: {
      keys: userCache.keys().length,
      stats: userCache.getStats(),
    },
  };
}