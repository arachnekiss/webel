import React from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Resource } from '@/types';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CategoryNav from '@/components/layout/CategoryNav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Share, ArrowLeft, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const ResourceDetail: React.FC = () => {
  const { id } = useParams();
  const resourceId = parseInt(id);
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
        url: window.location.href,
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
        return '3D 모델링';
      case 'software':
        return '소프트웨어';
      case 'free_content':
        return '프리 콘텐츠';
      default:
        return type;
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <CategoryNav />
        <main className="flex-grow container mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-300 rounded-lg mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!resource) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <CategoryNav />
        <main className="flex-grow container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">리소스를 찾을 수 없습니다</h2>
            <p className="text-gray-600 mb-6">요청하신 리소스가 존재하지 않거나 삭제되었을 수 있습니다.</p>
            <Link href="/resources">
              <Button className="bg-primary text-white hover:bg-blue-600">
                리소스 목록으로 돌아가기
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <Link href="/resources">
            <div className="inline-flex items-center text-blue-600 hover:text-blue-700 cursor-pointer">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              리소스 목록으로 돌아가기
            </div>
          </Link>
        </div>
        
        {/* Steam/Tindie style layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Image and Actions */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-6">
              <div className="relative">
                {resource.imageUrl ? (
                  <img 
                    src={resource.imageUrl} 
                    alt={resource.title} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full aspect-square bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <span className="text-slate-400">이미지 없음</span>
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 text-xs font-medium rounded">
                  {getTypeName(resource.resourceType)}
                </div>
              </div>
              
              <div className="p-4 border-t border-slate-100">
                <div className="flex flex-col gap-3">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors flex items-center justify-center py-2"
                    onClick={handleDownload}
                  >
                    <Download className="h-5 w-5 mr-2" />
                    다운로드
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-white text-slate-700 font-medium rounded border border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-center py-2"
                    onClick={handleShare}
                  >
                    <Share className="h-5 w-5 mr-2" />
                    공유하기
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Source and Stats Card */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-6">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-medium text-slate-800">리소스 정보</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 text-sm">다운로드 수</span>
                  <span className="font-medium text-slate-800">{resource.downloadCount.toLocaleString()}</span>
                </div>
                {resource.isCrawled && resource.sourceSite && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 text-sm">출처</span>
                    <span className="font-medium text-slate-800">{resource.sourceSite}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 text-sm">유형</span>
                  <span className="font-medium text-slate-800">{getTypeName(resource.resourceType)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 text-sm">등록일</span>
                  <span className="font-medium text-slate-800">
                    {new Date(resource.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Tags Card */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-medium text-slate-800">태그</h3>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {resource.tags && resource.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="bg-slate-100 border-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Details and Recipe */}
          <div className="md:col-span-2">
            {/* Main Info Card */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-6">
              <div className="p-6">
                <h1 className="text-2xl font-bold text-slate-800 mb-4">{resource.title}</h1>
                <div className="prose max-w-none text-slate-700">
                  <p>{resource.description}</p>
                </div>
              </div>
            </div>
            
            {/* Materials List Card */}
            {resource.materialsList && resource.materialsList.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-6">
                <div className="p-4 border-b border-slate-100">
                  <h3 className="font-medium text-slate-800">필요한 재료</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {resource.materialsList.map((material, index) => (
                      <div key={index} className="flex items-center bg-slate-50 p-2 rounded">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{material}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Recipe Steps Card */}
            {resource.recipe && (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-6">
                <div className="p-4 border-b border-slate-100">
                  <h3 className="font-medium text-slate-800">조립/사용 방법</h3>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    {Array.isArray(resource.recipe) ? (
                      resource.recipe.map((step, index) => (
                        <div key={index} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-3">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-800 mb-1">{step.title || `단계 ${index + 1}`}</h4>
                              <p className="text-sm text-slate-600">{step.description}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-slate-700">
                        <p>{typeof resource.recipe === 'string' ? resource.recipe : JSON.stringify(resource.recipe)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Related Resources Card - Can be implemented later */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-medium text-slate-800">관련 리소스</h3>
              </div>
              <div className="p-4">
                <p className="text-slate-500 text-sm">같은 카테고리의 다른 리소스를 확인해보세요.</p>
                <div className="mt-4">
                  <Link href={`/resources/${resource.resourceType}`}>
                    <div className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer">
                      {getTypeName(resource.resourceType)} 더 보기
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ResourceDetail;
