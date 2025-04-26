import React, { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Resource } from '@/types';

import ResourceCard from '@/components/ui/ResourceCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

const Resources: React.FC = () => {
  const { type } = useParams();
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Define query key based on type parameter
  const queryKey = type ? `/api/resources/type/${type}` : '/api/resources';
  
  const { data: resources, isLoading } = useQuery<Resource[]>({
    queryKey: [queryKey],
  });
  
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
  
  // Filter resources by search query
  const filteredResources = resources?.filter(resource => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      resource.title.toLowerCase().includes(query) ||
      resource.description.toLowerCase().includes(query) ||
      resource.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  });
  
  return (
    <div>
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">{getResourceTypeName()}</h1>
          <p className="text-gray-600">
            무료로 제공되는 다양한 설계도, 소프트웨어, 콘텐츠를 찾아보세요.
          </p>
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
                onClick={() => setSearchQuery('')}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
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
                onClick={() => setSearchQuery('')}
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
