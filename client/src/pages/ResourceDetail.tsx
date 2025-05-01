import React, { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Download, 
  Calendar, 
  Tag, 
  FileText, 
  Share2, 
  Bookmark, 
  ThumbsUp,
  AlertCircle,
  CheckCircle,
  Box,
  List
} from 'lucide-react';
import { Resource } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

// resource type 이름 맵핑 함수
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
      return 'AI 모델';
    case 'flash_game':
      return '플래시 게임';
    default:
      return type;
  }
};

// 리소스 유형별 색상 클래스 매핑
const getTypeColorClass = (type: string): string => {
  switch (type) {
    case 'hardware_design':
      return 'bg-yellow-500 text-white';
    case '3d_model':
      return 'bg-green-500 text-white';
    case 'software':
      return 'bg-blue-500 text-white';
    case 'ai_model':
      return 'bg-purple-500 text-white';
    case 'free_content':
      return 'bg-indigo-500 text-white';
    case 'flash_game':
      return 'bg-red-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

// 날짜 형식 변환 함수
const formatDate = (date: Date | string | undefined): string => {
  if (!date) return '날짜 정보 없음';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return `${dateObj.getFullYear()}년 ${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;
  } catch (e) {
    return '유효하지 않은 날짜';
  }
};

// 상세 페이지 컴포넌트
const ResourceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('details');

  // 리소스 데이터 가져오기
  const { data: resource, isLoading, error } = useQuery<Resource>({
    queryKey: [`/api/resources/${id}`],
  });

  // 다운로드 처리 함수
  const handleDownload = async () => {
    if (!resource) return;
    
    try {
      // 다운로드 카운트 증가 요청
      await apiRequest('POST', `/api/resources/${id}/download`, undefined);
      
      // 다운로드 URL이 있으면 새 탭에서 열기
      if (resource.downloadUrl) {
        window.open(resource.downloadUrl, '_blank');
        
        toast({
          title: "다운로드 시작됨",
          description: `${resource.title} 다운로드가 시작되었습니다.`,
        });
      } else {
        toast({
          title: "다운로드 링크 없음",
          description: "이 리소스에는 다운로드 링크가 없습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "다운로드 실패",
        description: "파일을 다운로드하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 로딩 중 표시
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="w-full h-96 rounded-lg mb-6" />
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div>
            <Skeleton className="w-full h-64 rounded-lg mb-4" />
            <Skeleton className="w-full h-10 mb-3" />
            <Skeleton className="w-full h-36" />
          </div>
        </div>
      </div>
    );
  }

  // 에러 표시
  if (error || !resource) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>리소스를 불러올 수 없습니다</AlertTitle>
          <AlertDescription>
            요청한 리소스를 찾을 수 없거나 액세스 권한이 없습니다. 
            <Link href="/resources" className="underline ml-1">
              리소스 목록으로 돌아가기
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const resourceType = resource.resourceType || resource.category;
  const createdAt = resource.uploadDate || resource.createdAt;
  const timeAgo = createdAt ? formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: ko }) : '';

  return (
    <div className="container mx-auto py-8 px-4">
      {/* 뒤로 가기 버튼 */}
      <div className="mb-6">
        <Link href="/resources" className="inline-flex items-center text-gray-600 hover:text-primary">
          <ArrowLeft className="h-4 w-4 mr-1" />
          모든 리소스로 돌아가기
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 메인 콘텐츠 영역 */}
        <div className="lg:col-span-2">
          {/* 리소스 제목 및 기본 정보 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${getTypeColorClass(resourceType)} px-3 py-1`}>
                {getTypeName(resourceType)}
              </Badge>
              <span className="text-sm text-gray-500">{timeAgo}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{resource.title}</h1>
            <div className="flex flex-wrap gap-2">
              {resource.tags && resource.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="bg-gray-100 text-gray-700">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* 리소스 이미지 */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
            {resource.imageUrl ? (
              <img 
                src={resource.imageUrl} 
                alt={resource.title} 
                className="w-full h-auto max-h-[500px] object-contain bg-gray-50 p-2"
              />
            ) : (
              <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                <FileText className="h-12 w-12 text-gray-400" />
                <span className="text-gray-500 ml-2">이미지 없음</span>
              </div>
            )}
          </div>

          {/* 탭 내비게이션 */}
          <Tabs defaultValue="details" className="mb-6" onValueChange={setActiveTab}>
            <TabsList className="w-full border-b mb-6">
              <TabsTrigger value="details" className="data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:border-b-2">
                상세 정보
              </TabsTrigger>
              <TabsTrigger value="howToUse" className="data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:border-b-2">
                사용 방법
              </TabsTrigger>
              <TabsTrigger value="assembly" className="data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:border-b-2">
                조립 방법
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-0">
              <div className="prose max-w-none">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold mb-4">리소스 설명</h2>
                  <p className="whitespace-pre-line">{resource.description}</p>
                  
                  {/* 추가 정보 */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-medium mb-3">추가 정보</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">업로드 날짜</p>
                          <p>{formatDate(createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Download className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">다운로드 수</p>
                          <p>{resource.downloadCount.toLocaleString()}회</p>
                        </div>
                      </div>
                      {resource.sourceSite && (
                        <div className="flex items-start">
                          <FileText className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">출처</p>
                            <a 
                              href={resource.sourceSite} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {resource.sourceSite}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="howToUse" className="mt-0">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4">사용 방법</h2>
                {resource.howToUse ? (
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-line">{resource.howToUse}</p>
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>사용 방법 정보 없음</AlertTitle>
                    <AlertDescription>
                      이 리소스에 대한 사용 방법 정보가 아직 제공되지 않았습니다.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>

            <TabsContent value="assembly" className="mt-0">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4">조립 방법</h2>
                {resource.assemblyInstructions ? (
                  <div className="space-y-4">
                    {typeof resource.assemblyInstructions === 'string' ? (
                      <p className="whitespace-pre-line">{resource.assemblyInstructions}</p>
                    ) : (
                      <div className="space-y-6">
                        {/* 구조화된 조립 지침 렌더링 */}
                        {resource.assemblyInstructions.steps && Array.isArray(resource.assemblyInstructions.steps) && (
                          <div>
                            <h3 className="text-lg font-medium mb-3">조립 단계</h3>
                            <ol className="list-decimal pl-5 space-y-3">
                              {resource.assemblyInstructions.steps.map((step: any, index: number) => (
                                <li key={index} className="pl-2">
                                  <div className="font-medium">단계 {index + 1}: {step.title}</div>
                                  <p className="text-gray-600 mt-1">{step.description}</p>
                                  {step.imageUrl && (
                                    <img 
                                      src={step.imageUrl} 
                                      alt={`단계 ${index + 1}`} 
                                      className="mt-2 max-h-40 object-contain"
                                    />
                                  )}
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {/* 필요한 도구 및 재료 */}
                        {resource.assemblyInstructions.materials && Array.isArray(resource.assemblyInstructions.materials) && (
                          <div className="mt-6">
                            <h3 className="text-lg font-medium mb-3">필요한 재료</h3>
                            <ul className="list-disc pl-5 space-y-1">
                              {resource.assemblyInstructions.materials.map((material: string, index: number) => (
                                <li key={index}>{material}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* 필요한 도구 */}
                        {resource.assemblyInstructions.tools && Array.isArray(resource.assemblyInstructions.tools) && (
                          <div className="mt-6">
                            <h3 className="text-lg font-medium mb-3">필요한 도구</h3>
                            <ul className="list-disc pl-5 space-y-1">
                              {resource.assemblyInstructions.tools.map((tool: string, index: number) => (
                                <li key={index}>{tool}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* 주의사항 */}
                        {resource.assemblyInstructions.notes && (
                          <Alert className="mt-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>주의사항</AlertTitle>
                            <AlertDescription>
                              {resource.assemblyInstructions.notes}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>조립 방법 정보 없음</AlertTitle>
                    <AlertDescription>
                      이 리소스에 대한 조립 방법 정보가 아직 제공되지 않았습니다.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* AI 조립 비서 가이드 */}
          {(resourceType === 'hardware_design' || resourceType === '3d_model') && (
            <div className="mb-8">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full p-2 mr-4">
                      <CheckCircle className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-800 mb-2">AI 조립 비서로 쉽게 조립하세요</h3>
                      <p className="text-blue-700 mb-4">
                        이 리소스의 조립에 어려움이 있으신가요? Webel의 AI 조립 비서가 실시간으로 도와드립니다.
                        이미지를 업로드하거나 질문하시면 단계별 안내를 받을 수 있습니다.
                      </p>
                      <Link href="/ai-assembly">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          AI 조립 비서 이용하기
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 3D 모델 뷰어 (3D 모델 리소스인 경우) */}
          {resourceType === '3d_model' && resource.downloadUrl && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3D 모델 미리보기</h2>
              <div className="border border-gray-200 rounded-lg bg-gray-50 overflow-hidden w-full h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <Box className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">3D 모델 미리보기 준비 중</p>
                  <p className="text-sm text-gray-400">3D 모델 뷰어는 추후 업데이트 예정입니다</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 우측 사이드바 영역 */}
        <div className="lg:col-span-1">
          {/* 다운로드 카드 */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">다운로드</h3>
              <div className="space-y-4">
                <p className="text-sm text-gray-600 flex items-center">
                  <Download className="h-4 w-4 mr-1" />
                  {resource.downloadCount.toLocaleString()}명이 다운로드함
                </p>
                
                <Button 
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleDownload}
                  disabled={!resource.downloadUrl}
                >
                  <Download className="h-5 w-5" />
                  파일 다운로드
                </Button>
                
                {!resource.downloadUrl && (
                  <p className="text-sm text-amber-600">
                    다운로드 링크가 현재 제공되지 않습니다.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 작업 카드 */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">작업</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Share2 className="h-4 w-4 mr-2" />
                  공유하기
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bookmark className="h-4 w-4 mr-2" />
                  북마크 추가
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  추천하기
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 유사 리소스 */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">유사한 리소스</h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  유사한 리소스를 불러오는 중입니다...
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link href={`/resources/type/${resourceType}`}>
                  <Button variant="link" className="p-0 h-auto text-primary hover:underline">
                    {getTypeName(resourceType)} 더 보기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* 조립 서비스 연결 */}
          {(resourceType === 'hardware_design' || resourceType === '3d_model') && (
            <Card className="mb-6 bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-100">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-indigo-900">전문가 조립 서비스</h3>
                <p className="text-sm text-indigo-700 mb-4">
                  직접 조립하기 어렵다면 근처 엔지니어에게 조립을 의뢰해보세요.
                </p>
                <Link href="/engineers">
                  <Button variant="outline" className="w-full bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                    엔지니어 찾기
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* 3D 프린팅 서비스 연결 (3D 모델인 경우) */}
          {resourceType === '3d_model' && (
            <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-100">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-green-900">3D 프린팅 서비스</h3>
                <p className="text-sm text-green-700 mb-4">
                  3D 프린터가 없으신가요? 근처에서 3D 프린팅 서비스를 찾아보세요.
                </p>
                <Link href="/services/type/3d_printing">
                  <Button variant="outline" className="w-full bg-white border-green-200 text-green-700 hover:bg-green-50">
                    3D 프린터 찾기
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceDetail;