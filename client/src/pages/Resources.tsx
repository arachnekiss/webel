import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
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
  
  // 페이지당 아이템 수
  const ITEMS_PER_PAGE = 12;

  // Define query key based on type parameter
  // 타입이 없거나 undefined인 경우 기본값으로 모든 리소스 API 경로 사용
  const queryKey = type ? `/api/resources/type/${type}` : '/api/resources';
  
  // 단순 쿼리로 변경 (무한 스크롤 제거)
  const { data: rawResources = [], isLoading } = useQuery<Resource[]>({
    queryKey: [queryKey || '/api/resources'],
    enabled: isBrowser,
    staleTime: 60 * 1000, // 1분 캐싱
    refetchOnWindowFocus: false,
    retry: 1,
  });
  
  // 선택된 카테고리 리스트 (하드웨어 설계도, 소프트웨어 오픈소스, AI 모델, 3D 모델링 파일)
  const ALLOWED_CATEGORIES = ['hardware_design', 'software', 'ai_model', '3d_model'];
  
  // 리소스 배열이 유효한지 확인하고 선택된 카테고리만 필터링
  const resources = useMemo(() => {
    try {
      if (!rawResources) {
        console.log('[Resources] 데이터가 없습니다');
        return [];
      }
      
      if (!Array.isArray(rawResources)) {
        console.log('[Resources] 응답이 배열이 아닙니다:', typeof rawResources);
        return [];
      }
      
      // 타입 파라미터가 있으면 해당 타입만 표시
      if (type && type !== 'all') {
        console.log('[Resources] 리소스 데이터 로드됨, 개수:', rawResources.length);
        return rawResources;
      }
      
      // 타입 파라미터가 없으면 선택된 카테고리만 필터링
      const filteredResources = rawResources.filter(resource => 
        ALLOWED_CATEGORIES.includes(resource.category) || 
        (resource.resourceType && ALLOWED_CATEGORIES.includes(resource.resourceType))
      );
      
      console.log('[Resources] 필터링된 리소스 데이터 로드됨, 개수:', filteredResources.length);
      return filteredResources;
    } catch (error) {
      console.error('[Resources] 리소스 처리 중 오류:', error);
      return [];
    }
  }, [rawResources, type]);
  
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
  
  // 무한 스크롤 기능 제거
  
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
            {/* 설명 제거 */}
          </div>
          {/* 업로드 버튼 제거 - 관리자 대시보드로 통합 */}
        </div>
        
        {/* Search and filter controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <div className="relative w-full">
            <Input 
              type="text" 
              placeholder="리소스 검색..." 
              className="w-full pr-10" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
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
