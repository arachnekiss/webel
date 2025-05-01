import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Upload, 
  Save, 
  Trash2, 
  Plus, 
  X, 
  Image, 
  FileEdit, 
  Tag, 
  Package, 
  Info, 
  BookOpen, 
  Hammer, 
  CheckCircle, 
  LinkIcon,
  Download,
  ArrowLeft,
  Eye,
  Loader2,
  ExternalLink,
  FileDown,
  CalendarDays,
  FileText
} from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { resourceTypeMap } from '@/lib/resourceTypes';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// 리소스 폼을 위한 스키마 정의
const resourceFormSchema = z.object({
  title: z.string().min(1, "제목은 필수 입력항목입니다.").max(100, "제목은 100자 이내로 입력해주세요."),
  description: z.string().min(1, "설명은 필수 입력항목입니다."),
  category: z.string().min(1, "카테고리는 필수 선택항목입니다."),
  tags: z.string().optional().transform(val => val ? val.split(',').map(tag => tag.trim()) : []),
  imageUrl: z.string().optional(),
  downloadUrl: z.string().optional(),
  howToUse: z.string().optional(),
  assemblyInstructions: z.string().optional(),
  license: z.string().optional(),
  version: z.string().optional(),
  sourceSite: z.string().optional(),
  isFeatured: z.boolean().default(false)
});

type ResourceFormValues = z.infer<typeof resourceFormSchema>;

export default function ResourceManagementPage() {
  const [, params] = useRoute<{ id: string }>('/resources/manage/:id');
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isNew, setIsNew] = useState(true);
  const [selectedTab, setSelectedTab] = useState("basic");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // 리소스 ID가 URL에 있으면 편집 모드, 없으면 생성 모드
  const resourceId = params?.id ? parseInt(params.id) : null;
  
  // 폼 초기화
  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      tags: "",
      imageUrl: "",
      downloadUrl: "",
      howToUse: "",
      assemblyInstructions: "",
      license: "",
      version: "",
      sourceSite: "",
      isFeatured: false
    }
  });

  // 기존 리소스 데이터 가져오기 (편집 모드인 경우)
  const { 
    data: resource, 
    isLoading: isLoadingResource, 
    error: resourceError
  } = useQuery({
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

  // 리소스 저장 API 호출
  const saveResourceMutation = useMutation({
    mutationFn: async (data: ResourceFormValues) => {
      let response;
      if (resourceId) {
        // 리소스 업데이트
        response = await apiRequest('PUT', `/api/resources/${resourceId}`, data);
      } else {
        // 새 리소스 생성
        response = await apiRequest('POST', '/api/resources', data);
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '리소스 저장 중 오류가 발생했습니다.');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: resourceId ? '리소스 업데이트 완료' : '리소스 생성 완료',
        description: resourceId ? '리소스가 성공적으로 업데이트되었습니다.' : '새 리소스가 성공적으로 생성되었습니다.',
      });
      
      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['/api/resources'] });
      
      // 생성 후 해당 리소스 페이지로 이동
      if (!resourceId && data.id) {
        setLocation(`/resources/${data.id}`);
      }
    },
    onError: (error: Error) => {
      toast({
        title: '오류 발생',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // 이미지 업로드 함수
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('image', file);
    
    setIsUploading(true);
    try {
      const response = await fetch('/api/resources/upload-image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('이미지 업로드 중 오류가 발생했습니다.');
      }
      
      const data = await response.json();
      form.setValue('imageUrl', data.imageUrl);
      setPreviewImage(data.imageUrl);
      
      toast({
        title: '이미지 업로드 성공',
        description: '이미지가 성공적으로 업로드되었습니다.',
      });
    } catch (error) {
      toast({
        title: '이미지 업로드 실패',
        description: error instanceof Error ? error.message : '이미지 업로드 중 알 수 없는 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // 파일 업로드 함수
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    setIsUploading(true);
    try {
      const response = await fetch('/api/resources/upload-file', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('파일 업로드 중 오류가 발생했습니다.');
      }
      
      const data = await response.json();
      form.setValue('downloadFile', data.filePath);
      
      toast({
        title: '파일 업로드 성공',
        description: '파일이 성공적으로 업로드되었습니다.',
      });
    } catch (error) {
      toast({
        title: '파일 업로드 실패',
        description: error instanceof Error ? error.message : '파일 업로드 중 알 수 없는 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // 폼 제출 처리 함수
  const onSubmit = (data: ResourceFormValues) => {
    saveResourceMutation.mutate(data);
  };

  // 리소스 카테고리에 따른 커스텀 필드 렌더링
  const renderCategorySpecificFields = () => {
    const category = form.watch('category');
    
    switch(category) {
      case 'hardware_design':
        return (
          <>
            <FormField
              control={form.control}
              name="version"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>하드웨어 버전</FormLabel>
                  <FormControl>
                    <Input placeholder="예) v1.0, 2023 Edition" {...field} />
                  </FormControl>
                  <FormDescription>
                    하드웨어 디자인의 버전 정보를 입력하세요.
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="license"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>라이센스</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="라이센스 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MIT">MIT</SelectItem>
                      <SelectItem value="GPL-3.0">GPL-3.0</SelectItem>
                      <SelectItem value="Apache-2.0">Apache-2.0</SelectItem>
                      <SelectItem value="CC-BY-4.0">CC-BY-4.0</SelectItem>
                      <SelectItem value="CC-BY-SA-4.0">CC-BY-SA-4.0</SelectItem>
                      <SelectItem value="custom">사용자 지정</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    하드웨어 디자인에 적용된 라이센스를 선택하세요.
                  </FormDescription>
                </FormItem>
              )}
            />
          </>
        );
      
      case 'software':
        return (
          <>
            <FormField
              control={form.control}
              name="version"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>소프트웨어 버전</FormLabel>
                  <FormControl>
                    <Input placeholder="예) v1.2.3" {...field} />
                  </FormControl>
                  <FormDescription>
                    소프트웨어의 버전 정보를 입력하세요 (Semantic Versioning 권장).
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="license"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>라이센스</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="라이센스 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MIT">MIT</SelectItem>
                      <SelectItem value="GPL-3.0">GPL-3.0</SelectItem>
                      <SelectItem value="Apache-2.0">Apache-2.0</SelectItem>
                      <SelectItem value="BSD-3-Clause">BSD-3-Clause</SelectItem>
                      <SelectItem value="AGPL-3.0">AGPL-3.0</SelectItem>
                      <SelectItem value="custom">사용자 지정</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    소프트웨어에 적용된 라이센스를 선택하세요.
                  </FormDescription>
                </FormItem>
              )}
            />
          </>
        );
      
      case '3d_model':
        return (
          <>
            <FormField
              control={form.control}
              name="license"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>라이센스</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="라이센스 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CC-BY-4.0">CC-BY-4.0</SelectItem>
                      <SelectItem value="CC-BY-SA-4.0">CC-BY-SA-4.0</SelectItem>
                      <SelectItem value="CC-BY-NC-4.0">CC-BY-NC-4.0</SelectItem>
                      <SelectItem value="CC-BY-NC-SA-4.0">CC-BY-NC-SA-4.0</SelectItem>
                      <SelectItem value="CC0-1.0">CC0-1.0 (퍼블릭 도메인)</SelectItem>
                      <SelectItem value="custom">사용자 지정</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    3D 모델에 적용된 라이센스를 선택하세요.
                  </FormDescription>
                </FormItem>
              )}
            />
          </>
        );
      
      case 'ai_model':
        return (
          <>
            <FormField
              control={form.control}
              name="version"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>모델 버전</FormLabel>
                  <FormControl>
                    <Input placeholder="예) v1.0" {...field} />
                  </FormControl>
                  <FormDescription>
                    AI 모델의 버전 정보를 입력하세요.
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="license"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>라이센스</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="라이센스 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MIT">MIT</SelectItem>
                      <SelectItem value="Apache-2.0">Apache-2.0</SelectItem>
                      <SelectItem value="CC-BY-4.0">CC-BY-4.0</SelectItem>
                      <SelectItem value="CC-BY-SA-4.0">CC-BY-SA-4.0</SelectItem>
                      <SelectItem value="custom">사용자 지정</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    AI 모델에 적용된 라이센스를 선택하세요.
                  </FormDescription>
                </FormItem>
              )}
            />
          </>
        );
      
      case 'flash_game':
        return (
          <>
            <FormField
              control={form.control}
              name="version"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>게임 버전</FormLabel>
                  <FormControl>
                    <Input placeholder="예) v1.0" {...field} />
                  </FormControl>
                  <FormDescription>
                    게임의 버전 정보를 입력하세요.
                  </FormDescription>
                </FormItem>
              )}
            />
          </>
        );
      
      case 'free_content':
        return (
          <>
            <FormField
              control={form.control}
              name="license"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>라이센스</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="라이센스 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CC-BY-4.0">CC-BY-4.0</SelectItem>
                      <SelectItem value="CC-BY-SA-4.0">CC-BY-SA-4.0</SelectItem>
                      <SelectItem value="CC-BY-NC-4.0">CC-BY-NC-4.0</SelectItem>
                      <SelectItem value="CC-BY-NC-SA-4.0">CC-BY-NC-SA-4.0</SelectItem>
                      <SelectItem value="CC0-1.0">CC0-1.0 (퍼블릭 도메인)</SelectItem>
                      <SelectItem value="custom">사용자 지정</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    콘텐츠에 적용된 라이센스를 선택하세요.
                  </FormDescription>
                </FormItem>
              )}
            />
          </>
        );
        
      default:
        return null;
    }
  };

  // 기존 리소스 데이터로 폼 초기화
  useEffect(() => {
    if (resource) {
      setIsNew(false);
      // 폼 필드 초기화
      form.reset({
        title: resource.title,
        description: resource.description,
        category: resource.category,
        tags: resource.tags ? resource.tags.join(', ') : '',
        imageUrl: resource.imageUrl || '',
        downloadUrl: resource.downloadUrl || '',
        howToUse: resource.howToUse || '',
        assemblyInstructions: resource.assemblyInstructions || '',
        license: resource.license || '',
        version: resource.version || '',
        sourceSite: resource.sourceSite || '',
        isFeatured: resource.isFeatured || false
      });
      
      // 이미지 프리뷰 설정
      if (resource.imageUrl) {
        setPreviewImage(resource.imageUrl);
      }
    }
  }, [resource, form]);

  if (isLoadingResource && resourceId) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (resourceError && resourceId) {
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

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isNew ? '리소스 등록' : '리소스 수정'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isNew ? '새로운 리소스를 등록하세요.' : '리소스 정보를 수정하세요.'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setLocation('/resources')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로
          </Button>
          {!isNew && (
            <Button variant="outline" onClick={() => setLocation(`/resources/${resourceId}`)}>
              <Eye className="mr-2 h-4 w-4" />
              상세 보기
            </Button>
          )}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* 왼쪽 사이드바 영역 - 이미지 및 카테고리 */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Image className="h-5 w-5 mr-2 text-primary" />
                    대표 이미지
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 flex flex-col items-center justify-center min-h-[200px] bg-slate-50 relative">
                      {previewImage ? (
                        <>
                          <img 
                            src={previewImage} 
                            alt="리소스 이미지 미리보기" 
                            className="max-h-[200px] object-contain"
                          />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
                            onClick={() => {
                              setPreviewImage(null);
                              form.setValue('imageUrl', '');
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <div className="text-center">
                          <Image className="h-12 w-12 mx-auto text-gray-300" />
                          <p className="mt-2 text-sm text-gray-500">이미지를 업로드하세요</p>
                          <p className="text-xs text-gray-400 mt-1">권장 크기: 800 x 600</p>
                        </div>
                      )}
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem className="hidden">
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => document.getElementById('image-upload')?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                        업로드
                      </Button>
                      <Input 
                        id="image-upload" 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                      <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>이미지 URL</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://example.com/image.jpg" 
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  setPreviewImage(e.target.value);
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              이미지 URL을 직접 입력할 수도 있습니다.
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Tag className="h-5 w-5 mr-2 text-primary" />
                    카테고리 및 태그
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>카테고리</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="카테고리 선택" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="hardware_design">하드웨어 디자인</SelectItem>
                              <SelectItem value="software">소프트웨어</SelectItem>
                              <SelectItem value="3d_model">3D 모델</SelectItem>
                              <SelectItem value="free_content">프리 콘텐츠</SelectItem>
                              <SelectItem value="ai_model">AI 모델</SelectItem>
                              <SelectItem value="flash_game">플래시 게임</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>태그</FormLabel>
                          <FormControl>
                            <Input placeholder="예) 아두이노, IoT, 센서" {...field} />
                          </FormControl>
                          <FormDescription>
                            쉼표(,)로 구분하여 태그를 입력하세요.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 다운로드 부분 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Download className="h-5 w-5 mr-2 text-primary" />
                    다운로드 정보
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="downloadUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>다운로드 URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/download" {...field} />
                          </FormControl>
                          <FormDescription>
                            외부 다운로드 링크가 있으면 입력하세요.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid gap-2">
                      <Label>파일 업로드</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => document.getElementById('file-upload')?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                          파일 업로드
                        </Button>
                        <Input 
                          id="file-upload" 
                          type="file" 
                          className="hidden" 
                          onChange={handleFileUpload}
                          disabled={isUploading}
                        />
                        <Button 
                          type="button" 
                          variant="ghost"
                          className="col-span-2 justify-start px-2"
                          disabled={!form.watch('downloadFile')}
                        >
                          <FileText className="h-4 w-4 mr-2 text-primary" />
                          {form.watch('downloadFile') ? form.watch('downloadFile').split('/').pop() : '업로드된 파일 없음'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 관리자 옵션 */}
              {user?.isAdmin && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileEdit className="h-5 w-5 mr-2 text-primary" />
                      관리자 옵션
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="isFeatured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>추천 리소스로 설정</FormLabel>
                              <FormDescription>
                                메인 페이지에 노출됩니다.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="sourceSite"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>출처 사이트</FormLabel>
                            <FormControl>
                              <Input placeholder="원본 출처 사이트 URL" {...field} />
                            </FormControl>
                            <FormDescription>
                              외부에서 가져온 리소스의 경우 원본 출처를 입력하세요.
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* 오른쪽 메인 콘텐츠 영역 */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden">
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                  <div className="px-6 pt-6 border-b">
                    <TabsList className="w-full justify-start gap-4 bg-transparent h-12">
                      <TabsTrigger 
                        value="basic" 
                        className="data-[state=active]:border-b-2 border-primary data-[state=active]:shadow-none rounded-none h-12"
                      >
                        <Info className="h-4 w-4 mr-2" />
                        기본 정보
                      </TabsTrigger>
                      <TabsTrigger 
                        value="usage" 
                        className="data-[state=active]:border-b-2 border-primary data-[state=active]:shadow-none rounded-none h-12"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        사용법
                      </TabsTrigger>
                      <TabsTrigger 
                        value="assembly" 
                        className="data-[state=active]:border-b-2 border-primary data-[state=active]:shadow-none rounded-none h-12"
                      >
                        <Hammer className="h-4 w-4 mr-2" />
                        조립방법
                      </TabsTrigger>
                    </TabsList>
                  </div>
                
                  <TabsContent value="basic" className="p-6">
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>제목</FormLabel>
                            <FormControl>
                              <Input placeholder="리소스 제목을 입력하세요" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>상세 설명</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="리소스에 대한 상세 설명을 입력하세요" 
                                className="min-h-[200px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              리소스의 특징, 기능, 활용법 등을 자세히 설명하세요.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* 카테고리별 추가 필드 */}
                      {renderCategorySpecificFields()}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="usage" className="p-6">
                    <FormField
                      control={form.control}
                      name="howToUse"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>사용법</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="리소스 사용법에 대한 안내를 작성하세요" 
                              className="min-h-[300px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            리소스 활용 방법, 설치 방법, 주의사항 등을 상세히 작성하세요.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="assembly" className="p-6">
                    <FormField
                      control={form.control}
                      name="assemblyInstructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>조립 방법</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="조립/설치에 필요한 단계별 안내를 작성하세요" 
                              className="min-h-[300px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            단계별로 번호를 매겨 조립/설치 방법을 자세히 작성하세요. 예) 1. 부품 확인, 2. 기판 조립 등
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
              </Card>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {!isNew && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" type="button">
                          <Trash2 className="h-4 w-4 mr-2" />
                          삭제
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>리소스 삭제</AlertDialogTitle>
                          <AlertDialogDescription>
                            이 리소스를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction 
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => {
                              // 삭제 API 호출
                              apiRequest('DELETE', `/api/resources/${resourceId}`)
                                .then((response) => {
                                  if (response.ok) {
                                    toast({
                                      title: '리소스 삭제 완료',
                                      description: '리소스가 성공적으로 삭제되었습니다.',
                                    });
                                    
                                    // 캐시 무효화
                                    queryClient.invalidateQueries({ queryKey: ['/api/resources'] });
                                    
                                    // 리소스 목록으로 이동
                                    setLocation('/resources');
                                  } else {
                                    throw new Error('리소스 삭제 중 오류가 발생했습니다.');
                                  }
                                })
                                .catch((error) => {
                                  toast({
                                    title: '삭제 실패',
                                    description: error.message,
                                    variant: 'destructive',
                                  });
                                });
                            }}
                          >
                            삭제
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={() => form.reset()}
                  >
                    초기화
                  </Button>
                  <Button type="submit" disabled={saveResourceMutation.isPending}>
                    {saveResourceMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        저장 중...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        저장
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}