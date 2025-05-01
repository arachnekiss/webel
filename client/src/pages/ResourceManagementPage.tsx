import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import { 
  ArrowLeft, 
  Check, 
  X, 
  Save, 
  Trash2, 
  UploadCloud, 
  HelpCircle, 
  ImagePlus,
  FileSymlink,
  Tag,
  ChevronDown,
  Plus,
  AlertCircle,
  Package,
  Newspaper
} from 'lucide-react';

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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Resource, InsertResource } from '@/types';
import { insertResourceSchema } from '@shared/schema';
import { resourceTypeMap } from '@/lib/resourceTypes';

// 확장된 유효성 검사를 위한 스키마
const formSchema = insertResourceSchema.extend({
  resourceType: z.string().min(1, '리소스 유형을 선택해 주세요'),
  title: z.string().min(2, '제목은 2글자 이상이어야 합니다').max(100, '제목은 100글자 이하여야 합니다'),
  description: z.string().min(10, '설명은 10글자 이상이어야 합니다'),
  tags: z.array(z.string()).optional(),
  imageFile: z.instanceof(File).optional(),
  downloadFile: z.instanceof(File).optional(),
  newTag: z.string().optional(),
  assemblyMaterials: z.array(z.string()).optional(),
  assemblyTools: z.array(z.string()).optional(),
  assemblySteps: z.array(z.object({
    title: z.string(),
    description: z.string(),
    imageUrl: z.string().optional()
  })).optional(),
  assemblyNotes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// 파일 관련 상태
interface FileState {
  file: File | null;
  preview: string | null;
}

// 유형별 필드 정의
const getCategorySpecificFields = (category: string): JSX.Element | null => {
  switch (category) {
    case 'hardware_design':
      return (
        <div className="space-y-4">
          <FormField
            name="compatibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>호환성</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="예: Arduino Uno, Raspberry Pi 3+" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  이 설계가 호환되는 하드웨어 플랫폼을 입력하세요
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            name="designSoftware"
            render={({ field }) => (
              <FormItem>
                <FormLabel>설계 소프트웨어</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="예: AutoCAD, Eagle PCB" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  설계에 사용된 소프트웨어를 입력하세요
                </FormDescription>
              </FormItem>
            )}
          />
        </div>
      );
    case 'software':
      return (
        <div className="space-y-4">
          <FormField
            name="programmingLanguage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>프로그래밍 언어</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="예: Python, JavaScript, C++" 
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="dependencies"
            render={({ field }) => (
              <FormItem>
                <FormLabel>의존성 패키지</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="예: React, NumPy, TensorFlow" 
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="softwareRequirements"
            render={({ field }) => (
              <FormItem>
                <FormLabel>시스템 요구사항</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="예: Windows 10 이상, Node.js 14.x 이상, 4GB 이상 RAM" 
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      );
    case '3d_model':
      return (
        <div className="space-y-4">
          <FormField
            name="fileFormat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>파일 형식</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="예: STL, OBJ, FBX" 
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="polygonCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>폴리곤 수</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="예: 15,000" 
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="dimensions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>치수 (mm)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="예: 100 x 50 x 25" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  모델의 크기를 가로 x 세로 x 높이 형식으로 입력하세요
                </FormDescription>
              </FormItem>
            )}
          />
        </div>
      );
    case 'ai_model':
      return (
        <div className="space-y-4">
          <FormField
            name="aiModelType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>AI 모델 유형</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="예: Classification, NLP, Computer Vision" 
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="trainingData"
            render={({ field }) => (
              <FormItem>
                <FormLabel>학습 데이터</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="학습 데이터에 대한 설명을 입력하세요" 
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="modelAccuracy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>모델 정확도</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="예: 95.7%" 
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      );
    default:
      return null;
  }
};

// 리소스 관리 페이지 컴포넌트
const ResourceManagementPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!id;
  
  // 파일 업로드 상태
  const [imageState, setImageState] = useState<FileState>({ file: null, preview: null });
  const [downloadFileState, setDownloadFileState] = useState<FileState>({ file: null, preview: null });
  const [isUploading, setIsUploading] = useState(false);
  
  // 태그 관리를 위한 상태
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  
  // 조립 정보를 위한 상태
  const [assemblyMaterials, setAssemblyMaterials] = useState<string[]>([]);
  const [newMaterial, setNewMaterial] = useState('');
  const [assemblyTools, setAssemblyTools] = useState<string[]>([]);
  const [newTool, setNewTool] = useState('');
  const [assemblySteps, setAssemblySteps] = useState<Array<{title: string, description: string, imageUrl?: string}>>([]);
  
  // 리소스 데이터 가져오기 (편집 모드인 경우)
  const { data: resource, isLoading } = useQuery<Resource>({
    queryKey: [`/api/resources/${id}`],
    enabled: isEditMode,
  });
  
  // 폼 설정
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      resourceType: '',
      tags: [],
      howToUse: '',
      assemblyMaterials: [],
      assemblyTools: [],
      assemblySteps: [],
      assemblyNotes: '',
    },
  });
  
  // 리소스 유형이 변경될 때 관련 필드 업데이트
  const resourceType = form.watch('resourceType');

  // 리소스 데이터가 로드되면 폼에 설정
  useEffect(() => {
    if (resource) {
      // 기본 정보 설정
      form.reset({
        title: resource.title,
        description: resource.description,
        resourceType: resource.resourceType || resource.category,
        tags: resource.tags || [],
        howToUse: resource.howToUse || '',
        downloadUrl: resource.downloadUrl || '',
        // 그 외 필드들
      });
      
      // 이미지 미리보기 설정
      if (resource.imageUrl) {
        setImageState({ file: null, preview: resource.imageUrl });
      }
      
      // 태그 설정
      if (resource.tags) {
        setTags(resource.tags);
      }
      
      // 조립 지침 정보 설정
      if (resource.assemblyInstructions) {
        if (typeof resource.assemblyInstructions === 'string') {
          // 문자열 형태로 저장된 경우
          form.setValue('assemblyInstructions', resource.assemblyInstructions);
        } else {
          // 구조화된 형태로 저장된 경우
          if (resource.assemblyInstructions.materials) {
            setAssemblyMaterials(resource.assemblyInstructions.materials);
            form.setValue('assemblyMaterials', resource.assemblyInstructions.materials);
          }
          
          if (resource.assemblyInstructions.tools) {
            setAssemblyTools(resource.assemblyInstructions.tools);
            form.setValue('assemblyTools', resource.assemblyInstructions.tools);
          }
          
          if (resource.assemblyInstructions.steps) {
            setAssemblySteps(resource.assemblyInstructions.steps);
            form.setValue('assemblySteps', resource.assemblyInstructions.steps);
          }
          
          if (resource.assemblyInstructions.notes) {
            form.setValue('assemblyNotes', resource.assemblyInstructions.notes);
          }
        }
      }
    }
  }, [resource, form]);

  // 파일 업로드 처리
  const handleFileUpload = async (file: File, type: 'image' | 'download'): Promise<string> => {
    if (!file) return '';
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await apiRequest(
        'POST',
        `/api/resources/upload-${type === 'image' ? 'image' : 'file'}`,
        formData,
        { contentType: 'multipart/form-data' }
      );
      
      const result = await response.json();
      return result.fileUrl || '';
    } catch (error) {
      console.error(`${type} 업로드 오류:`, error);
      toast({
        title: `${type === 'image' ? '이미지' : '파일'} 업로드 실패`,
        description: "업로드 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      return '';
    }
  };

  // 이미지 파일 선택 처리
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // 이미지 미리보기 URL 생성
      const previewUrl = URL.createObjectURL(file);
      setImageState({ file, preview: previewUrl });
      
      // 폼 값 업데이트
      form.setValue('imageFile', file);
    }
  };

  // 다운로드 파일 선택 처리
  const handleDownloadFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDownloadFileState({ file, preview: file.name });
      
      // 폼 값 업데이트
      form.setValue('downloadFile', file);
    }
  };

  // 태그 추가 처리
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      form.setValue('tags', updatedTags);
      setNewTag('');
    }
  };

  // 태그 삭제 처리
  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    form.setValue('tags', updatedTags);
  };

  // 조립 재료 추가 처리
  const handleAddMaterial = () => {
    if (newMaterial.trim() && !assemblyMaterials.includes(newMaterial.trim())) {
      const updatedMaterials = [...assemblyMaterials, newMaterial.trim()];
      setAssemblyMaterials(updatedMaterials);
      form.setValue('assemblyMaterials', updatedMaterials);
      setNewMaterial('');
    }
  };

  // 조립 도구 추가 처리
  const handleAddTool = () => {
    if (newTool.trim() && !assemblyTools.includes(newTool.trim())) {
      const updatedTools = [...assemblyTools, newTool.trim()];
      setAssemblyTools(updatedTools);
      form.setValue('assemblyTools', updatedTools);
      setNewTool('');
    }
  };

  // 조립 단계 추가 처리
  const handleAddStep = () => {
    const newStep = { title: '', description: '' };
    setAssemblySteps([...assemblySteps, newStep]);
    form.setValue('assemblySteps', [...assemblySteps, newStep]);
  };

  // 조립 단계 업데이트 처리
  const handleUpdateStep = (index: number, field: 'title' | 'description', value: string) => {
    const updatedSteps = [...assemblySteps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    setAssemblySteps(updatedSteps);
    form.setValue('assemblySteps', updatedSteps);
  };

  // 조립 단계 삭제 처리
  const handleRemoveStep = (index: number) => {
    const updatedSteps = assemblySteps.filter((_, i) => i !== index);
    setAssemblySteps(updatedSteps);
    form.setValue('assemblySteps', updatedSteps);
  };

  // 리소스 저장 뮤테이션
  const saveResourceMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      setIsUploading(true);
      
      try {
        // 이미지 업로드 (있는 경우)
        let imageUrl = resource?.imageUrl || '';
        if (imageState.file) {
          imageUrl = await handleFileUpload(imageState.file, 'image');
        }
        
        // 다운로드 파일 업로드 (있는 경우)
        let downloadUrl = resource?.downloadUrl || '';
        let downloadFile = resource?.downloadFile || '';
        if (downloadFileState.file) {
          const fileUrl = await handleFileUpload(downloadFileState.file, 'download');
          if (fileUrl) {
            downloadUrl = fileUrl;
            downloadFile = downloadFileState.file.name;
          }
        }
        
        // 조립 지침 구성
        let assemblyInstructions: any = null;
        if (resourceType === 'hardware_design' || resourceType === '3d_model' || resourceType === 'ai_model') {
          assemblyInstructions = {
            steps: assemblySteps,
            materials: assemblyMaterials,
            tools: assemblyTools,
            notes: form.getValues('assemblyNotes')
          };
        } else if (form.getValues('assemblyInstructions')) {
          assemblyInstructions = form.getValues('assemblyInstructions');
        }
        
        // API 요청 데이터 구성
        const requestData = {
          title: data.title,
          description: data.description,
          category: data.resourceType, // category 필드 사용
          resourceType: data.resourceType, // 백워드 호환성을 위해 유지
          tags,
          imageUrl,
          downloadUrl,
          downloadFile,
          howToUse: data.howToUse,
          assemblyInstructions,
          // 기타 필드들은 리소스 타입에 따라 선택적으로 추가
          ...(data.programmingLanguage && { programmingLanguage: data.programmingLanguage }),
          ...(data.dependencies && { dependencies: data.dependencies }),
          ...(data.softwareRequirements && { softwareRequirements: data.softwareRequirements }),
          ...(data.fileFormat && { fileFormat: data.fileFormat }),
          ...(data.polygonCount && { polygonCount: data.polygonCount }),
          ...(data.dimensions && { dimensions: data.dimensions }),
          ...(data.aiModelType && { aiModelType: data.aiModelType }),
          ...(data.trainingData && { trainingData: data.trainingData }),
          ...(data.modelAccuracy && { modelAccuracy: data.modelAccuracy }),
        };
        
        // 생성 또는 업데이트 API 호출
        if (isEditMode) {
          const response = await apiRequest('PUT', `/api/resources/${id}`, requestData);
          return response.json();
        } else {
          const response = await apiRequest('POST', '/api/resources', requestData);
          return response.json();
        }
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: () => {
      toast({
        title: `리소스 ${isEditMode ? '수정' : '생성'} 성공`,
        description: `리소스가 성공적으로 ${isEditMode ? '수정' : '생성'}되었습니다.`,
      });
      
      // 캐시 무효화 및 리디렉션
      queryClient.invalidateQueries({ queryKey: ['/api/resources'] });
      if (isEditMode) {
        queryClient.invalidateQueries({ queryKey: [`/api/resources/${id}`] });
      }
      
      // 리소스 목록 페이지로 이동
      setTimeout(() => setLocation('/resources'), 1000);
    },
    onError: (error: any) => {
      toast({
        title: `리소스 ${isEditMode ? '수정' : '생성'} 실패`,
        description: error.message || "오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  // 폼 제출 처리
  const onSubmit = (data: FormValues) => {
    saveResourceMutation.mutate(data);
  };

  // 로딩 중 표시
  if (isEditMode && isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">리소스 로딩 중...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/resources')}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            리소스 목록으로 돌아가기
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditMode ? '리소스 편집' : '새 리소스 등록'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEditMode 
              ? '기존 리소스의 정보를 업데이트합니다.' 
              : 'Webel에 새로운 리소스를 등록합니다.'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">기본 정보</TabsTrigger>
              <TabsTrigger value="details">상세 정보</TabsTrigger>
              <TabsTrigger value="assembly">조립 방법</TabsTrigger>
              <TabsTrigger value="preview">미리보기</TabsTrigger>
            </TabsList>
            
            {/* 기본 정보 탭 */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>리소스 기본 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="resourceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>리소스 유형</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="리소스 유형을 선택하세요" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(resourceTypeMap).map(([key, value]) => (
                              <SelectItem key={key} value={key}>
                                {value.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          등록할 리소스의 유형을 선택하세요.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>제목</FormLabel>
                        <FormControl>
                          <Input placeholder="리소스 제목을 입력하세요" {...field} />
                        </FormControl>
                        <FormDescription>
                          리소스의 제목은 명확하고 간결하게 작성하세요.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>설명</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="리소스에 대한 상세 설명을 입력하세요" 
                            rows={5}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          리소스의 기능, 용도, 특징 등을 자세히 설명하세요.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* 태그 입력 */}
                  <div>
                    <FormLabel>태그</FormLabel>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="새 태그 입력"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleAddTag}
                      >
                        추가
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {tags.map((tag, index) => (
                        <Badge key={index} className="px-2 py-1 gap-1">
                          {tag}
                          <button 
                            type="button" 
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 text-xs rounded-full hover:bg-gray-200 h-4 w-4 inline-flex items-center justify-center"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <FormDescription className="mt-2">
                      리소스 검색을 위한 태그를 추가하세요.
                    </FormDescription>
                  </div>
                  
                  {/* 이미지 업로드 */}
                  <div>
                    <FormLabel>대표 이미지</FormLabel>
                    <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {imageState.preview ? (
                        <div className="space-y-2">
                          <img 
                            src={imageState.preview} 
                            alt="미리보기" 
                            className="max-h-60 mx-auto object-contain" 
                          />
                          <div className="flex justify-center gap-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => setImageState({ file: null, preview: null })}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              삭제
                            </Button>
                            <label className="cursor-pointer">
                              <Input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                              />
                              <Button 
                                type="button" 
                                variant="outline"
                                size="sm"
                                className="cursor-pointer"
                                asChild
                              >
                                <span>
                                  <ImagePlus className="h-4 w-4 mr-1" />
                                  변경
                                </span>
                              </Button>
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label className="cursor-pointer block">
                          <Input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                          <div className="space-y-2">
                            <ImagePlus className="h-12 w-12 mx-auto text-gray-400" />
                            <div className="text-sm text-gray-600">
                              클릭하여 이미지 업로드
                            </div>
                            <div className="text-xs text-gray-500">
                              PNG, JPG, GIF 파일 지원 (최대 5MB)
                            </div>
                            <Button 
                              type="button" 
                              variant="outline"
                              size="sm"
                              className="cursor-pointer"
                            >
                              이미지 선택
                            </Button>
                          </div>
                        </label>
                      )}
                    </div>
                    <FormDescription className="mt-2">
                      리소스를 대표하는 이미지를 업로드하세요.
                    </FormDescription>
                  </div>
                  
                  {/* 다운로드 파일 업로드 */}
                  <div>
                    <FormLabel>다운로드 파일</FormLabel>
                    <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {downloadFileState.preview ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-2">
                            <FileSymlink className="h-8 w-8 text-blue-500" />
                            <span className="text-lg font-medium">{downloadFileState.preview}</span>
                          </div>
                          <div className="flex justify-center gap-2 mt-3">
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => setDownloadFileState({ file: null, preview: null })}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              삭제
                            </Button>
                            <label className="cursor-pointer">
                              <Input
                                type="file"
                                className="hidden"
                                onChange={handleDownloadFileChange}
                              />
                              <Button 
                                type="button" 
                                variant="outline"
                                size="sm"
                                className="cursor-pointer"
                                asChild
                              >
                                <span>
                                  <FileSymlink className="h-4 w-4 mr-1" />
                                  변경
                                </span>
                              </Button>
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {resource?.downloadUrl ? (
                            <div className="space-y-2">
                              <FileSymlink className="h-12 w-12 mx-auto text-blue-500" />
                              <div className="text-sm text-gray-600">
                                현재 다운로드 파일: <a href={resource.downloadUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{resource.downloadFile || "다운로드 파일"}</a>
                              </div>
                              <label className="cursor-pointer">
                                <Input
                                  type="file"
                                  className="hidden"
                                  onChange={handleDownloadFileChange}
                                />
                                <Button 
                                  type="button" 
                                  variant="outline"
                                  size="sm"
                                  className="cursor-pointer"
                                >
                                  파일 변경
                                </Button>
                              </label>
                            </div>
                          ) : (
                            <label className="cursor-pointer block">
                              <Input
                                type="file"
                                className="hidden"
                                onChange={handleDownloadFileChange}
                              />
                              <div className="space-y-2">
                                <FileSymlink className="h-12 w-12 mx-auto text-gray-400" />
                                <div className="text-sm text-gray-600">
                                  클릭하여 파일 업로드
                                </div>
                                <div className="text-xs text-gray-500">
                                  ZIP, RAR, PDF, STL 등 모든 파일 유형 지원
                                </div>
                                <Button 
                                  type="button" 
                                  variant="outline"
                                  size="sm"
                                  className="cursor-pointer"
                                >
                                  파일 선택
                                </Button>
                              </div>
                            </label>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="downloadUrl"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>또는 다운로드 URL 입력</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://example.com/download/file.zip" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            파일 업로드 대신 외부 URL을 제공할 수 있습니다.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* 상세 정보 탭 */}
            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>상세 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="howToUse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>사용 방법</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="리소스 사용 방법을 단계별로 작성하세요" 
                            rows={6}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          다른 사용자가 이 리소스를 활용하는 방법을 설명하세요.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* 리소스 유형별 추가 필드 */}
                  {resourceType && getCategorySpecificFields(resourceType)}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* 조립 방법 탭 */}
            <TabsContent value="assembly" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>조립 방법</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 필요한 재료 */}
                  <div>
                    <FormLabel>필요한 재료</FormLabel>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="필요한 재료를 입력하세요"
                        value={newMaterial}
                        onChange={(e) => setNewMaterial(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddMaterial();
                          }
                        }}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleAddMaterial}
                      >
                        추가
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {assemblyMaterials.map((material, index) => (
                        <Badge key={index} className="px-2 py-1 gap-1" variant="outline">
                          {material}
                          <button 
                            type="button" 
                            onClick={() => {
                              const updated = assemblyMaterials.filter((_, i) => i !== index);
                              setAssemblyMaterials(updated);
                              form.setValue('assemblyMaterials', updated);
                            }}
                            className="ml-1 text-xs rounded-full hover:bg-gray-200 h-4 w-4 inline-flex items-center justify-center"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <FormDescription className="mt-2">
                      조립에 필요한 모든 재료를 추가하세요.
                    </FormDescription>
                  </div>
                  
                  {/* 필요한 도구 */}
                  <div>
                    <FormLabel>필요한 도구</FormLabel>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="필요한 도구를 입력하세요"
                        value={newTool}
                        onChange={(e) => setNewTool(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTool();
                          }
                        }}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleAddTool}
                      >
                        추가
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {assemblyTools.map((tool, index) => (
                        <Badge key={index} className="px-2 py-1 gap-1" variant="outline">
                          {tool}
                          <button 
                            type="button" 
                            onClick={() => {
                              const updated = assemblyTools.filter((_, i) => i !== index);
                              setAssemblyTools(updated);
                              form.setValue('assemblyTools', updated);
                            }}
                            className="ml-1 text-xs rounded-full hover:bg-gray-200 h-4 w-4 inline-flex items-center justify-center"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <FormDescription className="mt-2">
                      조립에 필요한 모든 도구를 추가하세요.
                    </FormDescription>
                  </div>
                  
                  {/* 조립 단계 */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <FormLabel className="text-base">조립 단계</FormLabel>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={handleAddStep}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        단계 추가
                      </Button>
                    </div>
                    
                    {assemblySteps.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                        <Package className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500">조립 단계가 없습니다. 단계를 추가해주세요.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {assemblySteps.map((step, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="font-medium">단계 {index + 1}</h3>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveStep(index)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <FormLabel>제목</FormLabel>
                                <Input
                                  value={step.title || ''}
                                  onChange={(e) => handleUpdateStep(index, 'title', e.target.value)}
                                  placeholder="단계 제목"
                                  className="mb-2"
                                />
                              </div>
                              <div>
                                <FormLabel>설명</FormLabel>
                                <Textarea
                                  value={step.description || ''}
                                  onChange={(e) => handleUpdateStep(index, 'description', e.target.value)}
                                  placeholder="단계 설명"
                                  rows={3}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* 주의사항 */}
                  <FormField
                    control={form.control}
                    name="assemblyNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>주의사항</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="조립 시 주의해야 할 사항이나 팁을 작성하세요" 
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          안전 경고나 중요한 주의사항을 알려주세요.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* 미리보기 탭 */}
            <TabsContent value="preview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>리소스 미리보기</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white rounded-lg border p-6">
                    <div className="mb-4">
                      {resourceType && (
                        <Badge className={`mb-2 ${getTypeColorClass(resourceType)}`}>
                          {resourceTypeMap[resourceType]?.name || resourceType}
                        </Badge>
                      )}
                      <h1 className="text-2xl font-bold">{form.watch('title') || '(제목 없음)'}</h1>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((tag, index) => (
                          <Badge key={index} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      {imageState.preview ? (
                        <img 
                          src={imageState.preview} 
                          alt="리소스 이미지" 
                          className="w-full max-h-60 object-contain rounded-lg border bg-gray-50"
                        />
                      ) : (
                        <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Newspaper className="h-12 w-12 text-gray-300" />
                        </div>
                      )}
                    </div>
                    
                    <div className="prose max-w-none mb-6">
                      <h2 className="text-xl font-semibold mb-2">설명</h2>
                      <p className="whitespace-pre-line">{form.watch('description') || '(설명 없음)'}</p>
                    </div>
                    
                    {form.watch('howToUse') && (
                      <div className="prose max-w-none mb-6">
                        <h2 className="text-xl font-semibold mb-2">사용 방법</h2>
                        <p className="whitespace-pre-line">{form.watch('howToUse')}</p>
                      </div>
                    )}
                    
                    {(assemblyMaterials.length > 0 || assemblyTools.length > 0 || assemblySteps.length > 0) && (
                      <div className="prose max-w-none">
                        <h2 className="text-xl font-semibold mb-4">조립 방법</h2>
                        
                        {assemblyMaterials.length > 0 && (
                          <div className="mb-4">
                            <h3 className="text-lg font-medium mb-2">필요한 재료</h3>
                            <ul className="list-disc pl-5">
                              {assemblyMaterials.map((material, index) => (
                                <li key={index}>{material}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {assemblyTools.length > 0 && (
                          <div className="mb-4">
                            <h3 className="text-lg font-medium mb-2">필요한 도구</h3>
                            <ul className="list-disc pl-5">
                              {assemblyTools.map((tool, index) => (
                                <li key={index}>{tool}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {assemblySteps.length > 0 && (
                          <div className="mb-4">
                            <h3 className="text-lg font-medium mb-2">조립 단계</h3>
                            <ol className="list-decimal pl-5">
                              {assemblySteps.map((step, index) => (
                                <li key={index} className="mb-3">
                                  <strong>{step.title || `단계 ${index + 1}`}</strong>
                                  <p>{step.description || '(설명 없음)'}</p>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
                        
                        {form.watch('assemblyNotes') && (
                          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <h3 className="text-lg font-medium mb-2 flex items-center">
                              <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                              주의사항
                            </h3>
                            <p>{form.watch('assemblyNotes')}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setLocation('/resources')}
            >
              취소
            </Button>
            <Button 
              type="submit"
              disabled={isUploading || saveResourceMutation.isPending}
              className="min-w-[120px]"
            >
              {(isUploading || saveResourceMutation.isPending) ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  처리 중...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditMode ? '리소스 수정' : '리소스 등록'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ResourceManagementPage;