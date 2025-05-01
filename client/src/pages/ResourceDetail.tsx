import React, { useState } from 'react';
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
  User,
  Share2,
  MessageSquare,
  Star,
  Heart,
  ThumbsUp,
  Clock,
  List,
  Box,
  Tag,
  ExternalLink,
  Eye,
  FileDown,
  HelpCircle,
  X,
  CheckCircle,
  ShoppingCart,
  Upload,
  Package,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

  // 좋아요 및 공유 기능을 위한 상태 변수
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      {/* 제품 이미지 모달 */}
      {showFullImage && resource.imageUrl && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullImage(false)}
        >
          <div className="max-w-4xl max-h-[90vh] relative">
            <Button 
              size="sm" 
              variant="ghost" 
              className="absolute -top-10 right-0 text-white hover:bg-white/20"
              onClick={() => setShowFullImage(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            <img 
              src={resource.imageUrl}
              alt={resource.title}
              className="max-h-[85vh] max-w-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* 상단 네비게이션 */}
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setLocation('/resources')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          목록으로 돌아가기
        </Button>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-500 hover:text-primary"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: resource.title,
                        text: `${resource.title} - Webel 리소스 공유`,
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      toast({
                        title: "URL이 복사되었습니다",
                        description: "공유 링크가 클립보드에 복사되었습니다.",
                      });
                    }
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>공유하기</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={isLiked ? "default" : "ghost"} 
                  size="sm" 
                  className={isLiked ? "bg-pink-100 text-pink-600 hover:bg-pink-200 hover:text-pink-700" : "text-gray-500 hover:text-pink-500"}
                  onClick={() => setIsLiked(!isLiked)}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isLiked ? "좋아요 취소" : "좋아요"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 메인 콘텐츠 영역 */}
        <div className="lg:col-span-8">
          {/* 헤더 및 이미지 섹션 */}
          <div className="bg-white rounded-lg border shadow-sm mb-8">
            <div className="p-6 pb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary/10 h-10 w-10 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{resource.userId ? `사용자 ${resource.userId}` : "Webel 사용자"}</div>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formattedDate}
                  </div>
                </div>
                <Button 
                  variant={isFollowing ? "default" : "outline"} 
                  size="sm" 
                  className="ml-auto"
                  onClick={() => setIsFollowing(!isFollowing)}
                >
                  {isFollowing ? "팔로잉" : "팔로우"}
                </Button>
              </div>
              
              <h1 className="text-3xl font-bold leading-tight mb-3">{resource.title}</h1>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className={resourceTypeMap[resource.resourceType]?.color || 'bg-gray-100'}>
                  {resourceTypeMap[resource.resourceType]?.name || resource.resourceType}
                </Badge>
                
                {resource.category && (
                  <Badge variant="outline" className="ml-2">
                    {resource.category}
                  </Badge>
                )}
              </div>
            </div>
            
            {resource.imageUrl && (
              <div className="border-t border-b relative group cursor-pointer" onClick={() => setShowFullImage(true)}>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                  <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                </div>
                <img
                  src={resource.imageUrl}
                  alt={resource.title}
                  className="w-full object-contain max-h-[500px]"
                />
              </div>
            )}
            
            <div className="p-6 pt-4 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-1.5">
                  <Button 
                    variant={isLiked ? "default" : "ghost"} 
                    size="sm" 
                    className={isLiked ? "bg-pink-100 text-pink-600 hover:bg-pink-200 hover:text-pink-700" : "text-gray-500 hover:text-pink-500"}
                    onClick={() => setIsLiked(!isLiked)}
                  >
                    <Heart className={`h-4 w-4 mr-1.5 ${isLiked ? "fill-current" : ""}`} />
                    {isLiked ? "좋아요 취소" : "좋아요"}
                  </Button>
                </div>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-sm text-gray-500">
                        <Eye className="h-4 w-4 mr-1.5" />
                        조회수 {Math.floor(Math.random() * 100) + 10}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>조회수</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-sm text-gray-500">
                        <FileDown className="h-4 w-4 mr-1.5" />
                        다운로드 {resource.downloadCount || 0}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>다운로드 횟수</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
          
          {/* 상세 정보 탭 */}
          <div className="bg-white rounded-lg border shadow-sm mb-8">
            <Tabs defaultValue="description" className="w-full">
              <div className="border-b">
                <div className="px-6">
                  <TabsList className="w-full justify-start gap-6 bg-transparent h-12">
                    <TabsTrigger value="description" className="data-[state=active]:border-b-2 border-primary data-[state=active]:shadow-none rounded-none h-12">
                      <Info className="h-4 w-4 mr-2" />
                      상세 설명
                    </TabsTrigger>
                    {resource.howToUse && (
                      <TabsTrigger value="howToUse" className="data-[state=active]:border-b-2 border-primary data-[state=active]:shadow-none rounded-none h-12">
                        <BookOpen className="h-4 w-4 mr-2" />
                        사용 방법
                      </TabsTrigger>
                    )}
                    {resource.assemblyInstructions && (
                      <TabsTrigger value="assembly" className="data-[state=active]:border-b-2 border-primary data-[state=active]:shadow-none rounded-none h-12">
                        <Hammer className="h-4 w-4 mr-2" />
                        조립 방법
                      </TabsTrigger>
                    )}
                  </TabsList>
                </div>
              </div>
              
              <TabsContent value="description" className="p-6">
                <div className="prose prose-blue max-w-none">
                  <p className="whitespace-pre-line text-base leading-relaxed">{resource.description}</p>
                </div>
              </TabsContent>
              
              {resource.howToUse && (
                <TabsContent value="howToUse" className="p-6">
                  <div className="prose prose-blue max-w-none">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <HelpCircle className="h-5 w-5 mr-2 text-primary" />
                      사용 방법
                    </h3>
                    <p className="whitespace-pre-line text-base leading-relaxed">{resource.howToUse}</p>
                  </div>
                </TabsContent>
              )}
              
              {resource.assemblyInstructions && (
                <TabsContent value="assembly" className="p-6">
                  <div className="prose prose-blue max-w-none">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <Hammer className="h-5 w-5 mr-2 text-primary" />
                      조립 방법
                    </h3>
                    <p className="whitespace-pre-line text-base leading-relaxed">{resource.assemblyInstructions}</p>
                  </div>
                </TabsContent>
              )}
              
              {resource.tags && Array.isArray(resource.tags) && resource.tags.length > 0 && (
                <div className="px-6 py-4 border-t">
                  <div className="flex items-start gap-2">
                    <Tag className="h-4 w-4 mt-1 text-gray-500" />
                    <div className="flex flex-wrap gap-2">
                      {resource.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-gray-100 hover:bg-gray-200 text-gray-800">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Tabs>
          </div>
          
          {/* 관리자 전용 컨트롤 */}
          {isAdmin && (
            <div className="bg-white rounded-lg border shadow-sm p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">관리자 도구</h3>
              <div className="flex items-center gap-4">
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
              </div>
            </div>
          )}
        </div>
        
        {/* 사이드바 영역 */}
        <div className="lg:col-span-4">
          {/* 다운로드 카드 */}
          <div className="bg-white rounded-lg border shadow-sm mb-6">
            <div className="p-6 pb-4 border-b">
              <h3 className="text-lg font-semibold mb-1 flex items-center">
                <Package className="h-5 w-5 mr-2 text-primary" />
                무료 리소스
              </h3>
              <p className="text-sm text-gray-500">
                이 리소스는 무료로 다운로드할 수 있습니다.
              </p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="bg-primary/5 p-4 rounded-md">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div className="font-medium">무료로 제공</div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-700 gap-2">
                      <FileDown className="h-4 w-4 text-primary" />
                      <span>다운로드 수: <strong>{resource.downloadCount || 0}회</strong></span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700 gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>업로드 날짜: <strong>{formattedDate}</strong></span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700 gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <span>제공자: <strong>{resource.userId ? `사용자 ${resource.userId}` : "Webel 사용자"}</strong></span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-4 pb-4 border-b">
                    {resource.downloadUrl 
                      ? "외부 다운로드 링크로 이동합니다." 
                      : "파일 다운로드가 즉시 시작됩니다."}
                  </div>
                </div>
                
                <Button 
                  onClick={handleDownload} 
                  className="w-full h-12 text-base font-medium"
                  size="lg"
                >
                  <Download className="mr-2 h-5 w-5" />
                  무료 다운로드
                </Button>
                
                {resource.downloadUrl && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(resource.downloadUrl, '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    원본 링크로 이동
                  </Button>
                )}

                <div className="text-center text-xs text-gray-500 mt-2">
                  다운로드 버튼을 클릭하면 Webel의 <a href="#" className="text-primary hover:underline">이용약관</a>에 동의하게 됩니다.
                </div>
              </div>
            </div>
          </div>
          
          {/* 정보 카드 */}
          <div className="bg-white rounded-lg border shadow-sm mb-6">
            <div className="p-6 pb-4 border-b">
              <h3 className="text-lg font-semibold mb-1 flex items-center">
                <Info className="h-5 w-5 mr-2 text-primary" />
                리소스 정보
              </h3>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">리소스 유형</span>
                  <Badge className={resourceTypeMap[resource.resourceType]?.color || 'bg-gray-100'}>
                    {resourceTypeMap[resource.resourceType]?.name || resource.resourceType}
                  </Badge>
                </div>
                
                {resource.category && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">카테고리</span>
                    <Badge variant="outline">{resource.category}</Badge>
                  </div>
                )}
                
                {resource.license && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">라이센스</span>
                    <span>{resource.license}</span>
                  </div>
                )}
                
                {resource.version && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">버전</span>
                    <span>{resource.version}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">등록일</span>
                  <span>{formattedDate}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">다운로드 횟수</span>
                  <span>{resource.downloadCount || 0}회</span>
                </div>
                
                {resource.sourceSite && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">출처</span>
                    <span>{resource.sourceSite}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* 소셜 공유 카드 */}
          <div className="bg-white rounded-lg border shadow-sm mb-6">
            <div className="p-4">
              <div className="flex flex-col space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: resource.title,
                        text: `${resource.title} - Webel 리소스 공유`,
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      toast({
                        title: "URL이 복사되었습니다",
                        description: "공유 링크가 클립보드에 복사되었습니다.",
                      });
                    }
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  리소스 공유하기
                </Button>
                
                <Button 
                  variant={isLiked ? "default" : "outline"} 
                  className={`w-full justify-start ${isLiked ? "bg-pink-100 hover:bg-pink-200 text-pink-600 border-pink-200" : ""}`}
                  onClick={() => setIsLiked(!isLiked)}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                  {isLiked ? "좋아요 취소" : "좋아요"}
                </Button>
                
                <Button 
                  variant={isFollowing ? "default" : "outline"} 
                  className="w-full justify-start"
                  onClick={() => setIsFollowing(!isFollowing)}
                >
                  <User className="h-4 w-4 mr-2" />
                  {isFollowing ? "팔로잉" : "업로더 팔로우"}
                </Button>
              </div>
            </div>
          </div>

          {/* 관련 리소스 카드 */}
          <div className="bg-white rounded-lg border shadow-sm mb-6">
            <div className="p-6 pb-4 border-b">
              <h3 className="text-lg font-semibold mb-1 flex items-center">
                <Tag className="h-5 w-5 mr-2 text-primary" />
                관련 리소스
              </h3>
              <p className="text-sm text-gray-500">
                같은 카테고리의 다른 리소스를 확인해 보세요.
              </p>
            </div>
            
            <div className="p-6">
              {/* 관련 리소스 목록 - 미래 기능에서 실제 데이터로 구현 */}
              <div className="space-y-3">
                <div className="bg-gray-50 hover:bg-gray-100 rounded-md p-3 transition-colors cursor-pointer">
                  <div className="text-sm font-medium line-clamp-1">유사한 리소스 추천 기능 준비 중</div>
                  <div className="text-xs text-gray-500 mt-1">곧 제공될 예정입니다</div>
                </div>
                <div className="bg-gray-50 hover:bg-gray-100 rounded-md p-3 transition-colors cursor-pointer">
                  <div className="text-sm font-medium line-clamp-1">AI 기반 맞춤형 리소스 추천</div>
                  <div className="text-xs text-gray-500 mt-1">개발 중</div>
                </div>
                <div className="bg-gray-50 hover:bg-gray-100 rounded-md p-3 transition-colors cursor-pointer">
                  <div className="text-sm font-medium line-clamp-1">인기 리소스 보기</div>
                  <div className="text-xs text-gray-500 mt-1">베타 기능</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 태그 카드 */}
          {resource.tags && Array.isArray(resource.tags) && resource.tags.length > 0 && (
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-6 pb-4 border-b">
                <h3 className="text-lg font-semibold mb-1 flex items-center">
                  <List className="h-5 w-5 mr-2 text-primary" />
                  태그
                </h3>
              </div>
              
              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="px-3 py-1 cursor-pointer hover:bg-secondary/80"
                      onClick={() => setLocation(`/resources?tag=${tag}`)}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}