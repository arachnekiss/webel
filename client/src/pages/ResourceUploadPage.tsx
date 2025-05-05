import { useState, useRef, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import MediaPreview from "@/components/ui/MediaPreview";

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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

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
  ChevronLeft,
  Link2,
  Video,
  FolderOpen,
  Smile,
  CalendarIcon,
  FileIcon
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
  preview: string;
  progress?: number;
}

// 폼 유효성 검사 스키마 - 모든 필드를 선택 사항으로 변경하고 최소 문자수 제한 제거
const formSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  resourceType: z.string().default("hardware_design"),
  uploadDate: z.string().optional(),
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

  // 미디어 에디터 관련 상태
  const [urlInputActive, setUrlInputActive] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [currentEditor, setCurrentEditor] = useState<string | null>(null);
  const [uploadedMediaFiles, setUploadedMediaFiles] = useState<{[key: string]: FileWithPreview[]}>({});

  // 미디어 파일 입력 참조
  const mediaImageInputRef = useRef<HTMLInputElement>(null);
  const mediaGifInputRef = useRef<HTMLInputElement>(null);
  const mediaVideoInputRef = useRef<HTMLInputElement>(null);
  const mediaFileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  // 폼 초기화
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      resourceType: "hardware_design", // 기본값 설정
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
        "/api/resources/upload",
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
      
      // sourceSite 필드에 downloadUrl 값을 복사 (출처 사이트를 다운로드 URL로 통합)
      if (values.downloadUrl) {
        formData.append("sourceSite", String(values.downloadUrl));
      }

      // 파일 추가
      if (thumbnailFile) {
        formData.append("image", thumbnailFile);
      }

      galleryFiles.forEach((file, index) => {
        formData.append(`gallery_${index}`, file);
      });

      if (downloadFile) {
        formData.append("downloadFile", downloadFile);
      }

      await mutation.mutateAsync(formData);
    } catch (error) {
      console.error("폼 제출 오류:", error);
    }
  };

  // 미디어 첨부 도구 관련 함수들

  // 미디어 첨부 핸들러 함수들
  const handleMediaImageSelect = (fieldName: string) => {
    console.log("이미지 버튼 클릭: ", fieldName);
    setCurrentEditor(fieldName);
    if (mediaImageInputRef.current) {
      console.log("이미지 input 참조 성공");
      mediaImageInputRef.current.value = '';
      mediaImageInputRef.current.click();
    } else {
      console.error("이미지 input 참조 실패");
    }
  };
  
  // 이미지 클릭 핸들러 - 클릭한 이미지 편집/관리 (예: 크기 조정, 삭제, 캡션 추가 등)
  const handleImageClick = useCallback((imageSrc: string) => {
    console.log("이미지 클릭됨:", imageSrc);
    
    // 여기에 이미지 편집 모달 표시 등의 코드를 추가할 수 있습니다.
    toast({
      title: "이미지 선택됨",
      description: "이미지를 편집하는 기능은 곧 추가될 예정입니다.",
    });
  }, [toast]);
  
  // 이미지 위치 이동 핸들러 - 드래그 앤 드롭으로 이미지 순서 변경
  const handleImageMove = useCallback((
    draggedImageSrc: string, 
    targetImageSrc: string, 
    direction: 'before' | 'after'
  ) => {
    if (!currentEditor) return;
    
    console.log(`이미지 이동: ${draggedImageSrc} -> ${targetImageSrc} (${direction})`);
    
    // 현재 에디터 내용 가져오기
    const currentContent = form.getValues(currentEditor as any) || '';
    
    // 마크다운 이미지 형식(![]()) 찾기
    const regex = /!\[(.*?)\]\((.*?)\)/g;
    const matches: {alt: string, src: string, full: string, index: number}[] = [];
    
    let match;
    while ((match = regex.exec(currentContent)) !== null) {
      matches.push({
        full: match[0],
        alt: match[1],
        src: match[2],
        index: match.index
      });
    }
    
    // 드래그한 이미지와 타겟 이미지 찾기
    const draggedImage = matches.find(m => m.src === draggedImageSrc);
    const targetImage = matches.find(m => m.src === targetImageSrc);
    
    if (!draggedImage || !targetImage) {
      console.error("이미지를 찾을 수 없음");
      return;
    }
    
    // 원본 텍스트에서 드래그한 이미지 제거
    let newContent = currentContent.substring(0, draggedImage.index) + 
                     currentContent.substring(draggedImage.index + draggedImage.full.length);
    
    // 타겟 이미지 위치 업데이트 (draggedImage를 제거한 후 인덱스가 변경될 수 있음)
    const targetIndex = newContent.indexOf(targetImage.full);
    if (targetIndex === -1) {
      console.error("타겟 이미지 위치를 찾을 수 없음");
      return;
    }
    
    // 새로운 위치에 드래그한 이미지 삽입
    if (direction === 'before') {
      newContent = newContent.substring(0, targetIndex) + 
                  draggedImage.full + '\n\n' + 
                  newContent.substring(targetIndex);
    } else {
      const insertIndex = targetIndex + targetImage.full.length;
      newContent = newContent.substring(0, insertIndex) + 
                  '\n\n' + draggedImage.full + 
                  newContent.substring(insertIndex);
    }
    
    // 폼 업데이트
    form.setValue(currentEditor as any, newContent, { shouldValidate: true });
    
    toast({
      title: "이미지 위치 변경됨",
      description: "이미지 순서가 업데이트되었습니다.",
    });
  }, [currentEditor, form, toast]);

  const handleMediaGifSelect = (fieldName: string) => {
    console.log("GIF 버튼 클릭: ", fieldName);
    setCurrentEditor(fieldName);
    if (mediaGifInputRef.current) {
      console.log("GIF input 참조 성공");
      mediaGifInputRef.current.value = '';
      mediaGifInputRef.current.click();
    } else {
      console.error("GIF input 참조 실패");
    }
  };

  const handleMediaVideoSelect = (fieldName: string) => {
    console.log("비디오 버튼 클릭: ", fieldName);
    setCurrentEditor(fieldName);
    if (mediaVideoInputRef.current) {
      console.log("비디오 input 참조 성공");
      mediaVideoInputRef.current.value = '';
      mediaVideoInputRef.current.click();
    } else {
      console.error("비디오 input 참조 실패");
    }
  };

  const handleMediaFileSelect = (fieldName: string) => {
    console.log("파일 버튼 클릭: ", fieldName);
    setCurrentEditor(fieldName);
    if (mediaFileInputRef.current) {
      console.log("파일 input 참조 성공");
      mediaFileInputRef.current.value = '';
      mediaFileInputRef.current.click();
    } else {
      console.error("파일 input 참조 실패");
    }
  };

  const handleMediaUrlSelect = (fieldName: string) => {
    setCurrentEditor(fieldName);
    setUrlInputActive(true);
    setTimeout(() => urlInputRef.current?.focus(), 100);
  };
  
  // 미디어 버튼 렌더링 함수 - 모든 미디어 버튼 표시
  const renderMediaButtons = (fieldName: string) => (
    <div className="flex flex-wrap border-b p-2 gap-2 bg-muted/10">
      <Button 
        variant="outline" 
        size="sm" 
        type="button" 
        className="h-8"
        onClick={() => handleMediaImageSelect(fieldName)}
      >
        <ImageIcon className="h-4 w-4 mr-1" /> 이미지
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        type="button" 
        className="h-8"
        onClick={() => handleMediaGifSelect(fieldName)}
      >
        <Smile className="h-4 w-4 mr-1" /> GIF
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        type="button" 
        className="h-8"
        onClick={() => handleMediaVideoSelect(fieldName)}
      >
        <Video className="h-4 w-4 mr-1" /> 동영상
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        type="button" 
        className="h-8"
        onClick={() => handleMediaFileSelect(fieldName)}
      >
        <FolderOpen className="h-4 w-4 mr-1" /> 파일
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        type="button" 
        className="h-8"
        onClick={() => handleMediaUrlSelect(fieldName)}
      >
        <Link2 className="h-4 w-4 mr-1" /> URL
      </Button>
    </div>
  );

  // 미디어 파일 업로드 및 직접 에디터에 렌더링
  const handleMediaFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'gif' | 'video' | 'file') => {
    console.log("파일 업로드 이벤트:", type, e.target.files);
    const files = e.target.files;
    if (!files || files.length === 0 || !currentEditor) {
      console.error("파일 없음 또는 currentEditor 없음:", files, currentEditor);
      return;
    }

    const file = files[0];
    console.log("선택된 파일:", file.name, file.type, file.size);
    // 임시 URL 생성 (실제로는 서버에 업로드하고 URL을 받아야 함)
    const fileUrl = URL.createObjectURL(file);

    // 현재 에디터 텍스트 영역 가져오기
    console.log("현재 에디터:", currentEditor);
    const textAreaElement = document.querySelector(`textarea[name="${currentEditor}"]`) as HTMLTextAreaElement;
    if (!textAreaElement) {
      console.error("텍스트 영역 요소를 찾을 수 없음:", currentEditor);
      alert(`텍스트 영역을 찾을 수 없습니다: ${currentEditor}`);
      return;
    }

    // 캐럿 위치 가져오기
    const currentValue = form.getValues(currentEditor as any) || '';
    const selectionStart = textAreaElement.selectionStart || currentValue.length;
    const selectionEnd = textAreaElement.selectionEnd || currentValue.length;
    
    // 미디어 타입에 따라 다른 마크다운 콘텐츠 생성
    let markdownContent = '';
    
    switch (type) {
      case 'image':
      case 'gif':
        // 이미지 마크다운 생성 (실제 렌더링될 형태)
        markdownContent = `\n![${type === 'image' ? '이미지' : 'GIF'}](${fileUrl})\n`;
        break;
      case 'video':
        // 비디오 HTML 태그 생성
        markdownContent = `\n<video controls width="100%"><source src="${fileUrl}" type="${file.type}"></video>\n`;
        break;
      case 'file':
        // 파일 다운로드 링크 생성
        markdownContent = `\n[파일 다운로드: ${file.name}](${fileUrl})\n`;
        break;
    }
    
    // 마크다운을 커서 위치에 삽입
    const newValue = currentValue.substring(0, selectionStart) + markdownContent + currentValue.substring(selectionEnd);
    
    // 폼 값 업데이트 및 캐럿 위치 조정
    form.setValue(currentEditor as any, newValue, { shouldValidate: true });
    
    // 에디터에 포커스 복원 및 커서 위치 조정
    setTimeout(() => {
      if (textAreaElement) {
        textAreaElement.focus();
        const newCursorPosition = selectionStart + markdownContent.length;
        textAreaElement.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 10);
    
    // 파일 입력 초기화
    if (e.target) e.target.value = '';
    
    // 업로드된 미디어 파일 추적
    const fileWithPreview = file as FileWithPreview;
    fileWithPreview.preview = fileUrl;
    
    setUploadedMediaFiles(prev => {
      const fieldFiles = prev[currentEditor] || [];
      return {
        ...prev,
        [currentEditor]: [...fieldFiles, fileWithPreview]
      };
    });
    
    // 성공 토스트 표시
    toast({
      title: "미디어 추가 완료",
      description: `${type === 'image' ? '이미지' : type === 'gif' ? 'GIF' : type === 'video' ? '동영상' : '파일'}가 에디터에 삽입되었습니다.`,
    });
  };

  // URL 제출 핸들러 - URL 입력 시 텍스트 에디터에 삽입
  const handleUrlSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || !currentEditor) {
      setUrlInputActive(false);
      return;
    }

    // 텍스트 영역 엘리먼트 찾기
    const textareaElement = document.querySelector(`textarea[name="${currentEditor}"]`) as HTMLTextAreaElement;
    
    // YouTube URL 감지 및 처리
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = urlInput.match(youtubeRegex);

    let markdownContent = '';
    let mediaType = 'url';

    if (match && match[1]) {
      // YouTube 비디오 임베드
      const videoId = match[1];
      markdownContent = `\n<div class="youtube-embed">
      <iframe 
        width="100%" 
        height="315" 
        src="https://www.youtube.com/embed/${videoId}" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen
      ></iframe>
      </div>\n`;
      mediaType = 'youtube';
    } else {
      // 이미지 URL 감지
      const imageRegex = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
      if (imageRegex.test(urlInput)) {
        // 이미지 URL이면 마크다운 이미지 형식으로 추가
        markdownContent = `\n![이미지](${urlInput})\n`;
        mediaType = 'image';
        
        // 이미지를 미디어 파일 목록에 추가 (첨부된 미디어로 표시됨)
        const imageFile = new File([], "url-image.jpg") as FileWithPreview;
        imageFile.preview = urlInput;
        
        setUploadedMediaFiles(prev => {
          const fieldFiles = prev[currentEditor] || [];
          return {
            ...prev,
            [currentEditor]: [...fieldFiles, imageFile]
          };
        });
        
        // 성공 토스트 표시
        toast({
          title: "이미지 추가 완료",
          description: "이미지가 에디터에 삽입되었습니다.",
        });
      } else {
        try {
          // URL 정보 추출
          const domainMatch = urlInput.match(/^https?:\/\/(?:www\.)?([^\/]+)/i);
          const domain = domainMatch ? domainMatch[1] : urlInput;
          
          // 일반 URL - 카드 형태로 표시 (MediaPreview에서 처리됨)
          markdownContent = `\n${urlInput}\n`;
        } catch (e) {
          // URL 파싱 오류 시 기본 링크 형태로 추가
          markdownContent = `\n[${urlInput}](${urlInput})\n`;
        }
      }
    }

    // 현재 값과 선택 위치 가져오기
    const currentValue = form.getValues(currentEditor as any) || '';
    
    // 텍스트 영역이 포커스 상태이고 선택 범위가 있으면 커서 위치에 삽입
    if (textareaElement && document.activeElement === textareaElement) {
      const start = textareaElement.selectionStart || 0;
      const end = textareaElement.selectionEnd || 0;
      
      // 선택된 텍스트를 미디어로 대체하거나, 커서 위치에 미디어 삽입
      const newValue = currentValue.substring(0, start) + markdownContent + currentValue.substring(end);
      
      // 필드 값 업데이트
      form.setValue(currentEditor as any, newValue, { shouldValidate: true });
      
      // 커서 위치 업데이트
      setTimeout(() => {
        if (textareaElement) {
          const newPosition = start + markdownContent.length;
          textareaElement.focus();
          textareaElement.setSelectionRange(newPosition, newPosition);
        }
      }, 0);
    } else {
      // 텍스트 영역이 포커스되어 있지 않거나 선택 범위가 없는 경우 끝에 추가
      form.setValue(currentEditor as any, currentValue + markdownContent, { shouldValidate: true });
    }

    setUrlInput('');
    setUrlInputActive(false);
  }, [urlInput, currentEditor, form, toast, setUploadedMediaFiles]);

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
  
  // 첨부된 미디어 파일 요약 컴포넌트
  const AttachedMediaSummary = ({ fieldName }: { fieldName: string }) => {
    const files = uploadedMediaFiles[fieldName] || [];
    if (files.length === 0) return null;
    
    return (
      <div className="mt-2 border-t pt-2">
        <p className="text-sm text-muted-foreground mb-2">첨부된 미디어 ({files.length}개)</p>
        <div className="flex flex-wrap gap-2">
          {files.map((file, index) => {
            // 파일 유형 확인
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');
            
            return (
              <div key={index} className="relative group border rounded-md p-2 bg-muted/10 flex items-center space-x-2 text-xs">
                {isImage ? (
                  <ImageIcon className="h-4 w-4 text-blue-500" />
                ) : isVideo ? (
                  <Video className="h-4 w-4 text-red-500" />
                ) : (
                  <FileIcon className="h-4 w-4 text-gray-500" />
                )}
                <span className="truncate max-w-[120px]">{file.name}</span>
                <span className="text-muted-foreground">
                  {(file.size / 1024).toFixed(1)}KB
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 미디어 파일 입력 참조용 숨겨진 input 요소들
  const renderHiddenInputs = () => (
    <>
      <input
        ref={mediaImageInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={(e) => handleMediaFileUpload(e, 'image')}
      />
      <input
        ref={mediaGifInputRef}
        type="file"
        className="hidden"
        accept="image/gif"
        onChange={(e) => handleMediaFileUpload(e, 'gif')}
      />
      <input
        ref={mediaVideoInputRef}
        type="file"
        className="hidden"
        accept="video/*"
        onChange={(e) => handleMediaFileUpload(e, 'video')}
      />
      <input
        ref={mediaFileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleMediaFileUpload(e, 'file')}
      />
    </>
  );

  // 리치 미디어 에디터 컴포넌트
  const RichMediaEditor = ({ 
    value, 
    onChange, 
    placeholder,
    name,
    onImageClick,
    onImageMove,
    editable = false
  }: { 
    value: string; 
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void | Promise<void>;
    placeholder: string;
    name: string;
    onImageClick?: (src: string) => void;
    onImageMove?: (draggedImageSrc: string, targetImageSrc: string, direction: 'before' | 'after') => void;
    editable?: boolean;
  }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // 마크다운 이미지 링크를 HTML 이미지로 변환
    const processContent = useCallback((text: string): string => {
      if (!text) return "";
      
      // 마크다운 이미지 변환 - ![]() 
      let processedText = text.replace(
        /!\[(.*?)\]\((.*?)\)/g, 
        '<img src="$2" alt="$1" class="editor-img" draggable="true" />'
      );
      
      // URL 처리 (단독 라인에 있는 경우만)
      const urlPattern = /^(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*))$/gm;
      processedText = processedText.replace(
        urlPattern,
        (match) => {
          // 이미지 URL인지 확인
          if (/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i.test(match)) {
            return `<img src="${match}" alt="이미지" class="editor-img" draggable="true" />`;
          }
          
          // YouTube URL인지 확인
          const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
          const youtubeMatch = match.match(youtubeRegex);
          
          if (youtubeMatch && youtubeMatch[1]) {
            return `<div class="media-card youtube-embed">
              <iframe 
                width="100%" 
                height="200"
                src="https://www.youtube.com/embed/${youtubeMatch[1]}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
              ></iframe>
              <div class="p-2 text-sm text-muted-foreground">${match}</div>
            </div>`;
          }
          
          // 일반 URL
          return `<div class="media-card url-card">
            <div class="p-2 flex items-center">
              <div class="mr-2">🔗</div>
              <div class="flex-1 overflow-hidden">
                <div class="font-medium">${new URL(match).hostname.replace('www.', '')}</div>
                <div class="text-sm text-muted-foreground truncate">${match}</div>
              </div>
            </div>
          </div>`;
        }
      );
      
      return processedText;
    }, []);
    
    // 텍스트 영역 크기 자동 조절 및 내용 설정
    useEffect(() => {
      const textarea = textareaRef.current;
      const overlay = overlayRef.current;
      if (!textarea || !overlay) return;
      
      // 오버레이에 처리된 내용 표시
      overlay.innerHTML = processContent(value || "");
      
      // 이미지 클릭 및 드래그 이벤트 설정
      overlay.querySelectorAll('img').forEach(img => {
        // 편집 가능한 경우만 이벤트 추가
        if (editable) {
          // 클릭 이벤트 설정
          img.addEventListener('click', () => {
            if (onImageClick) {
              onImageClick(img.getAttribute('src') || "");
            }
          });
          
          // 드래그 이벤트 설정
          img.addEventListener('dragstart', (e) => {
            if (e.dataTransfer) {
              // 드래그 중인 이미지 표시
              img.classList.add('dragging-media');
              
              // 이미지 URL을 드래그 데이터로 전달
              const src = img.getAttribute('src') || "";
              e.dataTransfer.setData('text/plain', src);
              
              // 드래그 이미지 사용자 정의 (이미지의 작은 버전)
              const dragImage = new Image();
              dragImage.src = src;
              dragImage.style.opacity = '0.7';
              dragImage.style.width = '100px';
              dragImage.style.height = 'auto';
              dragImage.style.position = 'absolute';
              dragImage.style.left = '-9999px';
              dragImage.style.top = '-9999px';
              
              document.body.appendChild(dragImage);
              e.dataTransfer.setDragImage(dragImage, 50, 30);
              
              // 1ms 후 드래그 이미지 제거
              setTimeout(() => {
                document.body.removeChild(dragImage);
              }, 1);
            }
          });
          
          img.addEventListener('dragend', (e) => {
            img.classList.remove('dragging-media');
          });
        }
      });
      
      // 이미지 드래그 앤 드롭 영역 설정 (컨테이너에 적용)
      if (editable && onImageMove) {
        // 드래그 오버 이벤트 (시각적 피드백)
        overlay.addEventListener('dragover', (e) => {
          e.preventDefault();
          
          // 드롭 위치에 더 다양한 시각적 피드백을 제공할 수 있음
          const target = e.target as HTMLElement;
          if (target.tagName === 'IMG') {
            const rect = target.getBoundingClientRect();
            const middle = rect.top + rect.height / 2;
            
            // 마우스 위치에 따라 이미지 위/아래 표시
            target.classList.remove('drop-before', 'drop-after');
            if (e.clientY < middle) {
              target.classList.add('drop-before');
            } else {
              target.classList.add('drop-after');
            }
          }
        });
        
        // 드래그 리브 이벤트 (시각적 피드백 제거)
        overlay.addEventListener('dragleave', (e) => {
          const target = e.target as HTMLElement;
          if (target.tagName === 'IMG') {
            target.classList.remove('drop-before', 'drop-after');
          }
        });
        
        // 드롭 이벤트
        overlay.addEventListener('drop', (e) => {
          e.preventDefault();
          
          // 드롭된 텍스트 데이터 (이미지 URL) 가져오기
          const draggedImageSrc = e.dataTransfer?.getData('text/plain');
          if (!draggedImageSrc) return;
          
          // 드롭 대상 요소 찾기
          const target = e.target as HTMLElement;
          if (target.tagName === 'IMG') {
            const targetImageSrc = target.getAttribute('src') || "";
            
            // 드롭 방향 계산 (이미지 위/아래)
            const rect = target.getBoundingClientRect();
            const middle = rect.top + rect.height / 2;
            const direction = e.clientY < middle ? 'before' : 'after';
            
            // 콜백 호출
            console.log(`이미지 이동: ${draggedImageSrc} -> ${targetImageSrc} (${direction})`);
            onImageMove(draggedImageSrc, targetImageSrc, direction);
            
            // 시각적 피드백 제거
            target.classList.remove('drop-before', 'drop-after');
          }
        });
      }
      
      // 텍스트 영역 스크롤 이벤트 추가 (스크롤 동기화)
      const syncScroll = () => {
        if (overlay) {
          overlay.scrollTop = textarea.scrollTop;
        }
      };
      
      textarea.addEventListener('scroll', syncScroll);
      
      // 텍스트 영역 크기 자동 조절
      const adjustHeight = () => {
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.max(textarea.scrollHeight, 200)}px`;
      };
      
      adjustHeight();
      textarea.addEventListener('input', adjustHeight);
      
      // 입력할 때마다 스크롤 동기화
      textarea.addEventListener('input', syncScroll);
      
      return () => {
        textarea.removeEventListener('input', adjustHeight);
        textarea.removeEventListener('scroll', syncScroll);
        textarea.removeEventListener('input', syncScroll);
      };
    }, [value, processContent, onImageClick, onImageMove, editable]);
    
    return (
      <div className="rich-editor-content border rounded-md" ref={containerRef}>
        <textarea
          ref={textareaRef}
          name={name}
          className="resize-y border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        <div 
          ref={overlayRef} 
          className="rich-editor-overlay media-preview"
          data-testid={`${name}-overlay`}
        />
      </div>
    );
  };
  
  // 간단한 텍스트 영역 컴포넌트 (기존 호환성 유지)
  const AutoResizeTextarea = ({ 
    value, 
    onChange, 
    placeholder,
    name 
  }: { 
    value: string; 
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void | Promise<void>;
    placeholder: string;
    name: string;
  }) => {
    // 리치 미디어 에디터로 전환
    return (
      <RichMediaEditor 
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        name={name}
        editable={true}
        onImageClick={(src) => {
          toast({
            title: "이미지 선택됨",
            description: "이미지를 편집하는 기능은 곧 추가될 예정입니다.",
          });
        }}
      />
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        {/* 미디어 첨부용 숨겨진 input 요소들 */}
        {renderHiddenInputs()}
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
                        <FormLabel>리소스 제목 (선택)</FormLabel>
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
                        <FormLabel>카테고리</FormLabel>
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

                {/* 세부 카테고리 및 날짜 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="uploadDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>업로드 일자</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="text" 
                              placeholder="YYYY-MM-DD" 
                              {...field}
                              value={field.value || new Date().toISOString().split('T')[0]}
                              onChange={(e) => field.onChange(e.target.value)}
                              pattern="\d{4}-\d{2}-\d{2}"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8"
                                    type="button"
                                  >
                                    <CalendarIcon className="h-4 w-4" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                  <Calendar
                                    mode="single"
                                    selected={field.value ? new Date(field.value) : new Date()}
                                    onSelect={(date) => {
                                      if (date) {
                                        const dateStr = date.toISOString().split('T')[0];
                                        field.onChange(dateStr);
                                      }
                                    }}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          리소스가 생성된 날짜를 입력하거나 달력에서 선택해주세요. 형식: YYYY-MM-DD
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
                            <span className="inline-flex items-center px-3 bg-muted text-muted-foreground rounded-l-md border border-r-0 border-input">
                              <Link2 className="h-4 w-4" />
                            </span>
                            <Input
                              className="rounded-l-none"
                              placeholder="다운로드 URL (있는 경우)"
                              {...field}
                              value={field.value || ""}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          리소스를 다운로드할 수 있는 외부 URL이 있는 경우 입력해주세요.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 설명 및 태그 */}
                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>설명</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="리소스에 대한 간략한 설명을 입력하세요. 이 내용은 검색 결과와 미리보기에 표시됩니다."
                            className="min-h-[120px] resize-y"
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
                              placeholder="태그를 쉼표로 구분하여 입력하세요 (예: 아두이노, 전자공학, IoT)"
                              {...field}
                              value={field.value || ""}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          태그는 쉼표(,)로 구분하여 여러 개 입력할 수 있습니다. 검색과 필터링에 활용됩니다.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* 이미지 갤러리 탭 */}
              <TabsContent value="images" className="space-y-6 mt-2">
                <Alert className="mb-6">
                  <ImageIcon className="h-4 w-4" />
                  <AlertTitle>이미지 업로드</AlertTitle>
                  <AlertDescription>
                    리소스를 시각적으로 표현할 수 있는 이미지를 업로드하세요. 대표 이미지 1개와 추가 이미지를 여러 장 첨부할 수 있습니다.
                  </AlertDescription>
                </Alert>

                {/* 대표 이미지 업로드 */}
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">대표 이미지</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          리소스의 대표 이미지로 사용됩니다. 16:9 비율의 고품질 이미지를 권장합니다.
                        </p>

                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          ref={fileInputRef}
                          onChange={(e) => handleFileSelect(e, 'thumbnail')}
                        />

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full"
                        >
                          <ImageIcon className="h-5 w-5 mr-2" />
                          대표 이미지 업로드
                        </Button>
                      </div>

                      <div>
                        {thumbnailFile ? (
                          <div className="relative group">
                            <div className="overflow-hidden border rounded-md aspect-video bg-muted/20">
                              <img src={thumbnailFile.preview} alt="대표 이미지 미리보기" className="object-cover w-full h-full" />
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
                            <p className="text-xs text-muted-foreground mt-1 text-center">
                              {thumbnailFile.name} ({Math.round(thumbnailFile.size / 1024)} KB)
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center border rounded-md aspect-video bg-muted/20 text-muted-foreground">
                            <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
                            <p className="text-sm">이미지 미리보기</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 갤러리 이미지 업로드 */}
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">추가 이미지 갤러리</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        추가 이미지를 업로드하여 갤러리를 구성할 수 있습니다. 최대 5장까지 업로드 가능합니다.
                      </p>

                      <div className="flex flex-wrap gap-4 mb-4">
                        {galleryFiles.map((file, index) => (
                          <FilePreviewCard
                            key={index}
                            file={file}
                            onDelete={() => removeGalleryFile(index)}
                          />
                        ))}

                        {galleryFiles.length < 5 && (
                          <div className="border border-dashed rounded-md aspect-video flex items-center justify-center cursor-pointer hover:bg-muted/20 transition-colors duration-200"
                               style={{ width: '200px' }}
                               onClick={() => {
                                 if (fileInputRef.current) {
                                   fileInputRef.current.value = '';
                                   fileInputRef.current.click();
                                 }
                               }}>
                            <div className="flex flex-col items-center text-muted-foreground">
                              <Plus className="h-8 w-8 mb-2" />
                              <span className="text-sm">이미지 추가</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                            fileInputRef.current.click();
                          }
                        }}
                        disabled={galleryFiles.length >= 5}
                      >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        갤러리 이미지 추가 ({galleryFiles.length}/5)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 상세 정보 탭 */}
              <TabsContent value="details" className="space-y-6 mt-2">
                <Alert className="mb-6">
                  <Info className="h-4 w-4" />
                  <AlertTitle>리소스 상세 정보</AlertTitle>
                  <AlertDescription>
                    선택한 카테고리에 따라 필요한 상세 정보를 입력해주세요. 필요한 재료, 조립 방법, 사용법 등을 자세히
                    설명할수록 사용자들에게 도움이 됩니다.
                  </AlertDescription>
                </Alert>

                {form.watch('resourceType') === 'hardware_design' && (
                  <>
                    <FormField
                      control={form.control}
                      name="materials"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>필요 재료</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="하드웨어 제작에 필요한 부품, 도구 등을 나열해주세요."
                              className="min-h-[150px] resize-y"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            필요한 재료와 부품을 목록 형태로 작성해주세요. 가능하면 구매처 정보도 포함하면 좋습니다.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="assemblyInstructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>조립 방법</FormLabel>
                          <FormControl>
                            <div className="border rounded-md">
                              {renderMediaButtons("assemblyInstructions")}
                              {urlInputActive && currentEditor === "assemblyInstructions" && (
                                <div className="p-2 border-b bg-muted/5">
                                  <div className="flex gap-2">
                                    <Input
                                      ref={urlInputRef}
                                      value={urlInput}
                                      onChange={(e) => setUrlInput(e.target.value)}
                                      placeholder="URL을 입력하세요 (YouTube 링크도 지원됩니다)"
                                      className="flex-1"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          handleUrlSubmit(e);
                                        }
                                      }}
                                    />
                                    <Button 
                                      type="button" 
                                      size="sm"
                                      onClick={handleUrlSubmit}
                                    >
                                      추가
                                    </Button>
                                    <Button 
                                      type="button" 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={() => {
                                        setUrlInputActive(false);
                                        setUrlInput("");
                                      }}
                                    >
                                      취소
                                    </Button>
                                  </div>
                                </div>
                              )}
                              <div className="flex flex-col relative">
                                <AutoResizeTextarea
                                  name="assemblyInstructions"
                                  placeholder="단계별 조립 방법을 상세히 설명해주세요. 이미지 버튼을 클릭하여 이미지를 첨부할 수 있습니다."
                                  value={field.value || ""}
                                  onChange={async (e) => {
                                    field.onChange(e.target.value);
                                  }}
                                />
                                <div className="rich-editor-content">
                                  <div className="rich-editor-overlay" 
                                       dangerouslySetInnerHTML={{ 
                                          __html: field.value?.replace(
                                            /!\[(.*?)\]\((.*?)\)/g, 
                                            '<img src="$2" alt="$1" class="editor-img" draggable="true" />'
                                          ) || "" 
                                       }} 
                                  />
                                </div>
                                <AttachedMediaSummary fieldName="assemblyInstructions" />
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription>
                            조립에 필요한 단계와 방법을 순서대로 설명해주세요. 미디어 요소를 추가하여 더 명확하게 설명할 수 있습니다.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="howToUse"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>사용법</FormLabel>
                          <FormControl>
                            <div className="border rounded-md">
                              {renderMediaButtons("howToUse")}
                              {urlInputActive && currentEditor === "howToUse" && (
                                <div className="p-2 border-b bg-muted/5">
                                  <div className="flex gap-2">
                                    <Input
                                      ref={urlInputRef}
                                      value={urlInput}
                                      onChange={(e) => setUrlInput(e.target.value)}
                                      placeholder="URL을 입력하세요 (YouTube 링크도 지원됩니다)"
                                      className="flex-1"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          handleUrlSubmit(e);
                                        }
                                      }}
                                    />
                                    <Button 
                                      type="button" 
                                      size="sm"
                                      onClick={handleUrlSubmit}
                                    >
                                      추가
                                    </Button>
                                    <Button 
                                      type="button" 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={() => {
                                        setUrlInputActive(false);
                                        setUrlInput("");
                                      }}
                                    >
                                      취소
                                    </Button>
                                  </div>
                                </div>
                              )}
                              <div className="flex flex-col relative">
                                <AutoResizeTextarea
                                  name="howToUse"
                                  placeholder="하드웨어 사용 방법과 주의사항을 설명해주세요."
                                  value={field.value || ""}
                                  onChange={async (e) => {
                                    field.onChange(e.target.value);
                                  }}
                                />
                                <div className="rich-editor-content">
                                  <div className="rich-editor-overlay" 
                                       dangerouslySetInnerHTML={{ 
                                          __html: field.value?.replace(
                                            /!\[(.*?)\]\((.*?)\)/g, 
                                            '<img src="$2" alt="$1" class="editor-img" draggable="true" />'
                                          ) || "" 
                                       }} 
                                  />
                                </div>
                                <AttachedMediaSummary fieldName="howToUse" />
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription>
                            하드웨어 제품의 사용법, 주의사항, 팁 등을 상세히 설명해주세요. 미디어 요소를 추가하여 더 명확하게 설명할 수 있습니다.
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
                          <div className="border rounded-md">
                            {renderMediaButtons("howToUse")}
                            {urlInputActive && currentEditor === "howToUse" && (
                              <div className="p-2 border-b bg-muted/5">
                                <div className="flex gap-2">
                                  <Input
                                    ref={urlInputRef}
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    placeholder="URL을 입력하세요 (YouTube 링크도 지원됩니다)"
                                    className="flex-1"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleUrlSubmit(e);
                                      }
                                    }}
                                  />
                                  <Button 
                                    type="button" 
                                    size="sm"
                                    onClick={handleUrlSubmit}
                                  >
                                    추가
                                  </Button>
                                  <Button 
                                    type="button" 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => {
                                      setUrlInputActive(false);
                                      setUrlInput("");
                                    }}
                                  >
                                    취소
                                  </Button>
                                </div>
                              </div>
                            )}
                            <div className="flex flex-col relative">
                              <AutoResizeTextarea
                                name="howToUse"
                                placeholder="설치 방법과 사용법을 설명해주세요."
                                value={field.value || ""}
                                onChange={async (e) => {
                                  field.onChange(e.target.value);
                                }}
                              />
                              <div className="rich-editor-content">
                                <div className="rich-editor-overlay" 
                                     dangerouslySetInnerHTML={{ 
                                        __html: field.value?.replace(
                                          /!\[(.*?)\]\((.*?)\)/g, 
                                          '<img src="$2" alt="$1" class="editor-img" draggable="true" />'
                                        ) || "" 
                                     }} 
                                />
                              </div>
                              <AttachedMediaSummary fieldName="howToUse" />
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          소프트웨어 설치 및 사용 방법을 단계별로 설명해주세요. 코드 예제도 포함하면 좋습니다. 미디어 요소를 추가하여 더 명확하게 설명할 수 있습니다.
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

                    <FormField
                      control={form.control}
                      name="assemblyInstructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>조립 방법</FormLabel>
                          <FormControl>
                            <div className="border rounded-md">
                              {renderMediaButtons("assemblyInstructions")}
                              {urlInputActive && currentEditor === "assemblyInstructions" && (
                                <div className="p-2 border-b bg-muted/5">
                                  <div className="flex gap-2">
                                    <Input
                                      ref={urlInputRef}
                                      value={urlInput}
                                      onChange={(e) => setUrlInput(e.target.value)}
                                      placeholder="URL을 입력하세요 (YouTube 링크도 지원됩니다)"
                                      className="flex-1"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          handleUrlSubmit(e);
                                        }
                                      }}
                                    />
                                    <Button 
                                      type="button" 
                                      size="sm"
                                      onClick={handleUrlSubmit}
                                    >
                                      추가
                                    </Button>
                                    <Button 
                                      type="button" 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={() => {
                                        setUrlInputActive(false);
                                        setUrlInput("");
                                      }}
                                    >
                                      취소
                                    </Button>
                                  </div>
                                </div>
                              )}
                              <div className="flex flex-col relative">
                                <AutoResizeTextarea
                                  name="assemblyInstructions"
                                  placeholder="3D 모델의 조립 방법과 단계를 설명해주세요."
                                  value={field.value || ""}
                                  onChange={async (e) => {
                                    field.onChange(e.target.value);
                                  }}
                                />
                                <div className="rich-editor-content">
                                  <div className="rich-editor-overlay" 
                                       dangerouslySetInnerHTML={{ 
                                          __html: field.value?.replace(
                                            /!\[(.*?)\]\((.*?)\)/g, 
                                            '<img src="$2" alt="$1" class="editor-img" draggable="true" />'
                                          ) || "" 
                                       }} 
                                  />
                                </div>
                                <AttachedMediaSummary fieldName="assemblyInstructions" />
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription>
                            모델의 조립 과정과 방법을 순서대로 설명해주세요. 미디어 요소를 추가하여 더 명확하게 설명할 수 있습니다.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="howToUse"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>사용법</FormLabel>
                          <FormControl>
                            <div className="border rounded-md">
                              {renderMediaButtons("howToUse")}
                              {urlInputActive && currentEditor === "howToUse" && (
                                <div className="p-2 border-b bg-muted/5">
                                  <div className="flex gap-2">
                                    <Input
                                      ref={urlInputRef}
                                      value={urlInput}
                                      onChange={(e) => setUrlInput(e.target.value)}
                                      placeholder="URL을 입력하세요 (YouTube 링크도 지원됩니다)"
                                      className="flex-1"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          handleUrlSubmit(e);
                                        }
                                      }}
                                    />
                                    <Button 
                                      type="button" 
                                      size="sm"
                                      onClick={handleUrlSubmit}
                                    >
                                      추가
                                    </Button>
                                    <Button 
                                      type="button" 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={() => {
                                        setUrlInputActive(false);
                                        setUrlInput("");
                                      }}
                                    >
                                      취소
                                    </Button>
                                  </div>
                                </div>
                              )}
                              <div className="flex flex-col relative">
                                <AutoResizeTextarea
                                  name="howToUse"
                                  placeholder="3D 모델 프린팅 설정과 사용 방법을 설명해주세요."
                                  value={field.value || ""}
                                  onChange={async (e) => {
                                    field.onChange(e.target.value);
                                  }}
                                />
                                <div className="rich-editor-content">
                                  <div className="rich-editor-overlay" 
                                       dangerouslySetInnerHTML={{ 
                                          __html: field.value?.replace(
                                            /!\[(.*?)\]\((.*?)\)/g, 
                                            '<img src="$2" alt="$1" class="editor-img" draggable="true" />'
                                          ) || "" 
                                       }} 
                                  />
                                </div>
                                <AttachedMediaSummary fieldName="howToUse" />
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription>
                            3D 모델의 프린팅 설정, 후처리 방법, 사용 시 주의사항 등을 설명해주세요.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {(form.watch('resourceType') === 'ai_model' || form.watch('resourceType') === 'free_content' || form.watch('resourceType') === 'flash_game') && (
                  <FormField
                    control={form.control}
                    name="howToUse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>사용 방법</FormLabel>
                        <FormControl>
                          <div className="border rounded-md">
                            {renderMediaButtons("howToUse")}
                            {urlInputActive && currentEditor === "howToUse" && (
                              <div className="p-2 border-b bg-muted/5">
                                <div className="flex gap-2">
                                  <Input
                                    ref={urlInputRef}
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    placeholder="URL을 입력하세요 (YouTube 링크도 지원됩니다)"
                                    className="flex-1"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleUrlSubmit(e);
                                      }
                                    }}
                                  />
                                  <Button 
                                    type="button" 
                                    size="sm"
                                    onClick={handleUrlSubmit}
                                  >
                                    추가
                                  </Button>
                                  <Button 
                                    type="button" 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => {
                                      setUrlInputActive(false);
                                      setUrlInput("");
                                    }}
                                  >
                                    취소
                                  </Button>
                                </div>
                              </div>
                            )}
                            <div className="flex flex-col relative">
                              <AutoResizeTextarea
                                name="howToUse"
                                placeholder="사용 방법과 특징을 설명해주세요."
                                value={field.value || ""}
                                onChange={async (e) => {
                                  field.onChange(e.target.value);
                                }}
                              />
                              <div className="rich-editor-content">
                                <div className="rich-editor-overlay" 
                                     dangerouslySetInnerHTML={{ 
                                        __html: field.value?.replace(
                                          /!\[(.*?)\]\((.*?)\)/g, 
                                          '<img src="$2" alt="$1" class="editor-img" draggable="true" />'
                                        ) || "" 
                                     }} 
                                />
                              </div>
                              <AttachedMediaSummary fieldName="howToUse" />
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          {form.watch('resourceType') === 'ai_model' 
                            ? "AI 모델의 사용 방법, 요구 사항, 성능 지표 등을 설명해주세요."
                            : form.watch('resourceType') === 'flash_game'
                              ? "게임 조작 방법, 목표, 팁 등을 설명해주세요."
                              : "콘텐츠의 사용 방법, 라이센스 정보, 출처 등을 명시해주세요."
                          }
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </TabsContent>

              {/* 파일 업로드 탭 */}
              <TabsContent value="files" className="space-y-6 mt-2">
                <Alert className="mb-6">
                  <UploadCloud className="h-4 w-4" />
                  <AlertTitle>파일 업로드</AlertTitle>
                  <AlertDescription>
                    리소스 다운로드 파일을 업로드하세요. ZIP, PDF, STL 등 다양한 파일 형식을 지원합니다.
                  </AlertDescription>
                </Alert>

                {/* 다운로드 파일 업로드 */}
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">다운로드 파일</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          사용자가 다운로드할 수 있는 파일을 업로드하세요. CAD 파일, 소스 코드, 3D 모델 등 리소스 유형에 맞는 파일을 제공해주세요.
                        </p>

                        <input 
                          type="file" 
                          className="hidden" 
                          ref={fileInputRef}
                          onChange={(e) => handleFileSelect(e, 'download')}
                        />

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full"
                        >
                          <UploadCloud className="h-5 w-5 mr-2" />
                          다운로드 파일 업로드
                        </Button>
                      </div>

                      <div>
                        {downloadFile ? (
                          <div className="relative group p-4 border rounded-md bg-muted/10">
                            <div className="flex items-center">
                              <FileIcon className="h-10 w-10 mr-3 text-primary" />
                              <div>
                                <p className="font-medium">{downloadFile.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {Math.round(downloadFile.size / 1024)} KB • {downloadFile.type || '알 수 없는 파일 형식'}
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => setDownloadFile(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center border rounded-md h-32 bg-muted/20 text-muted-foreground">
                            <FileIcon className="h-10 w-10 mb-2 opacity-50" />
                            <p className="text-sm">파일 미리보기</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 업로드 진행 상황 */}
                {mutation.isPending && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-2">업로드 진행 상황</h3>
                    <ProgressStatus />
                  </div>
                )}
              </TabsContent>
            </form>
          </Form>
        </Tabs>
      </div>
    </div>
  );
}