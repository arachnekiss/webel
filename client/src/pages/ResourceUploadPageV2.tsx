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
  File as FileIcon,
  X,
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
  thumbnailUrl: z.string().optional(),
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
  
  const { toast } = useToast();

  return (
    <div ref={setNodeRef} style={style} className="mb-5 group relative">
      <div className="relative border rounded-md px-4 py-3 hover:border-muted-foreground/30 transition-colors">
        <div className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" {...attributes} {...listeners}>
          <Grip className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(block.id)}
            className="h-7 w-7 p-0 rounded-full"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
        
        {/* 헤딩 블록 */}
        {block.type === 'heading' && (
          <Textarea
            placeholder="제목을 입력하세요..."
            value={block.content}
            onChange={(e) => onUpdate(block.id, e.target.value)}
            className="resize-none text-xl font-medium border-0 focus-visible:ring-0 p-0 focus:outline-none w-full"
            rows={1}
          />
        )}
        
        {/* 단락 블록 */}
        {block.type === 'paragraph' && (
          <Textarea
            placeholder="텍스트를 입력하세요..."
            value={block.content}
            onChange={(e) => onUpdate(block.id, e.target.value)}
            className="resize-none border-0 focus-visible:ring-0 p-0 focus:outline-none w-full min-h-[100px]"
            rows={4}
          />
        )}
        
        {/* 코드 블록 */}
        {block.type === 'code' && (
          <Textarea
            placeholder="코드를 입력하세요..."
            value={block.content}
            onChange={(e) => onUpdate(block.id, e.target.value)}
            className="resize-none font-mono text-sm border border-muted bg-muted/50 p-2 rounded focus-visible:ring-0 focus:outline-none w-full min-h-[100px]"
            rows={4}
          />
        )}
        
        {/* 목록 블록 */}
        {block.type === 'list' && (
          <Textarea
            placeholder="목록 항목을 한 줄에 하나씩 입력하세요"
            value={block.content}
            onChange={(e) => onUpdate(block.id, e.target.value)}
            className="resize-none border-0 focus-visible:ring-0 p-0 focus:outline-none w-full"
            rows={3}
          />
        )}

        {/* 이미지 및 미디어 블록 */}
        {block.type === 'image' && (
          <div className="space-y-3 mt-3">
            <div className="flex gap-2">
              <Input
                placeholder="이미지 URL"
                value={block.content && !block.content.startsWith('blob:') ? block.content : ''}
                onChange={(e) => onUpdate(block.id, e.target.value)}
                className="flex-1"
              />
              <div className="relative">
                <input
                  type="file"
                  id={`block-image-${block.id}`}
                  onChange={async (e) => {
                    const files = e.target.files;
                    if (!files || files.length === 0) return;
                    
                    const file = files[0];
                    
                    // 이미지 파일 유효성 및 크기 검사
                    if (!file.type.startsWith('image/')) {
                      toast({
                        title: "잘못된 파일 형식",
                        description: "이미지 파일만 업로드할 수 있습니다.",
                        variant: "destructive",
                      });
                      e.target.value = '';
                      return;
                    }
                    
                    if (file.size > 5 * 1024 * 1024) { // 5MB
                      toast({
                        title: "파일 크기 초과",
                        description: "이미지 크기는 5MB 이하여야 합니다.",
                        variant: "destructive",
                      });
                      e.target.value = '';
                      return;
                    }
                    
                    // 이미지 미리보기 URL 생성
                    const previewUrl = URL.createObjectURL(file);
                    onUpdate(block.id, previewUrl);
                    
                    e.target.value = '';
                  }}
                  className="hidden"
                  accept="image/*"
                />
                <Button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById(`block-image-${block.id}`) as HTMLInputElement;
                    if (input) input.click();
                  }}
                >
                  업로드
                </Button>
              </div>
            </div>
            <Input
              placeholder="이미지 설명 (선택사항)"
              value={block.caption || ""}
              onChange={(e) => onUpdate(block.id, block.content, e.target.value)}
              className="w-full"
            />
          </div>
        )}
        
        {/* 유튜브, 비디오, GIF 블록 */}
        {(block.type === 'video' || block.type === 'youtube' || block.type === 'gif') && (
          <div className="mt-3 space-y-2">
            <Input
              placeholder={
                block.type === 'youtube'
                  ? "유튜브 영상 URL 또는 임베드 코드"
                  : `${block.type} URL`
              }
              value={block.content}
              onChange={(e) => onUpdate(block.id, e.target.value)}
              className="w-full"
            />
            <Input
              placeholder="설명 (선택사항)"
              value={block.caption || ""}
              onChange={(e) => onUpdate(block.id, block.content, e.target.value)}
              className="w-full"
            />
          </div>
        )}
        
        {/* 이미지 미리보기 */}
        {block.type === 'image' && block.content && (
          <div className="mt-3">
            <div className="relative w-full">
              <img
                src={block.content}
                alt={block.caption || "Preview"}
                className="max-h-56 max-w-full rounded object-contain mx-auto border"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=이미지+미리보기+실패';
                }}
              />
              {block.content.startsWith('blob:') && (
                <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs text-muted-foreground flex items-center">
                  <p>로컬 미리보기 - 저장 시 업로드 됨</p>
                </div>
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 rounded-full"
                onClick={() => onUpdate(block.id, "")}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
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
    
    // 파일 크기 제한 확인 (2MB = 2 * 1024 * 1024 bytes) 썸네일용
    if (type === 'thumbnail' && file.size > 2 * 1024 * 1024) {
      toast({
        title: "파일 크기 초과",
        description: "썸네일 이미지는 2MB 이하여야 합니다.",
        variant: "destructive",
      });
      e.target.value = '';
      return;
    }
    
    // 파일 크기 제한 확인 (100MB = 100 * 1024 * 1024 bytes) 다운로드 파일용
    if (type === 'download' && file.size > 100 * 1024 * 1024) {
      toast({
        title: "파일 크기 초과",
        description: "업로드 파일은 100MB 이하여야 합니다.",
        variant: "destructive",
      });
      e.target.value = '';
      return;
    }
    
    // 이미지 파일 유효성 검사 (썸네일)
    if (type === 'thumbnail' && !file.type.startsWith('image/')) {
      toast({
        title: "잘못된 파일 형식",
        description: "썸네일에는 이미지 파일만 업로드할 수 있습니다.",
        variant: "destructive",
      });
      e.target.value = '';
      return;
    }
    
    // FileInfo 객체 생성
    const fileInfo: FileInfo = {
      file,
      preview: type === 'thumbnail' ? URL.createObjectURL(file) : null,
      name: file.name,
      size: file.size,
      type: file.type,
      uploaded: false,
      progress: 0,
    };
    
    // 파일 타입에 따라 상태 업데이트
    if (type === 'download') {
      setDownloadFile(fileInfo);
      
      // 비동기로 파일 업로드 시작
      (async () => {
        try {
          const progressUpdater = (progress: number) => {
            setDownloadFile(prev => prev ? {...prev, progress} : null);
          };
          
          // 0%에서 60%까지 진행 표시 (가상)
          let progress = 0;
          const interval = setInterval(() => {
            progress += 5;
            if (progress <= 60) {
              progressUpdater(progress);
            } else {
              clearInterval(interval);
            }
          }, 200);
          
          // 실제 파일 업로드
          const url = await handleFileUpload(file, 'download');
          
          // 업로드 완료 후 URL을 폼에 설정
          if (url) {
            form.setValue('downloadUrl', url);
            clearInterval(interval);
            progressUpdater(100);
            
            setTimeout(() => {
              setDownloadFile(prev => prev ? {...prev, uploaded: true} : null);
            }, 500);
            
            toast({
              title: "파일 업로드 완료",
              description: "파일이 성공적으로 업로드되었습니다.",
            });
          } else {
            clearInterval(interval);
            setDownloadFile(null);
          }
        } catch (error: any) {
          toast({
            title: "파일 업로드 실패",
            description: error.message || "파일 업로드 중 오류가 발생했습니다.",
            variant: "destructive",
          });
          setDownloadFile(null);
        }
      })();
      
    } else {
      setThumbnailFile(fileInfo);
      
      // 썸네일 이미지 업로드
      (async () => {
        try {
          const progressUpdater = (progress: number) => {
            setThumbnailFile(prev => prev ? {...prev, progress} : null);
          };
          
          // 0%에서 60%까지 진행 표시 (가상)
          let progress = 0;
          const interval = setInterval(() => {
            progress += 10;
            if (progress <= 60) {
              progressUpdater(progress);
            } else {
              clearInterval(interval);
            }
          }, 100);
          
          // 실제 이미지 업로드
          const url = await handleFileUpload(file, 'thumbnail');
          
          // 업로드 완료 후 URL을 폼에 설정
          if (url) {
            // 썸네일 URL은 나중에 폼 제출 시 사용
            clearInterval(interval);
            progressUpdater(100);
            
            setTimeout(() => {
              setThumbnailFile(prev => prev ? {...prev, uploaded: true} : null);
            }, 500);
            
            // 자동으로 이미지 컨텐츠 블록 추가 (썸네일 이미지일 경우)
            const newBlock: ContentBlock = {
              id: uuidv4(),
              type: 'image',
              content: url,
              caption: '대표 이미지',
            };
            
            // 기존 대표 이미지 블록이 없으면 추가
            const hasMainImage = blocks.some(block => 
              block.type === 'image' && block.caption === '대표 이미지'
            );
            
            if (!hasMainImage) {
              setBlocks((prev) => [newBlock, ...prev]);
            }
            
            toast({
              title: "이미지 업로드 완료",
              description: "썸네일 이미지가 성공적으로 업로드되었습니다.",
            });
          } else {
            clearInterval(interval);
            setThumbnailFile(null);
          }
        } catch (error: any) {
          toast({
            title: "이미지 업로드 실패",
            description: error.message || "이미지 업로드 중 오류가 발생했습니다.",
            variant: "destructive",
          });
          setThumbnailFile(null);
        }
      })();
    }
    
    // Reset the input value so the same file can be selected again if needed
    e.target.value = '';
  }

  // 폼 제출 처리
  const mutation = useMutation({
    mutationFn: async (data: FormValues & { contentBlocks: ContentBlock[] }) => {
      // 먼저 파일들을 업로드
      let downloadUrl = data.downloadUrl || '';
      let thumbnailUrl = data.thumbnailUrl || '';
      
      // 다운로드 파일 업로드 (아직 업로드되지 않은 경우)
      if (downloadFile && downloadFile.file && !downloadFile.uploaded) {
        downloadUrl = await handleFileUpload(downloadFile.file, 'download');
      }
      
      // 썸네일 이미지 업로드 (아직 업로드되지 않은 경우)
      if (thumbnailFile && thumbnailFile.file && !thumbnailFile.uploaded) {
        thumbnailUrl = await handleFileUpload(thumbnailFile.file, 'thumbnail');
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
        thumbnailUrl,
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
            
            {/* 썸네일 업로드 영역 */}
            <div>
              <FormLabel>썸네일 이미지</FormLabel>
              <div className="border rounded-md p-2 bg-muted/20 mt-2 flex justify-center">
                {thumbnailFile ? (
                  <div className="relative w-full aspect-video flex items-center justify-center overflow-hidden rounded-md">
                    <img 
                      src={thumbnailFile.preview || ''} 
                      alt="Thumbnail preview" 
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        onClick={() => setThumbnailFile(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {thumbnailFile.progress > 0 && thumbnailFile.progress < 100 && (
                      <Progress value={thumbnailFile.progress} className="absolute bottom-0 left-0 right-0 h-1" />
                    )}
                  </div>
                ) : (
                  <div 
                    className="flex flex-col items-center justify-center p-4 cursor-pointer w-full aspect-video rounded-md border-2 border-dashed hover:bg-muted/30 transition-colors"
                    onClick={() => {
                      const fileInput = document.getElementById('thumbnailInput') as HTMLInputElement;
                      if (fileInput) fileInput.click();
                    }}
                  >
                    <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                    <div className="text-sm font-medium text-center">썸네일 이미지 추가</div>
                    <div className="text-xs text-muted-foreground text-center mt-1">
                      권장 비율: 16:9, 최대 2MB
                    </div>
                    <input
                      id="thumbnailInput"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e, 'thumbnail')}
                    />
                  </div>
                )}
              </div>
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

          {/* 파일 업로드 섹션 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <FormField
                control={form.control}
                name="downloadUrl"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel>파일 업로드</FormLabel>
                    <div className="flex flex-col space-y-2">
                      <div className="border rounded-md p-4 bg-muted/20">
                        {downloadFile ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <FileIcon className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm font-medium">{downloadFile.name}</span>
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
                            <div className="text-xs text-muted-foreground">
                              {(downloadFile.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                            {downloadFile.progress > 0 && downloadFile.progress < 100 && (
                              <Progress value={downloadFile.progress} className="h-1" />
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-4">
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <div className="text-sm font-medium mb-1">파일을 끌어다 놓거나 클릭하여 업로드</div>
                            <div className="text-xs text-muted-foreground">최대 100MB</div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              파일 선택
                            </Button>
                            <input 
                              ref={fileInputRef}
                              type="file" 
                              className="hidden" 
                              onChange={(e) => handleFileSelect(e, 'download')}
                            />
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        또는 직접 URL 입력:
                      </div>
                      <FormControl>
                        <Input
                          placeholder="파일 다운로드 URL (선택사항)"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                  <FormDescription>
                    오픈 소스 프로젝트의 저장소 URL을 입력하세요.
                  </FormDescription>
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
        <div className="flex items-center mb-4 border-b pb-2">
          <h2 className="text-lg font-medium">본문 작성</h2>
        </div>
        <div className="flex gap-1 mb-4 bg-muted/20 p-2 rounded-md flex-wrap">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9"
            onClick={() => addBlock('heading')}
          >
            <FileText className="h-4 w-4 mr-1" />
            제목
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9"
            onClick={() => addBlock('paragraph')}
          >
            <File className="h-4 w-4 mr-1" />
            텍스트
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9"
            onClick={() => addBlock('image')}
          >
            <ImageIcon className="h-4 w-4 mr-1" />
            이미지
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9"
            onClick={() => addBlock('youtube')}
          >
            <Youtube className="h-4 w-4 mr-1" />
            유튜브
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9"
            onClick={() => addBlock('code')}
          >
            <Code className="h-4 w-4 mr-1" />
            코드
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9"
            onClick={() => addBlock('list')}
          >
            <List className="h-4 w-4 mr-1" />
            목록
          </Button>
        </div>
        
        {blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md bg-muted/10">
            <File className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">콘텐츠 블록 없음</h3>
            <p className="text-sm text-muted-foreground text-center mb-4 max-w-md">
              위 버튼을 눌러 제목, 텍스트, 이미지, 동영상, 코드 등의 콘텐츠 블록을 추가하세요.
              풍부한 콘텐츠를 제공하면 자료의 품질이 높아집니다.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-2 max-w-md">
              <Button
                type="button"
                variant="outline"
                onClick={() => addBlock('heading')}
                className="flex items-center gap-1"
              >
                <FileText className="h-4 w-4" /> 제목
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => addBlock('paragraph')}
                className="flex items-center gap-1"
              >
                <File className="h-4 w-4" /> 텍스트
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => addBlock('image')}
                className="flex items-center gap-1"
              >
                <ImageIcon className="h-4 w-4" /> 이미지
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => addBlock('code')}
                className="flex items-center gap-1"
              >
                <Code className="h-4 w-4" /> 코드
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="bg-muted/20 px-3 py-2 rounded text-sm font-medium mb-2">
              <div className="flex items-center">
                <Grip className="h-4 w-4 mr-2 text-muted-foreground" />
                블록을 드래그하여 순서를 변경할 수 있습니다
              </div>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={blocks.map(b => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {blocks.map((block) => (
                    <SortableContentBlock
                      key={block.id}
                      block={block}
                      onUpdate={updateBlock}
                      onDelete={deleteBlock}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            
            <div className="mt-6 bg-muted/10 border border-dashed rounded-md p-4">
              <p className="text-sm text-center text-muted-foreground mb-3">
                다양한 종류의 콘텐츠를 추가해 보세요
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock('heading')}
                  className="flex items-center gap-1"
                >
                  <FileText className="h-4 w-4" /> 제목
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock('paragraph')}
                  className="flex items-center gap-1"
                >
                  <File className="h-4 w-4" /> 텍스트
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock('image')}
                  className="flex items-center gap-1"
                >
                  <ImageIcon className="h-4 w-4" /> 이미지
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock('youtube')}
                  className="flex items-center gap-1"
                >
                  <Youtube className="h-4 w-4" /> 유튜브
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock('code')}
                  className="flex items-center gap-1"
                >
                  <Code className="h-4 w-4" /> 코드
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock('list')}
                  className="flex items-center gap-1"
                >
                  <List className="h-4 w-4" /> 목록
                </Button>
              </div>
            </div>
          </div>
        )}
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