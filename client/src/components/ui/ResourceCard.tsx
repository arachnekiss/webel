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
  const { toast } = useToast();
  
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await apiRequest('GET', resource.downloadUrl, undefined);
      toast({
        title: "다운로드 시작됨",
        description: `${resource.title} 다운로드가 시작되었습니다.`,
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
        return '3D 모델링';
      case 'software':
        return '소프트웨어 오픈소스';
      case 'free_content':
        return '프리 콘텐츠';
      default:
        return type;
    }
  };

  return (
    <Card className="h-full bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {resource.imageUrl ? (
          <img 
            src={resource.imageUrl} 
            alt={resource.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <span className="text-gray-500">이미지 없음</span>
          </div>
        )}
        <div className={`absolute top-0 left-0 ${getTypeColor(resource.resourceType)} text-white px-3 py-1 text-xs font-medium`}>
          {getTypeName(resource.resourceType)}
        </div>
      </div>
      <CardContent className="p-4">
        <Link href={`/resources/${resource.id}`}>
          <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-primary">{resource.title}</h3>
        </Link>
        <p className="text-gray-600 text-sm mb-3">{resource.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {resource.tags && resource.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Download className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500 ml-1">{resource.downloadCount.toLocaleString()}</span>
          </div>
          <Button 
            className="px-3 py-1 text-sm bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
            onClick={handleDownload}
          >
            다운로드
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourceCard;
