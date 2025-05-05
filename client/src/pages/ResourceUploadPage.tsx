import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

// 멀티미디어 미리보기 컴포넌트
interface MediaPreviewProps {
  content: string;
}

const MediaPreview = ({ content }: MediaPreviewProps) => {
  if (!content.trim()) return null;

  const contentRef = useRef<HTMLDivElement>(null);
  
  // 마크다운 이미지 패턴 감지 (![alt](url) 형식)
  const markdownImageRegex = /!\[(.*?)\]\((.*?)\)/g;
  
  // YouTube 링크 추출하여 임베드로 변환
  const extractYouTubeEmbeds = (text: string) => {
    // YouTube URL 패턴(일반 링크, 공유 링크, 모바일 링크 등)
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
    const matches = Array.from(text.matchAll(youtubeRegex));
    
    if (matches.length === 0) return [];
    
    return matches.map(match => {
      const videoId = match[1];
      const originalUrl = match[0];
      const embedCode = `
        <div class="youtube-embed my-3">
          <div class="aspect-video rounded-lg overflow-hidden shadow-md">
            <iframe 
              width="100%" 
              height="100%" 
              src="https://www.youtube.com/embed/${videoId}" 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen
            ></iframe>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            <a href="${originalUrl}" target="_blank" rel="noopener noreferrer">${originalUrl}</a>
          </div>
        </div>
      `;
      return { originalUrl, embedCode };
    });
  };

  // 이미지 URL 추출 (일반 URL과 마크다운 형식 모두 처리)
  const extractImages = (text: string) => {
    // 일반 이미지 URL 패턴 (jpg, jpeg, png, gif, webp)
    const imageRegex = /https?:\/\/\S+\.(jpg|jpeg|png|gif|webp)(\?\S+)?/gi;
    const matches = Array.from(text.matchAll(imageRegex));
    
    // 마크다운 이미지 패턴 매칭
    const markdownMatches = Array.from(text.matchAll(markdownImageRegex));
    
    // 마크다운 이미지 태그를 변환
    const markdownImages = markdownMatches.map(match => {
      const alt = match[1] || '이미지';
      const url = match[2];
      return {
        originalUrl: url,
        embedCode: `
          <div class="image-preview my-3">
            <img 
              src="${url}" 
              alt="${alt}" 
              class="max-w-full rounded-lg shadow-sm"
            />
          </div>
        `
      };
    });
    
    // 일반 URL 이미지 태그로 변환
    const urlImages = matches.map(match => {
      const imageUrl = match[0];
      // 마크다운 이미지 태그 안에 포함된 URL은 제외 (중복 방지)
      if (markdownMatches.some(mdMatch => mdMatch[2] === imageUrl)) {
        return null;
      }
      
      return {
        originalUrl: imageUrl,
        embedCode: `
          <div class="image-preview my-3">
            <img 
              src="${imageUrl}" 
              alt="이미지" 
              class="max-w-full rounded-lg shadow-sm"
            />
            <div class="text-xs text-gray-500 mt-1">
              <a href="${imageUrl}" target="_blank" rel="noopener noreferrer">${imageUrl}</a>
            </div>
          </div>
        `
      };
    }).filter(item => item !== null);
    
    return [...markdownImages, ...urlImages];
  };

  // 비디오 태그 감지
  const extractVideos = (text: string) => {
    const videoRegex = /<video[^>]*>(.*?)<\/video>/gs;
    const matches = Array.from(text.matchAll(videoRegex));
    
    if (matches.length === 0) return [];
    
    return matches.map(match => {
      const videoTag = match[0];
      return {
        originalUrl: "", // 원본 URL은 없음
        embedCode: videoTag // 이미 HTML 태그이므로 그대로 사용
      };
    });
  };

  // 일반 URL 추출하여 카드로 변환
  const extractUrlCards = (text: string) => {
    // URL 패턴 - 이미지와 YouTube URL 제외
    const urlRegex = /https?:\/\/(?!.*\.(jpg|jpeg|png|gif|webp)(?:\?\S+)?$)(?!(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/))[^\s]+/gi;
    const matches = Array.from(text.matchAll(urlRegex));
    
    if (matches.length === 0) return [];
    
    return matches.map(match => {
      const url = match[0];
      // 마크다운 이미지 태그 내부의 URL은 제외
      if (text.match(markdownImageRegex)?.some(imgMatch => imgMatch.includes(url))) {
        return null;
      }
      
      const domain = new URL(url).hostname.replace('www.', '');
      const embedCode = `
        <div class="url-card my-3">
          <div class="url-preview p-3 border rounded-lg shadow-sm bg-gray-50">
            <div class="flex items-center">
              <div class="url-icon mr-3 text-xl">🔗</div>
              <div class="url-content overflow-hidden">
                <div class="url-title font-medium text-gray-900 truncate">${domain}</div>
                <div class="url-link text-sm text-blue-600 truncate">
                  <a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      return { originalUrl: url, embedCode };
    }).filter(item => item !== null);
  };

  // 모든 미디어 요소 추출 및 변환
  const youtubeEmbeds = extractYouTubeEmbeds(content);
  const imageEmbeds = extractImages(content);
  const videoEmbeds = extractVideos(content);
  const urlCards = extractUrlCards(content);
  
  // 모든 미디어 요소를 HTML로 모아서 렌더링
  const mediaElements = [...imageEmbeds, ...videoEmbeds, ...youtubeEmbeds, ...urlCards];
  
  // 추출된 미디어가 없으면 렌더링하지 않음
  if (mediaElements.length === 0) {
    return null;
  }
  
  const mediaHtml = mediaElements.map(media => media.embedCode).join('');

  return (
    <div 
      className="media-preview border-t mt-2 pt-2 px-2"
      dangerouslySetInnerHTML={{ __html: mediaHtml }}
    />
  );
};

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
  CalendarIcon
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
    setCurrentEditor(fieldName);
    mediaImageInputRef.current?.click();
  };

  const handleMediaGifSelect = (fieldName: string) => {
    setCurrentEditor(fieldName);
    mediaGifInputRef.current?.click();
  };

  const handleMediaVideoSelect = (fieldName: string) => {
    setCurrentEditor(fieldName);
    mediaVideoInputRef.current?.click();
  };

  const handleMediaFileSelect = (fieldName: string) => {
    setCurrentEditor(fieldName);
    mediaFileInputRef.current?.click();
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
        onClick={() => handleUrlButtonClick(fieldName)}
      >
        <Link2 className="h-4 w-4 mr-1" /> URL
      </Button>
    </div>
  );

  const handleMediaFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'gif' | 'video' | 'file') => {
    const files = e.target.files;
    if (!files || files.length === 0 || !currentEditor) {
      return;
    }

    const file = files[0];
    
    // 파일을 FormData에 추가하고 서버에 업로드하는 대신 
    // 바로 미리보기 이미지를 삽입합니다
    
    // 로컬 URL 생성 (즉시 미리보기용)
    const fileUrl = URL.createObjectURL(file);
    
    // 현재 필드의 값 가져오기
    const currentValue = form.getValues(currentEditor as any) || '';
    
    // 현재 에디터 참조 요소 가져오기
    const textAreaElement = document.querySelector(`[name="${currentEditor}"]`) as HTMLTextAreaElement;
    if (!textAreaElement) return;
    
    // 에디터 영역의 부모 요소 찾기
    const editorContainer = textAreaElement.closest('.form-item') as HTMLElement;
    if (!editorContainer) return;
    
    // 미리보기 컨테이너 생성 또는 찾기
    let previewContainer = editorContainer.querySelector('.media-preview-container') as HTMLElement;
    
    if (!previewContainer) {
      // 미리보기 컨테이너가 없으면 새로 생성
      previewContainer = document.createElement('div');
      previewContainer.className = 'media-preview-container';
      previewContainer.style.cssText = 'margin-top: 10px; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; background-color: #f9fafb; overflow-y: auto;';
      
      // 미리보기 헤더 추가
      const previewHeader = document.createElement('div');
      previewHeader.className = 'media-preview-header';
      previewHeader.style.cssText = 'margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb; font-weight: 500;';
      previewHeader.textContent = '에디터 미리보기 (실제 이미지와 미디어가 표시됩니다)';
      
      previewContainer.appendChild(previewHeader);
      
      // 미리보기 내용 영역 추가
      const previewContent = document.createElement('div');
      previewContent.className = 'media-preview-content';
      previewContainer.appendChild(previewContent);
      
      // 에디터 아래에 미리보기 컨테이너 삽입
      editorContainer.appendChild(previewContainer);
    }
    
    // 미리보기 내용 영역 찾기
    const previewContent = previewContainer.querySelector('.media-preview-content') as HTMLElement;
    if (!previewContent) return;
    
    // 미디어 요소 생성
    const mediaElement = document.createElement('div');
    mediaElement.className = 'media-element';
    mediaElement.setAttribute('draggable', 'true');
    mediaElement.style.cssText = 'margin: 10px 0; position: relative;';
    
    // 미디어 타입에 따라 다른 내용 추가
    let mediaContent = '';
    let markdownContent = '';
    
    switch (type) {
      case 'image':
      case 'gif':
        // 실제 이미지 삽입
        mediaContent = `<img src="${fileUrl}" alt="${type === 'image' ? '이미지' : 'GIF'}" style="max-width: 100%; border-radius: 6px;" />`;
        markdownContent = `\n![${type === 'image' ? '이미지' : 'GIF'}](${fileUrl})\n`;
        break;
      case 'video':
        // 비디오 삽입
        mediaContent = `<video controls width="100%" style="border-radius: 6px;">
          <source src="${fileUrl}" type="${file.type}">
          브라우저가 비디오를 지원하지 않습니다.
        </video>`;
        markdownContent = `\n<video controls width="100%"><source src="${fileUrl}" type="${file.type}"></video>\n`;
        break;
      case 'file':
        // 파일 다운로드 링크 삽입
        mediaContent = `<a href="${fileUrl}" download="${file.name}" style="display: block; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; background-color: #f8f9fa; text-decoration: none;">
          <span style="display: flex; align-items: center;">
            <span style="margin-right: 8px; font-size: 1.2em;">📎</span>
            <span>${file.name}</span>
          </span>
        </a>`;
        markdownContent = `\n[파일 다운로드: ${file.name}](${fileUrl})\n`;
        break;
    }
    
    // 미디어 요소 내용 설정
    mediaElement.innerHTML = mediaContent;
    
    // 드래그 핸들러 추가
    mediaElement.addEventListener('dragstart', (e) => {
      const dragImage = new Image();
      dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
      e.dataTransfer.setDragImage(dragImage, 0, 0);
      e.dataTransfer.setData('text/plain', mediaElement.id);
      mediaElement.style.opacity = '0.5';
    });
    
    mediaElement.addEventListener('dragend', () => {
      mediaElement.style.opacity = '1';
    });
    
    // 미디어 요소 고유 ID 설정
    const mediaId = `media-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    mediaElement.id = mediaId;
    
    // 미리보기 영역에 미디어 요소 추가
    previewContent.appendChild(mediaElement);
    
    // 드롭 영역 설정
    previewContent.addEventListener('dragover', (e) => {
      e.preventDefault();
      const target = e.target as HTMLElement;
      const closestMediaElement = target.closest('.media-element');
      
      if (closestMediaElement && closestMediaElement !== mediaElement) {
        const rect = closestMediaElement.getBoundingClientRect();
        const midY = rect.y + rect.height / 2;
        
        if (e.clientY < midY) {
          // 위에 놓기
          closestMediaElement.style.borderTop = '2px solid #3b82f6';
          closestMediaElement.style.borderBottom = '';
        } else {
          // 아래에 놓기
          closestMediaElement.style.borderBottom = '2px solid #3b82f6';
          closestMediaElement.style.borderTop = '';
        }
      }
    });
    
    previewContent.addEventListener('dragleave', (e) => {
      const target = e.target as HTMLElement;
      const closestMediaElement = target.closest('.media-element');
      
      if (closestMediaElement) {
        closestMediaElement.style.borderTop = '';
        closestMediaElement.style.borderBottom = '';
      }
    });
    
    previewContent.addEventListener('drop', (e) => {
      e.preventDefault();
      const target = e.target as HTMLElement;
      const closestMediaElement = target.closest('.media-element');
      
      document.querySelectorAll('.media-element').forEach(elem => {
        (elem as HTMLElement).style.borderTop = '';
        (elem as HTMLElement).style.borderBottom = '';
      });
      
      if (closestMediaElement && closestMediaElement !== mediaElement) {
        const rect = closestMediaElement.getBoundingClientRect();
        const midY = rect.y + rect.height / 2;
        
        if (e.clientY < midY) {
          // 위에 놓기
          previewContent.insertBefore(mediaElement, closestMediaElement);
        } else {
          // 아래에 놓기
          previewContent.insertBefore(mediaElement, closestMediaElement.nextSibling);
        }
        
        // 미리보기 영역의 내용을 기반으로 마크다운 재생성
        updateTextareaFromPreview(previewContent, textAreaElement);
      }
    });
    
    // 원래 마크다운 방식으로도 에디터에 콘텐츠 추가
    form.setValue(currentEditor as any, currentValue + markdownContent, { shouldValidate: true });
    
    // 입력창 초기화
    if (e.target) e.target.value = '';
    
    // 성공 토스트 표시
    toast({
      title: "미디어 추가 완료",
      description: "미디어가 성공적으로 추가되었습니다.",
    });
  };
  
  // 미리보기 영역의 내용을 기반으로 마크다운으로 변환하는 함수
  const updateTextareaFromPreview = (previewContent: HTMLElement, textAreaElement: HTMLTextAreaElement) => {
    // 현재 모든 미디어 요소를 순회하며 마크다운 생성
    const mediaElements = previewContent.querySelectorAll('.media-element');
    let markdownContent = '';
    
    mediaElements.forEach(mediaElement => {
      // 이미지인 경우
      const imgElement = mediaElement.querySelector('img');
      if (imgElement) {
        const src = imgElement.getAttribute('src') || '';
        const alt = imgElement.getAttribute('alt') || '이미지';
        markdownContent += `\n![${alt}](${src})\n`;
        return;
      }
      
      // 비디오인 경우
      const videoElement = mediaElement.querySelector('video');
      if (videoElement) {
        const sourceElement = videoElement.querySelector('source');
        if (sourceElement) {
          const src = sourceElement.getAttribute('src') || '';
          const type = sourceElement.getAttribute('type') || '';
          markdownContent += `\n<video controls width="100%"><source src="${src}" type="${type}"></video>\n`;
        }
        return;
      }
      
      // 파일인 경우
      const linkElement = mediaElement.querySelector('a');
      if (linkElement) {
        const href = linkElement.getAttribute('href') || '';
        const fileName = linkElement.textContent?.trim() || '파일';
        markdownContent += `\n[파일 다운로드: ${fileName}](${href})\n`;
      }
    });
    
    // 생성된 마크다운으로 텍스트 영역 업데이트
    const fieldName = textAreaElement.getAttribute('name');
    if (fieldName) {
      form.setValue(fieldName as any, markdownContent, { shouldValidate: true });
    }
  };

  // YouTube 링크 처리 함수 - 텍스트를 그대로 반환하고, MediaPreview 컴포넌트에서 미리보기 처리
  const processYouTubeLinks = async (text: string): Promise<string> => {
    return text; // 텍스트를 변환하지 않고 그대로 반환, 대신 MediaPreview에서 처리
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || !currentEditor) {
      setUrlInputActive(false);
      return;
    }

    // YouTube URL 감지 및 처리
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = urlInput.match(youtubeRegex);

    let markdownContent = '';

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
    } else {
      // 일반 URL - 카드 형태로 표시
      markdownContent = `\n<div class="url-card">
      <a href="${urlInput}" target="_blank" rel="noopener noreferrer">
        <div class="url-preview">
          <div class="url-icon">🔗</div>
          <div class="url-content">
            <div class="url-title">${urlInput}</div>
            <div class="url-link">${urlInput}</div>
          </div>
        </div>
      </a>
      </div>\n`;
    }

    const currentValue = form.getValues(currentEditor as any) || '';
    form.setValue(currentEditor as any, currentValue + markdownContent, { shouldValidate: true });

    setUrlInput('');
    setUrlInputActive(false);
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
                          리소스를 다운로드할 수 있는 URL을 입력해주세요.
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
                      <FormLabel>설명 (선택)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="리소스에 대한 간략한 설명을 입력하세요 (이 내용은 리소스 목록에서 미리보기로 표시됩니다)"
                          className="min-h-[120px] resize-y"
                          {...field}
                          onChange={async (e) => {
                            const newValue = await processYouTubeLinks(e.target.value);
                            field.onChange(newValue);
                          }}
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
                    <p className="textsm text-muted-foreground mb-4">
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
                {(
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
                                <div className="border rounded-md">
                                  <div className="flex flex-wrap border-b p-2 gap-2 bg-muted/10">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      type="button" 
                                      className="h-8"
                                      onClick={() => handleMediaImageSelect("assemblyInstructions")}
                                    >
                                      <ImageIcon className="h-4 w-4 mr-1" /> 이미지
                                    </Button>
                                  </div>
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
                                  <div className="flex flex-col">
                                    <Textarea
                                      placeholder="단계별 조립 방법을 상세히 설명해주세요. 이미지 버튼을 클릭하여 이미지를 첨부할 수 있습니다."
                                      className="min-h-[200px] resize-y border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                      {...field}
                                      value={field.value || ""}
                                      onChange={async (e) => {
                                        // YouTube URL 감지 및 변환
                                        const newValue = await processYouTubeLinks(e.target.value);
                                        field.onChange(newValue);
                                      }}
                                    />
                                    <MediaPreview content={field.value || ""} />
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
                                  <div className="flex flex-wrap border-b p-2 gap-2 bg-muted/10">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      type="button" 
                                      className="h-8"
                                      onClick={() => handleMediaImageSelect("howToUse")}
                                    >
                                      <ImageIcon className="h-4 w-4 mr-1" /> 이미지
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      type="button" 
                                      className="h-8"
                                      onClick={() => handleMediaGifSelect("howToUse")}
                                    >
                                      <Smile className="h-4 w-4 mr-1" /> GIF
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      type="button" 
                                      className="h-8"
                                      onClick={() => handleMediaVideoSelect("howToUse")}
                                    >
                                      <Video className="h-4 w-4 mr-1" /> 동영상
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      type="button" 
                                      className="h-8"
                                      onClick={() => handleMediaUrlSelect("howToUse")}
                                    >
                                      <Link2 className="h-4 w-4 mr-1" /> URL
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      type="button" 
                                      className="h-8"
                                      onClick={() => handleMediaFileSelect("howToUse")}
                                    >
                                      <FolderOpen className="h-4 w-4 mr-1" /> 파일
                                    </Button>
                                  </div>
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
                                  <div className="flex flex-col">
                                    <Textarea
                                      placeholder="하드웨어 사용 방법과 주의사항을 설명해주세요."
                                      className="min-h-[200px] resize-y border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                      {...field}
                                      value={field.value || ""}
                                      onChange={async (e) => {
                                        const newValue = await processYouTubeLinks(e.target.value);
                                        field.onChange(newValue);
                                      }}
                                    />
                                    <MediaPreview content={field.value || ""} />
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
                                <div className="flex flex-wrap border-b p-2 gap-2 bg-muted/10">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    type="button" 
                                    className="h-8"
                                    onClick={() => handleMediaImageSelect("howToUse")}
                                  >
                                    <ImageIcon className="h-4 w-4 mr-1" /> 이미지
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    type="button" 
                                    className="h-8"
                                    onClick={() => handleMediaGifSelect("howToUse")}
                                  >
                                    <Smile className="h-4 w-4 mr-1" /> GIF
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    type="button" 
                                    className="h-8"
                                    onClick={() => handleMediaVideoSelect("howToUse")}
                                  >
                                    <Video className="h-4 w-4 mr-1" /> 동영상
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    type="button" 
                                    className="h-8"
                                    onClick={() => handleMediaUrlSelect("howToUse")}
                                  >
                                    <Link2 className="h-4 w-4 mr-1" /> URL
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    type="button" 
                                    className="h-8"
                                    onClick={() => handleMediaFileSelect("howToUse")}
                                  >
                                    <FolderOpen className="h-4 w-4 mr-1" /> 파일
                                  </Button>
                                </div>
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
                                <div className="flex flex-col">
                                  <Textarea
                                    placeholder="설치 방법과 사용법을 설명해주세요."
                                    className="min-h-[300px] resize-y border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                    {...field}
                                    value={field.value || ""}
                                    onChange={async (e) => {
                                      const newValue = await processYouTubeLinks(e.target.value);
                                      field.onChange(newValue);
                                    }}
                                  />
                                  <MediaPreview content={field.value || ""} />
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
                                  <div className="flex flex-wrap border-b p-2 gap-2 bg-muted/10">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      type="button" 
                                      className="h-8"
                                      onClick={() => handleMediaImageSelect("assemblyInstructions")}
                                    >
                                      <ImageIcon className="h-4 w-4 mr-1" /> 이미지
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      type="button" 
                                      className="h-8"
                                      onClick={() => handleMediaGifSelect("assemblyInstructions")}
                                    >
                                      <Smile className="h-4 w-4 mr-1" /> GIF
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      type="button" 
                                      className="h-8"
                                      onClick={() => handleMediaVideoSelect("assemblyInstructions")}
                                    >
                                      <Video className="h-4 w-4 mr-1" /> 동영상
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      type="button" 
                                      className="h-8"
                                      onClick={() => handleMediaUrlSelect("assemblyInstructions")}
                                    >
                                      <Link2 className="h-4 w-4 mr-1" /> URL
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      type="button" 
                                      className="h-8"
                                      onClick={() => handleMediaFileSelect("assemblyInstructions")}
                                    >
                                      <FolderOpen className="h-4 w-4 mr-1" /> 파일
                                    </Button>
                                  </div>
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
                                  <div className="flex flex-col">
                                    <Textarea
                                      placeholder="3D 모델의 조립 방법과 단계를 설명해주세요."
                                      className="min-h-[200px] resize-y border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                      {...field}
                                      value={field.value || ""}
                                      onChange={async (e) => {
                                        const newValue = await processYouTubeLinks(e.target.value);
                                        field.onChange(newValue);
                                      }}
                                    />
                                    <MediaPreview content={field.value || ""} />
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
                                  <div className="flex flex-wrap border-b p-2 gap-2 bg-muted/10">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      type="button" 
                                      className="h-8"
                                      onClick={() => handleMediaImageSelect("howToUse")}
                                    >
                                      <ImageIcon className="h-4 w-4 mr-1" /> 이미지
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      type="button" 
                                      className="h-8"
                                      onClick={() => handleMediaGifSelect("howToUse")}
                                    >
                                      <Smile className="h-4 w-4 mr-1" /> GIF
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      type="button" 
                                      className="h-8"
                                      onClick={() => handleMediaVideoSelect("howToUse")}
                                    >
                                      <Video className="h-4 w-4 mr-1" /> 동영상
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      type="button" 
                                      className="h-8"
                                      onClick={() => handleMediaUrlSelect("howToUse")}
                                    >
                                      <Link2 className="h-4 w-4 mr-1" /> URL
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      type="button" 
                                      className="h-8"
                                      onClick={() => handleMediaFileSelect("howToUse")}
                                    >
                                      <FolderOpen className="h-4 w-4 mr-1" /> 파일
                                    </Button>
                                  </div>
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
                                  <div className="flex flex-col">
                                    <Textarea
                                      placeholder="3D 모델 사용 방법을 설명해주세요."
                                      className="min-h-[200px] resize-y border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                      {...field}
                                      value={field.value || ""}
                                      onChange={async (e) => {
                                        const newValue = await processYouTubeLinks(e.target.value);
                                        field.onChange(newValue);
                                      }}
                                    />
                                    <MediaPreview content={field.value || ""} />
                                  </div>
                                </div>
                              </FormControl>
                              <FormDescription>
                                3D 모델 사용 방법, 최적의 프린팅 설정(층 높이, 충전률, 서포트 등)을 상세히 설명해주세요. 미디어 요소를 추가하여 더 명확하게 설명할 수 있습니다.
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
                              <div className="border rounded-md">
                                <div className="flex flex-wrap border-b p-2 gap-2 bg-muted/10">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    type="button" 
                                    className="h-8"
                                    onClick={() => handleMediaImageSelect("howToUse")}
                                  >
                                    <ImageIcon className="h-4 w-4 mr-1" /> 이미지
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    type="button" 
                                    className="h-8"
                                    onClick={() => handleMediaGifSelect("howToUse")}
                                  >
                                    <Smile className="h-4 w-4 mr-1" /> GIF
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    type="button" 
                                    className="h-8"
                                    onClick={() => handleMediaVideoSelect("howToUse")}
                                  >
                                    <Video className="h-4 w-4 mr-1" /> 동영상
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    type="button" 
                                    className="h-8"
                                    onClick={() => handleMediaUrlSelect("howToUse")}
                                  >
                                    <Link2 className="h-4 w-4 mr-1" /> URL
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    type="button" 
                                    className="h-8"
                                    onClick={() => handleMediaFileSelect("howToUse")}
                                  >
                                    <FolderOpen className="h-4 w-4 mr-1" /> 파일
                                  </Button>
                                </div>
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
                                <div className="flex flex-col">
                                  <Textarea
                                    placeholder="모델의 구조, 훈련 방법, 사용법 등을 설명해주세요."
                                    className="min-h-[300px] resize-y border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                    {...field}
                                    value={field.value || ""}
                                    onChange={async (e) => {
                                      const newValue = await processYouTubeLinks(e.target.value);
                                      field.onChange(newValue);
                                    }}
                                  />
                                  <MediaPreview content={field.value || ""} />
                                </div>
                              </div>
                            </FormControl>
                            <FormDescription>
                              모델 구조, 파라미터, 성능지표, 사용 예제 등을 포함해주세요. 미디어 요소를 추가하여 더 명확하게 설명할 수 있습니다.
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
                              <div className="border rounded-md">
                                <div className="flex flex-wrap border-b p-2 gap-2 bg-muted/10">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    type="button" 
                                    className="h-8"
                                    onClick={() => handleMediaImageSelect("howToUse")}
                                  >
                                    <ImageIcon className="h-4 w-4 mr-1" /> 이미지
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    type="button" 
                                    className="h-8"
                                    onClick={() => handleMediaGifSelect("howToUse")}
                                  >
                                    <Smile className="h-4 w-4 mr-1" /> GIF
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    type="button" 
                                    className="h-8"
                                    onClick={() => handleMediaVideoSelect("howToUse")}
                                  >
                                    <Video className="h-4 w-4 mr-1" /> 동영상
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    type="button" 
                                    className="h-8"
                                    onClick={() => handleMediaUrlSelect("howToUse")}
                                  >
                                    <Link2 className="h-4 w-4 mr-1" /> URL
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    type="button" 
                                    className="h-8"
                                    onClick={() => handleMediaFileSelect("howToUse")}
                                  >
                                    <FolderOpen className="h-4 w-4 mr-1" /> 파일
                                  </Button>
                                </div>
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
                                <div className="flex flex-col">
                                  <Textarea
                                    placeholder="콘텐츠에 대한 설명과 라이센스 정보를 입력해주세요."
                                    className="min-h-[200px] resize-y border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                    {...field}
                                    value={field.value || ""}
                                    onChange={async (e) => {
                                      const newValue = await processYouTubeLinks(e.target.value);
                                      field.onChange(newValue);
                                    }}
                                  />
                                  <MediaPreview content={field.value || ""} />
                                </div>
                              </div>
                            </FormControl>
                            <FormDescription>
                              콘텐츠 이용 조건, 출처, 라이센스 정보를 명확히 기재해주세요. 미디어 요소를 추가하여 더 명확하게 설명할 수 있습니다.
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
                              <div className="border rounded-md">
                                <div className="flex flex-wrap border-b p-2 gap-2 bg-muted/10">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    type="button" 
                                    className="h-8"
                                    onClick={() => handleMediaImageSelect("howToUse")}
                                  >
                                    <ImageIcon className="h-4 w-4 mr-1" /> 이미지
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    type="button" 
                                    className="h-8"
                                    onClick={() => handleMediaGifSelect("howToUse")}
                                  >
                                    <Smile className="h-4 w-4 mr-1" /> GIF
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    type="button" 
                                    className="h-8"
                                    onClick={() => handleMediaVideoSelect("howToUse")}
                                  >
                                    <Video className="h-4 w-4 mr-1" /> 동영상
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    type="button" 
                                    className="h-8"
                                    onClick={() => handleMediaUrlSelect("howToUse")}
                                  >
                                    <Link2 className="h-4 w-4 mr-1" /> URL
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    type="button" 
                                    className="h-8"
                                    onClick={() => handleMediaFileSelect("howToUse")}
                                  >
                                    <FolderOpen className="h-4 w-4 mr-1" /> 파일
                                  </Button>
                                </div>
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
                                <div className="flex flex-col">
                                  <Textarea
                                    placeholder="게임 설명, 목표, 조작법 등을 설명해주세요."
                                    className="min-h-[200px] resize-y border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                    {...field}
                                    value={field.value || ""}
                                    onChange={async (e) => {
                                      const newValue = await processYouTubeLinks(e.target.value);
                                      field.onChange(newValue);
                                    }}
                                  />
                                  <MediaPreview content={field.value || ""} />
                                </div>
                              </div>
                            </FormControl>
                            <FormDescription>
                              게임 목표, 조작키, 게임 플레이 방법을 자세히 설명해주세요. 미디어 요소를 추가하여 더 명확하게 설명할 수 있습니다.
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
                      !form.watch('resourceType')
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