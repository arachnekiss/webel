import React from 'react';
import { Link } from 'wouter';
import { Resource } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ResourceCardProps {
  resource: Resource;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  // 리소스가 올바른 형식인지 확인
  if (!resource || typeof resource !== 'object') {
    return (
      <Card className="h-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4">
          <p className="text-red-500">유효하지 않은 리소스 데이터</p>
        </div>
      </Card>
    );
  }

  const { toast } = useToast();
  
  // 안전하게 리소스 속성에 접근
  const resourceType = resource.resourceType || resource.category || '';
  const title = resource.title || '제목 없음';
  const description = resource.description || '설명 없음';
  const tags = Array.isArray(resource.tags) ? resource.tags : [];
  const downloadCount = typeof resource.downloadCount === 'number' ? resource.downloadCount : 0;
  
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!resource.downloadUrl) {
      toast({
        title: "다운로드 불가",
        description: "다운로드 URL이 제공되지 않았습니다.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await apiRequest('GET', resource.downloadUrl, undefined);
      toast({
        title: "다운로드 시작됨",
        description: `${title} 다운로드가 시작되었습니다.`,
      });
    } catch (error) {
      toast({
        title: "다운로드 실패",
        description: "파일을 다운로드 하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // Helper to determine resource type background color
  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'hardware_design':
        return 'bg-green-500';
      case '3d_model':
        return 'bg-indigo-500';
      case 'software':
        return 'bg-blue-500';
      case 'free_content':
        return 'bg-purple-500';
      case 'ai_model':
        return 'bg-red-500';
      case 'flash_game':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Helper to get readable type name
  const getTypeName = (type: string): string => {
    switch (type) {
      case 'hardware_design':
        return '하드웨어 설계도';
      case '3d_model':
        return '3D 모델링 파일';
      case 'software':
        return '소프트웨어 오픈소스';
      case 'free_content':
        return '프리 콘텐츠';
      case 'ai_model':
        return 'AI 모델';
      case 'flash_game':
        return '플래시 게임';
      default:
        return type || '기타';
    }
  };

  // 디버깅을 위해 리소스 ID 확인
  console.log('Resource card ID:', resource.id, typeof resource.id);

  return (
    <Card className="h-full bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group relative">
      <Link href={`/resources/${resource.id}`}>
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          {resource.imageUrl ? (
            <img 
              src={resource.imageUrl} 
              alt={title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <span className="text-gray-500">이미지 없음</span>
            </div>
          )}
          <div className={`absolute top-0 left-0 ${getTypeColor(resourceType)} text-white px-3 py-1 text-xs font-medium`}>
            {getTypeName(resourceType)}
          </div>
        </div>
      
        <CardContent className="p-4 pb-14"> {/* 하단에 여백 추가하여 다운로드 버튼을 위한 공간 확보 */}
          <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-primary">{title}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-3 overflow-hidden"> {/* 텍스트를 3줄로 제한하고 더 많은 경우 생략 */}
            {description}
          </p>
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.slice(0, 3).map((tag, index) => ( // 최대 3개의 태그만 표시하여 공간 확보
                <Badge key={index} variant="outline" className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Link>
      
      {/* 다운로드 버튼 - 카드 내에서 독립적으로 클릭 가능, 위치 조정 */}
      <div className="absolute bottom-4 right-4 z-10">
        <Button 
          className="px-4 py-1 text-sm bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
          onClick={handleDownload}
          disabled={!resource.downloadUrl}
        >
          다운로드
        </Button>
      </div>
    </Card>
  );
};

export default ResourceCard;
