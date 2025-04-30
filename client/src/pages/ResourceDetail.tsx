import React from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Resource } from '@/types';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Share, ArrowLeft, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const ResourceDetail: React.FC = () => {
  const { id } = useParams();
  const resourceId = id ? parseInt(id) : 0;
  const { toast } = useToast();
  
  const { data: resource, isLoading } = useQuery<Resource>({
    queryKey: [`/api/resources/${resourceId}`],
    enabled: !isNaN(resourceId)
  });
  
  const handleDownload = async () => {
    if (!resource) return;
    
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

  const handleShare = () => {
    if (navigator.share && resource) {
      navigator.share({
        title: resource.title,
        text: resource.description,
        url: document.location.href,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      toast({
        title: "공유 실패",
        description: "이 브라우저에서는 공유 기능을 지원하지 않습니다.",
      });
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
        return '인공지능 모델';
      case 'flash_game':
        return '플래시 게임';
      default:
        return type;
    }
  };
  
  if (isLoading) {
    return (
      <div>
        <main className="flex-grow container mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-300 rounded-lg mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
          </div>
        </main>
      </div>
    );
  }
  
  if (!resource) {
    return (
      <div>
        <main className="flex-grow container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">리소스를 찾을 수 없습니다</h2>
            <p className="text-gray-600 mb-6">요청하신 리소스가 존재하지 않거나 삭제되었을 수 있습니다.</p>
            <Link href="/resources">
              <div>
                <Button className="bg-primary text-white hover:bg-blue-600">
                  리소스 목록으로 돌아가기
                </Button>
              </div>
            </Link>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div>
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="mb-6">
          <Link href="/resources">
            <div className="inline-flex items-center text-primary hover:underline cursor-pointer">
              <ArrowLeft className="h-4 w-4 mr-1" />
              리소스 목록으로 돌아가기
            </div>
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:w-1/3 relative h-64 md:h-auto">
              {resource.imageUrl ? (
                <img 
                  src={resource.imageUrl} 
                  alt={resource.title} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-500">이미지 없음</span>
                </div>
              )}
              <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 text-sm font-medium rounded">
                {getTypeName(resource.resourceType)}
              </div>
            </div>
            <div className="md:w-2/3 p-6 md:p-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{resource.title}</h1>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {resource.tags && resource.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <p className="text-gray-700 mb-6">{resource.description}</p>
              
              <div className="flex items-center mb-6">
                <Download className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-600">
                  다운로드 횟수: <span className="font-semibold">{resource.downloadCount.toLocaleString()}</span>
                </span>
              </div>
              
              {/* Materials section */}
              {resource.materialsList && resource.materialsList.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">필요 재료</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {resource.materialsList.map((material, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-sm">{material}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Source information if crawled */}
              {resource.isCrawled && resource.sourceSite && (
                <div className="mb-6">
                  <p className="text-sm text-gray-500">
                    출처: {resource.sourceSite}
                  </p>
                </div>
              )}
              
              <div className="flex flex-wrap gap-4">
                <Button
                  className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                  onClick={handleDownload}
                >
                  <Download className="h-5 w-5 mr-2" />
                  다운로드
                </Button>
                <Button
                  variant="outline"
                  className="px-6 py-2 bg-white text-primary font-medium rounded-lg border border-primary hover:bg-blue-50 transition-colors flex items-center"
                  onClick={handleShare}
                >
                  <Share className="h-5 w-5 mr-2" />
                  공유하기
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related resources section would go here */}
      </main>
    </div>
  );
};

export default ResourceDetail;
