import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Resource } from '@/types';

import ResourceCard from '@/components/ui/ResourceCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, PlusCircle } from 'lucide-react';

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
    if (location) {
      const url = new URL(window.location.href);
      const searchParam = url.searchParams.get('search');
      if (searchParam) {
        setSearchQuery(decodeURIComponent(searchParam));
      }
    }
  }, [location]);
  
  // Define query key based on type parameter
  const queryKey = type ? `/api/resources/type/${type}` : '/api/resources';
  
  // 무한 스크롤을 위한 설정
  const ITEMS_PER_PAGE = 12;
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  // 무한 쿼리 설정
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: [queryKey],
    queryFn: async ({ pageParam = 1 }) => {
      const url = new URL(`${window.location.origin}${queryKey}`);
      url.searchParams.append('page', String(pageParam));
      url.searchParams.append('limit', String(ITEMS_PER_PAGE));
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('리소스를 불러오는데 실패했습니다.');
      }
      
      return await response.json();
    },
    getNextPageParam: (lastPage) => {
      // lastPage가 undefined인 경우 방어 처리
      if (!lastPage) {
        return undefined;
      }
      
      // API가 페이지네이션 메타데이터를 반환하는 경우
      if (lastPage?.meta) {
        const { currentPage, totalPages } = lastPage.meta;
        return currentPage < totalPages ? currentPage + 1 : undefined;
      }
      
      // 단순 배열을 반환하는 경우 (lastPage가 배열인지 확인)
      if (Array.isArray(lastPage)) {
        // 배열에는 meta 속성이 없으므로, 단순히 배열 길이로 판단
        return lastPage.length === ITEMS_PER_PAGE ? 2 : undefined;
      }
      
      // 기본값으로 undefined 반환 (다음 페이지 없음)
      return undefined;
    },
    initialPageParam: 1,
  });
  
  // 모든 페이지의 리소스를 하나의 배열로 병합
  const resources = data?.pages?.flatMap(page => {
    // API가 {items, meta} 형식으로 반환하는 경우
    if (page?.items) {
      return page.items;
    }
    // API가 리소스 배열을 직접 반환하는 경우
    return page || [];
  }) || [];
  
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
  }, [handleObserver, loadMoreRef.current]);
  
  // Filter resources by search query
  const filteredResources = resources?.filter(resource => {
    // 잘못된 리소스 객체 필터링
    if (!resource || typeof resource !== 'object') return false;
    
    // 검색어가 없으면 모든 리소스 표시
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      (resource.title && resource.title.toLowerCase().includes(query)) ||
      (resource.description && resource.description.toLowerCase().includes(query)) ||
      (resource.tags && Array.isArray(resource.tags) && 
        resource.tags.some((tag: string) => tag && typeof tag === 'string' && tag.toLowerCase().includes(query)))
    );
  });
  
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
                  // URL에서 검색 파라미터 제거
                  const url = new URL(window.location.href);
                  url.searchParams.delete('search');
                  window.history.replaceState({}, '', url.toString());
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
        ) : filteredResources && filteredResources.length > 0 ? (
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
              ) : filteredResources.length > ITEMS_PER_PAGE && (
                <span className="text-sm text-muted-foreground">모든 리소스를 불러왔습니다</span>
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
                  // URL에서 검색 파라미터 제거
                  const url = new URL(window.location.href);
                  url.searchParams.delete('search');
                  window.history.replaceState({}, '', url.toString());
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
