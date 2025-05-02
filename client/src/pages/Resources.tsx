import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Resource } from '@/types';

import ResourceCard from '@/components/ui/ResourceCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, PlusCircle } from 'lucide-react';

// 브라우저 환경인지 확인하는 전역 변수
const isBrowser = typeof window !== 'undefined';

interface ResourcesProps {
  type?: string;
  params?: any;
}

const Resources: React.FC<ResourcesProps> = (props) => {
  const routeParams = useParams();
  const [location] = useLocation();
  // Use props.type if provided directly, or from params prop, or from route params
  const type = props.type || (props.params?.type) || routeParams.type;
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // URL에서 검색 쿼리 파라미터 추출
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.location && window.location.href) {
        const url = new URL(window.location.href);
        const searchParam = url.searchParams.get('search');
        if (searchParam) {
          setSearchQuery(decodeURIComponent(searchParam));
        }
      }
    } catch (error) {
      console.error('URL 파라미터 파싱 중 오류:', error);
    }
  }, [location]);
  
  // 무한 스크롤을 위한 설정
  const ITEMS_PER_PAGE = 12;
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Define query key based on type parameter
  // 타입이 없거나 undefined인 경우 기본값으로 모든 리소스 API 경로 사용
  const queryKey = type ? `/api/resources/type/${type}` : '/api/resources';
  
  // 무한 쿼리 설정 - 더 강화된 오류 처리
  const infiniteQueryResult = useInfiniteQuery({
    queryKey: [queryKey || '/api/resources'],
    enabled: isBrowser, // 브라우저 환경에서만 쿼리 활성화
    queryFn: async ({ pageParam = 1 }) => {
      try {
        // 클라이언트 측 URL 생성 - queryKey가 유효한지 확인
        const endpoint = queryKey || '/api/resources'; 
        
        // 중복 체크지만 안전을 위해 유지
        if (!isBrowser) {
          console.log('[Resources] 브라우저 환경이 아닙니다. 빈 결과 반환');
          return { items: [] };
        }
        
        console.log(`[Resources] 리소스 로딩 시작: ${endpoint}, 페이지: ${pageParam}`);
        
        const url = new URL(`${window.location.origin}${endpoint}`);
        url.searchParams.append('page', String(pageParam));
        url.searchParams.append('limit', String(ITEMS_PER_PAGE));
        
        const response = await fetch(url.toString());
        if (!response.ok) {
          console.error('[Resources] API 응답 에러:', response.status);
          return { items: [] };
        }
        
        const result = await response.json();
        console.log(`[Resources] API 응답 데이터:`, result);
        
        // API가 배열을 직접 반환하는 경우, items 형식으로 변환
        if (Array.isArray(result)) {
          return { items: result, meta: null };
        }
        
        // 객체이지만 items 속성이 없는 경우
        if (typeof result === 'object' && !Array.isArray(result.items)) {
          return { items: [], meta: null };
        }
        
        return result;
      } catch (error) {
        console.error('[Resources] 리소스 로딩 중 오류:', error);
        return { items: [] };
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      try {
        // 가장 기본적인 안전장치
        if (!lastPage) return undefined;
        
        // 페이지네이션 메타데이터가 있는 경우
        if (lastPage?.meta) {
          const { currentPage, totalPages } = lastPage.meta;
          return currentPage < totalPages ? currentPage + 1 : undefined;
        }
        
        // 배열인 경우 (API가 배열을 직접 반환)
        if (Array.isArray(lastPage) && lastPage.length > 0) {
          return lastPage.length === ITEMS_PER_PAGE ? 2 : undefined;
        }
        
        // items 배열이 있는 경우 (가장 일반적인 패턴)
        if (lastPage?.items && Array.isArray(lastPage.items)) {
          // 현재 페이지 번호 계산 - 배열 길이 + 1 (1부터 시작하므로)
          const nextPage = allPages.length + 1;
          return lastPage.items.length === ITEMS_PER_PAGE ? nextPage : undefined;
        }
        
        return undefined;
      } catch (error) {
        console.error('[Resources] getNextPageParam 오류:', error);
        return undefined;
      }
    },
    initialPageParam: 1,
  });
  
  // 기본값을 제공하여 안전하게 구조 분해
  const {
    data = { pages: [] },
    fetchNextPage = () => {},
    hasNextPage = false,
    isFetchingNextPage = false,
    isLoading = false
  } = infiniteQueryResult || {};
  
  // 모든 페이지의 리소스를 하나의 배열로 병합 (안전하게 처리)
  const resources = useMemo(() => {
    try {
      // 데이터 검증
      if (!data) {
        console.log('[Resources] data가 없습니다.');
        return [];
      }
      if (!data.pages) {
        console.log('[Resources] data.pages가 없습니다:', data);
        return [];
      }
      if (!Array.isArray(data.pages)) {
        console.log('[Resources] data.pages가 배열이 아닙니다:', typeof data.pages);
        return [];
      }
      
      console.log('[Resources] data.pages 길이:', data.pages.length);
      
      const result = data.pages.flatMap(page => {
        // null, undefined 체크
        if (!page) {
          console.log('[Resources] 페이지가 null/undefined입니다.');
          return [];
        }
        
        // API가 {items, meta} 형식으로 반환하는 경우
        if (page.items && Array.isArray(page.items)) {
          console.log('[Resources] items 형식의 응답:', page.items.length);
          return page.items;
        }
        
        // API가 리소스 배열을 직접 반환하는 경우
        if (Array.isArray(page)) {
          console.log('[Resources] 배열 형식의 응답:', page.length);
          return page;
        }
        
        console.log('[Resources] 알 수 없는 응답 형식:', page);
        // 기타 경우 빈 배열 반환
        return [];
      });
      
      console.log('[Resources] 최종 리소스 배열 길이:', result.length);
      return result;
    } catch (error) {
      console.error('[Resources] 리소스 데이터 처리 중 오류:', error);
      return [];
    }
  }, [data]);
  
  // Get resource type name for display
  const getResourceTypeName = () => {
    switch (type) {
      case 'hardware_design':
        return '하드웨어 설계도';
      case 'software':
        return '소프트웨어 오픈소스';
      case '3d_model':
        return '3D 모델링 파일';
      case 'free_content':
        return '프리 콘텐츠';
      case 'ai_model':
        return '인공지능 모델';
      case 'flash_game':
        return '플래시 게임';
      default:
        return '모든 리소스';
    }
  };
  
  // 인터섹션 옵저버 설정 (무한 스크롤)
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // 무한 스크롤을 위한 인터섹션 옵저버 설정
  useEffect(() => {
    // 브라우저 환경에서만 IntersectionObserver 사용
    if (!isBrowser) return;
    
    try {
      const observer = new IntersectionObserver(handleObserver, {
        rootMargin: '0px 0px 300px 0px', // 하단에서 300px 떨어진 지점에서 트리거
        threshold: 0.1
      });
      
      if (loadMoreRef.current) {
        observer.observe(loadMoreRef.current);
      }
      
      return () => {
        if (loadMoreRef.current) {
          observer.unobserve(loadMoreRef.current);
        }
      };
    } catch (error) {
      console.error('인터섹션 옵저버 설정 중 오류:', error);
      return () => {};
    }
  }, [handleObserver, loadMoreRef.current]);
  
  // 리소스 데이터가 유효한지 확인
  const validResources = resources || [];
  console.log('[Resources] validResources의 타입:', typeof validResources, '길이:', Array.isArray(validResources) ? validResources.length : '배열 아님');

  // Filter resources by search query - try/catch로 안전하게 처리
  const filteredResources = useMemo(() => {
    try {
      if (!Array.isArray(validResources)) {
        console.error('[Resources] validResources가 배열이 아닙니다:', validResources);
        return [];
      }
      
      return validResources.filter((resource: any) => {
        try {
          // 잘못된 리소스 객체 필터링
          if (!resource || typeof resource !== 'object') {
            console.log('[Resources] 유효하지 않은 리소스 객체:', resource);
            return false;
          }
          
          // 검색어가 없으면 모든 리소스 표시
          if (!searchQuery || !searchQuery.trim()) return true;
          
          const query = searchQuery.toLowerCase();
          
          // 안전하게 속성 확인 후 검색
          const title = resource.title || '';
          const description = resource.description || '';
          const tags = resource.tags || [];
          
          return (
            title.toLowerCase().includes(query) ||
            description.toLowerCase().includes(query) ||
            (Array.isArray(tags) && tags.some(tag => 
              tag && typeof tag === 'string' && tag.toLowerCase().includes(query)
            ))
          );
        } catch (error) {
          console.error('[Resources] 리소스 필터링 중 오류:', error);
          return false;
        }
      });
    } catch (error) {
      console.error('[Resources] 전체 필터링 중 오류:', error);
      return [];
    }
  }, [validResources, searchQuery]);
  
  return (
    <div>
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="mb-8 md:flex md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-3">{getResourceTypeName()}</h1>
            <p className="text-gray-600">
              무료로 제공되는 다양한 설계도, 소프트웨어, 콘텐츠를 찾아보세요.
            </p>
          </div>
          {/* 업로드 버튼 제거 - 관리자 대시보드로 통합 */}
        </div>
        
        {/* Search and filter controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Input 
                type="text" 
                placeholder="리소스 검색..." 
                className="w-full pr-10" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  // URL에서 검색 파라미터 제거 (브라우저 환경에서만)
                  if (isBrowser) {
                    try {
                      const url = new URL(window.location.href);
                      url.searchParams.delete('search');
                      window.history.replaceState({}, '', url.toString());
                    } catch (error) {
                      console.error('URL 파라미터 제거 중 오류:', error);
                    }
                  }
                }}
                disabled={!searchQuery}
              >
                필터 초기화
              </Button>
            </div>
          </div>
        </div>
        
        {/* Resources grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (Array.isArray(filteredResources) && filteredResources.length > 0) ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredResources.map((resource, index) => (
                <ResourceCard 
                  key={resource.id || `resource-${index}`} 
                  resource={resource} 
                />
              ))}
            </div>
            
            {/* 무한 스크롤을 위한 로딩 인디케이터 */}
            <div 
              ref={loadMoreRef} 
              className="mt-8 w-full flex justify-center py-4"
            >
              {isFetchingNextPage ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">더 불러오는 중...</span>
                </div>
              ) : hasNextPage ? (
                <span className="text-sm text-muted-foreground">스크롤하여 더 보기</span>
              ) : (Array.isArray(filteredResources) && filteredResources.length > ITEMS_PER_PAGE) ? (
                <span className="text-sm text-muted-foreground">모든 리소스를 불러왔습니다</span>
              ) : (
                <span className="text-sm text-muted-foreground"></span>
              )}
            </div>
          </>
        ) : (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? `'${searchQuery}'에 대한 검색 결과가 없습니다.` 
                : '이용 가능한 리소스가 없습니다.'}
            </p>
            {searchQuery && (
              <Button 
                className="bg-primary text-white hover:bg-blue-600"
                onClick={() => {
                  setSearchQuery('');
                  // URL에서 검색 파라미터 제거 (브라우저 환경에서만)
                  if (isBrowser) {
                    try {
                      const url = new URL(window.location.href);
                      url.searchParams.delete('search');
                      window.history.replaceState({}, '', url.toString());
                    } catch (error) {
                      console.error('URL 파라미터 제거 중 오류:', error);
                    }
                  }
                }}
              >
                모든 리소스 보기
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Resources;
