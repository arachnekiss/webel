import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Resource } from '@shared/schema';
import {
  Loader2,
  Download,
  Calendar,
  Info,
  BookOpen,
  Hammer,
  ArrowLeft,
  Edit,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

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

export default function ResourceDetail() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute<{ id: string }>('/resources/:id');
  
  // 리소스 ID가 없으면 목록 페이지로 이동
  if (!match || !params?.id) {
    setLocation('/resources');
    return null;
  }
  
  const resourceId = parseInt(params.id);
  
  // 리소스 상세 데이터 가져오기
  const { data: resource, isLoading, error } = useQuery<Resource>({
    queryKey: ['/api/resources', resourceId],
    queryFn: async () => {
      const response = await fetch(`/api/resources/${resourceId}`);
      if (!response.ok) {
        throw new Error('리소스를 찾을 수 없습니다.');
      }
      return response.json();
    },
    staleTime: 60 * 1000, // 1분 동안 캐시 유지
  });

  // 리소스 다운로드 처리
  const handleDownload = async () => {
    if (!resource) return;
    
    try {
      const response = await fetch(`/api/resources/${resourceId}/download`);
      const data = await response.json();
      
      if (data.redirectUrl) {
        window.open(data.redirectUrl, '_blank');
        
        toast({
          title: '다운로드 시작',
          description: `'${resource.title}' 다운로드가 시작되었습니다.`,
        });
      }
    } catch (error) {
      toast({
        title: '다운로드 실패',
        description: '리소스 다운로드 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 리소스 삭제 처리
  const handleDelete = async () => {
    if (!resource) return;
    
    try {
      const response = await apiRequest('DELETE', `/api/resources/${resourceId}`);
      
      if (!response.ok) {
        throw new Error('리소스 삭제에 실패했습니다.');
      }
      
      toast({
        title: '리소스 삭제 완료',
        description: '리소스가 성공적으로 삭제되었습니다.',
      });
      
      setLocation('/resources');
    } catch (error) {
      toast({
        title: '삭제 실패',
        description: error instanceof Error ? error.message : '리소스 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="container mx-auto py-10">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">리소스를 찾을 수 없습니다</CardTitle>
            <CardDescription>
              요청하신 리소스가 존재하지 않거나 접근 권한이 없습니다.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setLocation('/resources')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              리소스 목록으로 돌아가기
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const isAdmin = user?.isAdmin;
  const formattedDate = resource.createdAt
    ? format(new Date(resource.createdAt), 'yyyy년 MM월 dd일', { locale: ko })
    : '날짜 정보 없음';

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Button variant="outline" size="sm" onClick={() => setLocation('/resources')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          리소스 목록으로 돌아가기
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <Badge className={resourceTypeMap[resource.resourceType]?.color || 'bg-gray-100'}>
                    {resourceTypeMap[resource.resourceType]?.name || resource.resourceType}
                  </Badge>
                  
                  {resource.category && (
                    <Badge variant="outline" className="ml-2">
                      {resource.category}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formattedDate}</span>
                </div>
              </div>
              <CardTitle className="text-3xl mt-2">{resource.title}</CardTitle>
            </CardHeader>
            
            <CardContent>
              {resource.imageUrl && (
                <div className="mb-6 aspect-video overflow-hidden rounded-lg">
                  <img
                    src={resource.imageUrl}
                    alt={resource.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              
              <Tabs defaultValue="description">
                <TabsList className="mb-4">
                  <TabsTrigger value="description">
                    <Info className="h-4 w-4 mr-1" />
                    설명
                  </TabsTrigger>
                  {resource.howToUse && (
                    <TabsTrigger value="howToUse">
                      <BookOpen className="h-4 w-4 mr-1" />
                      사용 방법
                    </TabsTrigger>
                  )}
                  {resource.assemblyInstructions && (
                    <TabsTrigger value="assembly">
                      <Hammer className="h-4 w-4 mr-1" />
                      조립 설명서
                    </TabsTrigger>
                  )}
                </TabsList>
                
                <TabsContent value="description" className="text-md">
                  <p className="whitespace-pre-line">{resource.description}</p>
                </TabsContent>
                
                {resource.howToUse && (
                  <TabsContent value="howToUse" className="text-md">
                    <p className="whitespace-pre-line">{resource.howToUse}</p>
                  </TabsContent>
                )}
                
                {resource.assemblyInstructions && (
                  <TabsContent value="assembly" className="text-md">
                    <p className="whitespace-pre-line">{resource.assemblyInstructions}</p>
                  </TabsContent>
                )}
              </Tabs>

              {resource.tags && Array.isArray(resource.tags) && resource.tags.length > 0 && (
                <div className="mt-6">
                  <Separator className="mb-4" />
                  <div className="flex flex-wrap gap-2">
                    {resource.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="justify-between flex-wrap gap-4">
              <div>
                <Badge variant="outline" className="text-gray-600">
                  다운로드: {resource.downloadCount || 0}회
                </Badge>
                
                {resource.sourceSite && (
                  <Badge variant="outline" className="ml-2 text-gray-600">
                    출처: {resource.sourceSite}
                  </Badge>
                )}
              </div>
              
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                다운로드
              </Button>
            </CardFooter>
          </Card>
          
          {/* 관리자 전용 컨트롤 */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">관리자 도구</CardTitle>
                <CardDescription>
                  이 리소스에 대한 관리 작업을 수행할 수 있습니다.
                </CardDescription>
              </CardHeader>
              
              <CardFooter className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setLocation(`/edit-resource/${resourceId}`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  수정하기
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      삭제하기
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>리소스 삭제</AlertDialogTitle>
                      <AlertDialogDescription>
                        정말로 이 리소스를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        삭제
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          )}
        </div>
        
        {/* 사이드바 섹션 */}
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">다운로드 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">다운로드 횟수:</span>
                  <span className="font-medium">{resource.downloadCount || 0}회</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">등록일:</span>
                  <span className="font-medium">{formattedDate}</span>
                </div>
                {resource.sourceSite && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">출처:</span>
                    <span className="font-medium">{resource.sourceSite}</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                다운로드
              </Button>
            </CardFooter>
          </Card>
          
          {/* 관련 리소스 추천 기능 - 미래에 구현 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">관련 리소스</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-sm">
                같은 카테고리의 다른 리소스를 확인해 보세요.
              </p>
              {/* 관련 리소스 목록은 미래 기능에서 구현 */}
              <div className="text-center py-8 text-gray-400">
                <p>관련 리소스 기능 준비 중</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}