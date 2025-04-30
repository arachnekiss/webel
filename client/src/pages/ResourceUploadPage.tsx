import { useState, ChangeEvent, useEffect } from "react";
import { useNavigate } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// 아이콘 및 UI 컴포넌트
import {
  Loader2,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  File,
  FileText,
  Youtube,
  Plus,
  X,
  FileImage
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// 리소스 타입을 사람이 읽기 쉬운 형태로 변환
const resourceTypeLabels: Record<string, string> = {
  'hardware_design': '하드웨어 설계',
  'software': '소프트웨어',
  '3d_model': '3D 모델',
  'free_content': '무료 콘텐츠',
  'ai_model': 'AI 모델',
  'flash_game': '플래시 게임'
};

// 멀티미디어 타입 정의
type MultimediaType = 'image' | 'video' | 'youtube' | 'gif';

interface Multimedia {
  id: string;
  type: MultimediaType;
  content: string; // URL 또는 유튜브 임베드 코드
}

// 폼 스키마 정의
const resourceFormSchema = z.object({
  title: z.string().min(3, "제목은 최소 3자 이상이어야 합니다"),
  description: z.string().min(10, "설명은 최소 10자 이상이어야 합니다"),
  resourceType: z.string().min(1, "리소스 유형을 선택해주세요"),
  tags: z.string().nullable().optional().transform(val => 
    val ? val.split(',').map(tag => tag.trim()) : []
  ),
  downloadUrl: z.string().url("유효한 URL을 입력해주세요").nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  howToUse: z.string().nullable().optional(),
  assemblyInstructions: z.string().nullable().optional(),
});

// 폼 기본값
const defaultValues = {
  title: "",
  description: "",
  resourceType: "",
  tags: "",
  downloadUrl: "",
  imageUrl: "",
  howToUse: "",
  assemblyInstructions: "",
};

export default function ResourceUploadPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [downloadFile, setDownloadFile] = useState<File | null>(null);
  const [howToUseMultimedia, setHowToUseMultimedia] = useState<Multimedia[]>([]);
  const [assemblyMultimedia, setAssemblyMultimedia] = useState<Multimedia[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [leaveAlertOpen, setLeaveAlertOpen] = useState(false);

  const form = useForm<z.infer<typeof resourceFormSchema>>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues,
  });

  // 선택된 리소스 타입에 따라 필요한 필드 표시 여부 결정
  const resourceType = form.watch("resourceType");
  const needsAssemblyInstructions = resourceType === 'hardware_design' || resourceType === '3d_model';
  const needsHowToUse = resourceType === 'hardware_design' || resourceType === '3d_model' || 
                        resourceType === 'software' || resourceType === 'ai_model';

  // 리소스 생성 뮤테이션
  const createResourceMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      setIsUploading(true);
      const res = await apiRequest("POST", "/api/resources/upload", undefined, {
        body: formData,
        customConfig: { headers: {} } // 이 부분은 Content-Type을 자동으로 설정하기 위함
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "리소스 업로드 완료", description: "리소스가 성공적으로 업로드되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/resources'] });
      navigate("/admin/resources");
    },
    onError: (error: Error) => {
      toast({
        title: "리소스 업로드 실패",
        description: error.message,
        variant: "destructive",
      });
      setIsUploading(false);
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

  // 멀티미디어 추가 함수
  const addMultimedia = (type: string, content: string, isHowToUse: boolean) => {
    const newItem: Multimedia = {
      id: Date.now().toString(),
      type: type as MultimediaType,
      content,
    };
    
    if (isHowToUse) {
      setHowToUseMultimedia(prev => [...prev, newItem]);
    } else {
      setAssemblyMultimedia(prev => [...prev, newItem]);
    }
  };

  // 멀티미디어 제거 함수
  const removeMultimedia = (id: string, isHowToUse: boolean) => {
    if (isHowToUse) {
      setHowToUseMultimedia(prev => prev.filter(item => item.id !== id));
    } else {
      setAssemblyMultimedia(prev => prev.filter(item => item.id !== id));
    }
  };

  // 이미지 파일 처리 함수
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailImage(reader.result as string);
        form.setValue("imageUrl", URL.createObjectURL(file));
      };
      reader.readAsDataURL(file);
    }
  };

  // 다운로드 파일 처리 함수
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDownloadFile(file);
      toast({ 
        title: "파일 선택됨", 
        description: `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)` 
      });
    }
  };

  // 폼 제출 처리
  const onSubmit = async (data: z.infer<typeof resourceFormSchema>) => {
    const formData = new FormData();
    
    // 기본 데이터 추가
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("resourceType", data.resourceType);
    
    if (data.tags) {
      formData.append("tags", data.tags);
    }
    
    if (data.downloadUrl) {
      formData.append("downloadUrl", data.downloadUrl);
    }
    
    // 필요한 경우만 필드 추가
    if (needsHowToUse && data.howToUse) {
      // 멀티미디어 데이터를 포함한 JSON으로 변환
      const howToUseWithMultimedia = {
        text: data.howToUse,
        multimedia: howToUseMultimedia
      };
      formData.append("howToUse", JSON.stringify(howToUseWithMultimedia));
    }
    
    if (needsAssemblyInstructions && data.assemblyInstructions) {
      // 멀티미디어 데이터를 포함한 JSON으로 변환
      const assemblyWithMultimedia = {
        text: data.assemblyInstructions,
        multimedia: assemblyMultimedia
      };
      formData.append("assemblyInstructions", JSON.stringify(assemblyWithMultimedia));
    }
    
    // 파일 추가
    if (thumbnailFile) {
      formData.append("image", thumbnailFile);
    }
    
    if (downloadFile) {
      formData.append("downloadFile", downloadFile);
    }
    
    // 뮤테이션 실행
    createResourceMutation.mutate(formData);
  };

  // 페이지를 떠날 때 경고
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [form.formState.isDirty]);

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-2"
          onClick={() => {
            if (form.formState.isDirty) {
              setLeaveAlertOpen(true);
            } else {
              navigate("/admin/resources");
            }
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          돌아가기
        </Button>
        <h1 className="text-3xl font-bold">새 리소스 업로드</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>
                리소스에 대한 기본적인 정보를 입력해주세요. 모든 항목은 필수입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>제목</FormLabel>
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
                      <FormLabel>카테고리</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          // 필요 없는 필드 초기화
                          if (!needsHowToUse) {
                            form.setValue("howToUse", "");
                            setHowToUseMultimedia([]);
                          }
                          if (!needsAssemblyInstructions) {
                            form.setValue("assemblyInstructions", "");
                            setAssemblyMultimedia([]);
                          }
                        }} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="카테고리 선택" />
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
                    <FormLabel>설명</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="리소스에 대한 상세한 설명을 입력하세요" 
                        className="min-h-[120px]" 
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
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>태그</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="태그 (쉼표로 구분, 예: 3d, printer, arduino)" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        태그는 쉼표(,)로 구분하여 입력해주세요
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="downloadUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>다운로드 URL</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <Input 
                            placeholder="다운로드 URL 입력 (선택사항)"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value || null)}
                          />
                          <LinkIcon className="h-5 w-5 ml-2 mt-2" />
                        </div>
                      </FormControl>
                      <FormDescription>
                        URL 또는 파일 중 하나를 제공해주세요
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FormLabel>썸네일 이미지</FormLabel>
                  <div className="mt-2 border-2 border-dashed rounded-lg p-4 text-center hover:bg-secondary/20 transition-colors cursor-pointer">
                    <input
                      type="file"
                      id="thumbnail"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <label htmlFor="thumbnail" className="cursor-pointer block">
                      {thumbnailImage ? (
                        <div className="relative">
                          <img 
                            src={thumbnailImage} 
                            alt="썸네일 미리보기" 
                            className="max-h-40 mx-auto object-contain" 
                          />
                          <Button 
                            type="button" 
                            variant="destructive" 
                            size="icon" 
                            className="absolute top-0 right-0"
                            onClick={(e) => {
                              e.preventDefault();
                              setThumbnailImage(null);
                              setThumbnailFile(null);
                              form.setValue("imageUrl", "");
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">이미지 파일을 클릭하여 업로드</p>
                          <p className="text-xs text-muted-foreground mt-1">(최대 5MB, JPG, PNG, GIF)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div>
                  <FormLabel>다운로드 파일</FormLabel>
                  <div className="mt-2 border-2 border-dashed rounded-lg p-4 text-center hover:bg-secondary/20 transition-colors cursor-pointer">
                    <input
                      type="file"
                      id="downloadFile"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="downloadFile" className="cursor-pointer block">
                      {downloadFile ? (
                        <div className="flex items-center justify-center">
                          <FileText className="h-8 w-8 text-primary mr-2" />
                          <div className="text-left">
                            <p className="text-sm font-medium truncate max-w-[200px]">{downloadFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(downloadFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="ml-auto"
                            onClick={(e) => {
                              e.preventDefault();
                              setDownloadFile(null);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <File className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">파일을 클릭하여 업로드</p>
                          <p className="text-xs text-muted-foreground mt-1">(최대 50MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {resourceType && (
            <Card>
              <CardHeader>
                <CardTitle>상세 정보</CardTitle>
                <CardDescription>
                  선택한 카테고리에 맞는 상세 정보를 입력해주세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="content" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    {needsHowToUse && (
                      <TabsTrigger value="content">사용법</TabsTrigger>
                    )}
                    {needsAssemblyInstructions && (
                      <TabsTrigger value="assembly">조립방법</TabsTrigger>
                    )}
                  </TabsList>

                  {needsHowToUse && (
                    <TabsContent value="content" className="space-y-4 pt-4">
                      <FormField
                        control={form.control}
                        name="howToUse"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>사용법</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="리소스 사용 방법을 상세히 설명해주세요" 
                                className="min-h-[200px]" 
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value || null)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="border rounded-lg p-4">
                        <h3 className="text-sm font-medium mb-3">멀티미디어 첨부</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const url = prompt("이미지 URL을 입력하세요");
                              if (url) addMultimedia('image', url, true);
                            }}
                          >
                            <FileImage className="h-4 w-4 mr-1" />
                            이미지
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const url = prompt("비디오 URL을 입력하세요");
                              if (url) addMultimedia('video', url, true);
                            }}
                          >
                            <FileImage className="h-4 w-4 mr-1" />
                            비디오
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const url = prompt("유튜브 URL 또는 임베드 코드를 입력하세요");
                              if (url) addMultimedia('youtube', url, true);
                            }}
                          >
                            <Youtube className="h-4 w-4 mr-1" />
                            유튜브
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const url = prompt("GIF URL을 입력하세요");
                              if (url) addMultimedia('gif', url, true);
                            }}
                          >
                            <FileImage className="h-4 w-4 mr-1" />
                            GIF
                          </Button>
                        </div>

                        {howToUseMultimedia.length > 0 && (
                          <div className="space-y-2 mt-4">
                            <h4 className="text-sm font-medium">첨부된 멀티미디어</h4>
                            <Accordion type="multiple" className="w-full">
                              {howToUseMultimedia.map((item, index) => (
                                <AccordionItem key={item.id} value={item.id}>
                                  <AccordionTrigger className="text-sm">
                                    {index + 1}. {item.type === 'image' ? '이미지' : 
                                      item.type === 'video' ? '비디오' : 
                                      item.type === 'youtube' ? '유튜브' : 'GIF'}
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1 overflow-hidden">
                                        {item.type === 'image' || item.type === 'gif' ? (
                                          <img 
                                            src={item.content} 
                                            alt="첨부 미디어" 
                                            className="max-h-40 object-contain" 
                                          />
                                        ) : item.type === 'youtube' ? (
                                          <div className="aspect-video">
                                            <div dangerouslySetInnerHTML={{ __html: item.content }} />
                                          </div>
                                        ) : (
                                          <video 
                                            src={item.content} 
                                            controls 
                                            className="max-h-40 w-full"
                                          />
                                        )}
                                        <p className="text-xs text-muted-foreground mt-1 break-all">
                                          {item.content}
                                        </p>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="ml-2 flex-shrink-0"
                                        onClick={() => removeMultimedia(item.id, true)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              ))}
                            </Accordion>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  )}

                  {needsAssemblyInstructions && (
                    <TabsContent value="assembly" className="space-y-4 pt-4">
                      <FormField
                        control={form.control}
                        name="assemblyInstructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>조립방법</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="하드웨어 조립 방법이나 설치 방법 등을 상세히 설명해주세요" 
                                className="min-h-[200px]" 
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value || null)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="border rounded-lg p-4">
                        <h3 className="text-sm font-medium mb-3">멀티미디어 첨부</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const url = prompt("이미지 URL을 입력하세요");
                              if (url) addMultimedia('image', url, false);
                            }}
                          >
                            <FileImage className="h-4 w-4 mr-1" />
                            이미지
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const url = prompt("비디오 URL을 입력하세요");
                              if (url) addMultimedia('video', url, false);
                            }}
                          >
                            <FileImage className="h-4 w-4 mr-1" />
                            비디오
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const url = prompt("유튜브 URL 또는 임베드 코드를 입력하세요");
                              if (url) addMultimedia('youtube', url, false);
                            }}
                          >
                            <Youtube className="h-4 w-4 mr-1" />
                            유튜브
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const url = prompt("GIF URL을 입력하세요");
                              if (url) addMultimedia('gif', url, false);
                            }}
                          >
                            <FileImage className="h-4 w-4 mr-1" />
                            GIF
                          </Button>
                        </div>

                        {assemblyMultimedia.length > 0 && (
                          <div className="space-y-2 mt-4">
                            <h4 className="text-sm font-medium">첨부된 멀티미디어</h4>
                            <Accordion type="multiple" className="w-full">
                              {assemblyMultimedia.map((item, index) => (
                                <AccordionItem key={item.id} value={item.id}>
                                  <AccordionTrigger className="text-sm">
                                    {index + 1}. {item.type === 'image' ? '이미지' : 
                                      item.type === 'video' ? '비디오' : 
                                      item.type === 'youtube' ? '유튜브' : 'GIF'}
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1 overflow-hidden">
                                        {item.type === 'image' || item.type === 'gif' ? (
                                          <img 
                                            src={item.content} 
                                            alt="첨부 미디어" 
                                            className="max-h-40 object-contain" 
                                          />
                                        ) : item.type === 'youtube' ? (
                                          <div className="aspect-video">
                                            <div dangerouslySetInnerHTML={{ __html: item.content }} />
                                          </div>
                                        ) : (
                                          <video 
                                            src={item.content} 
                                            controls 
                                            className="max-h-40 w-full"
                                          />
                                        )}
                                        <p className="text-xs text-muted-foreground mt-1 break-all">
                                          {item.content}
                                        </p>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="ml-2 flex-shrink-0"
                                        onClick={() => removeMultimedia(item.id, false)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              ))}
                            </Accordion>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button 
              type="button" 
              variant="outline" 
              className="mr-2"
              onClick={() => {
                if (form.formState.isDirty) {
                  setLeaveAlertOpen(true);
                } else {
                  navigate("/admin/resources");
                }
              }}
            >
              취소
            </Button>
            <Button 
              type="submit" 
              disabled={isUploading || (!thumbnailFile && !form.getValues("imageUrl"))}
            >
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              리소스 업로드
            </Button>
          </div>
        </form>
      </Form>

      <AlertDialog open={leaveAlertOpen} onOpenChange={setLeaveAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>페이지 이탈 확인</AlertDialogTitle>
            <AlertDialogDescription>
              작성 중인 내용이 있습니다. 페이지를 나가면 작성한 내용이 모두 사라집니다.
              정말 나가시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => navigate("/admin/resources")}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              나가기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}