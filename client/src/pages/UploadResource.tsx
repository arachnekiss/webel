import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, UploadCloud } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// 유효성 검사 스키마
const uploadSchema = z.object({
  title: z.string().min(3, { message: '제목은 최소 3자 이상이어야 합니다.' }),
  description: z.string().min(10, { message: '설명은 최소 10자 이상이어야 합니다.' }),
  resourceType: z.enum(['hardware_design', 'software', '3d_model', 'free_content', 'ai_model', 'flash_game'], {
    required_error: '리소스 타입을 선택해주세요.',
  }),
  category: z.string().min(2, { message: '카테고리를 입력해주세요.' }),
  tags: z.string().optional(),
  howToUse: z.string().optional(),
  assemblyInstructions: z.string().optional(),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

export default function UploadResource() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [uploadedImage, setUploadedImage] = useState<any>(null);
  
  // 인증 여부 확인
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-[600px] shadow-lg">
          <CardHeader>
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>
              리소스를 업로드하려면 먼저 로그인해주세요.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setLocation('/auth')}>로그인 페이지로 이동</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      tags: '',
      howToUse: '',
      assemblyInstructions: '',
    },
  });

  // 파일 업로드 처리
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/resources/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('파일 업로드에 실패했습니다.');
      }

      const data = await response.json();
      setUploadedFile(data);
      
      toast({
        title: '파일 업로드 성공',
        description: '파일이 성공적으로 업로드되었습니다.',
      });
    } catch (error) {
      toast({
        title: '파일 업로드 실패',
        description: error instanceof Error ? error.message : '파일 업로드 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // 이미지 업로드 처리
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/resources/upload-image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('이미지 업로드에 실패했습니다.');
      }

      const data = await response.json();
      setUploadedImage(data);
      
      toast({
        title: '이미지 업로드 성공',
        description: '이미지가 성공적으로 업로드되었습니다.',
      });
    } catch (error) {
      toast({
        title: '이미지 업로드 실패',
        description: error instanceof Error ? error.message : '이미지 업로드 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // 폼 제출 처리
  const onSubmit = async (values: UploadFormValues) => {
    try {
      // 태그 문자열을 배열로 변환
      const tagsArray = values.tags ? values.tags.split(',').map(tag => tag.trim()) : [];
      
      // API 요청 데이터 구성
      const resourceData = {
        ...values,
        tags: tagsArray,
        downloadFile: uploadedFile ? uploadedFile.fileName : null,
        imageUrl: uploadedImage ? uploadedImage.url : null,
        userId: user.id,
        downloadCount: 0,
      };

      // 리소스 생성 API 호출
      const response = await apiRequest('POST', '/api/resources', resourceData);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '리소스 생성에 실패했습니다.');
      }

      toast({
        title: '리소스 등록 성공',
        description: '리소스가 성공적으로 등록되었습니다.',
      });

      // 성공 시 리소스 목록 페이지로 이동
      setLocation('/resources');
    } catch (error) {
      toast({
        title: '리소스 등록 실패',
        description: error instanceof Error ? error.message : '리소스 등록 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">리소스 업로드</h1>
          <p className="text-gray-500">
            나만의 리소스를 공유하고 커뮤니티에 기여해보세요.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  name="resourceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>리소스 유형</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="리소스 유형을 선택하세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="hardware_design">하드웨어 디자인</SelectItem>
                          <SelectItem value="software">소프트웨어</SelectItem>
                          <SelectItem value="3d_model">3D 모델</SelectItem>
                          <SelectItem value="free_content">무료 콘텐츠</SelectItem>
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
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>카테고리</FormLabel>
                      <FormControl>
                        <Input placeholder="카테고리를 입력하세요 (예: 게임, 도구, 교육)" {...field} />
                      </FormControl>
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
                        <Input placeholder="쉼표로 구분하여 태그를 입력하세요" {...field} />
                      </FormControl>
                      <FormDescription>
                        예: 프린팅,Arduino,DIY
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div>
                    <FormLabel htmlFor="fileUpload">리소스 파일</FormLabel>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-md">
                      <div className="space-y-1 text-center">
                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="fileUpload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/80"
                          >
                            <span>파일 업로드</span>
                            <input
                              id="fileUpload"
                              name="fileUpload"
                              type="file"
                              className="sr-only"
                              onChange={handleFileUpload}
                              disabled={isUploading}
                            />
                          </label>
                          <p className="pl-1">또는 드래그 앤 드롭</p>
                        </div>
                        <p className="text-xs text-gray-500">최대 10MB</p>
                      </div>
                    </div>
                    {uploadedFile && (
                      <div className="mt-2 text-sm text-green-600">
                        업로드 완료: {uploadedFile.originalName}
                      </div>
                    )}
                  </div>

                  <div>
                    <FormLabel htmlFor="imageUpload">이미지</FormLabel>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-md">
                      <div className="space-y-1 text-center">
                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="imageUpload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/80"
                          >
                            <span>이미지 업로드</span>
                            <input
                              id="imageUpload"
                              name="imageUpload"
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={handleImageUpload}
                              disabled={isUploading}
                            />
                          </label>
                          <p className="pl-1">또는 드래그 앤 드롭</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF (최대 10MB)</p>
                      </div>
                    </div>
                    {uploadedImage && (
                      <div className="mt-2 flex items-center">
                        <div className="text-sm text-green-600 mr-2">
                          업로드 완료
                        </div>
                        <img
                          src={uploadedImage.url}
                          alt="업로드된 이미지"
                          className="h-10 w-10 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>설명</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="리소스에 대한 설명을 자세히 입력하세요"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="howToUse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>사용 방법</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="리소스 사용 방법에 대해 설명해주세요"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assemblyInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>조립 설명서</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="조립이 필요한 경우 조립 방법을 설명해주세요"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                type="submit"
                className="w-full md:w-auto"
                disabled={isUploading}
              >
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                리소스 등록하기
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}