import React from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Resource } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, ThumbsUp, Heart, Share } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import FlashGamePlayer from '@/components/ui/FlashGamePlayer';

const FlashGameDetail: React.FC = () => {
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
  
  if (isLoading) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="h-[480px] bg-slate-300 rounded-lg mb-6"></div>
          <div className="h-4 bg-slate-200 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-6"></div>
        </div>
      </div>
    );
  }
  
  if (!resource || resource.resourceType !== 'flash_game') {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">플래시 게임을 찾을 수 없습니다</h2>
          <p className="text-slate-600 mb-6">요청하신 플래시 게임이 존재하지 않거나 삭제되었을 수 있습니다.</p>
          <Link href="/resources/flash_game">
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              플래시 게임 목록으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      <div className="mb-6">
        <Link href="/resources/flash_game">
          <div className="inline-flex items-center text-blue-600 hover:text-blue-700 cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            플래시 게임 목록으로 돌아가기
          </div>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main content - Game player */}
        <div className="lg:col-span-3">
          <FlashGamePlayer resource={resource} onDownload={handleDownload} />
          
          {/* Game description */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">{resource.title}</h2>
            </div>
            <div className="p-4">
              <p className="text-slate-700">{resource.description}</p>
              
              {/* Tags */}
              <div className="mt-4 flex flex-wrap gap-2">
                {resource.tags && resource.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="bg-slate-100 border-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between">
              <div className="flex items-center text-sm text-slate-500">
                <Download className="h-4 w-4 mr-1" />
                <span>{resource.downloadCount.toLocaleString()}회 플레이</span>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex items-center">
                  <ThumbsUp className="h-4 w-4 mr-1.5" />
                  좋아요
                </Button>
                <Button variant="outline" size="sm" className="flex items-center">
                  <Heart className="h-4 w-4 mr-1.5" />
                  찜하기
                </Button>
                <Button variant="outline" size="sm" className="flex items-center" onClick={handleShare}>
                  <Share className="h-4 w-4 mr-1.5" />
                  공유
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar - Similar games and info */}
        <div className="lg:col-span-1">
          {/* Game info */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-6">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-medium text-slate-800">게임 정보</h3>
            </div>
            <div className="p-4">
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-slate-500">등록일</dt>
                  <dd className="text-sm font-medium text-slate-800">
                    {new Date(resource.createdAt).toLocaleDateString()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-slate-500">플레이 수</dt>
                  <dd className="text-sm font-medium text-slate-800">
                    {resource.downloadCount.toLocaleString()}
                  </dd>
                </div>
                {resource.isCrawled && resource.sourceSite && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-slate-500">출처</dt>
                    <dd className="text-sm font-medium text-slate-800">
                      {resource.sourceSite}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
          
          {/* Controls info */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-6">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-medium text-slate-800">조작 방법</h3>
            </div>
            <div className="p-4">
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start">
                  <span className="bg-slate-100 text-slate-800 rounded px-1.5 py-0.5 text-xs font-medium mr-2">↑↓←→</span>
                  <span>이동 및 방향 조작</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-slate-100 text-slate-800 rounded px-1.5 py-0.5 text-xs font-medium mr-2">Space</span>
                  <span>점프 / 행동</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-slate-100 text-slate-800 rounded px-1.5 py-0.5 text-xs font-medium mr-2">Z / X</span>
                  <span>공격 / 특수 행동</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-slate-100 text-slate-800 rounded px-1.5 py-0.5 text-xs font-medium mr-2">P</span>
                  <span>일시 정지</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Download Button */}
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            게임 다운로드
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FlashGameDetail;