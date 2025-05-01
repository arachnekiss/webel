import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { resourceTypeMap } from '@/lib/resourceTypes';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ArrowLeftCircle, Calendar, Copy, Download, Edit, FileDown, Heart, HeartOff, LinkIcon, Loader2, MapPin, Share, ShoppingBag, Sparkles, User, Clock, Pencil, Info, BookOpen, Hammer, ListFilter, Tag } from 'lucide-react';

const ResourceDetail = () => {
  const [matches, params] = useRoute<{ id: string }>('/resources/:id');
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageModalOpen, setImageModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('info');
  const [isDownloading, setIsDownloading] = useState(false);

  const resourceId = parseInt(params?.id || '0');

  // 리소스 데이터 가져오기
  const { data: resource, isLoading, error } = useQuery({
    queryKey: ['/api/resources', resourceId],
    queryFn: async () => {
      if (!resourceId) return null;
      const response = await fetch(`/api/resources/${resourceId}`);
      if (!response.ok) {
        throw new Error('리소스를 찾을 수 없습니다.');
      }
      return response.json();
    },
    enabled: !!resourceId,
  });

  // 다운로드 처리 함수
  const handleDownload = async () => {
    if (!resource) return;
    
    setIsDownloading(true);
    try {
      // 다운로드 URL이 있으면 그 URL로 리다이렉트
      if (resource.downloadUrl) {
        // 외부 URL인 경우 새 탭에서 열기
        if (resource.downloadUrl.startsWith('http')) {
          window.open(resource.downloadUrl, '_blank');
        } else {
          // 내부 파일인 경우 다운로드 API 호출
          window.location.href = `/api/resources/${resourceId}/download`;
        }
      } 
      // 다운로드 파일이 있으면 다운로드 API 호출
      else if (resource.downloadFile) {
        window.location.href = `/api/resources/${resourceId}/download`;
      }
      
      toast({
        title: '다운로드 시작',
        description: '파일 다운로드가 시작되었습니다.',
      });
    } catch (error) {
      toast({
        title: '다운로드 오류',
        description: '파일을 다운로드하는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // 공유 기능
  const handleShare = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: '링크 복사됨',
        description: '리소스 공유 링크가 클립보드에 복사되었습니다.',
      });
    } catch (error) {
      toast({
        title: '복사 실패',
        description: '링크를 클립보드에 복사하지 못했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 편집 페이지로 이동
  const handleEdit = () => {
    setLocation(`/resources/manage/${resourceId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-64 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              리소스를 찾을 수 없습니다
            </CardTitle>
            <CardDescription>
              요청하신 리소스가 존재하지 않거나 삭제되었을 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setLocation('/resources')}>
              <ArrowLeftCircle className="h-4 w-4 mr-2" />
              리소스 목록으로 돌아가기
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // 이미지 선택 (기본값은 메인 이미지)
  const displayImage = selectedImage || resource.imageUrl || '/placeholder-image.png';
  
  // 카테고리 정보
  const category = resource.category || resource.resourceType || 'free_content';
  const categoryInfo = resourceTypeMap[category] || { name: '기타', color: 'bg-gray-100 text-gray-800' };

  // 업로드 날짜 포맷팅
  const uploadDate = resource.createdAt 
    ? format(new Date(resource.createdAt), 'yyyy년 MM월 dd일', { locale: ko })
    : '날짜 정보 없음';

  // 시간 경과 계산
  const timeAgo = resource.createdAt 
    ? formatDistanceToNow(new Date(resource.createdAt), { addSuffix: true, locale: ko })
    : '';

  // 갤러리 이미지 배열 (메인 이미지 + 갤러리 이미지)
  const galleryImages = [
    resource.imageUrl,
    ...(resource.galleryImages || [])
  ].filter(Boolean); // null/undefined 제거

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setLocation('/resources')} className="mb-4">
          <ArrowLeftCircle className="h-4 w-4 mr-2" />
          리소스 목록으로 돌아가기
        </Button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{resource.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={categoryInfo.color}>
                {categoryInfo.name}
              </Badge>
              
              {resource.version && (
                <Badge variant="outline" className="text-xs font-normal">
                  버전 {resource.version}
                </Badge>
              )}
              
              {resource.license && (
                <Badge variant="outline" className="text-xs font-normal">
                  {resource.license} 라이센스
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share className="h-4 w-4" />
            </Button>
            
            {user?.isAdmin && (
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                편집
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 왼쪽 메인 콘텐츠 영역 */}
        <div className="md:col-span-2 space-y-6">
          {/* 이미지 영역 */}
          <Card className="overflow-hidden border-0 shadow-none">
            <CardContent className="p-0">
              <div className="rounded-lg border overflow-hidden mb-4">
                <AspectRatio ratio={16 / 9}>
                  <img 
                    src={displayImage} 
                    alt={resource.title} 
                    className="object-contain w-full h-full cursor-pointer"
                    onClick={() => setImageModalOpen(true)} 
                  />
                </AspectRatio>
              </div>
              
              {galleryImages.length > 1 && (
                <div className="flex overflow-auto space-x-2 pb-2">
                  {galleryImages.map((img, index) => (
                    <div 
                      key={index}
                      className={`flex-shrink-0 w-20 h-20 border rounded-md overflow-hidden cursor-pointer ${selectedImage === img ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setSelectedImage(img)}
                    >
                      <img 
                        src={img} 
                        alt={`${resource.title} 이미지 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 탭 콘텐츠 */}
          <Card>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <CardHeader className="border-b px-6">
                <TabsList className="w-full justify-start gap-4 bg-transparent h-12">
                  <TabsTrigger 
                    value="info" 
                    className="data-[state=active]:border-b-2 border-primary data-[state=active]:shadow-none rounded-none h-12"
                  >
                    <Info className="h-4 w-4 mr-2" />
                    상세 정보
                  </TabsTrigger>
                  {resource.howToUse && (
                    <TabsTrigger 
                      value="usage" 
                      className="data-[state=active]:border-b-2 border-primary data-[state=active]:shadow-none rounded-none h-12"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      사용법
                    </TabsTrigger>
                  )}
                  {resource.assemblyInstructions && (
                    <TabsTrigger 
                      value="assembly" 
                      className="data-[state=active]:border-b-2 border-primary data-[state=active]:shadow-none rounded-none h-12"
                    >
                      <Hammer className="h-4 w-4 mr-2" />
                      조립방법
                    </TabsTrigger>
                  )}
                </TabsList>
              </CardHeader>
              
              <CardContent className="p-6">
                <TabsContent value="info" className="m-0">
                  {/* 상세 설명 */}
                  <div className="prose max-w-none">
                    <h3 className="text-lg font-medium mb-4">상세 설명</h3>
                    <div className="whitespace-pre-wrap">{resource.description}</div>
                  </div>

                  {/* 태그 */}
                  {resource.tags && resource.tags.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-2">태그</h3>
                      <div className="flex flex-wrap gap-2">
                        {resource.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="usage" className="m-0">
                  <div className="prose max-w-none">
                    <h3 className="text-lg font-medium mb-4">사용법</h3>
                    <div className="whitespace-pre-wrap">{resource.howToUse}</div>
                  </div>
                </TabsContent>
                
                <TabsContent value="assembly" className="m-0">
                  <div className="prose max-w-none">
                    <h3 className="text-lg font-medium mb-4">조립 방법</h3>
                    <div className="whitespace-pre-wrap">{resource.assemblyInstructions}</div>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>

        {/* 오른쪽 사이드바 */}
        <div className="space-y-6">
          {/* 다운로드 카드 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Download className="h-5 w-5 mr-2 text-primary" />
                다운로드
              </CardTitle>
              {resource.downloadCount !== undefined && (
                <CardDescription>
                  다운로드 {resource.downloadCount}회
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {(resource.downloadUrl || resource.downloadFile) ? (
                <Button 
                  className="w-full" 
                  onClick={handleDownload}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      다운로드 중...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      다운로드
                    </>
                  )}
                </Button>
              ) : (
                <div className="text-center py-2 text-muted-foreground">
                  다운로드 파일이 없습니다.
                </div>
              )}
              
              {resource.downloadFile && (
                <p className="text-xs text-muted-foreground">
                  파일명: {resource.downloadFile.split('/').pop()}
                </p>
              )}
              
              {resource.downloadUrl && resource.downloadUrl.startsWith('http') && (
                <div className="flex items-center justify-between text-sm border rounded-md p-2">
                  <span className="truncate flex-1">{resource.downloadUrl}</span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(resource.downloadUrl || '');
                      toast({
                        title: 'URL 복사됨',
                        description: '다운로드 URL이 클립보드에 복사되었습니다.',
                      });
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 업로드 정보 카드 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Info className="h-5 w-5 mr-2 text-primary" />
                리소스 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">카테고리</span>
                  <Badge className={categoryInfo.color}>{categoryInfo.name}</Badge>
                </div>
                
                {resource.version && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">버전</span>
                    <span>{resource.version}</span>
                  </div>
                )}
                
                {resource.license && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">라이센스</span>
                    <span>{resource.license}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">업로드일</span>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{uploadDate}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">마지막 업데이트</span>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{timeAgo}</span>
                  </div>
                </div>
                
                {resource.sourceSite && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">출처</span>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto" 
                      onClick={() => window.open(resource.sourceSite, '_blank')}
                    >
                      <LinkIcon className="h-3 w-3 mr-1" />
                      원본 사이트
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 카테고리별 추가 정보 카드 */}
          {category === 'hardware_design' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-primary" />
                  하드웨어 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Accordion type="single" collapsible>
                  <AccordionItem value="compatibility">
                    <AccordionTrigger>호환성 정보</AccordionTrigger>
                    <AccordionContent>
                      {resource.compatibility || '호환성 정보가 없습니다.'}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="components">
                    <AccordionTrigger>필요 부품</AccordionTrigger>
                    <AccordionContent>
                      {resource.components || '부품 정보가 없습니다.'}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          )}

          {category === 'software' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Pencil className="h-5 w-5 mr-2 text-primary" />
                  소프트웨어 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Accordion type="single" collapsible>
                  <AccordionItem value="requirements">
                    <AccordionTrigger>시스템 요구사항</AccordionTrigger>
                    <AccordionContent>
                      {resource.requirements || '시스템 요구사항 정보가 없습니다.'}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="dependencies">
                    <AccordionTrigger>종속성</AccordionTrigger>
                    <AccordionContent>
                      {resource.dependencies || '종속성 정보가 없습니다.'}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 이미지 모달 */}
      <Dialog open={isImageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{resource.title}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center">
            <img 
              src={displayImage} 
              alt={resource.title} 
              className="max-h-[70vh] max-w-full object-contain" 
            />
          </div>
          <DialogFooter>
            <Button onClick={() => setImageModalOpen(false)}>닫기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResourceDetail;