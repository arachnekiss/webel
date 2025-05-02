import React from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import { Resource } from '@/types';
import { apiRequest } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';

interface RelatedResourcesProps {
  tags: string[];
  resourceType: string;
  currentResourceId: number;
}

const RelatedResources: React.FC<RelatedResourcesProps> = ({ tags, resourceType, currentResourceId }) => {
  const { data: resources, isLoading, error } = useQuery<Resource[]>({
    queryKey: ['/api/resources'],
  });

  if (isLoading) {
    return <p className="text-sm text-gray-500">유사한 리소스를 검색 중입니다...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500">리소스를 불러오는 중 오류가 발생했습니다.</p>;
  }

  // 현재 리소스를 제외하고, 같은 태그를 가진 리소스 필터링
  const relatedResources = resources?.filter(resource => {
    // 현재 리소스는 제외
    if (resource.id === currentResourceId) return false;
    
    // 태그가 없는 리소스 제외
    if (!Array.isArray(resource.tags) || resource.tags.length === 0) return false;
    
    // 최소 1개 이상의 태그가 일치하는지 확인
    return tags.some(tag => resource.tags?.includes(tag));
  }).slice(0, 3); // 최대 3개만 표시

  if (!relatedResources || relatedResources.length === 0) {
    return <p className="text-sm text-gray-500">유사한 태그를 가진 리소스가 없습니다.</p>;
  }

  return (
    <div className="space-y-4">
      {relatedResources.map(resource => (
        <Link key={resource.id} href={`/resources/${resource.id}`}>
          <div className="flex items-start p-3 rounded-md hover:bg-gray-50 transition-colors">
            <div className="w-16 h-16 mr-3 bg-gray-200 rounded overflow-hidden flex-shrink-0">
              {resource.imageUrl ? (
                <img 
                  src={resource.imageUrl} 
                  alt={resource.title} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-gray-900 truncate mb-1 hover:text-primary">
                {resource.title}
              </h4>
              <p className="text-xs text-gray-500 line-clamp-2">{resource.description}</p>
              {Array.isArray(resource.tags) && resource.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {resource.tags.filter(tag => tags.includes(tag)).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs px-1 py-0 bg-blue-50 text-blue-700">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default RelatedResources;