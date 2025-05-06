/**
 * 다국어 검색 API 구현
 * 
 * 이 모듈은 다국어 검색 관련 API 엔드포인트를 제공합니다.
 * PostgreSQL의 pg_trgm과 정규화 함수를 활용한 효율적인 다국어 검색 기능을 제공합니다.
 */

import { Request, Response } from 'express';
import { db, executeWithRetry } from './db';
import { resources, services } from '@shared/schema';
import { SQL, ilike, and, isNull, or, desc, sql } from 'drizzle-orm';
import { cache } from './cache';
import { detectLanguageFromHeader, normalizeText } from './utils/normalizeText';

// 지원하는 언어 목록
const SUPPORTED_LANGUAGES = ['ko', 'en', 'ja', 'zh', 'es'];

// 캐시 키 생성 함수
function generateSearchCacheKey(query: string, lang: string, type?: string): string {
  return `search:${lang}:${query}:${type || 'all'}`;
}

/**
 * 다국어 검색 API
 * 
 * 언어 자동 감지 및 언어별 최적화된 검색 결과 제공
 * 
 * @route GET /api/search
 * @param {string} q - 검색어
 * @param {string} [lang=auto] - 언어 코드 (ko, en, ja, zh, es, auto)
 * @param {string} [type] - 검색 유형 (resources, services, all)
 * @param {number} [limit=20] - 반환할 최대 결과 수
 */
export async function multilingualSearch(req: Request, res: Response): Promise<void> {
  try {
    const query = req.query.q as string;
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // 언어 코드 확인 (기본값: 자동 감지)
    let lang = (req.query.lang as string || 'auto').toLowerCase();
    if (lang === 'auto') {
      // Accept-Language 헤더에서 언어 감지
      lang = detectLanguageFromHeader(req.headers['accept-language']);
    }

    // 지원하지 않는 언어인 경우 영어로 대체
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
      lang = 'en';
    }

    // 검색 유형 확인 (기본값: all)
    const type = (req.query.type as string || 'all').toLowerCase();
    // 결과 제한 개수 확인 (기본값: 20)
    const limit = parseInt(req.query.limit as string || '20', 10);

    // 캐시 키 생성 및 캐시 확인
    const cacheKey = generateSearchCacheKey(query, lang, type);
    const cachedResults = cache.get(cacheKey);
    if (cachedResults) {
      return res.json(cachedResults);
    }

    // 쿼리 정규화 - DB 쿼리와 일치하도록 정규화
    const normalizedQuery = normalizeText(query, lang);
    console.log(`[Search] Query: "${query}", Lang: ${lang}, Normalized: "${normalizedQuery}"`);

    // 검색 결과 저장 변수
    let resourceResults: any[] = [];
    let serviceResults: any[] = [];

    // 언어별 검색 조건 생성
    const searchCondition = createSearchCondition(normalizedQuery, lang);

    // 요청된 타입에 따라 검색 수행
    if (type === 'all' || type === 'resources') {
      resourceResults = await executeWithRetry(async () => {
        return db.select()
          .from(resources)
          .where(and(
            searchCondition('resources'),
            isNull(resources.deleted_at)
          ))
          .limit(limit)
          .orderBy(desc(resources.created_at));
      });
    }

    if (type === 'all' || type === 'services') {
      serviceResults = await executeWithRetry(async () => {
        return db.select()
          .from(services)
          .where(searchCondition('services'))
          .limit(limit)
          .orderBy(desc(services.created_at));
      });
    }

    // 결과 구성
    const results = {
      query,
      language: lang,
      normalizedQuery,
      resources: resourceResults,
      services: serviceResults,
      totalCount: resourceResults.length + serviceResults.length
    };

    // 결과 캐싱 (TTL: 5분)
    cache.set(cacheKey, results, 300);

    // 응답 반환
    res.json(results);
  } catch (error) {
    console.error('다국어 검색 오류:', error);
    res.status(500).json({ error: 'Internal server error during search operation' });
  }
}

/**
 * 언어별 검색 조건 생성 함수
 * @param normalizedQuery 정규화된 검색어
 * @param lang 언어 코드
 * @returns 테이블별 검색 조건 생성 함수
 */
function createSearchCondition(normalizedQuery: string, lang: string) {
  return (table: 'resources' | 'services'): SQL => {
    const searchTerms = normalizedQuery.split(' ').filter(term => term.length > 0);
    let likePattern = `%${normalizedQuery}%`;
    
    // 검색어가 한글자인 경우, 정확한 패턴 매칭을 위해 공백 추가하지 않음
    if (normalizedQuery.length > 1) {
      // 앞뒤 공백 추가하여 단어 단위 매칭 개선
      likePattern = `%${normalizedQuery}%`;
    }

    if (table === 'resources') {
      // 리소스 테이블 검색 조건
      // 단일 검색어면 단순 ILIKE 사용
      if (searchTerms.length <= 1) {
        return or(
          sql`normalize_${lang}(${resources.title} || ' ' || ${resources.description} || ' ' || coalesce(${resources.tags}::text, '')) ILIKE ${likePattern}`,
          sql`${resources.category} ILIKE ${likePattern}`
        );
      } 
      
      // 다중 검색어면 각 단어별 검색 조건 결합
      const conditions = searchTerms.map(term => 
        sql`normalize_${lang}(${resources.title} || ' ' || ${resources.description} || ' ' || coalesce(${resources.tags}::text, '')) ILIKE ${'%' + term + '%'}`
      );
      return and(...conditions);
    } else {
      // 서비스 테이블 검색 조건
      if (searchTerms.length <= 1) {
        return or(
          sql`normalize_${lang}(${services.title} || ' ' || ${services.description} || ' ' || coalesce(${services.tags}::text, '') || ' ' || coalesce(${services.service_type}, '')) ILIKE ${likePattern}`,
          sql`${services.service_type} ILIKE ${likePattern}`
        );
      }
      
      const conditions = searchTerms.map(term => 
        sql`normalize_${lang}(${services.title} || ' ' || ${services.description} || ' ' || coalesce(${services.tags}::text, '') || ' ' || coalesce(${services.service_type}, '')) ILIKE ${'%' + term + '%'}`
      );
      return and(...conditions);
    }
  };
}

/**
 * 검색 성능 테스트 API
 * 
 * 다양한 언어의 쿼리로 성능 테스트를 수행
 * 
 * @route GET /api/search/performance-test
 */
export async function searchPerformanceTest(req: Request, res: Response): Promise<void> {
  try {
    // 성능 테스트용 샘플 쿼리
    const testQueries = [
      { lang: 'ko', query: '엔지니어링' },
      { lang: 'en', query: 'engineering' },
      { lang: 'ja', query: 'エンジニアリング' },
      { lang: 'zh', query: '工程' },
      { lang: 'es', query: 'ingeniería' }
    ];
    
    const results: any[] = [];
    
    for (const { lang, query } of testQueries) {
      const startTime = Date.now();
      
      // 정규화 실행
      const normalizedQuery = normalizeText(query, lang);
      
      // 검색 조건 생성
      const searchCondition = createSearchCondition(normalizedQuery, lang);
      
      // 리소스 검색 테스트
      const resourceResults = await executeWithRetry(async () => {
        return db.select()
          .from(resources)
          .where(and(
            searchCondition('resources'),
            isNull(resources.deleted_at)
          ))
          .limit(5);
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      results.push({
        lang,
        query,
        normalizedQuery,
        duration: `${duration}ms`,
        resultCount: resourceResults.length,
        sampleResults: resourceResults.map(r => ({ id: r.id, title: r.title }))
      });
    }
    
    res.json({
      message: 'Performance test completed',
      results
    });
  } catch (error) {
    console.error('검색 성능 테스트 오류:', error);
    res.status(500).json({ error: 'Internal server error during performance test' });
  }
}