import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Video,
  FileVideo,
  Trash2,
  Plus,
  Loader2,
  Youtube,
  Paperclip,
  Link as LinkIcon,
  Save,
} from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type MultimediaType = 'image' | 'video' | 'youtube' | 'gif';

interface Multimedia {
  id: string;
  type: MultimediaType;
  content: string; // URL 또는 유튜브 임베드 코드
}

// 리소스 타입 정의
const resourceTypeLabels: Record<string, string> = {
  'hardware_design': '하드웨어 설계',
  'software': '소프트웨어',
  '3d_model': '3D 모델',
  'free_content': '무료 콘텐츠',
  'ai_model': 'AI 모델',
  'flash_game': '플래시 게임'
};

// 카테고리 목록
const categoryOptions = [
  { value: 'tutorial', label: '튜토리얼' },
  { value: 'tool', label: '도구' },
  { value: 'game', label: '게임' },
  { value: 'library', label: '라이브러리' },
  { value: 'template', label: '템플릿' },
  { value: 'design', label: '디자인' },
  { value: 'other', label: '기타' },
];

// 리소스 업로드 스키마
const resourceUploadSchema = z.object({
  title: z.string().min(3, "제목은 최소 3자 이상이어야 합니다"),
  description: z.string().min(10, "설명은 최소 10자 이상이어야 합니다"),
  resourceType: z.string().min(1, "리소스 유형을 선택해주세요"),
  category: z.string().nullable().optional(),
  tags: z.string().nullable().optional().transform(val => 
    val ? val.split(',').map(tag => tag.trim()) : []
  ),
  downloadUrl: z.string().url("유효한 URL을 입력해주세요").nullable().optional(),
  imageUrl: z.string().url("유효한 URL을 입력해주세요").nullable().optional(),
  howToUse: z.string().nullable().optional(),
  assemblyInstructions: z.string().nullable().optional(),
  programmingLanguage: z.string().nullable().optional(),
  dependencies: z.string().nullable().optional(),
  softwareRequirements: z.string().nullable().optional(),
  license: z.string().nullable().optional(),
  version: z.string().nullable().optional(),
  aiModelType: z.string().nullable().optional(),
  trainingData: z.string().nullable().optional(),
  modelAccuracy: z.string().nullable().optional(),
  fileFormat: z.string().nullable().optional(),
  polygonCount: z.string().nullable().optional(),
  dimensions: z.string().nullable().optional(),
});

export default function ResourceUploadPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [multimedia, setMultimedia] = useState<Multimedia[]>([]);
  const [selectedTab, setSelectedTab] = useState("basic");
  const [isDirty, setIsDirty] = useState(false);
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isFileUploading, setIsFileUploading] = useState(false);

  type FormValues = z.infer<typeof resourceUploadSchema>;

  // 리소스 업로드 폼
  const form = useForm<FormValues>({
    resolver: zodResolver(resourceUploadSchema),
    defaultValues: {
      title: "",
      description: "",
      resourceType: "",
      category: null,
      tags: "",
      downloadUrl: "",
      imageUrl: "",
      howToUse: "",
      assemblyInstructions: "",
      programmingLanguage: "",
      dependencies: "",
      softwareRequirements: "",
      license: "",
      version: "",
      aiModelType: "",
      trainingData: "",
      modelAccuracy: "",
      fileFormat: "",
      polygonCount: "",
      dimensions: "",
    },
  });

  // 사용자가 폼을 수정했는지 감지
  useEffect(() => {
    const subscription = form.watch(() => setIsDirty(true));
    return () => subscription.unsubscribe();
  }, [form]);

  // 브라우저 이탈 시 경고
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // 이미지 업로드 기능
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);

      const res = await apiRequest("POST", "/api/resources/upload-image", undefined, {
        body: formData,
        customConfig: { headers: {} },
      });
      return await res.json();
    },
    onSuccess: (data) => {
      form.setValue("imageUrl", data.imageUrl);
      setIsImageUploading(false);
      toast({
        title: "이미지 업로드 완료",
        description: "이미지가 성공적으로 업로드되었습니다.",
      });
    },
    onError: (error: Error) => {
      setIsImageUploading(false);
      toast({
        title: "이미지 업로드 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 파일 업로드 기능
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await apiRequest("POST", "/api/resources/upload-file", undefined, {
        body: formData,
        customConfig: { headers: {} },
      });
      return await res.json();
    },
    onSuccess: (data) => {
      // 서버에서 반환된 파일 이름을 저장
      setUploadedFile(null);
      setIsFileUploading(false);
      toast({
        title: "파일 업로드 완료",
        description: "파일이 성공적으로 업로드되었습니다.",
      });
    },
    onError: (error: Error) => {
      setIsFileUploading(false);
      toast({
        title: "파일 업로드 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 리소스 생성 뮤테이션
  const createResourceMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await apiRequest("POST", "/api/resources", undefined, {
        body: formData,
        customConfig: { headers: {} },
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({ 
        title: "리소스 업로드 완료",
        description: "리소스가 성공적으로 업로드되었습니다."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/resources'] });
      setLocation("/admin/resources");
    },
    onError: (error: Error) => {
      toast({
        title: "리소스 업로드 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 멀티미디어 추가 핸들러
  const addMultimedia = (type: MultimediaType) => {
    const newItem: Multimedia = {
      id: uuidv4(),
      type,
      content: ''
    };
    setMultimedia(prev => [...prev, newItem]);
  };

  // 멀티미디어 수정 핸들러
  const updateMultimedia = (id: string, content: string) => {
    setMultimedia(prev => 
      prev.map(item => item.id === id ? { ...item, content } : item)
    );
  };

  // 멀티미디어 삭제 핸들러
  const removeMultimedia = (id: string) => {
    setMultimedia(prev => prev.filter(item => item.id !== id));
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    setUploadedImageFile(file);
    setIsImageUploading(true);
    uploadImageMutation.mutate(file);
  };

  // 파일 업로드 핸들러
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    setUploadedFile(file);
    setIsFileUploading(true);
    uploadFileMutation.mutate(file);
  };

  // 폼 제출 핸들러
  const onSubmit = async (values: FormValues) => {
    const formData = new FormData();

    // 기본 정보
    Object.entries(values).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === 'tags' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value as string);
        }
      }
    });

    // 멀티미디어 정보
    formData.append('multimedia', JSON.stringify(multimedia));

    // 리소스 생성
    createResourceMutation.mutate(formData);
  };

  // 현재 선택된 리소스 타입
  const resourceType = form.watch('resourceType');

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/admin/resources")}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            돌아가기
          </Button>
          <h1 className="text-3xl font-bold">리소스 업로드</h1>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="basic" value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="basic">기본 정보</TabsTrigger>
              <TabsTrigger value="details">상세 정보</TabsTrigger>
              <TabsTrigger value="multimedia">멀티미디어</TabsTrigger>
              <TabsTrigger value="files">파일</TabsTrigger>
            </TabsList>

            {/* 기본 정보 탭 */}
            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>제목 *</FormLabel>
                      <FormControl>
                        <Input placeholder="리소스 제목" {...field} />
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
                      <FormLabel>리소스 유형 *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="리소스 유형 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(resourceTypeLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>설명 *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="리소스에 대한 자세한 설명을 입력하세요" 
                        className="min-h-[150px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>카테고리</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="카테고리 선택 (선택사항)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoryOptions.map(({ value, label }) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
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
                        <Input 
                          placeholder="태그 (쉼표로 구분, 예: arduino, 3d, electronics)" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="license"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>라이센스</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="예: MIT, GPL, Apache 2.0 등" 
                          {...field} 
                          value={field.value || ""} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>버전</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="예: 1.0.0" 
                          {...field} 
                          value={field.value || ""} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>

            {/* 상세 정보 탭 */}
            <TabsContent value="details" className="space-y-6">
              {/* 공통 필드 */}
              <FormField
                control={form.control}
                name="howToUse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>사용 방법</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="이 리소스를 어떻게 사용하는지 설명해주세요." 
                        className="min-h-[120px]" 
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 하드웨어 설계 관련 필드 */}
              {resourceType === 'hardware_design' && (
                <>
                  <FormField
                    control={form.control}
                    name="assemblyInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>조립 지침</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="하드웨어 조립 방법을 자세히 설명해주세요." 
                            className="min-h-[120px]" 
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="dimensions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>크기/치수</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="예: 100mm x 50mm x 20mm" 
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}

              {/* 소프트웨어 관련 필드 */}
              {resourceType === 'software' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="programmingLanguage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>프로그래밍 언어</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="예: Python, JavaScript, C++" 
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="softwareRequirements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>시스템 요구사항</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="예: Windows 10 이상, 4GB RAM 이상" 
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="dependencies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>의존성 패키지</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="예: numpy>=1.20.0, tensorflow>=2.5.0" 
                            className="min-h-[80px]" 
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* 3D 모델 관련 필드 */}
              {resourceType === '3d_model' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fileFormat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>파일 형식</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="예: STL, OBJ, FBX" 
                            {...field} 
                            value={field.value || ""} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="polygonCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>폴리곤 수</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="예: 10,000" 
                            {...field} 
                            value={field.value || ""} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* AI 모델 관련 필드 */}
              {resourceType === 'ai_model' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="aiModelType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>AI 모델 유형</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="예: CNN, LSTM, Transformer" 
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="modelAccuracy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>모델 정확도/성능</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="예: 정확도 95%, F1 점수 0.92" 
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="trainingData"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>학습 데이터</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="학습에 사용된 데이터셋에 대해 설명해주세요." 
                            className="min-h-[80px]" 
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </TabsContent>

            {/* 멀티미디어 탭 */}
            <TabsContent value="multimedia" className="space-y-6">
              <div className="flex flex-wrap gap-3 mb-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => addMultimedia('image')}
                >
                  <ImageIcon className="h-4 w-4 mr-1" />
                  이미지 추가
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => addMultimedia('video')}
                >
                  <Video className="h-4 w-4 mr-1" />
                  비디오 추가
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => addMultimedia('youtube')}
                >
                  <Youtube className="h-4 w-4 mr-1" />
                  유튜브 추가
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => addMultimedia('gif')}
                >
                  <FileVideo className="h-4 w-4 mr-1" />
                  GIF 추가
                </Button>
              </div>

              {multimedia.map((item) => (
                <Card key={item.id} className="mb-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex justify-between items-center">
                      <div className="flex items-center">
                        {item.type === 'image' && <ImageIcon className="h-4 w-4 mr-1" />}
                        {item.type === 'video' && <Video className="h-4 w-4 mr-1" />}
                        {item.type === 'youtube' && <Youtube className="h-4 w-4 mr-1" />}
                        {item.type === 'gif' && <FileVideo className="h-4 w-4 mr-1" />}
                        {item.type === 'image' && '이미지'}
                        {item.type === 'video' && '비디오'}
                        {item.type === 'youtube' && '유튜브'}
                        {item.type === 'gif' && 'GIF'}
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeMultimedia(item.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input
                      placeholder={
                        item.type === 'youtube'
                          ? "유튜브 영상 URL 또는 임베드 코드"
                          : `${item.type} URL`
                      }
                      value={item.content}
                      onChange={(e) => updateMultimedia(item.id, e.target.value)}
                      className="w-full"
                    />
                  </CardContent>
                  {item.content && item.type === 'image' && (
                    <CardFooter className="pt-0">
                      <img
                        src={item.content}
                        alt="Preview"
                        className="max-h-40 max-w-full rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=이미지+미리보기+실패';
                        }}
                      />
                    </CardFooter>
                  )}
                </Card>
              ))}

              {multimedia.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  멀티미디어를 추가하려면 위의 버튼을 클릭하세요.
                </div>
              )}
            </TabsContent>

            {/* 파일 탭 */}
            <TabsContent value="files" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>대표 이미지</FormLabel>
                        <FormControl>
                          <div className="flex flex-col gap-2">
                            <div className="flex">
                              <Input 
                                placeholder="이미지 URL 입력 또는 파일 업로드"
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value || null)}
                                className="flex-1"
                              />
                              <div className="flex items-center ml-2">
                                <label htmlFor="imageUpload" className="cursor-pointer">
                                  <div className="bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 rounded-md inline-flex items-center">
                                    <Upload className="h-4 w-4 mr-1" />
                                    업로드
                                  </div>
                                  <input
                                    id="imageUpload"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                                  />
                                </label>
                              </div>
                            </div>
                            {isImageUploading && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>{uploadedImageFile?.name} 업로드 중...</span>
                              </div>
                            )}
                            {field.value && (
                              <img
                                src={field.value}
                                alt="Preview"
                                className="mt-2 max-h-48 rounded"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=이미지+미리보기+실패';
                                }}
                              />
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormField
                    control={form.control}
                    name="downloadUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>다운로드 URL</FormLabel>
                        <FormControl>
                          <div className="flex flex-col gap-2">
                            <div className="flex">
                              <Input 
                                placeholder="다운로드 URL 입력 또는 파일 업로드"
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value || null)}
                                className="flex-1"
                              />
                              <div className="flex items-center ml-2">
                                <label htmlFor="fileUpload" className="cursor-pointer">
                                  <div className="bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 rounded-md inline-flex items-center">
                                    <Upload className="h-4 w-4 mr-1" />
                                    업로드
                                  </div>
                                  <input
                                    id="fileUpload"
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                  />
                                </label>
                              </div>
                            </div>
                            {isFileUploading && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>{uploadedFile?.name} 업로드 중...</span>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>유의사항</AlertTitle>
                <AlertDescription>
                  업로드된 파일과 이미지는 서버에 저장됩니다. 저작권에 문제가 없는 콘텐츠만 업로드해 주세요.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2">
            <Link href="/admin/resources">
              <Button type="button" variant="outline">취소</Button>
            </Link>
            <Button 
              type="submit" 
              disabled={createResourceMutation.isPending}
              className="gap-1"
            >
              {createResourceMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              <Save className="h-4 w-4 mr-1" />
              저장하기
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}