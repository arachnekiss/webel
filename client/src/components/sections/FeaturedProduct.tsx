import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Resource } from '@/types';
import { Button } from '@/components/ui/button';
import { Download, Share, Phone } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// We'll assume resource ID 5 is the featured product based on our seed data
const FEATURED_RESOURCE_ID = 5;

const FeaturedProduct: React.FC = () => {
  const { toast } = useToast();
  
  const { data: resource, isLoading } = useQuery<Resource>({
    queryKey: [`/api/resources/${FEATURED_RESOURCE_ID}`],
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

  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">인기 하드웨어 설계도</h2>
          <Link href="/resources">
            <div className="text-primary hover:underline text-sm font-medium cursor-pointer">모두 보기</div>
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="md:flex h-96 animate-pulse">
            <div className="md:w-1/3 bg-gray-300"></div>
            <div className="md:w-2/3 p-8 bg-gray-100"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!resource) {
    return null;
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">인기 하드웨어 설계도</h2>
        <Link href="/resources/hardware_design">
          <div className="text-primary hover:underline text-sm font-medium cursor-pointer">모두 보기</div>
        </Link>
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3 relative">
            {resource.imageUrl ? (
              <img 
                src={resource.imageUrl} 
                alt={resource.title} 
                className="w-full h-full object-cover md:h-full" 
              />
            ) : (
              <div className="w-full h-64 md:h-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-500">이미지 없음</span>
              </div>
            )}
            <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 text-sm font-medium rounded">
              하드웨어 설계도
            </div>
          </div>
          <div className="md:w-2/3 p-6 md:p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-3">{resource.title}</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {resource.tags && resource.tags.map((tag, index) => (
                <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-gray-600 mb-6">{resource.description}</p>
            
            {/* Materials section */}
            {resource.materialsList && resource.materialsList.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">필요 재료</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {resource.materialsList.map((material, index) => (
                    <div key={index} className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">{material}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex flex-wrap gap-4">
              <Button
                className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                onClick={handleDownload}
              >
                <Download className="h-5 w-5 mr-2" />
                설계도 다운로드
              </Button>
              <Button
                variant="outline"
                className="px-6 py-2 bg-white text-primary font-medium rounded-lg border border-primary hover:bg-blue-50 transition-colors flex items-center"
                onClick={handleShare}
              >
                <Share className="h-5 w-5 mr-2" />
                공유하기
              </Button>
              <Button
                variant="outline"
                className="px-6 py-2 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center"
              >
                <Phone className="h-5 w-5 mr-2" />
                제작 문의
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProduct;
