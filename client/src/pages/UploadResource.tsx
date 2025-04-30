import { useState, useRef } from "react";
import { useLocation as useWouterLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ResourceType } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Image as ImageIcon, FileText, X, Plus, Download } from "lucide-react";
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

// 리소스 타입
const resourceTypeOptions: { value: ResourceType; label: string }[] = [
  { value: "hardware_design", label: "하드웨어 설계" },
  { value: "software", label: "소프트웨어" },
  { value: "3d_model", label: "3D 모델" },
  { value: "free_content", label: "무료 콘텐츠" },
  { value: "ai_model", label: "AI 모델" },
  { value: "flash_game", label: "플래시 게임" },
];

// 카테고리 옵션 (resourceType에 따라 달라짐)
const categoryOptions: Record<ResourceType, string[]> = {
  hardware_design: ["PCB 디자인", "회로도", "센서", "액추에이터", "기계 설계", "기타"],
  software: ["API", "라이브러리", "앱", "웹앱", "게임", "도구", "기타"],
  "3d_model": ["가구", "피규어", "부품", "장식품", "공구", "기타"],
  free_content: ["아트웍", "음악", "책", "가이드", "튜토리얼", "기타"],
  ai_model: ["이미지 생성", "텍스트 생성", "코드 생성", "데이터 분석", "음성 생성", "기타"],
  flash_game: ["액션", "퍼즐", "롤플레잉", "시뮬레이션", "캐주얼", "기타"]
};

// 리소스 업로드 폼 스키마
const resourceFormSchema = z.object({
  title: z.string().min(2, "제목은 최소 2자 이상이어야 합니다").max(100, "제목은 최대 100자까지 가능합니다"),
  description: z.string().min(10, "설명은 최소 10자 이상이어야 합니다").max(2000, "설명은 최대 2000자까지 가능합니다"),
  resourceType: z.enum(["hardware_design", "software", "3d_model", "free_content", "ai_model", "flash_game"]),
  category: z.string().optional(),
  tags: z.string().optional(),
  downloadUrl: z.string().url("유효한 URL을 입력하세요").optional().or(z.literal("")),
  howToUse: z.string().optional(),
  assemblyInstructions: z.string().optional(),
});

type ResourceFormValues = z.infer<typeof resourceFormSchema>;

export default function UploadResource() {
  const { toast } = useToast();
  const [, navigate] = useWouterLocation();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [downloadFile, setDownloadFile] = useState<File | null>(null);
  const [selectedTab, setSelectedTab] = useState("basic");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  
  // URL에서 type 파라미터 추출
  const [initialResourceType, setInitialResourceType] = useState<ResourceType | null>(null);
  
  // 컴포넌트 마운트 시 URL에서 type 파라미터 확인
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const typeParam = params.get('type') as ResourceType | null;
      
      // 유효한 ResourceType인지 검증
      if (typeParam && resourceTypeOptions.some(option => option.value === typeParam)) {
        setInitialResourceType(typeParam);
      }
    }
  });

  // URL에서 가져온 리소스 타입으로 초기화하기 위한 useEffect
  useEffect(() => {
    if (initialResourceType) {
      form.setValue("resourceType", initialResourceType);
    }
  }, [initialResourceType]);

  // 폼 초기화
  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      title: "",
      description: "",
      resourceType: initialResourceType || "hardware_design",
      category: "",
      tags: "",
      downloadUrl: "",
      howToUse: "",
      assemblyInstructions: "",
    },
  });

  // 리소스 타입이 변경되면 카테고리 초기화
  const resourceType = form.watch("resourceType") as ResourceType;

  // 리소스 업로드 뮤테이션
  const uploadResourceMutation = useMutation({
    mutationFn: async (formData: FormData) => {
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
    },
  });

  // 이미지 선택 핸들러
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "파일 크기 초과",
          description: "이미지 파일은 5MB 이하만 업로드 가능합니다.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setImageFile(file);
    }
  };

  // 다운로드 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    }
  };

  // 태그 추가 핸들러
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      form.setValue("tags", newTags.join(","));
      setTagInput("");
    }
  };

  // 태그 제거 핸들러
  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    form.setValue("tags", newTags.join(","));
  };

  // 태그 입력 핸들러 (Enter 키 처리)
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  // 폼 제출 핸들러
  const onSubmit = async (data: ResourceFormValues) => {
    const formData = new FormData();
    
    // 기본 정보 추가
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("resourceType", data.resourceType);
    
    // 선택적 정보 추가
    if (data.category) formData.append("category", data.category);
    if (tags.length > 0) formData.append("tags", tags.join(","));
    if (data.downloadUrl) formData.append("downloadUrl", data.downloadUrl);
    if (data.howToUse) formData.append("howToUse", data.howToUse);
    if (data.assemblyInstructions) formData.append("assemblyInstructions", data.assemblyInstructions);
    
    // 사용자 ID 추가 (로그인 한 경우)
    if (user) {
      formData.append("userId", user.id.toString());
    }

    // 파일 추가
    if (imageFile) {
      formData.append("imageFile", imageFile);
    }
    
    if (downloadFile) {
      formData.append("downloadFile", downloadFile);
    }

    // 업로드 요청
    uploadResourceMutation.mutate(formData);
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">리소스 업로드</CardTitle>
            <CardDescription>
              여러분의 리소스를 공유하고 커뮤니티에 기여해보세요!
            </CardDescription>
          </CardHeader>

          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">기본 정보</TabsTrigger>
                <TabsTrigger value="details">상세 정보</TabsTrigger>
                <TabsTrigger value="preview">미리보기</TabsTrigger>
              </TabsList>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <TabsContent value="basic">
                  <CardContent className="space-y-4 pt-4">
                    {/* 제목 */}
                    <FormField
                      control={form.control}
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

                    {/* 리소스 타입 */}
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
                                <SelectValue placeholder="리소스 유형을 선택하세요" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {resourceTypeOptions.map((option) => (
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

                    {/* 카테고리 */}
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>카테고리</FormLabel>
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
                              {categoryOptions[resourceType].map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 설명 */}
                    <FormField
                      control={form.control}
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

                    {/* 이미지 업로드 */}
                    <div className="space-y-2">
                      <FormLabel>이미지</FormLabel>
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        <div className="border rounded-md p-4 text-center flex flex-col items-center justify-center min-h-[200px]">
                          {imagePreview ? (
                            <div className="relative w-full h-full">
                              <img
                                src={imagePreview}
                                alt="미리보기"
                                className="max-h-[180px] max-w-full object-contain mx-auto"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-0 right-0"
                                onClick={() => {
                                  setImagePreview(null);
                                  setImageFile(null);
                                  if (fileInputRef.current) {
                                    fileInputRef.current.value = "";
                                  }
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <ImageIcon className="h-4 w-4 mr-2" />
                              이미지 업로드
                            </Button>
                          )}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageSelect}
                          />
                          <p className="text-xs text-muted-foreground mt-2">
                            최대 5MB, JPG, PNG, GIF 형식 지원
                          </p>
                        </div>

                        <div className="border rounded-md p-4 text-center flex flex-col items-center justify-center">
                          <FormField
                            control={form.control}
                            name="downloadUrl"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel>다운로드 URL</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="외부 다운로드 URL 입력"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <p className="text-xs text-muted-foreground my-2">또는</p>
                          <div className="w-full">
                            <div className="flex items-center justify-center">
                              <input
                                type="file"
                                id="downloadFile"
                                className="hidden"
                                onChange={handleFileSelect}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => document.getElementById("downloadFile")?.click()}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                {downloadFile ? "파일 변경" : "파일 업로드"}
                              </Button>
                            </div>
                            {downloadFile && (
                              <div className="mt-2 text-sm flex items-center">
                                <FileText className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span className="truncate">{downloadFile.name}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="ml-auto h-6 w-6 p-0"
                                  onClick={() => setDownloadFile(null)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              최대 50MB, 모든 파일 형식 지원
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => navigate("/resources")}>
                      취소
                    </Button>
                    <Button type="button" onClick={() => setSelectedTab("details")}>
                      다음
                    </Button>
                  </CardFooter>
                </TabsContent>

                <TabsContent value="details">
                  <CardContent className="space-y-4 pt-4">
                    {/* 사용 방법 */}
                    <FormField
                      control={form.control}
                      name="howToUse"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>사용 방법</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="리소스를 사용하는 방법을 설명해주세요"
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 조립 방법 */}
                    <FormField
                      control={form.control}
                      name="assemblyInstructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>조립 방법</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="조립이 필요한 경우, 조립 방법을 설명해주세요"
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>

                  <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setSelectedTab("basic")}>
                      이전
                    </Button>
                    <Button type="button" onClick={() => setSelectedTab("preview")}>
                      미리보기
                    </Button>
                  </CardFooter>
                </TabsContent>

                <TabsContent value="preview">
                  <CardContent className="pt-4">
                    <div className="rounded-lg border p-6 space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold">{form.getValues("title") || "제목 없음"}</h2>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-primary/20">
                            {resourceTypeOptions.find(opt => opt.value === form.getValues("resourceType"))?.label || ""}
                          </Badge>
                          {form.getValues("category") && (
                            <Badge variant="outline">
                              {form.getValues("category")}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {imagePreview && (
                        <div className="flex justify-center">
                          <img
                            src={imagePreview}
                            alt="미리보기"
                            className="max-h-[300px] max-w-full object-contain rounded-md"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <h3 className="font-semibold">설명</h3>
                        <p className="text-muted-foreground whitespace-pre-line">
                          {form.getValues("description") || "설명이 없습니다."}
                        </p>
                      </div>

                      {tags.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="font-semibold">태그</h3>
                          <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {(form.getValues("howToUse") || form.getValues("assemblyInstructions")) && (
                        <Separator />
                      )}

                      {form.getValues("howToUse") && (
                        <div className="space-y-2">
                          <h3 className="font-semibold">사용 방법</h3>
                          <p className="text-muted-foreground whitespace-pre-line">
                            {form.getValues("howToUse")}
                          </p>
                        </div>
                      )}

                      {form.getValues("assemblyInstructions") && (
                        <div className="space-y-2">
                          <h3 className="font-semibold">조립 방법</h3>
                          <p className="text-muted-foreground whitespace-pre-line">
                            {form.getValues("assemblyInstructions")}
                          </p>
                        </div>
                      )}

                      {(form.getValues("downloadUrl") || downloadFile) && (
                        <div className="mt-4 text-center">
                          <Button type="button" variant="outline" disabled>
                            <Download className="h-4 w-4 mr-2" />
                            다운로드
                          </Button>
                          <p className="text-xs text-muted-foreground mt-1">
                            {downloadFile 
                              ? `파일: ${downloadFile.name} (${(downloadFile.size / 1024 / 1024).toFixed(2)} MB)` 
                              : "외부 다운로드 링크"}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setSelectedTab("details")}>
                      이전
                    </Button>
                    <Button
                      type="submit"
                      disabled={uploadResourceMutation.isPending}
                    >
                      {uploadResourceMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      업로드
                    </Button>
                  </CardFooter>
                </TabsContent>
              </form>
            </Form>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}