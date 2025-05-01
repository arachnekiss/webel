import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// UI 컴포넌트
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

// 아이콘
import {
  ArrowLeft,
  ImageIcon,
  Video,
  Youtube,
  FileVideo,
  Trash2,
  Save,
  Upload,
  FileText,
  Grip,
  Plus,
  AlertCircle,
  Info,
  Clock,
  FileUp,
  FolderInput,
  Code,
  List,
  File,
  Check,
  X,
} from "lucide-react";

// 카테고리 라벨 (이전 resourceType)
const categoryLabels: Record<string, string> = {
  "hardware_design": "하드웨어 디자인",
  "software": "소프트웨어",
  "3d_model": "3D 모델",
  "ai_model": "AI 모델",
  "free_content": "무료 콘텐츠",
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

// 콘텐츠 블록 타입
type ContentBlockType = 'heading' | 'paragraph' | 'image' | 'video' | 'youtube' | 'gif' | 'code' | 'list';

// 콘텐츠 블록 인터페이스
interface ContentBlock {
  id: string;
  type: ContentBlockType;
  content: string;
  caption?: string;
}

// 파일 정보 인터페이스
interface FileInfo {
  file: File | null;
  preview: string | null;
  name: string;
  size: number;
  type: string;
  uploaded: boolean;
  progress: number;
}

// 리소스 폼 스키마
const formSchema = z.object({
  title: z.string().min(2, { message: "제목은 최소 2자 이상이어야 합니다." }),
  resourceType: z.string({ required_error: "카테고리를 선택해주세요." }),
  description: z.string().min(10, { message: "설명은 최소 10자 이상이어야 합니다." }),
  tags: z.string().transform(val => val.split(",").map(tag => tag.trim()).filter(Boolean)),
  license: z.string().optional(),
  version: z.string().optional(),
  downloadUrl: z.string().optional(),
  repositoryUrl: z.string().optional(),
  programmingLanguage: z.string().optional(),
  softwareRequirements: z.string().optional(),
  dependencies: z.string().optional(),
  dimensions: z.string().optional(),
  assemblyInstructions: z.string().optional(),
  fileFormat: z.string().optional(),
  polygonCount: z.string().optional(),
  aiModelType: z.string().optional(),
  modelAccuracy: z.string().optional(),
  trainingData: z.string().optional(),
  howToUse: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// 드래그 가능한 콘텐츠 블록 컴포넌트
function SortableContentBlock({
  block,
  onUpdate,
  onDelete,
}: {
  block: ContentBlock;
  onUpdate: (id: string, content: string, caption?: string) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-4">
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center">
          <div className="cursor-grab mr-2" {...attributes} {...listeners}>
            <Grip className="h-5 w-5 text-muted-foreground" />
          </div>
          <CardTitle className="text-sm flex-1 flex items-center">
            {block.type === 'heading' && '제목'}
            {block.type === 'paragraph' && '텍스트'}
            {block.type === 'image' && (
              <div className="flex items-center">
                <ImageIcon className="h-4 w-4 mr-1" />
                이미지
              </div>
            )}
            {block.type === 'video' && (
              <div className="flex items-center">
                <Video className="h-4 w-4 mr-1" />
                비디오
              </div>
            )}
            {block.type === 'youtube' && (
              <div className="flex items-center">
                <Youtube className="h-4 w-4 mr-1" />
                유튜브
              </div>
            )}
            {block.type === 'gif' && (
              <div className="flex items-center">
                <FileVideo className="h-4 w-4 mr-1" />
                GIF
              </div>
            )}
            {block.type === 'code' && '코드'}
            {block.type === 'list' && '목록'}
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(block.id)}
            className="h-8 w-8 p-0 ml-2"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </CardHeader>
        <CardContent>
          {(block.type === 'heading' || block.type === 'paragraph' || block.type === 'code' || block.type === 'list') && (
            <Textarea
              placeholder={
                block.type === 'heading' ? "섹션 제목을 입력하세요" :
                block.type === 'paragraph' ? "텍스트 내용을 입력하세요" :
                block.type === 'code' ? "코드를 입력하세요" :
                "목록 항목을 한 줄에 하나씩 입력하세요"
              }
              className={block.type === 'heading' ? "font-bold text-lg" : ""}
              value={block.content}
              onChange={(e) => onUpdate(block.id, e.target.value)}
              rows={block.type === 'paragraph' || block.type === 'code' ? 4 : 2}
            />
          )}

          {(block.type === 'image' || block.type === 'video' || block.type === 'youtube' || block.type === 'gif') && (
            <>
              <Input
                placeholder={
                  block.type === 'youtube'
                    ? "유튜브 영상 URL 또는 임베드 코드"
                    : `${block.type} URL`
                }
                value={block.content}
                onChange={(e) => onUpdate(block.id, e.target.value)}
                className="w-full mb-2"
              />
              <Input
                placeholder="설명 (선택사항)"
                value={block.caption || ""}
                onChange={(e) => onUpdate(block.id, block.content, e.target.value)}
                className="w-full"
              />
            </>
          )}
        </CardContent>
        {block.type === 'image' && block.content && (
          <CardFooter className="pt-0">
            <img
              src={block.content}
              alt={block.caption || "Preview"}
              className="max-h-48 max-w-full rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=이미지+미리보기+실패';
              }}
            />
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

export default function ResourceUploadPageV2() {
  const [setLocation] = useLocation();
  const { toast } = useToast();
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [autoSaveTimerId, setAutoSaveTimerId] = useState<NodeJS.Timeout | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [savedLocally, setSavedLocally] = useState(false);

  // 로컬 스토리지에서 저장된 데이터 불러오기
  useEffect(() => {
    const savedForm = localStorage.getItem("resourceForm");
    const savedBlocks = localStorage.getItem("resourceBlocks");
    
    if (savedForm) {
      try {
        const parsedForm = JSON.parse(savedForm);
        form.reset(parsedForm);
        setSavedLocally(true);
      } catch (e) {
        console.error("저장된 폼 데이터 파싱 오류:", e);
      }
    }
    
    if (savedBlocks) {
      try {
        const parsedBlocks = JSON.parse(savedBlocks);
        setBlocks(parsedBlocks);
      } catch (e) {
        console.error("저장된 블록 데이터 파싱 오류:", e);
      }
    }
  }, []);

  // 자동 저장 타이머 설정
  useEffect(() => {
    // 이전 타이머 정리
    if (autoSaveTimerId) {
      clearInterval(autoSaveTimerId);
    }
    
    // 60초마다 자동 저장
    const timerId = setInterval(() => {
      saveFormLocally();
    }, 60000);
    
    setAutoSaveTimerId(timerId);
    
    return () => {
      if (autoSaveTimerId) {
        clearInterval(autoSaveTimerId);
      }
    };
  }, [blocks]);

  // 파일 업로드 상태 관리
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [downloadFile, setDownloadFile] = useState<FileInfo | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<FileInfo | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // 폼
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      resourceType: "",
      tags: "",
      license: "",
      version: "",
      downloadUrl: "",
      repositoryUrl: "",
    },
  });

  // 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 드래그 종료 핸들러
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  // 블록 추가
  function addBlock(type: ContentBlockType) {
    const newBlock: ContentBlock = {
      id: uuidv4(),
      type,
      content: "",
    };
    
    setBlocks((prev) => [...prev, newBlock]);
  }

  // 블록 업데이트
  function updateBlock(id: string, content: string, caption?: string) {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === id
          ? { ...block, content, caption: caption !== undefined ? caption : block.caption }
          : block
      )
    );
  }

  // 블록 삭제
  function deleteBlock(id: string) {
    setBlocks((prev) => prev.filter((block) => block.id !== id));
  }
  
  // 파일 업로드 함수
  async function handleFileUpload(file: File, type: 'download' | 'thumbnail'): Promise<string> {
    if (!file) return '';
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setUploading(true);
      const endpoint = type === 'download' ? '/api/resources/upload-file' : '/api/resources/upload-image';
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`파일 업로드 실패: ${response.statusText}`);
      }
      
      const data = await response.json();
      setUploading(false);
      
      return data.url;
    } catch (error) {
      setUploading(false);
      console.error('파일 업로드 에러:', error);
      toast({
        title: "파일 업로드 실패",
        description: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
        variant: "destructive",
      });
      return '';
    }
  }
  
  // 파일 선택 처리
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>, type: 'download' | 'thumbnail') {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const fileInfo: FileInfo = {
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      type: file.type,
      uploaded: false,
      progress: 0,
    };
    
    if (type === 'download') {
      setDownloadFile(fileInfo);
    } else {
      setThumbnailFile(fileInfo);
    }
    
    // 자동으로 이미지 컨텐츠 블록 추가 (썸네일 이미지일 경우)
    if (type === 'thumbnail' && fileInfo.preview) {
      // 첫 번째 블록으로 추가
      const newBlock: ContentBlock = {
        id: uuidv4(),
        type: 'image',
        content: fileInfo.preview,
        caption: '대표 이미지',
      };
      
      setBlocks((prev) => [newBlock, ...prev]);
    }
  }

  // 폼 제출 처리
  const mutation = useMutation({
    mutationFn: async (data: FormValues & { contentBlocks: ContentBlock[] }) => {
      // 먼저 파일들을 업로드
      let downloadUrl = data.downloadUrl || '';
      
      if (downloadFile && downloadFile.file && !downloadFile.uploaded) {
        downloadUrl = await handleFileUpload(downloadFile.file, 'download');
      }
      
      // 이미지 URL을 서버에 저장된 URL로 업데이트
      const updatedBlocks = await Promise.all(
        data.contentBlocks.map(async (block) => {
          if (block.type === 'image' && block.content && block.content.startsWith('blob:')) {
            // blob URL인 경우, 서버에 이미지 업로드
            try {
              const response = await fetch(block.content);
              const blob = await response.blob();
              const file = new File([blob], `image-${block.id}.${blob.type.split('/')[1] || 'png'}`, { type: blob.type });
              const uploadedUrl = await handleFileUpload(file, 'thumbnail');
              
              return { ...block, content: uploadedUrl || block.content };
            } catch (error) {
              console.error('이미지 변환 중 오류:', error);
              return block;
            }
          }
          return block;
        })
      );
      
      const response = await apiRequest("POST", "/api/resources", {
        ...data,
        downloadUrl,
        contentBlocks: updatedBlocks,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "리소스 업로드 성공",
        description: "리소스가 성공적으로 업로드되었습니다.",
      });
      
      // 로컬 스토리지 데이터 정리
      localStorage.removeItem("resourceForm");
      localStorage.removeItem("resourceBlocks");
      
      setTimeout(() => {
        setLocation("/admin/resources");
      }, 1500);
    },
    onError: (error: Error) => {
      toast({
        title: "리소스 업로드 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 폼 제출
  function onSubmit(values: FormValues) {
    if (blocks.length === 0) {
      toast({
        title: "콘텐츠 블록 필요",
        description: "최소 하나 이상의 콘텐츠 블록을 추가해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    mutation.mutate({
      ...values,
      contentBlocks: blocks,
    });
  }

  // 로컬 저장
  function saveFormLocally() {
    try {
      localStorage.setItem("resourceForm", JSON.stringify(form.getValues()));
      localStorage.setItem("resourceBlocks", JSON.stringify(blocks));
      setLastSaved(new Date());
      setSavedLocally(true);
      
      toast({
        title: "임시 저장 완료",
        description: "리소스 데이터가 로컬에 임시 저장되었습니다.",
      });
    } catch (e) {
      toast({
        title: "임시 저장 실패",
        description: "로컬 저장소에 데이터를 저장하는데 실패했습니다.",
        variant: "destructive",
      });
    }
  }

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
        <div className="flex items-center space-x-2">
          {savedLocally && (
            <div className="text-xs text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {lastSaved ? `마지막 저장: ${lastSaved.toLocaleTimeString()}` : "임시 저장됨"}
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
            type="submit"
            form="resource-form"
            disabled={mutation.isPending}
          >
            <Upload className="h-4 w-4 mr-1" />
            업로드
          </Button>
        </div>
      </div>

      {savedLocally && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>임시 저장된 내용이 있습니다</AlertTitle>
          <AlertDescription>
            이전에 작성 중이던 내용이 복원되었습니다. 새로 시작하시려면 페이지를 새로고침한 후 임시 저장 내용을 지워주세요.
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form id="resource-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* 기본 정보 섹션 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
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
            </div>

            <div>
              <FormField
                control={form.control}
                name="resourceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>카테고리 *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>설명 *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="리소스에 대한 간략한 설명을 입력하세요 (이 내용은 리소스 목록에서 미리보기로 표시됩니다)"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="category"
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
                      {detailCategoryOptions.map(({ value, label }) => (
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="downloadUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>다운로드 URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="파일 다운로드 URL (선택사항)"
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
              name="repositoryUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>저장소 URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="GitHub, GitLab 등의 저장소 URL (선택사항)"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* 리소스 유형별 추가 정보 */}
          {form.watch('resourceType') && (
            <>
              <Separator />
              <h2 className="text-xl font-semibold">{categoryLabels[form.watch('resourceType')]} 추가 정보</h2>

              {/* 하드웨어 디자인일 경우 */}
              {form.watch('resourceType') === 'hardware_design' && (
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
              )}

              {/* 소프트웨어일 경우 */}
              {form.watch('resourceType') === 'software' && (
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

              {/* 3D 모델일 경우 */}
              {form.watch('resourceType') === '3d_model' && (
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

              {/* AI 모델일 경우 */}
              {form.watch('resourceType') === 'ai_model' && (
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

              {/* 공통 사용 방법 */}
              <FormField
                control={form.control}
                name="howToUse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>사용 방법</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="이 리소스를 어떻게 사용하는지 간략하게 설명해주세요."
                        className="min-h-[100px]"
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
        </form>
      </Form>

      {/* 상세 콘텐츠 섹션 */}
      <div className="mt-8">
        <Separator className="mb-4" />
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">상세 콘텐츠</h2>
          <div className="flex flex-wrap gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addBlock('heading')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    제목
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>섹션 제목 추가</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addBlock('paragraph')}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    텍스트
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>텍스트 단락 추가</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addBlock('image')}
                  >
                    <ImageIcon className="h-4 w-4 mr-1" />
                    이미지
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>이미지 추가</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addBlock('video')}
                  >
                    <Video className="h-4 w-4 mr-1" />
                    비디오
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>비디오 URL 추가</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addBlock('youtube')}
                  >
                    <Youtube className="h-4 w-4 mr-1" />
                    유튜브
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>유튜브 임베드 추가</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addBlock('gif')}
                  >
                    <FileVideo className="h-4 w-4 mr-1" />
                    GIF
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>GIF 이미지 추가</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="mt-4">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={blocks.map(block => block.id)}
              strategy={verticalListSortingStrategy}
            >
              {blocks.map((block) => (
                <SortableContentBlock
                  key={block.id}
                  block={block}
                  onUpdate={updateBlock}
                  onDelete={deleteBlock}
                />
              ))}
            </SortableContext>
          </DndContext>

          {blocks.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed rounded-md">
              <p className="text-muted-foreground">
                상세 콘텐츠를 추가하려면 위의 버튼을 클릭하세요.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="mt-8 flex justify-end space-x-2">
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
          type="submit"
          form="resource-form"
          disabled={mutation.isPending}
        >
          <Upload className="h-4 w-4 mr-1" />
          업로드
        </Button>
      </div>
    </div>
  );
}