import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

// UI 컴포넌트
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// 아이콘
import {
  ArrowLeft,
  ImageIcon,
  Trash2,
  Save,
  X,
  Upload,
  Clock,
  FileUp,
  UploadCloud,
  Plus,
  Tag,
  Info,
  AlertCircle,
  FileText,
  Check,
  ChevronRight,
  ChevronDown,
  Link2
} from "lucide-react";

// 카테고리 라벨
const categoryLabels: Record<string, string> = {
  "hardware_design": "하드웨어 설계도",
  "software": "소프트웨어 오픈소스",
  "3d_model": "3D 모델링 파일",
  "ai_model": "AI 모델",
  "free_content": "프리 콘텐츠",
  "flash_game": "플래시 게임",
};

// 세부 카테고리 옵션
const detailCategoryOptions = [
  { value: "arduino", label: "아두이노" },
  { value: "raspberry_pi", label: "라즈베리 파이" },
  { value: "electronics", label: "전자공학" },
  { value: "robotics", label: "로보틱스" },
  { value: "iot", label: "IoT" },
  { value: "game", label: "게임" },
  { value: "utility", label: "유틸리티" },
  { value: "education", label: "교육" },
  { value: "science", label: "과학" },
  { value: "art", label: "예술" },
  { value: "music", label: "음악" },
  { value: "other", label: "기타" },
];

// 파일 타입 인터페이스
interface FileWithPreview extends File {
  preview?: string;
  progress?: number;
}

// 폼 유효성 검사 스키마
const formSchema = z.object({
  title: z.string().min(2, {
    message: "리소스 제목은 최소 2자 이상이어야 합니다.",
  }),
  description: z.string().min(10, {
    message: "설명은 최소 10자 이상이어야 합니다.",
  }),
  resourceType: z.string({
    required_error: "카테고리를 선택해주세요.",
  }),
  subcategory: z.string().optional(),
  tags: z.string().optional(),
  downloadUrl: z.string().optional(),
  howToUse: z.string().optional(),
  assemblyInstructions: z.string().optional(),
  materials: z.string().optional(),
  dimensions: z.string().optional(),
  sourceSite: z.string().optional(),
  isFeatured: z.boolean().optional(),
});

export default function ResourceUploadPage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [thumbnailFile, setThumbnailFile] = useState<FileWithPreview | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<FileWithPreview[]>([]);
  const [downloadFile, setDownloadFile] = useState<FileWithPreview | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>("basic");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [resourceTypeInfo, setResourceTypeInfo] = useState<string>("");
  
  // 폼 초기화
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      resourceType: "",
      tags: "",
      downloadUrl: "",
      howToUse: "",
      assemblyInstructions: "",
      materials: "",
      dimensions: "",
      sourceSite: "",
      isFeatured: false,
    },
  });

  // 리소스 타입 변경 시 정보 업데이트
  const watchResourceType = form.watch("resourceType");
  useEffect(() => {
    switch(watchResourceType) {
      case 'hardware_design':
        setResourceTypeInfo("하드웨어 설계도는 전자 기기, 회로, 3D 프린팅 모델 등의 설계 파일입니다. 조립 방법과 필요한 재료를 상세히 기재해주세요.");
        break;
      case 'software':
        setResourceTypeInfo("소프트웨어 오픈소스는 자유롭게 사용, 수정, 배포할 수 있는 코드와 프로그램입니다. 설치 및 사용 방법을 명확히 안내해주세요.");
        break;
      case '3d_model':
        setResourceTypeInfo("3D 모델링 파일은 3D 프린팅이나 디지털 환경에서 사용할 수 있는 3차원 모델입니다. 권장 프린팅 설정을 함께 제공해주세요.");
        break;
      case 'ai_model':
        setResourceTypeInfo("AI 모델은 머신러닝 또는 딥러닝 모델 파일입니다. 모델의 훈련 방법, 데이터셋, 성능 지표를 포함해주세요.");
        break;
      case 'free_content':
        setResourceTypeInfo("프리 콘텐츠는 무료로 이용 가능한 디지털 콘텐츠입니다. 라이센스 정보와 출처를 반드시 명시해주세요.");
        break;
      case 'flash_game':
        setResourceTypeInfo("플래시 게임은 웹에서 실행 가능한 게임 파일입니다. 게임 조작법과 목표를 설명해주세요.");
        break;
      default:
        setResourceTypeInfo("");
    }
  }, [watchResourceType]);

  // 리소스 생성 뮤테이션
  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      setIsUploading(true);
      const response = await apiRequest(
        "POST",
        "/api/resources",
        formData,
        { 
          isFormData: true, 
          onProgress: (progress: number) => setUploadProgress(progress) 
        }
      );
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "리소스 업로드 성공",
        description: "리소스가 성공적으로 업로드되었습니다.",
      });
      setIsUploading(false);
      setLocation("/admin/resources");
    },
    onError: (error: Error) => {
      setIsUploading(false);
      toast({
        title: "업로드 실패",
        description: `업로드 중 오류가 발생했습니다: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'thumbnail' | 'gallery' | 'download') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0] as FileWithPreview;
    file.preview = URL.createObjectURL(file);
    file.progress = 0;

    if (type === 'thumbnail') {
      setThumbnailFile(file);
    } else if (type === 'gallery') {
      setGalleryFiles(prev => [...prev, file]);
    } else if (type === 'download') {
      setDownloadFile(file);
    }

    // 파일 선택 후 input 초기화
    e.target.value = '';
  };

  // 갤러리 이미지 삭제
  const removeGalleryFile = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
  };

  // 폼 로컬 저장
  const saveFormLocally = () => {
    const formValues = form.getValues();
    localStorage.setItem("resourceForm", JSON.stringify(formValues));
    
    const filesInfo = {
      hasThumbnail: !!thumbnailFile,
      galleryCount: galleryFiles.length,
      hasDownload: !!downloadFile
    };
    localStorage.setItem("resourceFilesInfo", JSON.stringify(filesInfo));
    
    setLastSaved(new Date());
    toast({
      title: "임시 저장 완료",
      description: "작성 중인 내용이 브라우저에 저장되었습니다.",
    });
  };

  // 로컬 저장 데이터 불러오기
  const loadLocalSave = () => {
    const savedForm = localStorage.getItem("resourceForm");
    if (savedForm) {
      try {
        const parsedForm = JSON.parse(savedForm);
        form.reset(parsedForm);
        
        toast({
          title: "임시 저장 내용 불러오기 성공",
          description: "마지막으로 저장된 내용을 불러왔습니다.",
        });
      } catch (e) {
        console.error("저장된 폼 데이터 파싱 오류:", e);
        toast({
          title: "불러오기 실패",
          description: "저장된 데이터를 불러오는데 실패했습니다.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "저장된 내용 없음",
        description: "불러올 임시 저장 데이터가 없습니다.",
        variant: "destructive",
      });
    }
  };

  // 리소스 업로드 제출
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const formData = new FormData();
      
      // 기본 정보 추가
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      
      // 파일 추가
      if (thumbnailFile) {
        formData.append("image", thumbnailFile);
      }
      
      galleryFiles.forEach((file, index) => {
        formData.append(`gallery_${index}`, file);
      });
      
      if (downloadFile) {
        formData.append("file", downloadFile);
      }
      
      await mutation.mutateAsync(formData);
    } catch (error) {
      console.error("폼 제출 오류:", error);
    }
  };

  // 진행률 표시 컴포넌트
  const ProgressStatus = () => (
    <div className="flex items-center space-x-2">
      <div className="flex-1">
        <Progress value={uploadProgress} className="h-2" />
      </div>
      <div className="w-10 text-sm font-medium">{Math.round(uploadProgress)}%</div>
    </div>
  );

  // 파일 미리보기 카드 컴포넌트
  const FilePreviewCard = ({ file, onDelete }: { file: FileWithPreview, onDelete: () => void }) => (
    <div className="relative group">
      <div className="overflow-hidden border rounded-md aspect-video bg-muted/20">
        <img src={file.preview} alt="미리보기" className="object-cover w-full h-full" />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onDelete}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        {/* 헤더 섹션 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/admin/resources")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              돌아가기
            </Button>
            <div>
              <h1 className="text-2xl font-bold">리소스 업로드</h1>
              <p className="text-muted-foreground">새로운 리소스를 생성하고 공유하세요</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {lastSaved && (
              <div className="text-xs text-muted-foreground flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {`마지막 저장: ${lastSaved.toLocaleTimeString()}`}
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={saveFormLocally}
              disabled={mutation.isPending}
            >
              <Save className="h-4 w-4 mr-1" />
              임시 저장
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={loadLocalSave}
              disabled={mutation.isPending}
            >
              <FileUp className="h-4 w-4 mr-1" />
              불러오기
            </Button>
            <Button
              type="submit"
              form="resource-form"
              disabled={mutation.isPending}
              className="md:w-auto w-full"
            >
              {mutation.isPending ? (
                <>업로드 중... <UploadCloud className="ml-2 h-4 w-4 animate-bounce" /></>
              ) : (
                <>업로드 <Upload className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </div>
        </div>
        
        {/* 탭 네비게이션 */}
        <Tabs defaultValue="basic" value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
            <TabsTrigger value="basic" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              기본 정보
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center">
              <ImageIcon className="h-4 w-4 mr-2" />
              이미지 갤러리
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center">
              <Info className="h-4 w-4 mr-2" />
              상세 정보
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center">
              <UploadCloud className="h-4 w-4 mr-2" />
              파일 업로드
            </TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form id="resource-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* 기본 정보 탭 */}
              <TabsContent value="basic" className="space-y-6 mt-2">
                <Alert className="mb-6">
                  <Info className="h-4 w-4" />
                  <AlertTitle>리소스 기본 정보를 입력해주세요</AlertTitle>
                  <AlertDescription>
                    정확한 정보를 제공할수록 사용자들이 리소스를 더 쉽게 찾고 활용할 수 있습니다.
                  </AlertDescription>
                </Alert>
                
                {/* 제목 및 카테고리 그리드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>리소스 제목 *</FormLabel>
                        <FormControl>
                          <Input placeholder="간결하고 명확한 제목을 입력하세요" {...field} />
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
                        <FormLabel>카테고리 *</FormLabel>
                        <Select onValueChange={(value) => {
                          field.onChange(value);
                          form.trigger("resourceType");
                        }} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="카테고리 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(categoryLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                        {resourceTypeInfo && (
                          <FormDescription>
                            {resourceTypeInfo}
                          </FormDescription>
                        )}
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* 세부 카테고리 및 출처 사이트 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="subcategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>세부 카테고리</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="세부 카테고리 선택 (선택사항)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {detailCategoryOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          리소스의 더 구체적인 분류를 선택해주세요.
                        </FormDescription>
                        <FormMessage />
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
                          <div className="flex">
                            <span className="inline-flex items-center px-3 bg-muted text-muted-foreground rounded-l-md border border-r-0 border-input">
                              <Link2 className="h-4 w-4" />
                            </span>
                            <Input
                              className="rounded-l-none"
                              placeholder="원본 URL (있는 경우)"
                              {...field}
                              value={field.value || ""}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          리소스의 원본 출처가 있다면 URL을 입력해주세요.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* 설명 */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>설명 *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="리소스에 대한 간략한 설명을 입력하세요 (이 내용은 리소스 목록에서 미리보기로 표시됩니다)"
                          className="min-h-[120px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* 태그 */}
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>태그</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 bg-muted text-muted-foreground rounded-l-md border border-r-0 border-input">
                            <Tag className="h-4 w-4" />
                          </span>
                          <Input
                            className="rounded-l-none"
                            placeholder="#태그1 #태그2 #태그3 형식으로 입력 (예: #아두이노 #전자공학 #DIY)"
                            {...field}
                            value={field.value || ""}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        태그를 사용하면 검색 결과에 더 잘 노출되고, 관련 리소스 추천에 활용됩니다.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between pt-4 border-t">
                  <div></div>
                  <Button type="button" onClick={() => setCurrentTab("images")}>
                    다음: 이미지 갤러리
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
              
              {/* 이미지 갤러리 탭 */}
              <TabsContent value="images" className="space-y-6 mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* 썸네일 업로드 영역 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">대표 이미지 (썸네일)</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      리소스 목록에 표시될 대표 이미지를 업로드해주세요. 권장 비율은 16:9입니다.
                    </p>
                    
                    <div className="flex flex-col gap-4">
                      {thumbnailFile ? (
                        <div className="relative group">
                          <div className="overflow-hidden border rounded-md aspect-video bg-muted/20">
                            <img 
                              src={thumbnailFile.preview || ''} 
                              alt="대표 이미지" 
                              className="object-cover w-full h-full"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setThumbnailFile(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="border border-dashed rounded-md flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-muted/20 transition-colors aspect-video"
                          onClick={() => {
                            const input = document.getElementById('thumbnailInput') as HTMLInputElement;
                            if (input) input.click();
                          }}
                        >
                          <ImageIcon className="h-8 w-8 mb-2 text-muted-foreground" />
                          <p className="text-sm font-medium mb-1">대표 이미지 추가</p>
                          <p className="text-xs text-muted-foreground">클릭하여 이미지 업로드</p>
                        </div>
                      )}
                      <input
                        id="thumbnailInput"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e, 'thumbnail')}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => {
                          const input = document.getElementById('thumbnailInput') as HTMLInputElement;
                          if (input) input.click();
                        }}
                      >
                        {thumbnailFile ? "대표 이미지 변경" : "대표 이미지 선택"}
                      </Button>
                    </div>
                  </div>
                  
                  {/* 갤러리 이미지 업로드 영역 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">갤러리 이미지</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      추가 이미지를 업로드하여 리소스를 더 상세하게 보여주세요. 최대 10개까지 가능합니다.
                    </p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                      {galleryFiles.map((file, index) => (
                        <FilePreviewCard 
                          key={index} 
                          file={file} 
                          onDelete={() => removeGalleryFile(index)}
                        />
                      ))}
                      
                      {galleryFiles.length < 10 && (
                        <div 
                          className="border border-dashed rounded-md flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-muted/20 transition-colors aspect-video"
                          onClick={() => {
                            const input = document.getElementById('galleryInput') as HTMLInputElement;
                            if (input) input.click();
                          }}
                        >
                          <Plus className="h-6 w-6 mb-1 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">이미지 추가</p>
                        </div>
                      )}
                    </div>
                    
                    <input
                      id="galleryInput"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e, 'gallery')}
                    />
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        const input = document.getElementById('galleryInput') as HTMLInputElement;
                        if (input) input.click();
                      }}
                      disabled={galleryFiles.length >= 10}
                    >
                      <ImageIcon className="h-4 w-4 mr-1" />
                      갤러리 이미지 추가 {galleryFiles.length > 0 && `(${galleryFiles.length}/10)`}
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setCurrentTab("basic")}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    이전: 기본 정보
                  </Button>
                  <Button type="button" onClick={() => setCurrentTab("details")}>
                    다음: 상세 정보
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
              
              {/* 상세 정보 탭 */}
              <TabsContent value="details" className="space-y-6 mt-2">
                {!form.watch('resourceType') ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>카테고리 선택 필요</AlertTitle>
                    <AlertDescription>
                      기본 정보 탭에서 리소스 카테고리를 먼저 선택해주세요.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    {/* 카테고리별 상세 정보 */}
                    {form.watch('resourceType') === 'hardware_design' && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="materials"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>필요한 재료</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="제작에 필요한 재료를 입력하세요 (한 줄에 하나씩)"
                                    className="min-h-[150px] resize-y"
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormDescription>
                                  재료명, 수량, 규격 등을 포함하여 상세히 작성해주세요.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
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
                                <FormDescription>
                                  제품의 물리적 크기나 치수를 입력해주세요.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="assemblyInstructions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>조립 방법</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="단계별 조립 방법을 상세히 설명해주세요."
                                  className="min-h-[200px] resize-y"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormDescription>
                                조립에 필요한 단계와 방법을 순서대로 설명해주세요. 마크다운 형식을 지원합니다.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                    
                    {form.watch('resourceType') === 'software' && (
                      <FormField
                        control={form.control}
                        name="howToUse"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>사용 방법</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="설치 방법과 사용법을 상세히 설명해주세요."
                                className="min-h-[300px] resize-y"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              소프트웨어 설치 및 사용 방법을 단계별로 설명해주세요. 코드 예제도 포함하면 좋습니다.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    {form.watch('resourceType') === '3d_model' && (
                      <>
                        <FormField
                          control={form.control}
                          name="howToUse"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>프린팅 설정</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="권장 프린팅 설정을 입력하세요 (예: 층 높이, 충전률, 서포트 설정 등)"
                                  className="min-h-[150px] resize-y"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormDescription>
                                최적의 프린팅 결과를 위한 설정값을 공유해주세요.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="dimensions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>모델 크기</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="예: 100mm x 50mm x 20mm"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormDescription>
                                3D 모델의 기본 크기를 입력해주세요.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                    
                    {form.watch('resourceType') === 'ai_model' && (
                      <FormField
                        control={form.control}
                        name="howToUse"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>사용 방법 및 모델 설명</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="모델의 구조, 훈련 방법, 사용법 등을 설명해주세요."
                                className="min-h-[300px] resize-y"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              모델 구조, 파라미터, 성능지표, 사용 예제 등을 포함해주세요.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    {form.watch('resourceType') === 'free_content' && (
                      <FormField
                        control={form.control}
                        name="howToUse"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>콘텐츠 설명 및 라이센스</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="콘텐츠에 대한 설명과 라이센스 정보를 입력해주세요."
                                className="min-h-[200px] resize-y"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              콘텐츠 이용 조건, 출처, 라이센스 정보를 명확히 기재해주세요.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    {form.watch('resourceType') === 'flash_game' && (
                      <FormField
                        control={form.control}
                        name="howToUse"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>게임 설명 및 조작법</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="게임 설명, 목표, 조작법 등을 설명해주세요."
                                className="min-h-[200px] resize-y"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              게임 목표, 조작키, 게임 플레이 방법을 자세히 설명해주세요.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </>
                )}
                
                <div className="flex justify-between pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setCurrentTab("images")}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    이전: 이미지 갤러리
                  </Button>
                  <Button type="button" onClick={() => setCurrentTab("files")}>
                    다음: 파일 업로드
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
              
              {/* 파일 업로드 탭 */}
              <TabsContent value="files" className="space-y-6 mt-2">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">다운로드 파일 업로드</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          사용자가 다운로드할 수 있는 파일을 업로드하거나 외부 URL을 입력해주세요.
                        </p>
                        
                        {downloadFile ? (
                          <div className="border rounded-md p-4 bg-muted/10 mb-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary/10 text-primary mr-3">
                                  <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                  <p className="font-medium">{downloadFile.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {(downloadFile.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setDownloadFile(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className="border border-dashed rounded-md flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-muted/20 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <UploadCloud className="h-8 w-8 mb-2 text-muted-foreground" />
                            <p className="text-sm font-medium mb-1">파일을 여기에 드래그하거나 클릭하여 업로드</p>
                            <p className="text-xs text-muted-foreground">최대 100MB</p>
                          </div>
                        )}
                        
                        <input 
                          ref={fileInputRef}
                          type="file" 
                          className="hidden" 
                          onChange={(e) => handleFileSelect(e, 'download')}
                        />
                        
                        <div className="flex items-center gap-4 mt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1"
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            파일 선택
                          </Button>
                          
                          <Separator orientation="vertical" className="h-8" />
                          
                          <div className="flex-1">
                            <FormField
                              control={form.control}
                              name="downloadUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      placeholder="또는 다운로드 URL 직접 입력"
                                      {...field}
                                      value={field.value || ""}
                                      disabled={!!downloadFile}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        
                        {downloadFile && downloadFile.progress !== undefined && downloadFile.progress > 0 && downloadFile.progress < 100 && (
                          <div className="mt-4">
                            <ProgressStatus />
                          </div>
                        )}
                      </div>
                      
                      {/* 업로드 요약 및 완료 버튼 */}
                      <div className="mt-6 pt-6 border-t">
                        <h3 className="text-lg font-semibold mb-4">업로드 요약</h3>
                        
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6">
                          <div className="flex items-center">
                            <div className="w-6 text-primary mr-2">
                              {form.watch('title') ? <Check className="h-4 w-4" /> : <X className="h-4 w-4 text-destructive" />}
                            </div>
                            <span className="text-sm">리소스 제목</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-6 text-primary mr-2">
                              {form.watch('resourceType') ? <Check className="h-4 w-4" /> : <X className="h-4 w-4 text-destructive" />}
                            </div>
                            <span className="text-sm">카테고리</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-6 text-primary mr-2">
                              {form.watch('description') ? <Check className="h-4 w-4" /> : <X className="h-4 w-4 text-destructive" />}
                            </div>
                            <span className="text-sm">설명</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-6 text-primary mr-2">
                              {thumbnailFile ? <Check className="h-4 w-4" /> : <X className="h-4 w-4 text-destructive" />}
                            </div>
                            <span className="text-sm">대표 이미지</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-6 text-primary mr-2">
                              {(downloadFile || form.watch('downloadUrl')) ? <Check className="h-4 w-4" /> : <X className="h-4 w-4 text-muted-foreground" />}
                            </div>
                            <span className="text-sm">다운로드 파일</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-6 text-primary mr-2">
                              {galleryFiles.length > 0 ? <Check className="h-4 w-4" /> : <X className="h-4 w-4 text-muted-foreground" />}
                            </div>
                            <span className="text-sm">갤러리 이미지 ({galleryFiles.length}개)</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-4">
                          <Button
                            type="button"
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setCurrentTab("basic")}
                          >
                            정보 수정
                          </Button>
                          <Button 
                            type="submit"
                            className="flex-1"
                            disabled={
                              mutation.isPending || 
                              !form.watch('title') || 
                              !form.watch('description') || 
                              !form.watch('resourceType') ||
                              !thumbnailFile
                            }
                          >
                            {mutation.isPending ? (
                              <>업로드 중... <UploadCloud className="ml-2 h-4 w-4 animate-bounce" /></>
                            ) : (
                              <>리소스 업로드 완료 <Check className="ml-2 h-4 w-4" /></>
                            )}
                          </Button>
                        </div>
                        
                        {mutation.isPending && (
                          <div className="mt-4">
                            <ProgressStatus />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-between pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setCurrentTab("details")}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    이전: 상세 정보
                  </Button>
                  <Button 
                    type="submit"
                    disabled={
                      mutation.isPending || 
                      !form.watch('title') || 
                      !form.watch('description') || 
                      !form.watch('resourceType') ||
                      !thumbnailFile
                    }
                  >
                    {mutation.isPending ? (
                      <>업로드 중... <UploadCloud className="ml-2 h-4 w-4 animate-bounce" /></>
                    ) : (
                      <>리소스 업로드 <Upload className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </form>
          </Form>
        </Tabs>
      </div>
    </div>
  );
}

function ChevronLeft(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}