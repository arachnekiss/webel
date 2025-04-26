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
        return '소프트웨어';
      case 'free_content':
        return '프리 콘텐츠';
      default:
        return type;
    }
  };

  return (
    <Card className="h-full bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-all duration-200 group border border-slate-200">
      <Link href={`/resources/${resource.id}`}>
        <div className="w-full cursor-pointer">
          {/* Image Section */}
          <div className="relative h-52 bg-slate-100 overflow-hidden">
            {resource.imageUrl ? (
              <img 
                src={resource.imageUrl} 
                alt={resource.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center group-hover:opacity-90 transition-opacity duration-300">
                <span className="text-slate-400">이미지 없음</span>
              </div>
            )}
            
            {/* Type Badge - Steam/Tindie Style */}
            <div className={`absolute top-3 left-3 ${getTypeColor(resource.resourceType)} text-white text-xs font-medium px-2.5 py-1 rounded`}>
              {getTypeName(resource.resourceType)}
            </div>
            
            {/* Source Badge - If crawled */}
            {resource.isCrawled && resource.sourceSite && (
              <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded">
                {resource.sourceSite}
              </div>
            )}
          </div>
          
          {/* Content Section */}
          <CardContent className="p-4">
            <h3 className="text-base font-semibold text-slate-800 mb-1.5 group-hover:text-blue-600 line-clamp-2">{resource.title}</h3>
            <p className="text-slate-600 text-sm mb-3 line-clamp-2">{resource.description}</p>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {resource.tags && resource.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-slate-100 border-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                  {tag}
                </Badge>
              ))}
              {resource.tags && resource.tags.length > 3 && (
                <Badge variant="outline" className="text-xs bg-slate-100 border-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                  +{resource.tags.length - 3}
                </Badge>
              )}
            </div>
          </CardContent>
        </div>
      </Link>
      
      {/* Action Footer - Outside the Link area */}
      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
        <div className="flex items-center">
          <Download className="h-4 w-4 text-slate-500" />
          <span className="text-xs text-slate-600 ml-1.5">{resource.downloadCount.toLocaleString()}회 다운로드</span>
        </div>
        <Button 
          size="sm"
          variant="outline"
          className="h-8 px-3 py-1 text-xs bg-white border-slate-300 text-slate-700 hover:bg-slate-100 rounded-md"
          onClick={handleDownload}
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
          다운로드
        </Button>
      </div>
    </Card>
  );
};

export default ResourceCard;
