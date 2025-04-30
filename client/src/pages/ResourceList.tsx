import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Resource } from '@shared/schema';
import { Loader2, Download, Tag, Calendar, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

type ResourceTypeMap = {
  [key: string]: { name: string; color: string };
};

const resourceTypeMap: ResourceTypeMap = {
  hardware_design: { name: '하드웨어 디자인', color: 'bg-yellow-100 text-yellow-800' },
  software: { name: '소프트웨어', color: 'bg-blue-100 text-blue-800' },
  '3d_model': { name: '3D 모델', color: 'bg-green-100 text-green-800' },
  free_content: { name: '무료 콘텐츠', color: 'bg-purple-100 text-purple-800' },
  ai_model: { name: 'AI 모델', color: 'bg-red-100 text-red-800' },
  flash_game: { name: '플래시 게임', color: 'bg-orange-100 text-orange-800' },
};

export default function ResourceList() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // 리소스 데이터 가져오기
  const { data: resources, isLoading } = useQuery<Resource[]>({
    queryKey: ['/api/resources'],
    staleTime: 60 * 1000, // 1분 동안 캐시 유지
  });

  // 탭 변경 처리
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // 리소스 타입별 필터링
  const filteredResources = resources?.filter(resource => {
    if (activeTab === 'all') return true;
    return resource.resourceType === activeTab;
  });

  // 리소스 다운로드 처리
  const handleDownload = async (resourceId: number, title: string) => {
    try {
      const response = await fetch(`/api/resources/${resourceId}/download`);
      const data = await response.json();
      
      if (data.redirectUrl) {
        window.open(data.redirectUrl, '_blank');
      }
    } catch (error) {
      console.error('다운로드 에러:', error);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">리소스 라이브러리</h1>
          <p className="text-gray-500 mt-2">
            하드웨어 디자인, 소프트웨어, 3D 모델 등 다양한 리소스를 찾아보세요.
          </p>
        </div>
        
        {user && (
          <Button onClick={() => setLocation('/upload-resource')}>
            리소스 업로드
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" onValueChange={handleTabChange}>
        <TabsList className="mb-8 grid grid-cols-3 md:grid-cols-7 w-full">
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="hardware_design">하드웨어</TabsTrigger>
          <TabsTrigger value="software">소프트웨어</TabsTrigger>
          <TabsTrigger value="3d_model">3D 모델</TabsTrigger>
          <TabsTrigger value="free_content">무료 콘텐츠</TabsTrigger>
          <TabsTrigger value="ai_model">AI 모델</TabsTrigger>
          <TabsTrigger value="flash_game">플래시 게임</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredResources?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-500">등록된 리소스가 없습니다.</p>
              {user && (
                <Button onClick={() => setLocation('/upload-resource')} className="mt-4">
                  첫 번째 리소스 등록하기
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources?.map((resource) => (
                <Card key={resource.id} className="h-full flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={resourceTypeMap[resource.resourceType]?.color || 'bg-gray-100'}>
                        {resourceTypeMap[resource.resourceType]?.name || resource.resourceType}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Download className="h-4 w-4 mr-1" />
                        <span>{resource.downloadCount}</span>
                      </div>
                    </div>
                    <CardTitle className="text-xl hover:text-primary transition-colors">
                      <Link href={`/resources/${resource.id}`} className="hover:underline">
                        {resource.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {resource.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pb-4 flex-grow">
                    {resource.imageUrl && (
                      <div className="mb-4 aspect-video overflow-hidden rounded-md">
                        <img
                          src={resource.imageUrl}
                          alt={resource.title}
                          className="h-full w-full object-cover transition-all hover:scale-105"
                        />
                      </div>
                    )}
                    
                    {resource.tags && Array.isArray(resource.tags) && resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {resource.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        {resource.createdAt
                          ? format(new Date(resource.createdAt), 'yyyy년 MM월 dd일', { locale: ko })
                          : '날짜 정보 없음'}
                      </span>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-0 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setLocation(`/resources/${resource.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      상세보기
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDownload(resource.id, resource.title)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      다운로드
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}