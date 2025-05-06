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
import { RichMediaEditor } from "@/components/ui/RichMediaEditor";
import { TipTapEditor, TipTapEditorHandle } from "@/components/ui/TipTapEditor";
import { TextSelection } from '@tiptap/pm/state';

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

// window 전역 객체에 타임스탬프 추가 (삭제 소스 추적용)
declare global {
  interface Window {
    lastEditorDeletionTimestamp?: number;
    getYouTubeVideoId?: (url: string) => string;
  }
}

// 파일 타입 인터페이스
interface FileWithPreview extends File {
  preview: string;
  progress?: number;
}

// 미디어 아이템 타입 정의 (단일 소스로 관리)
interface MediaItem {
  url: string;
  type: 'image' | 'video' | 'gif' | 'file' | 'youtube';
  name?: string;
  size?: number;
  file?: File;
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

// YouTube 비디오 ID 추출 유틸리티 함수
function getYouTubeVideoId(url: string): string {
  if (!url) return '';
  
  let videoId = '';
  try {
    // URL 객체로 변환 시도
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch (e) {
      // 유효하지 않은 URL일 경우 빈 문자열 반환
      return '';
    }
    
    // 다양한 YouTube URL 형식 처리:
    
    // 1. 표준 형식: youtube.com/watch?v=ID
    if (parsedUrl.hostname.includes('youtube.com') && parsedUrl.pathname === '/watch') {
      videoId = parsedUrl.searchParams.get('v') || '';
    } 
    // 2. 단축 URL: youtu.be/ID
    else if (parsedUrl.hostname.includes('youtu.be')) {
      // /로 시작하는 경로에서 ID 추출
      const path = parsedUrl.pathname;
      if (path.length > 1) { // "/"보다 길이가 긴지 확인
        videoId = path.substring(1); // 첫 번째 "/" 이후의 문자열
      }
    } 
    // 3. 임베드 URL: youtube.com/embed/ID
    else if (parsedUrl.hostname.includes('youtube.com') && parsedUrl.pathname.startsWith('/embed/')) {
      videoId = parsedUrl.pathname.split('/embed/')[1] || '';
    }
    // 4. 공유 URL: youtube.com/shorts/ID
    else if (parsedUrl.hostname.includes('youtube.com') && parsedUrl.pathname.startsWith('/shorts/')) {
      videoId = parsedUrl.pathname.split('/shorts/')[1] || '';
    }
    
    // 비디오 ID에서 추가 경로나 쿼리 파라미터 제거
    if (videoId) {
      // 첫 번째 '?' 또는 '&'나 '/' 이전까지의 문자열만 사용
      videoId = videoId.split(/[?&/]/)[0];
    }
    
    // 비디오 ID 검증 (기본적인 YouTube 비디오 ID 패턴 확인)
    if (videoId && !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      console.warn('비정상적인 YouTube 비디오 ID 형식:', videoId);
      // 비정상이지만 일단 반환 (YouTube에서 처리)
    }
  } catch (error) {
    console.error('YouTube 비디오 ID 추출 중 오류:', error);
  }
  
  return videoId;
}

// 빈 단락 정리 함수
const tidyEmptyParagraph = (tr: any) => {
  const $pos = tr.selection.$from;
  const node = $pos.nodeAfter;
  if (node?.type.name === 'paragraph' && node.content.size === 0) {
    tr.delete($pos.pos, $pos.pos + node.nodeSize);
  }
  return tr;
};

// 전역에서 함수 접근 가능하도록 설정
if (typeof window !== 'undefined') {
  window.getYouTubeVideoId = getYouTubeVideoId;
  // 타임스탬프 저장 - 중복 삭제 방지용
  window.lastEditorDeletionTimestamp = 0;
}

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
  
  // 단일 미디어 소스 관리 (MediaItem[])
  const [mediaItems, setMediaItems] = useState<{[key: string]: MediaItem[]}>({});
  
  // TipTap 에디터 레퍼런스 관리
  const editorRefs = useRef<{ [fieldName: string]: React.RefObject<TipTapEditorHandle> }>({});

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
  
  // 미디어 관리 유틸리티 함수 먼저 정의
  
  // URL 정규화 함수
  const normalizeUrl = useCallback((url: string): string => {
    // null이나 undefined 처리
    if (!url) return '';
    
    // Base64 URL일 경우 앞부분 일치 확인
    if (url.startsWith('data:')) {
      return url.split(',')[0]; // 메타데이터 부분만 비교
    }
    
    try {
      // URL 객체로 파싱하여 경로 부분만 추출 (쿼리, 해시 제거)
      const urlObj = new URL(url);
      return urlObj.origin + urlObj.pathname;
    } catch (e) {
      // URL 파싱 실패 시 원래 방식으로 폴백
      return url.split('?')[0].split('#')[0];
    }
  }, []);
  
  // 미디어 아이템 제거 유틸리티 (단일 소스)
  const removeMediaItem = useCallback((fieldName: string, url: string, mediaType?: string) => {
    console.log(`미디어 아이템 제거: URL: ${url.substring(0, 30)}..., 필드: ${fieldName}`);
    
    // 1. 상태에서 미디어 아이템 제거
    setMediaItems(prev => {
      const fieldMedia = prev[fieldName] || [];
      return {
        ...prev,
        [fieldName]: fieldMedia.filter(item => normalizeUrl(item.url) !== normalizeUrl(url))
      };
    });
    
    // 2. uploadedMediaFiles에서도 제거 (호환성 유지)
    setUploadedMediaFiles(prev => {
      const fieldFiles = prev[fieldName] || [];
      return {
        ...prev,
        [fieldName]: fieldFiles.filter(file => normalizeUrl(file.preview) !== normalizeUrl(url))
      };
    });
    
    // 3. 에디터 내용에서도 미디어 삭제 (에디터 외부에서 삭제 버튼 클릭 시)
    const editorRef = editorRefs.current[fieldName];
    if (editorRef?.current) {
      const editor = editorRef.current.getEditor();
      if (editor) {
        editor.commands.command(({ tr, state }) => {
          let found = false;
          
          // 전체 문서를 순회하면서 해당 URL을 가진 노드 찾기
          state.doc.descendants((node, pos) => {
            // 이미지 노드 검사
            if (node.type.name === 'image' && normalizeUrl(node.attrs.src) === normalizeUrl(url)) {
              tr.delete(pos, pos + node.nodeSize);
              found = true;
              return false; // 순회 중단
            }
            
            // 비디오 노드 검사
            else if (node.type.name === 'video' && normalizeUrl(node.attrs.src) === normalizeUrl(url)) {
              tr.delete(pos, pos + node.nodeSize);
              found = true;
              return false;
            }
            
            // YouTube 노드 검사 (videoId를 사용하므로 URL 전체가 아니라 ID 추출 필요)
            else if (node.type.name === 'youtube') {
              const videoId = node.attrs.videoId;
              const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
              
              if (normalizeUrl(youtubeUrl) === normalizeUrl(url)) {
                tr.delete(pos, pos + node.nodeSize);
                found = true;
                return false;
              }
            }
            
            // 첨부 파일 노드 검사
            else if (node.type.name === 'attachment' && normalizeUrl(node.attrs.src) === normalizeUrl(url)) {
              tr.delete(pos, pos + node.nodeSize);
              found = true;
              return false;
            }
            
            return true; // 계속 순회
          });
          
          // 빈 단락 정리
          if (found) {
            // 여기서는 간단히 수행 - 더 정밀한 처리는 에디터 자체 cleanupEmptyParagraphs 함수가 담당
            return true;
          }
          
          return false;
        });
      }
    }
  }, [normalizeUrl]);
  
  // 에디터 콜백 - TipTapEditor에서 미디어 삭제될 때 호출되는 핸들러
  const handleMediaDeleteCallback = useCallback((url: string, type: string, fieldName?: string) => {
    console.log(`에디터에서 미디어 삭제 감지: ${type}, URL: ${url.substring(0, 30)}..., 필드: ${fieldName || '미지정'}`);
    
    if (!fieldName) {
      console.warn("필드명이 지정되지 않았습니다. 현재 활성 에디터를 사용합니다.");
      // 필드명이 없는 경우 현재 활성화된 에디터 필드 사용
      if (currentEditor) {
        removeMediaItem(currentEditor, url, type);
      } else {
        console.error("활성화된 에디터가 없어 미디어를 삭제할 수 없습니다.");
      }
      return;
    }
    
    // 단일 소스 미디어 상태에서도 삭제
    removeMediaItem(fieldName, url, type);
  }, [removeMediaItem, currentEditor]);
  
  // 이미지 클릭 핸들러 - 클릭한 이미지 편집/관리 (예: 크기 조정, 삭제, 캡션 추가 등)
  const handleImageClick = useCallback((imageSrc: string) => {
    console.log("이미지 클릭됨:", imageSrc);
    // 팝업 메시지 제거 - UX 개선을 위해 클릭 시 팝업 없음
    // 추후 이미지 편집 모달을 여기에 구현할 수 있음
  }, []);
  
  // ----- 미디어 관리 유틸리티 함수 사용 ----- //
  
  // 미디어 아이템 추가 유틸리티 (단일 소스)
  const addMediaItem = useCallback((fieldName: string, media: MediaItem) => {
    console.log(`미디어 아이템 추가: ${media.type}, URL: ${media.url.substring(0, 30)}...`);
    
    // 미디어 아이템 저장 (단일 소스)
    setMediaItems(prev => {
      const fieldMedia = prev[fieldName] || [];
      // URL 기준으로 중복 확인
      if (!fieldMedia.some(item => normalizeUrl(item.url) === normalizeUrl(media.url))) {
        return {
          ...prev,
          [fieldName]: [...fieldMedia, media]
        };
      }
      return prev;
    });
    
    // 에디터 참조 가져오기 및 미디어 타입에 따른 삽입
    const editorRef = editorRefs.current[fieldName];
    if (editorRef?.current) {
      const editor = editorRef.current;
      
      // 미디어 타입에 따라 적절한 삽입 방법 선택
      switch(media.type) {
        case 'image':
          editor.insertImage(media.url, media.name || '이미지');
          break;
        case 'video':
          editor.insertVideo(media.url);
          break;
        case 'youtube':
          editor.insertVideo(media.url); // insertVideo 메서드가 YouTube URL 감지 및 처리
          break;
        case 'file':
          editor.insertFile(media.url, media.name || '파일', media.size);
          break;
        default:
          console.warn(`지원하지 않는 미디어 타입: ${media.type}`);
      }
    }
    
    // 기존 uploadedMediaFiles 호환성 유지 (필요시에만 사용)
    if (media.file || media.type === 'youtube') {
      setUploadedMediaFiles(prev => {
        const fieldFiles = prev[fieldName] || [];
        
        // 이미 존재하는지 확인
        if (fieldFiles.some(file => file.preview === media.url)) {
          return prev;
        }
        
        // 새 FileWithPreview 객체 생성
        const newFile = new File([], 
          media.name || `${media.type}-${Date.now()}`, 
          { type: `${media.type}/${media.type === 'youtube' ? 'mp4' : 'file'}` }) as FileWithPreview;
        
        newFile.preview = media.url;
        // size는 읽기 전용이므로 Object.defineProperty 사용
        if (media.size) {
          Object.defineProperty(newFile, 'size', {
            value: media.size,
            writable: false
          });
        }
        
        return {
          ...prev,
          [fieldName]: [...fieldFiles, newFile]
        };
      });
    }
  }, [normalizeUrl]);
  
  // 에디터에서 미디어 찾아 삭제하는 함수
  const removeMediaFromEditor = useCallback((editorField: string, mediaUrl: string) => {
    try {
      // 로그 출력 - mediaUrl이 매우 길 경우 앞부분만 표시
      console.log(`에디터(${editorField})에서 미디어 삭제 시도: ${mediaUrl.substring(0, 30)}...`);
      
      // 1. 에디터 레퍼런스 가져오기 - 선호순위
      
      // 1.1 먼저 editorRefs에서 참조 찾기
      let tiptapEditor = null;
      if (editorRefs.current[editorField]?.current?.getEditor()) {
        tiptapEditor = editorRefs.current[editorField].current.getEditor();
        console.log("✅ editorRefs에서 에디터 인스턴스 찾음");
      }
      
      // 1.2 실패 시 DOM에서 직접 찾기 
      if (!tiptapEditor) {
        // 해당 필드의 에디터 컨테이너 찾기
        const editorContainer = document.querySelector(`[data-field-name="${editorField}"]`);
        if (!editorContainer) {
          console.error(`에디터 컨테이너를 찾을 수 없음: ${editorField}`);
          return false;
        }
        
        // editorContainer 내부의 TipTap 인스턴스 찾기
        const editorContent = editorContainer.querySelector('.ProseMirror');
        if (!editorContent) {
          console.error(`에디터 콘텐츠(.ProseMirror)를 찾을 수 없음: ${editorField}`);
          return false;
        }
        
        // The DOM editor query approach is a fallback - let's try to get the editor instance
        // This uses editor._tiptapEditor which is consistent with the TipTap internal convention
        tiptapEditor = (editorContent as any)?._tiptapEditor;
        if (!tiptapEditor) {
          console.error(`TipTap 에디터 인스턴스를 찾을 수 없음: ${editorField}`);
          return false;
        }
      }
      
      if (!tiptapEditor) {
        console.error("에디터 인스턴스를 찾을 수 없습니다.");
        return false;
      }
      
      // 2. YouTube 비디오 ID 비교 함수
      const matchesYouTubeVideo = (html: string, targetUrl: string): boolean => {
        if (!html.includes('youtube.com/embed/')) return false;
        if (!targetUrl.includes('youtube.com') && !targetUrl.includes('youtu.be')) return false;
        
        // 원본 URL에서 비디오 ID 추출
        const targetVideoId = getYouTubeVideoId(targetUrl);
        if (!targetVideoId) return false;
        
        // iframe HTML에서 비디오 ID 추출
        const embedMatch = html.match(/youtube\.com\/embed\/([^"?&/]+)/);
        const embedVideoId = embedMatch && embedMatch[1] ? embedMatch[1] : '';
        
        // ID 비교
        return embedVideoId === targetVideoId;
      };
      
      // 3. 노드 찾기 및 삭제
      let found = false;
      
      // 3.1 커맨드 생성 - tiptap 커맨드 API 사용
      tiptapEditor.commands.command(({ tr, state }: { tr: any, state: any }) => {
        const { doc } = state;
        
        // 3.2 문서의 모든 노드 순회
        doc.descendants((node: any, pos: number) => {
          // 이미 찾았으면 더 이상 검색하지 않음
          if (found) return false;
          
          // 이미지 노드 확인
          if (node.type.name === 'image') {
            if (normalizeUrl(node.attrs.src) === normalizeUrl(mediaUrl)) {
              // 노드 삭제
              tr.delete(pos, pos + node.nodeSize);
              
              // 빈 문단 처리 (필요 시 남겨두기)
              if (tr.doc.childCount === 0) {
                tr.insert(pos, state.schema.nodes.paragraph.create());
              }
              
              found = true;
              return false; // 순회 중단
            }
          }
          
          // 비디오 노드 확인
          else if (node.type.name === 'video') {
            if (normalizeUrl(node.attrs.src) === normalizeUrl(mediaUrl)) {
              tr.delete(pos, pos + node.nodeSize);
              
              if (tr.doc.childCount === 0) {
                tr.insert(pos, state.schema.nodes.paragraph.create());
              }
              
              found = true;
              return false;
            }
          }
          
          // attachment 노드 확인 (파일)
          else if (node.type.name === 'attachment') {
            if (normalizeUrl(node.attrs.url) === normalizeUrl(mediaUrl)) {
              tr.delete(pos, pos + node.nodeSize);
              
              if (tr.doc.childCount === 0) {
                tr.insert(pos, state.schema.nodes.paragraph.create());
              }
              
              found = true;
              return false;
            }
          }
          
          // HTML 블록 노드 확인 (YouTube iframe 등)
          else if (node.isBlock) {
            const html = node.attrs.innerHTML || node.attrs.html || '';
            
            // YouTube 비디오 검사
            if (matchesYouTubeVideo(html, mediaUrl)) {
              tr.delete(pos, pos + node.nodeSize);
              
              if (tr.doc.childCount === 0) {
                tr.insert(pos, state.schema.nodes.paragraph.create());
              }
              
              found = true;
              return false;
            }
            
            // 일반 HTML에 URL이 포함되어 있는지 확인
            if (html && html.includes(mediaUrl)) {
              tr.delete(pos, pos + node.nodeSize);
              
              if (tr.doc.childCount === 0) {
                tr.insert(pos, state.schema.nodes.paragraph.create());
              }
              
              found = true;
              return false;
            }
          }
          
          return true; // 계속 순회
        });
        
        return found;
      });
      
      // 에디터 포커스 및 업데이트
      if (found) {
        console.log(`✅ 미디어 노드 삭제 성공: ${mediaUrl.substring(0, 20)}...`);
        window.lastEditorDeletionTimestamp = Date.now();
        
        // 에디터 포커스
        setTimeout(() => {
          tiptapEditor.view.focus();
        }, 0);
        
        // 에디터 내용을 폼 필드에 업데이트
        const updatedContent = tiptapEditor.getHTML();
        form.setValue(editorField as any, updatedContent, { shouldValidate: true });
        
        // MediaItems에서도 해당 미디어 제거 (단일 소스 유지)
        removeMediaItem(editorField, mediaUrl);
        
        return true;
      } else {
        console.warn(`⚠️ 미디어 노드를 찾지 못함: ${mediaUrl.substring(0, 20)}...`);
        return false;
      }
    } catch (error) {
      console.error("❌ 에디터에서 미디어 삭제 중 오류:", error);
      return false;
    }
  }, [form, normalizeUrl, removeMediaItem]);
  
  // 에디터에서 미디어를 제거하고 빈 단락 정리하는 함수
  
  // 에디터에서 미디어를 제거하고 빈 단락 정리하는 함수
  const removeMediaAndCleanup = useCallback((fieldName: string, url: string) => {
    return removeMediaFromEditor(fieldName, url);
  }, [removeMediaFromEditor]);

  // 미디어 삭제 핸들러 - 에디터에서 삭제된 미디어를 첨부 파일 목록에서도 제거
  const handleMediaDelete = useCallback((src: string, type: 'image' | 'video' | 'gif' | 'file' | 'youtube', fieldName?: string) => {
    console.log(`미디어 삭제 요청: ${type}, URL: ${src ? src.substring(0, 50) + '...' : 'null'}, 필드: ${fieldName || '미지정'}`);
    
    if (!src) {
      console.error(`미디어 삭제 실패: ${type} - 소스 URL이 없습니다.`);
      return; // src가 없으면 처리 중단
    }
    
    // fieldName이 제공되지 않은 경우 현재 활성화된 에디터 필드 사용
    const targetField = fieldName || currentEditor || '';
    
    const normalizedSrc = normalizeUrl(src);
    console.log(`정규화된 URL: ${normalizedSrc}`);
    
    // 필드가 유효하지 않으면 처리 중단
    if (!targetField) {
      console.error('삭제할 미디어의 필드명이 없습니다.');
      return;
    }

    // 타임스탬프 기록 (중복 삭제 방지용)
    window.lastEditorDeletionTimestamp = Date.now();
    
    // 단일 소스 상태 관리: mediaItems 상태에서 제거
    removeMediaItem(targetField, src);
    
    // 요청 시작 위치에 따라 동기화 결정
    const fromAttachedMedia = !window.lastEditorDeletionTimestamp || 
                              (Date.now() - window.lastEditorDeletionTimestamp > 500);
    
    // 첨부된 미디어 버튼에서 삭제 시 에디터 내용도 함께 삭제
    if (fromAttachedMedia) {
      console.log('첨부된 미디어에서 삭제 요청 -> 에디터 내용 동기화');
      // 에디터에서도 해당 미디어 삭제 
      removeMediaAndCleanup(targetField, src);
    } else {
      console.log('에디터에서 삭제 요청 -> 첨부 미디어만 업데이트');
      // 에디터 내에서 삭제된 경우 타임스탬프 초기화
      window.lastEditorDeletionTimestamp = undefined;
    }

    // 해당 필드의 미디어 파일 목록 업데이트
    setUploadedMediaFiles(prev => {
      // 타입 안전성을 위해 문자열로 확실히 변환
      const fieldKey = String(targetField);
      const fieldFiles = prev[fieldKey] || [];
      console.log(`필드 ${fieldKey}의 파일 수: ${fieldFiles.length}`);
      
      // URL을 정규화하여 비교 (동일한 파일 찾기)
      const updatedFiles = fieldFiles.filter((file: FileWithPreview) => {
        if (!file.preview) return true;
        
        const filePreviewUrl = normalizeUrl(file.preview);
        
        // YouTube URL 특수 처리
        if ((file.preview.includes('youtube.com') || file.preview.includes('youtu.be')) &&
            (src.includes('youtube.com') || src.includes('youtu.be'))) {
          
          // 글로벌 유틸리티 함수 사용
          const fileVideoId = getYouTubeVideoId(file.preview);
          const srcVideoId = getYouTubeVideoId(src);
          
          console.log(`유튜브 비디오 ID 비교: 파일(${fileVideoId}) vs 소스(${srcVideoId})`);
          
          // 비디오 ID가 일치하면 제거
          if (fileVideoId && srcVideoId && fileVideoId === srcVideoId) {
            console.log(`유튜브 미디어 제거: ${file.name || '이름없음'}, ID: ${fileVideoId}`);
            return false;
          }
          
          return true;
        }
        
        // 일반 URL 비교
        const shouldKeep = filePreviewUrl !== normalizedSrc && 
                          !filePreviewUrl.includes(normalizedSrc) && 
                          !normalizedSrc.includes(filePreviewUrl);
        
        if (!shouldKeep) {
          console.log(`미디어 파일 제거: ${file.name || '이름없음'}, 타입: ${type}`);
        }
        
        return shouldKeep;
      });
      
      console.log(`필터링 후 파일 수: ${updatedFiles.length}`);
      
      return {
        ...prev,
        [fieldKey]: updatedFiles
      };
    });
  }, [currentEditor, removeMediaFromEditor]);
  
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
    
    // 단일 소스 미디어 상태 관리: 미디어 아이템 추가
    addMediaItem(currentEditor, {
      url: fileUrl,
      type: type as 'image' | 'video' | 'gif' | 'file',
      name: file.name,
      size: file.size,
      file: file
    });

    try {
      // TipTap 에디터 찾기
      const editorContainer = document.querySelector(`[data-field-name="${currentEditor}"]`);
      if (!editorContainer) {
        throw new Error("에디터 컨테이너를 찾을 수 없음");
      }

      // editorContainer 내부의 TipTap 인스턴스 찾기
      const editorContent = editorContainer.querySelector('.ProseMirror');
      // Try to access editor from various possible locations
      const tiptapEditor = (editorContent as any)?.__vue__?.$parent?._tiptapEditor || 
                         (editorContent as any)?._tiptapEditor;

      // TipTap API를 사용하여 미디어 삽입
      if (tiptapEditor) {
        console.log("TipTap 에디터 인스턴스 찾음:", currentEditor);
        
        switch (type) {
          case 'image':
          case 'gif':
            // 이미지 삽입 후 빈 단락 추가
            tiptapEditor
              .chain()
              .focus()
              .setImage({ src: fileUrl, alt: type === 'image' ? '이미지' : 'GIF' })
              .insertContent('<p><br></p>')
              .run();
            break;
          case 'video':
            // 비디오 삽입 후 빈 단락 추가
            const videoHtml = `<div><video controls width="100%"><source src="${fileUrl}" type="${file.type}"></video></div><p><br></p>`;
            tiptapEditor
              .chain()
              .focus()
              .insertContent(videoHtml)
              .run();
            break;
          case 'file':
            // 파일 링크 삽입 후 빈 단락 추가
            const fileHtml = `<p><a href="${fileUrl}" download="${file.name}" class="tiptap-file-link">${file.name} 다운로드</a></p><p><br></p>`;
            tiptapEditor
              .chain()
              .focus()
              .insertContent(fileHtml)
              .run();
            break;
        }
      } else {
        console.warn("TipTap 에디터를 찾을 수 없어 기존 방식으로 폴백:", currentEditor);
        // 폴백: 기존 방식으로 HTML 추가
        const currentValue = form.getValues(currentEditor as any) || '';
        let newContent = '';
        
        switch (type) {
          case 'image':
          case 'gif':
            newContent = currentValue + `<img src="${fileUrl}" alt="${type === 'image' ? '이미지' : 'GIF'}" class="tiptap-image" /><p><br></p>`;
            break;
          case 'video':
            newContent = currentValue + `<div><video controls width="100%"><source src="${fileUrl}" type="${file.type}"></video></div><p><br></p>`;
            break;
          case 'file':
            newContent = currentValue + `<p><a href="${fileUrl}" download="${file.name}" class="tiptap-file-link">${file.name} 다운로드</a></p><p><br></p>`;
            break;
        }
        
        form.setValue(currentEditor as any, newContent, { shouldValidate: true });
      }
    } catch (error) {
      console.error("TipTap 에디터 접근 중 오류:", error);
      
      // 오류 발생 시 폴백: 직접 HTML 문자열 조작
      const currentValue = form.getValues(currentEditor as any) || '';
      let newContent = '';
      
      switch (type) {
        case 'image':
        case 'gif':
          newContent = currentValue + `<img src="${fileUrl}" alt="${type === 'image' ? '이미지' : 'GIF'}" class="tiptap-image" /><p><br></p>`;
          break;
        case 'video':
          newContent = currentValue + `<div><video controls width="100%"><source src="${fileUrl}" type="${file.type}"></video></div><p><br></p>`;
          break;
        case 'file':
          newContent = currentValue + `<p><a href="${fileUrl}" download="${file.name}" class="tiptap-file-link">${file.name} 다운로드</a></p><p><br></p>`;
          break;
      }
      
      form.setValue(currentEditor as any, newContent, { shouldValidate: true });
    }
    
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

  // URL 제출 핸들러 - URL 입력 시 텍스트 에디터에 삽입 (TipTap 에디터 호환)
  const handleUrlSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || !currentEditor) {
      setUrlInputActive(false);
      return;
    }
    
    try {
      // TipTap 에디터 인스턴스 찾기
      const editorContainer = document.querySelector(`[data-field-name="${currentEditor}"]`);
      if (!editorContainer) {
        throw new Error("에디터 컨테이너를 찾을 수 없음");
      }
      
      // editorContainer 내부의 TipTap 인스턴스 찾기
      const editorContent = editorContainer.querySelector('.ProseMirror');
      // Try to access editor from various possible locations
      const tiptapEditor = (editorContent as any)?.__vue__?.$parent?._tiptapEditor || 
                          (editorContent as any)?._tiptapEditor;
      
      // URL 검증 - 빈 URL이나 공백만 있는 경우 처리하지 않음
      if (!urlInput.trim()) {
        toast({
          title: "URL 오류",
          description: "유효한 URL을 입력해주세요.",
          variant: "destructive"
        });
        setUrlInputActive(false);
        return;
      }
      
      // YouTube URL 감지 및 처리
      const isYouTubeUrl = urlInput.includes('youtube.com') || urlInput.includes('youtu.be');
      const videoId = isYouTubeUrl ? getYouTubeVideoId(urlInput) : '';
      
      if (tiptapEditor) {
        console.log("TipTap 에디터 인스턴스 찾음 (URL 삽입):", currentEditor);
        
        if (isYouTubeUrl && videoId) {
          // YouTube 비디오인 경우
          console.log(`YouTube 비디오 ID 추출됨: ${videoId}`);
          
          // YouTube iframe을 생성
          const youtubeHtml = `<div class="youtube-embed" data-youtube-id="${videoId}">
            <iframe 
              width="100%" 
              height="315" 
              src="https://www.youtube.com/embed/${videoId}" 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen
            ></iframe>
          </div><p><br></p>`;
          
          // 에디터에 삽입
          tiptapEditor.chain().focus().insertContent(youtubeHtml).run();
          
          // YouTube 링크를 중앙 집중식 미디어 관리 시스템에 추가
          const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
          
          // 단일 소스 미디어 아이템 추가
          addMediaItem(currentEditor, {
            url: youtubeUrl,
            type: 'youtube',
            name: `YouTube 비디오: ${videoId}`
          });
          
          toast({
            title: "YouTube 비디오 추가됨",
            description: `비디오 ID: ${videoId}`,
          });
          
        } else {
          // 이미지 URL 감지
          const imageRegex = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
          if (imageRegex.test(urlInput)) {
            // 이미지 URL이면 이미지로 삽입
            tiptapEditor
              .chain()
              .focus()
              .setImage({ src: urlInput, alt: '이미지' })
              .insertContent('<p><br></p>')
              .run();
            
            // 이미지를 단일 소스 미디어 관리 시스템에 추가
            addMediaItem(currentEditor, {
              url: urlInput,
              type: 'image',
              name: 'URL 이미지'
            });
          } else {
            // 일반 URL은 링크로 추가
            tiptapEditor
              .chain()
              .focus()
              .setLink({ href: urlInput })
              .insertContent(`<a href="${urlInput}" target="_blank" rel="noopener noreferrer">${urlInput}</a><p><br></p>`)
              .run();
          }
        }
      } else {
        console.warn("TipTap 에디터를 찾을 수 없어 기존 방식으로 폴백 (URL):", currentEditor);
        // 폴백: 기존 방식으로 HTML 추가
        const currentValue = form.getValues(currentEditor as any) || '';
        let newHtmlContent = '';
        
        // YouTube URL 감지
        const isYouTubeUrl = urlInput.includes('youtube.com') || urlInput.includes('youtu.be');
        const videoId = isYouTubeUrl ? getYouTubeVideoId(urlInput) : '';
        
        if (isYouTubeUrl && videoId) {
          // YouTube 비디오 임베드
          console.log(`폴백: YouTube 비디오 ID 추출됨: ${videoId}`);
          newHtmlContent = `<div class="youtube-embed" data-youtube-id="${videoId}">
          <iframe 
            width="100%" 
            height="315" 
            src="https://www.youtube.com/embed/${videoId}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
          ></iframe>
          </div><p><br></p>`;
          
          // YouTube 링크를 중앙 집중식 미디어 관리 시스템에 추가
          const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
          
          // 단일 소스 미디어 아이템 추가
          addMediaItem(currentEditor, {
            url: youtubeUrl,
            type: 'youtube',
            name: `YouTube 비디오: ${videoId}`
          });
        } else {
          // 이미지 URL 감지
          const imageRegex = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
          if (imageRegex.test(urlInput)) {
            // 이미지 URL이면 HTML 태그로 추가
            newHtmlContent = `<img src="${urlInput}" alt="이미지" class="tiptap-image" /><p><br></p>`;
            
            // 이미지를 단일 소스 미디어 관리 시스템에 추가
            addMediaItem(currentEditor, {
              url: urlInput,
              type: 'image',
              name: 'URL 이미지'
            });
          } else {
            // 일반 URL은 링크로 추가
            newHtmlContent = `<a href="${urlInput}" target="_blank" rel="noopener noreferrer">${urlInput}</a><p><br></p>`;
          }
        }
        
        // 폼 값 업데이트
        form.setValue(currentEditor as any, currentValue + newHtmlContent, { shouldValidate: true });
      }
    } catch (error) {
      console.error("URL 삽입 중 오류:", error);
      
      // 오류 발생 시 폴백: 직접 HTML 삽입
      const currentValue = form.getValues(currentEditor as any) || '';
      let newHtmlContent = '';
      
      // YouTube URL 감지 및 처리 - 글로벌 함수 사용
      const isYouTubeUrl = urlInput.includes('youtube.com') || urlInput.includes('youtu.be');
      const videoId = isYouTubeUrl ? getYouTubeVideoId(urlInput) : '';
      
      if (isYouTubeUrl && videoId) {
        // YouTube 비디오 임베드
        console.log(`폴백: YouTube 비디오 ID 추출됨: ${videoId}`);
        newHtmlContent = `<div class="youtube-embed" data-youtube-id="${videoId}">
        <iframe 
          width="100%" 
          height="315" 
          src="https://www.youtube.com/embed/${videoId}" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen
        ></iframe>
        </div><p><br></p>`;
        
        // YouTube 링크를 중앙 집중식 미디어 관리 시스템에 추가
        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
        
        // 단일 소스 미디어 아이템 추가
        addMediaItem(currentEditor, {
          url: youtubeUrl,
          type: 'youtube',
          name: `YouTube 비디오: ${videoId}`
        });
      } else {
        // 이미지 URL 감지
        const imageRegex = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
        if (imageRegex.test(urlInput)) {
          // 이미지 URL이면 HTML 태그로 추가
          newHtmlContent = `<img src="${urlInput}" alt="이미지" class="tiptap-image" /><p><br></p>`;
          
          // 이미지를 단일 소스 미디어 관리 시스템에 추가
          addMediaItem(currentEditor, {
            url: urlInput,
            type: 'image',
            name: 'URL 이미지'
          });
        } else {
          // 일반 URL은 링크로 추가
          newHtmlContent = `<a href="${urlInput}" target="_blank" rel="noopener noreferrer">${urlInput}</a><p><br></p>`;
        }
      }
      
      // 폼 값 업데이트
      form.setValue(currentEditor as any, currentValue + newHtmlContent, { shouldValidate: true });
    }
    
    // 토스트 표시
    toast({
      title: "URL 추가 완료",
      description: "URL이 에디터에 삽입되었습니다."
    });
    
    setUrlInput('');
    setUrlInputActive(false);
  }, [urlInput, currentEditor, form, toast, addMediaItem]);

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
  
  // 중앙 집중식 미디어 아이템 요약 컴포넌트
  const MediaItemsSummary = ({ fieldName }: { fieldName: string }) => {
    const items = mediaItems[fieldName] || [];
    if (items.length === 0) return null;
    
    return (
      <div className="mt-2 border-t pt-2">
        <p className="text-sm text-muted-foreground mb-2">첨부된 미디어 ({items.length}개)</p>
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => {
            // 아이콘 및 스타일
            let Icon = FileIcon;
            let iconColor = "text-gray-500";
            
            if (item.type === 'image' || item.type === 'gif') {
              Icon = ImageIcon;
              iconColor = "text-blue-500";
            } else if (item.type === 'video' || item.type === 'youtube') {
              Icon = Video;
              iconColor = "text-red-500";
            }
            
            return (
              <div key={index} className="relative group border rounded-md p-2 bg-muted/10 flex items-center space-x-2 text-xs">
                <Icon className={`h-4 w-4 ${iconColor}`} />
                <span className="truncate max-w-[120px]">{item.name || '미디어'}</span>
                {item.size && (
                  <span className="text-muted-foreground">
                    {(item.size / 1024).toFixed(1)}KB
                  </span>
                )}
                <button 
                  type="button"
                  className="ml-1 p-1 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // 미디어 삭제 함수 호출
                    handleMediaDelete(item.url, item.type, fieldName);
                  }}
                  title="삭제"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // 이전 방식 호환성을 위한 레거시 컴포넌트 (추후 제거 가능)
  const AttachedMediaSummary = ({ fieldName }: { fieldName: string }) => {
    const files = uploadedMediaFiles[fieldName] || [];
    if (files.length === 0) return null;
    
    return (
      <div className="mt-2 border-t pt-2">
        <p className="text-sm text-muted-foreground mb-2">첨부된 미디어 (레거시 - {files.length}개)</p>
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
                <button 
                  type="button"
                  className="ml-1 p-1 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // 미디어 삭제 함수 호출
                    if (file.preview) {
                      handleMediaDelete(file.preview, file.type.startsWith('image/') ? 'image' : 'video', fieldName);
                    }
                  }}
                  title="삭제"
                >
                  <X className="h-3 w-3" />
                </button>
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

  // TipTap 기반 리치 미디어 에디터 컴포넌트
  const CustomMediaEditor = ({ 
    value, 
    onChange, 
    placeholder,
    name,
    onImageClick,
    onImageMove,
    editable = true
  }: { 
    value: string; 
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void | Promise<void>;
    placeholder: string;
    name: string;
    onImageClick?: (src: string) => void;
    onImageMove?: (draggedImageSrc: string, targetImageSrc: string, direction: 'before' | 'after') => void;
    editable?: boolean;
  }) => {
    const [inputHeight, setInputHeight] = useState<number>(300);
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
          
          // YouTube URL인지 확인 - 글로벌 함수 사용
          const isYouTubeUrl = match.includes('youtube.com') || match.includes('youtu.be');
          const videoId = isYouTubeUrl ? getYouTubeVideoId(match) : '';
          
          if (isYouTubeUrl && videoId) {
            return `<div class="media-card youtube-embed">
              <iframe 
                width="100%" 
                height="200"
                src="https://www.youtube.com/embed/${videoId}" 
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
    
    // 텍스트 영역 크기 자동 조절
    useEffect(() => {
      if (textareaRef.current) {
        const adjustHeight = () => {
          const textarea = textareaRef.current;
          if (!textarea) return;
          
          // 실제 필요한 높이 계산
          const newHeight = Math.max(textarea.scrollHeight, 300);
          setInputHeight(newHeight);
          
          // 높이 설정
          textarea.style.height = `${newHeight}px`;
          
          // 컨테이너 높이 설정
          if (containerRef.current) {
            containerRef.current.style.height = `${newHeight}px`;
          }
        };
        
        // 초기 높이 조정
        adjustHeight();
        
        // 특히 긴 텍스트나 많은 콘텐츠가 있으면 setTimeout으로 조금 지연해서 한번 더 조정
        setTimeout(adjustHeight, 0);
        
        // 이벤트 리스너 추가
        textareaRef.current.addEventListener('input', adjustHeight);
        
        return () => {
          if (textareaRef.current) {
            textareaRef.current.removeEventListener('input', adjustHeight);
          }
        };
      }
    }, [value]);
    
    // 콘텐츠 처리 및 이벤트 설정
    useEffect(() => {
      const textarea = textareaRef.current;
      const overlay = overlayRef.current;
      if (!textarea || !overlay) return;
      
      // 오버레이에 처리된 내용 표시
      overlay.innerHTML = processContent(value || "");
      
      // 이미지 클릭 및 드래그 이벤트
      const setupImageEvents = () => {
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
      };
      
      // 스크롤 동기화
      const syncScroll = () => {
        if (overlay) {
          overlay.scrollTop = textarea.scrollTop;
        }
      };
      
      // 드롭 이벤트 설정
      const setupDropEvents = () => {
        if (editable && onImageMove) {
          // 드래그 오버 이벤트 (시각적 피드백)
          overlay.addEventListener('dragover', (e) => {
            e.preventDefault();
            
            // 드롭 위치에 시각적 피드백
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
      };
      
      // 이벤트 설정 함수 호출
      setupImageEvents();
      setupDropEvents();
      
      // 스크롤 이벤트 리스너 추가
      textarea.addEventListener('scroll', syncScroll);
      
      // 입력할 때마다 스크롤 동기화
      textarea.addEventListener('input', syncScroll);
      
      // 정리 함수
      return () => {
        textarea.removeEventListener('scroll', syncScroll);
        textarea.removeEventListener('input', syncScroll);
      };
    }, [value, processContent, onImageClick, onImageMove, editable]);
    
    // TipTap 에디터용 onChange 핸들러
    const handleEditorChange = (newValue: string) => {
      // form에 사용될 객체 형태로 변환 (React.ChangeEvent 형태 모방)
      const syntheticEvent = {
        target: { name, value: newValue },
        currentTarget: { name, value: newValue },
        preventDefault: () => {},
        stopPropagation: () => {}
      } as unknown as React.ChangeEvent<HTMLTextAreaElement>;
      
      onChange(syntheticEvent);
    };
    
    // 이미지 업로드 핸들러 (나중에 S3 또는 다른 스토리지 연동 가능)
    const handleImageUpload = async (file: File): Promise<string> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result && typeof e.target.result === 'string') {
            resolve(e.target.result);
          }
        };
        reader.readAsDataURL(file);
      });
    };
    
    return (
      <div className="tiptap-wrapper">
        <TipTapEditor
          value={value}
          onChange={handleEditorChange}
          placeholder={placeholder}
          editable={editable}
          onImageClick={onImageClick}
          onImageUpload={handleImageUpload}
          onMediaDelete={handleMediaDelete}
          fieldName={name}
        />
      </div>
    );
  };
  
  // TipTap 에디터를 사용하는 리치 텍스트 에디터 컴포넌트
  const AutoResizeTextarea = ({ 
    value, 
    onChange, 
    placeholder,
    name,
    onImageClick
  }: { 
    value: string; 
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void | Promise<void>;
    placeholder: string;
    name: string;
    onImageClick?: (src: string) => void;
  }) => {
    // TipTap 에디터용 onChange 핸들러
    const handleEditorChange = (newValue: string) => {
      // form에 사용될 객체 형태로 변환 (React.ChangeEvent 형태 모방)
      const syntheticEvent = {
        target: { name, value: newValue },
        currentTarget: { name, value: newValue },
        preventDefault: () => {},
        stopPropagation: () => {}
      } as unknown as React.ChangeEvent<HTMLTextAreaElement>;
      
      onChange(syntheticEvent);
    };
    
    // 이미지 업로드 핸들러 (나중에 S3 또는 다른 스토리지 연동 가능)
    const handleImageUpload = async (file: File): Promise<string> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result && typeof e.target.result === 'string') {
            resolve(e.target.result);
            
            // 나중에 이미지 업로드 기능과 연동할 수 있도록 상태 업데이트 로직 준비
            if (uploadedMediaFiles[name]) {
              const fileWithPreview = {
                ...file,
                preview: e.target.result
              } as FileWithPreview;
              
              setUploadedMediaFiles(prev => ({
                ...prev,
                [name]: [...prev[name], fileWithPreview]
              }));
            }
          }
        };
        reader.readAsDataURL(file);
      });
    };
    
    return (
      <div className="tiptap-wrapper border rounded-md overflow-hidden">
        <TipTapEditor
          value={value}
          onChange={handleEditorChange}
          placeholder={placeholder}
          editable={true}
          onImageClick={onImageClick || ((src) => {
            toast({
              title: "이미지 선택됨",
              description: "이미지를 편집하는 기능은 곧 추가될 예정입니다.",
            });
          })}
          onImageUpload={handleImageUpload}
          onMediaDelete={handleMediaDelete}
          fieldName={name}
        />
      </div>
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
                                <TipTapEditor
                                  name="assemblyInstructions"
                                  fieldName="assemblyInstructions"
                                  placeholder="단계별 조립 방법을 상세히 설명해주세요. 이미지 버튼을 클릭하여 이미지를 첨부할 수 있습니다."
                                  value={field.value || ""}
                                  onChange={(html) => field.onChange(html)}
                                  hideLinkButton={true}
                                  onImageClick={(src) => {
                                    toast({
                                      title: "이미지 선택됨",
                                      description: "이미지를 편집하는 기능은 곧 추가될 예정입니다.",
                                    });
                                  }}
                                  onMediaDelete={(src, type) => handleMediaDelete(src, type, "assemblyInstructions")}
                                />
                                <MediaItemsSummary fieldName="assemblyInstructions" />
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
                                <TipTapEditor
                                  name="howToUse"
                                  fieldName="howToUse"
                                  placeholder="하드웨어 사용 방법과 주의사항을 설명해주세요."
                                  value={field.value || ""}
                                  onChange={(html) => field.onChange(html)}
                                  hideLinkButton={true}
                                  onImageClick={(src) => {
                                    toast({
                                      title: "이미지 선택됨",
                                      description: "이미지를 편집하는 기능은 곧 추가될 예정입니다.",
                                    });
                                  }}
                                  onMediaDelete={(src, type) => handleMediaDelete(src, type, "howToUse")}
                                />
                                <MediaItemsSummary fieldName="howToUse" />
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
                              <TipTapEditor
                                name="howToUse"
                                fieldName="howToUse"
                                placeholder="설치 방법과 사용법을 설명해주세요."
                                value={field.value || ""}
                                onChange={(html) => field.onChange(html)}
                                hideLinkButton={true}
                                onImageClick={(src) => {
                                  toast({
                                    title: "이미지 선택됨",
                                    description: "이미지를 편집하는 기능은 곧 추가될 예정입니다.",
                                  });
                                }}
                                onMediaDelete={(src, type) => handleMediaDelete(src, type, "howToUse")}
                              />
                              <MediaItemsSummary fieldName="howToUse" />
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
                                <TipTapEditor
                                  name="assemblyInstructions"
                                  fieldName="assemblyInstructions" 
                                  placeholder="3D 모델의 조립 방법과 단계를 설명해주세요."
                                  value={field.value || ""}
                                  onChange={(html) => field.onChange(html)}
                                  hideLinkButton={true}
                                  onImageClick={(src) => {
                                    toast({
                                      title: "이미지 선택됨",
                                      description: "이미지를 편집하는 기능은 곧 추가될 예정입니다.",
                                    });
                                  }}
                                  onMediaDelete={(src, type) => handleMediaDelete(src, type, "assemblyInstructions")}
                                />
                                <MediaItemsSummary fieldName="assemblyInstructions" />
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
                                <TipTapEditor
                                  name="howToUse"
                                  fieldName="howToUse"
                                  placeholder="3D 모델 프린팅 설정과 사용 방법을 설명해주세요."
                                  value={field.value || ""}
                                  onChange={(html) => field.onChange(html)}
                                  hideLinkButton={true}
                                  onImageClick={(src) => {
                                    toast({
                                      title: "이미지 선택됨",
                                      description: "이미지를 편집하는 기능은 곧 추가될 예정입니다.",
                                    });
                                  }}
                                  onMediaDelete={(src, type) => handleMediaDelete(src, type, "howToUse")}
                                />
                                <MediaItemsSummary fieldName="howToUse" />
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
                              <TipTapEditor
                                name="howToUse"
                                fieldName="howToUse"
                                placeholder="사용 방법과 특징을 설명해주세요."
                                value={field.value || ""}
                                onChange={(html) => field.onChange(html)}
                                hideLinkButton={true}
                                onImageClick={(src) => {
                                  toast({
                                    title: "이미지 선택됨",
                                    description: "이미지를 편집하는 기능은 곧 추가될 예정입니다.",
                                  });
                                }}
                                onMediaDelete={(src, type) => handleMediaDelete(src, type, "howToUse")}
                              />
                              <MediaItemsSummary fieldName="howToUse" />
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