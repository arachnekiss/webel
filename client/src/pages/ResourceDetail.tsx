import React from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Download, 
  Calendar, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Box,
  Info,
  BookOpen,
  Wrench,
  Tag,
  Link2
} from 'lucide-react';
import { Resource } from '@/types';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import RelatedResources from '@/components/RelatedResources';

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

  // 리소스 데이터 가져오기
  const { data: resource, isLoading, error } = useQuery<Resource>({
    queryKey: [`/api/resources/${id}`],
    enabled: !!id && !isNaN(Number(id)), // id가 존재하고 숫자로 변환 가능한 경우에만 쿼리 실행
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
  const timeAgo = createdAt 
    ? formatDistanceToNow(new Date(typeof createdAt === 'string' ? createdAt : createdAt instanceof Date ? createdAt : new Date()), { 
        addSuffix: true, 
        locale: ko 
      }) 
    : '';

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* 뒤로 가기 버튼 */}
      <div className="mb-6">
        <Link href="/resources" className="inline-flex items-center text-gray-600 hover:text-primary">
          <ArrowLeft className="h-4 w-4 mr-1" />
          모든 리소스로 돌아가기
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 메인 콘텐츠 영역 */}
        <div className="lg:col-span-3 space-y-8">
          {/* 리소스 헤더 영역 */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden p-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge className={`${getTypeColorClass(resourceType)} px-3 py-1`}>
                {getTypeName(resourceType)}
              </Badge>
              <span className="text-sm text-gray-500">{timeAgo}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{resource.title}</h1>
            
            {resource.tags && resource.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {resource.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="bg-gray-50 text-gray-700">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* 리소스 이미지 */}
            <div className="bg-gray-50 rounded-md overflow-hidden mb-6">
              {resource.imageUrl ? (
                <img 
                  src={resource.imageUrl} 
                  alt={resource.title} 
                  className="w-full h-auto object-contain max-h-[400px]"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center">
                  <FileText className="h-12 w-12 text-gray-300" />
                </div>
              )}
            </div>
            
            {/* 리소스 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                <div>
                  <span className="text-gray-500 block">등록일</span>
                  <span>{formatDate(createdAt ? (typeof createdAt === 'string' ? createdAt : createdAt instanceof Date ? createdAt : undefined) : undefined)}</span>
                </div>
              </div>
              
              {Array.isArray(resource.tags) && resource.tags.length > 0 && (
                <div className="flex items-center">
                  <Tag className="h-4 w-4 text-gray-500 mr-2" />
                  <div>
                    <span className="text-gray-500 block">태그</span>
                    <span className="truncate max-w-[200px]">{resource.tags.join(', ')}</span>
                  </div>
                </div>
              )}
              
              {resource.downloadUrl && (
                <div className="flex items-center">
                  <Link2 className="h-4 w-4 text-gray-500 mr-2" />
                  <div>
                    <span className="text-gray-500 block">다운로드 URL</span>
                    <a 
                      href={resource.downloadUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate max-w-[200px] inline-block"
                    >
                      다운로드 링크
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 태그 및 다운로드 URL 섹션 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <div className="flex flex-col space-y-4">
              {/* 태그 섹션 */}
              {Array.isArray(resource.tags) && resource.tags.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-5 w-5 text-gray-600" />
                    <h3 className="font-semibold text-lg">태그</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {resource.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-800 px-3 py-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 다운로드 URL 섹션 */}
              {resource.downloadUrl && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Link2 className="h-5 w-5 text-gray-600" />
                    <h3 className="font-semibold text-lg">다운로드 URL</h3>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <a 
                      href={resource.downloadUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all"
                    >
                      {resource.downloadUrl}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* 리소스 설명 섹션 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-semibold">리소스 설명</h2>
            </div>
            <div className="prose max-w-none">
              <p className="whitespace-pre-line text-gray-700">{resource.description || '설명이 제공되지 않았습니다.'}</p>
            </div>
          </div>

          {/* 사용 방법 섹션 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-semibold">사용 방법</h2>
            </div>
            {resource.howToUse ? (
              <div className="prose max-w-none">
                <p className="whitespace-pre-line text-gray-700">{resource.howToUse}</p>
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

          {/* 조립 방법 섹션 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-semibold">조립 방법</h2>
            </div>
            {resource.assemblyInstructions ? (
              <div className="space-y-4">
                {typeof resource.assemblyInstructions === 'string' ? (
                  <p className="whitespace-pre-line text-gray-700">{resource.assemblyInstructions}</p>
                ) : (
                  <div className="space-y-6">
                    {/* 구조화된 조립 지침 렌더링 */}
                    {typeof resource.assemblyInstructions === 'object' && 
                     resource.assemblyInstructions?.steps && 
                     Array.isArray(resource.assemblyInstructions.steps) && (
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
                    {typeof resource.assemblyInstructions === 'object' && 
                     resource.assemblyInstructions?.materials && 
                     Array.isArray(resource.assemblyInstructions.materials) && (
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
                    {typeof resource.assemblyInstructions === 'object' && 
                     resource.assemblyInstructions?.tools && 
                     Array.isArray(resource.assemblyInstructions.tools) && (
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
                    {typeof resource.assemblyInstructions === 'object' && 
                     resource.assemblyInstructions?.notes && (
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
                        <Button className="bg-blue-600 hover:bg-blue-700 py-2">
                          <span className="truncate">AI 조립 비서 이용하기</span>
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
                <Button 
                  className="w-full flex items-center justify-center gap-2 py-2"
                  onClick={handleDownload}
                  disabled={!resource.downloadUrl}
                >
                  <Download className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">파일 다운로드</span>
                </Button>
                
                {!resource.downloadUrl && (
                  <p className="text-sm text-amber-600">
                    다운로드 링크가 현재 제공되지 않습니다.
                  </p>
                )}

                {resource.fileType && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">파일 형식:</span> {resource.fileType}
                  </div>
                )}
                
                {resource.fileSize && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">파일 크기:</span> {resource.fileSize}
                  </div>
                )}
                
                {resource.version && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">버전:</span> {resource.version}
                  </div>
                )}
                
                {resource.license && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">라이센스:</span> {resource.license}
                  </div>
                )}
                
                {resource.requirements && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">요구사항:</span> {resource.requirements}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 유사 리소스 */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">유사한 리소스</h3>
              {Array.isArray(resource.tags) && resource.tags.length > 0 ? (
                <div className="space-y-3">
                  <RelatedResources 
                    tags={resource.tags} 
                    resourceType={resourceType} 
                    currentResourceId={resource.id}
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  이 리소스에는 태그가 없어 유사한 리소스를 찾을 수 없습니다.
                </p>
              )}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link href={`/resources/type/${resourceType}`} className="text-primary hover:underline text-sm">
                  {getTypeName(resourceType)} 더 보기
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
                <Link href="/services/type/engineer">
                  <Button variant="outline" className="w-full bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50 py-2">
                    <span className="truncate">엔지니어 찾기</span>
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
                  <Button variant="outline" className="w-full bg-white border-green-200 text-green-700 hover:bg-green-50 py-2">
                    <span className="truncate">3D 프린터 찾기</span>
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