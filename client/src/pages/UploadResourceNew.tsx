import { useState, useRef, useEffect } from "react";
import { useLocation as useWouterLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ResourceType } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Image as ImageIcon, FileText, X, Plus, Download, File, ArrowLeft, ArrowRight, Link as LinkIcon, Check, Info, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// 카테고리 옵션 (기존 리소스 타입을 카테고리로 변경)
const categoryOptions = [
  { value: "hardware_design", label: "하드웨어 설계" },
  { value: "software", label: "소프트웨어" },
  { value: "3d_model", label: "3D 모델" },
  { value: "free_content", label: "무료 콘텐츠" },
  { value: "ai_model", label: "AI 모델" },
  { value: "flash_game", label: "플래시 게임" },
];

// 서브카테고리 옵션 (카테고리에 따라 달라짐)
const subcategoryOptions: Record<string, string[]> = {
  hardware_design: ["PCB 디자인", "회로도", "센서", "액추에이터", "기계 설계", "기타"],
  software: ["API", "라이브러리", "앱", "웹앱", "게임", "도구", "기타"],
  "3d_model": ["가구", "피규어", "부품", "장식품", "공구", "기타"],
  free_content: ["아트웍", "음악", "책", "가이드", "튜토리얼", "기타"],
  ai_model: ["이미지 생성", "텍스트 생성", "코드 생성", "데이터 분석", "음성 생성", "기타"],
  flash_game: ["액션", "퍼즐", "롤플레잉", "시뮬레이션", "캐주얼", "기타"]
};

// 리소스 업로드 폼 스키마 - 기본 정보
const resourceBasicFormSchema = z.object({
  title: z.string().min(2, "제목은 최소 2자 이상이어야 합니다").max(100, "제목은 최대 100자까지 가능합니다"),
  description: z.string().min(10, "설명은 최소 10자 이상이어야 합니다").max(2000, "설명은 최대 2000자까지 가능합니다"),
  category: z.string().min(1, "카테고리를 선택해주세요"),
  subcategory: z.string().optional(),
  tags: z.string().optional(),
  downloadUrl: z.string().url("유효한 URL을 입력하세요").optional().or(z.literal("")),
  sourceSite: z.string().optional(),
});

// 리소스 업로드 폼 스키마 - 상세 정보
const resourceDetailFormSchema = z.object({
  howToUse: z.string().optional(),
  assemblyInstructions: z.string().optional(),
});

type ResourceBasicFormValues = z.infer<typeof resourceBasicFormSchema>;
type ResourceDetailFormValues = z.infer<typeof resourceDetailFormSchema>;

export default function UploadResourceNew() {
  const { toast } = useToast();
  const [, navigate] = useWouterLocation();
  const { user } = useAuth();
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const downloadFileInputRef = useRef<HTMLInputElement>(null);
  const mediaFileInputRef = useRef<HTMLInputElement>(null);
  
  // 상태 변수들
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [downloadFile, setDownloadFile] = useState<File | null>(null);
  const [mediaFiles, setMediaFiles] = useState<{ file: File; preview: string; type: 'image' | 'video' }[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  
  // 기본 정보 폼
  const basicForm = useForm<ResourceBasicFormValues>({
    resolver: zodResolver(resourceBasicFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      subcategory: "",
      tags: "",
      downloadUrl: "",
      sourceSite: "",
    },
  });
  
  // 상세 정보 폼
  const detailForm = useForm<ResourceDetailFormValues>({
    resolver: zodResolver(resourceDetailFormSchema),
    defaultValues: {
      howToUse: "",
      assemblyInstructions: "",
    },
  });
  
  // 선택된 카테고리에 따라 서브카테고리 옵션 업데이트
  const selectedCategory = basicForm.watch("category");

  // 다음 단계로 이동
  const moveToNextStep = async () => {
    // 첫 번째 단계의 폼 유효성 검사
    const isBasicFormValid = await basicForm.trigger();
    if (!isBasicFormValid) {
      toast({
        title: "기본 정보를 확인해주세요",
        description: "모든 필수 항목을 올바르게 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentStep(2);
  };

  // 이전 단계로 이동
  const moveToPreviousStep = () => {
    setCurrentStep(1);
  };

  // 썸네일 이미지 선택 핸들러
  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "파일 크기 초과",
          description: "썸네일 이미지는 5MB 이하만 업로드 가능합니다.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setThumbnailFile(file);
    }
  };

  // 다운로드 파일 선택 핸들러
  const handleDownloadFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "파일 크기 초과",
          description: "다운로드 파일은 50MB 이하만 업로드 가능합니다.",
          variant: "destructive",
        });
        return;
      }
      setDownloadFile(file);
      toast({
        title: "파일 선택 완료",
        description: `'${file.name}' 파일이 선택되었습니다.`,
      });
    }
  };

  // 미디어 파일 선택 핸들러
  const handleMediaFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newMediaFiles: { file: File; preview: string; type: 'image' | 'video' }[] = [];
      
      Array.from(files).forEach((file) => {
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "파일 크기 초과",
            description: `${file.name}의 크기가 10MB를 초과합니다.`,
            variant: "destructive",
          });
          return;
        }
        
        const fileType = file.type.startsWith('image/') ? 'image' : 
                         file.type.startsWith('video/') ? 'video' : 'image';
        
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newMediaFiles.push({
              file,
              preview: event.target.result as string,
              type: fileType
            });
            
            if (newMediaFiles.length === Array.from(files).length) {
              setMediaFiles(prev => [...prev, ...newMediaFiles]);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // 미디어 파일 제거 핸들러
  const removeMediaFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  // 태그 추가 핸들러
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      basicForm.setValue("tags", newTags.join(","));
      setTagInput("");
    }
  };

  // 태그 제거 핸들러
  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    basicForm.setValue("tags", newTags.join(","));
  };

  // 태그 입력 핸들러 (Enter 키 처리)
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  // 리소스 업로드 뮤테이션
  const uploadResourceMutation = useMutation({
    mutationFn: async () => {
      const basicData = basicForm.getValues();
      const detailData = detailForm.getValues();
      
      const formData = new FormData();
      
      // 기본 정보 추가
      formData.append("title", basicData.title);
      formData.append("description", basicData.description);
      formData.append("resourceType", basicData.category as ResourceType);
      
      // 선택적 정보 추가
      if (basicData.subcategory) formData.append("category", basicData.subcategory);
      if (tags.length > 0) formData.append("tags", tags.join(","));
      if (basicData.downloadUrl) formData.append("downloadUrl", basicData.downloadUrl);
      if (basicData.sourceSite) formData.append("sourceSite", basicData.sourceSite);
      if (detailData.howToUse) formData.append("howToUse", detailData.howToUse);
      if (detailData.assemblyInstructions) formData.append("assemblyInstructions", detailData.assemblyInstructions);
      
      // 사용자 ID 추가 (로그인 한 경우)
      if (user) {
        formData.append("userId", user.id.toString());
      }

      // 썸네일 이미지 추가
      if (thumbnailFile) {
        formData.append("imageFile", thumbnailFile);
      }
      
      // 다운로드 파일 추가
      if (downloadFile) {
        formData.append("downloadFile", downloadFile);
      }
      
      // 미디어 파일 추가 (상세 설명용)
      mediaFiles.forEach((media, index) => {
        formData.append(`mediaFile${index}`, media.file);
        formData.append(`mediaType${index}`, media.type);
      });
      formData.append("mediaFilesCount", mediaFiles.length.toString());

      // API 요청
      const res = await apiRequest("POST", "/api/resources", formData, true);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "리소스 업로드 중 오류가 발생했습니다.");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "업로드 성공!",
        description: "리소스가 성공적으로 업로드되었습니다.",
      });
      navigate("/resources");
    },
    onError: (error: Error) => {
      toast({
        title: "업로드 실패",
        description: error.message,
        variant: "destructive",
      });
      setSubmitting(false);
    },
  });

  // 폼 제출 핸들러
  const onSubmit = async () => {
    setSubmitting(true);
    
    // 상세 정보 유효성 검사 (필수는 아님)
    const detailFormResult = await detailForm.trigger();
    if (!detailFormResult) {
      toast({
        title: "상세 정보 오류",
        description: "입력하신 상세 정보를 확인해주세요.",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }
    
    // 로그인 확인
    if (!user) {
      toast({
        title: "로그인이 필요합니다",
        description: "리소스를 업로드하려면 로그인이 필요합니다.",
        variant: "destructive",
      });
      navigate("/auth");
      setSubmitting(false);
      return;
    }
    
    // 파일 또는 URL 확인
    if (!downloadFile && !basicForm.getValues("downloadUrl")) {
      toast({
        title: "다운로드 정보 필요",
        description: "다운로드 파일을 업로드하거나 다운로드 URL을 입력해주세요.",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }
    
    // 업로드 요청
    uploadResourceMutation.mutate();
  };

  // 로그인 확인
  if (!user) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>로그인이 필요합니다</AlertTitle>
          <AlertDescription>
            리소스를 업로드하려면 로그인이 필요합니다.
            <Button
              variant="link"
              className="p-0 ml-2"
              onClick={() => navigate('/auth')}
            >
              로그인 페이지로 이동
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">리소스 공유하기</h1>
              <p className="text-muted-foreground">
                여러분의 창작물을 커뮤니티와 함께 나눠보세요!
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={() => navigate("/resources")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            돌아가기
          </Button>
        </div>

        {/* 단계 표시기 */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <div className="flex items-center space-x-4 bg-background px-4">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= 1 ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {currentStep > 1 ? <Check className="h-4 w-4" /> : "1"}
                </div>
                <div className="h-px w-12 bg-gray-200"></div>
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= 2 ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  2
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-2">
            <div className="text-center px-8">
              <p className={`text-sm ${currentStep === 1 ? "font-medium text-primary" : "text-muted-foreground"}`}>
                기본 정보
              </p>
            </div>
            <div className="text-center px-8">
              <p className={`text-sm ${currentStep === 2 ? "font-medium text-primary" : "text-muted-foreground"}`}>
                사용 방법 및 조립 지침
              </p>
            </div>
          </div>
        </div>

        {/* 단계 1: 기본 정보 */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>
                리소스에 대한 기본 정보를 입력해주세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...basicForm}>
                <form className="space-y-6">
                  {/* 제목 */}
                  <FormField
                    control={basicForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>제목 *</FormLabel>
                        <FormControl>
                          <Input placeholder="리소스 제목을 입력하세요" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 카테고리 */}
                  <FormField
                    control={basicForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>카테고리 *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="카테고리를 선택하세요" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categoryOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 서브카테고리 */}
                  {selectedCategory && (
                    <FormField
                      control={basicForm.control}
                      name="subcategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>서브카테고리</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="서브카테고리를 선택하세요" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {subcategoryOptions[selectedCategory]?.map((subcategory) => (
                                <SelectItem key={subcategory} value={subcategory}>
                                  {subcategory}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* 설명 */}
                  <FormField
                    control={basicForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>설명 *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="리소스에 대한 설명을 입력하세요"
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 태그 */}
                  <div className="space-y-2">
                    <FormLabel>태그</FormLabel>
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="태그 입력 후 Enter 키를 누르세요"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleAddTag}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        추가
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="pl-2 pr-1 py-1">
                            {tag}
                            <button
                              type="button"
                              className="ml-1 hover:bg-muted rounded-full"
                              onClick={() => handleRemoveTag(tag)}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 썸네일 이미지 업로드 */}
                  <div className="space-y-2">
                    <FormLabel>썸네일 이미지</FormLabel>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      <div className="border rounded-md p-4 text-center flex flex-col items-center justify-center min-h-[200px]">
                        {thumbnailPreview ? (
                          <div className="relative w-full h-full">
                            <img
                              src={thumbnailPreview}
                              alt="미리보기"
                              className="max-h-[180px] max-w-full object-contain mx-auto"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => {
                                setThumbnailPreview(null);
                                setThumbnailFile(null);
                                if (thumbnailInputRef.current) {
                                  thumbnailInputRef.current.value = "";
                                }
                              }}
                            >
                              <X className="h-4 w-4 mr-1" />
                              제거
                            </Button>
                          </div>
                        ) : (
                          <div
                            className="flex flex-col items-center justify-center cursor-pointer"
                            onClick={() => thumbnailInputRef.current?.click()}
                          >
                            <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground mb-1">클릭하여 썸네일 업로드</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, GIF (최대 5MB)</p>
                          </div>
                        )}
                        <input
                          type="file"
                          ref={thumbnailInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handleThumbnailSelect}
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="text-sm font-medium mb-2">썸네일 이미지 가이드라인</h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• 권장 크기: 1200 x 800 픽셀</li>
                          <li>• 최대 파일 크기: 5MB</li>
                          <li>• 지원 형식: JPG, PNG, GIF</li>
                          <li>• 텍스트 없는 깨끗한 이미지 권장</li>
                          <li>• 리소스의 완성된 모습이 잘 드러나야 함</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 다운로드 파일 업로드 및 URL */}
                  <div className="space-y-4">
                    <FormLabel>다운로드 정보</FormLabel>
                    <div className="border rounded-md p-4">
                      <h4 className="text-sm font-medium mb-2">다운로드 파일 업로드</h4>
                      {downloadFile ? (
                        <div className="flex items-center space-x-2 p-2 bg-muted rounded-md">
                          <File className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm flex-1 truncate">{downloadFile.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDownloadFile(null);
                              if (downloadFileInputRef.current) {
                                downloadFileInputRef.current.value = "";
                              }
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="border border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => downloadFileInputRef.current?.click()}
                        >
                          <Download className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">클릭하여 다운로드 파일 업로드</p>
                          <p className="text-xs text-muted-foreground mt-1">ZIP, PDF, STL 등 (최대 50MB)</p>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={downloadFileInputRef}
                        className="hidden"
                        onChange={handleDownloadFileSelect}
                      />
                      
                      <Separator className="my-4" />
                      
                      <h4 className="text-sm font-medium mb-2">또는 다운로드 URL 입력</h4>
                      <FormField
                        control={basicForm.control}
                        name="downloadUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <Input 
                                  placeholder="https://example.com/download/resource.zip" 
                                  {...field} 
                                />
                                <LinkIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                              </div>
                            </FormControl>
                            <FormDescription>
                              파일을 직접 업로드하지 않는 경우, 다운로드 가능한 URL을 입력하세요
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* 출처 사이트 */}
                  <FormField
                    control={basicForm.control}
                    name="sourceSite"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>출처 사이트 (선택사항)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="원본 리소스 출처 사이트 URL" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          리소스의 원본 출처가 있다면 입력해주세요
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={moveToNextStep}>
                다음 단계
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* 단계 2: 사용 방법 및 조립 지침 */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>사용 방법 및 조립 지침</CardTitle>
              <CardDescription>
                리소스 사용 방법과 조립 지침을 상세하게 작성해주세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...detailForm}>
                <form className="space-y-6">
                  {/* 사용 방법 */}
                  <FormField
                    control={detailForm.control}
                    name="howToUse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>사용 방법</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="리소스 사용 방법을 단계별로 자세히 설명해주세요"
                            className="min-h-[200px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          사용자가 리소스를 활용하는 방법을 설명하세요. 프로그램을 실행하는 방법, 필요한 설정 등을 포함하세요.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 조립 지침 */}
                  <FormField
                    control={detailForm.control}
                    name="assemblyInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>조립 지침</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="하드웨어 조립 지침이나 설치 과정을 단계별로 설명해주세요"
                            className="min-h-[200px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          하드웨어 조립 방법, 필요한 도구, 주의사항 등을 자세히 설명하세요.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 미디어 파일 업로드 (이미지, 동영상 등) */}
                  <div className="space-y-3">
                    <FormLabel>설명용 미디어 파일</FormLabel>
                    <div className="border rounded-md p-4">
                      <div className="flex flex-wrap gap-4 mb-4">
                        {mediaFiles.map((media, index) => (
                          <div key={index} className="relative w-32 h-32 border rounded-md overflow-hidden">
                            {media.type === 'image' ? (
                              <img 
                                src={media.preview} 
                                alt={`미디어 ${index+1}`} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <video 
                                src={media.preview} 
                                className="w-full h-full object-cover"
                                controls
                              />
                            )}
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-0 right-0 w-6 h-6 p-0"
                              onClick={() => removeMediaFile(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        <div className="w-32 h-32 border border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer"
                          onClick={() => mediaFileInputRef.current?.click()}
                        >
                          <Plus className="h-6 w-6 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground mt-1">미디어 추가</span>
                          <input
                            type="file"
                            ref={mediaFileInputRef}
                            className="hidden"
                            accept="image/*,video/*"
                            multiple
                            onChange={handleMediaFilesSelect}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        조립 과정이나 사용 방법을 설명하는 이미지나 짧은 동영상을 업로드하세요.
                        각 파일은 최대 10MB까지 가능합니다.
                      </p>
                    </div>
                  </div>

                  <Alert className="bg-primary/5 border-primary/20">
                    <Info className="h-4 w-4 text-primary" />
                    <AlertTitle>팁: 상세한 설명이 중요합니다</AlertTitle>
                    <AlertDescription className="text-sm">
                      상세하고 명확한 사용 방법과 조립 지침을 제공할수록 다른 사용자들이 
                      여러분의 리소스를 효과적으로 활용할 수 있습니다. 
                      단계별 접근 방식과 시각적 자료를 포함하면 이해하기 쉽습니다.
                    </AlertDescription>
                  </Alert>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={moveToPreviousStep}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                이전 단계
              </Button>
              <Button 
                onClick={onSubmit}
                disabled={submitting || uploadResourceMutation.isPending}
              >
                {(submitting || uploadResourceMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                리소스 업로드
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}