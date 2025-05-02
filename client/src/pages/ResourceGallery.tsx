import React, { useState, useMemo } from 'react';
import { useLocation, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Resource } from '@/types';
import { ResourceType } from '@shared/schema';

import ResourceCard from '@/components/ui/ResourceCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Loader2, Filter } from 'lucide-react';

// 브라우저 환경인지 확인하는 전역 변수
const isBrowser = typeof window !== 'undefined';

interface ResourceGalleryProps {
  type?: string;
  params?: any;
}

// 선택된 리소스 타입들
const SELECTED_RESOURCE_TYPES: ResourceType[] = [
  'hardware_design',
  'software',
  '3d_model',
  'ai_model'
];

// 리소스 타입별 한글 이름
const resourceTypeNames: Record<string, string> = {
  'hardware_design': '하드웨어 설계도',
  'software': '소프트웨어 오픈소스',
  '3d_model': '3D 모델링',
  'ai_model': 'AI 모델',
  'free_content': '프리 콘텐츠',
  'flash_game': '플래시 게임',
};

const ResourceGallery: React.FC<ResourceGalleryProps> = (props) => {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // 모든 리소스 가져오기
  const { data: rawResources = [], isLoading } = useQuery<Resource[]>({
    queryKey: ['/api/resources'],
    enabled: isBrowser,
    staleTime: 60 * 1000, // 1분 캐싱
    refetchOnWindowFocus: false,
    retry: 1,
  });
  
  // 리소스 배열이 유효한지 확인 및 선택된 타입의 리소스만 필터링
  const resources = useMemo(() => {
    try {
      if (!rawResources || !Array.isArray(rawResources)) {
        return [];
      }
      
      // 선택된 리소스 타입만 필터링
      return rawResources.filter(resource => 
        SELECTED_RESOURCE_TYPES.includes(resource.category as ResourceType) ||
        SELECTED_RESOURCE_TYPES.includes(resource.resourceType as ResourceType)
      );
    } catch (error) {
      console.error('[ResourceGallery] 리소스 처리 중 오류:', error);
      return [];
    }
  }, [rawResources]);
  
  // 탭과 검색어로 필터링된 리소스
  const filteredResources = useMemo(() => {
    try {
      // 유효한 리소스인지 확인
      if (!Array.isArray(resources)) {
        return [];
      }
      
      // 탭 필터링
      let filtered = resources;
      if (activeTab !== 'all') {
        filtered = resources.filter(resource => 
          resource.category === activeTab || resource.resourceType === activeTab
        );
      }
      
      // 검색어 필터링
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(resource => {
          const title = (resource.title || '').toLowerCase();
          const description = (resource.description || '').toLowerCase();
          const tags = Array.isArray(resource.tags) ? resource.tags.join(' ').toLowerCase() : '';
          
          return title.includes(query) || description.includes(query) || tags.includes(query);
        });
      }
      
      return filtered;
    } catch (error) {
      console.error('[ResourceGallery] 필터링 중 오류:', error);
      return [];
    }
  }, [resources, activeTab, searchQuery]);

  // 검색 핸들러
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // URL에 검색 쿼리 추가
    const searchParams = new URLSearchParams(window.location.search);
    if (searchQuery) {
      searchParams.set('search', searchQuery);
    } else {
      searchParams.delete('search');
    }
    
    // 현재 경로에 검색 쿼리 파라미터를 추가하여 URL 업데이트
    const currentPathname = window.location.pathname;
    setLocation(`${currentPathname}?${searchParams.toString()}`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">전문가용 리소스 갤러리</h1>
          <p className="text-gray-600">하드웨어 설계도, 소프트웨어 오픈소스, AI 모델, 3D 모델링 파일 모음</p>
        </div>
        
        <form onSubmit={handleSearch} className="mt-4 md:mt-0 flex w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="검색어를 입력하세요"
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" className="ml-2">검색</Button>
        </form>
      </div>
      
      {/* 탭 필터 */}
      <Card className="mb-8">
        <CardContent className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full flex flex-wrap justify-start">
              <TabsTrigger value="all" className="flex-grow md:flex-grow-0">전체</TabsTrigger>
              {SELECTED_RESOURCE_TYPES.map(type => (
                <TabsTrigger key={type} value={type} className="flex-grow md:flex-grow-0">
                  {resourceTypeNames[type]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* 로딩 상태 */}
      {isLoading && (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">리소스를 불러오는 중...</span>
        </div>
      )}
      
      {/* 결과 없음 */}
      {!isLoading && filteredResources.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-xl font-medium text-gray-600">검색 결과가 없습니다</p>
          <p className="text-gray-500 mt-2">다른 검색어나 필터를 사용해보세요</p>
        </div>
      )}
      
      {/* 리소스 그리드 */}
      {!isLoading && filteredResources.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceGallery;