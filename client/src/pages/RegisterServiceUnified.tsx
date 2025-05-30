import React, { useState, useRef, useEffect } from "react";
import { useLocation as useWouterLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ServiceType } from "@shared/schema";
import { useLocation } from "@/contexts/LocationContext"; 
import { useLanguage } from "@/contexts/LanguageContext";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Upload,
  Image as ImageIcon,
  MapPin,
  Wrench,
  X,
  Plus,
  Phone,
  Mail,
  Clock,
  DollarSign,
  FileBox,
  Printer,
  User,
  Building,
  Hexagon,
  Info,
  Check,
  Gift,
  CreditCard,
  AlertCircle as InfoIcon,
  AlertCircle
} from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// 파일 형식 옵션 (3D 프린터용)
const fileFormatOptions = [
  "STL", "OBJ", "AMF", "3MF", "STEP", "IGES", "X3D", "PLY", "FBX", "GCODE", "기타"
];

// 재료 옵션 (3D 프린터용)
const materialOptions = [
  "PLA", "ABS", "PETG", "TPU", "Nylon", "PC (폴리카보네이트)", 
  "PEEK", "PVA", "HIPS", "ASA", "Carbon Fiber", "Wood Fill", 
  "Metal Fill", "Ceramic", "Resin", "기타"
];

// 전문 분야 옵션 (엔지니어용)
const specializationOptions = [
  "전체", "전자공학", "기계공학", "소프트웨어 개발", "3D 모델링", 
  "PCB 설계", "임베디드 시스템", "로봇공학", "AI/ML", 
  "양자 컴퓨팅", "뉴럴 인터페이스", "자동화", "IoT", "생성형 AI", 
  "나노 기술", "생체공학", "생산 엔지니어링", "품질 관리", "기타"
];

// 생산 품목 옵션 (생산업체용)
const productionItemOptions = [
  "전체", "스마트 장치", "AI 시스템", "모듈형 로봇", "바이오닉 부품",
  "홀로그램 디스플레이", "3D 프린팅 구조물", "스마트 소재", "친환경 제품", 
  "웨어러블 기기", "드론 및 자율 이동체", "의료 장비", "첨단 가전", 
  "에너지 시스템", "고효율 배터리", "나노 소재", "기타"
];

// 서비스 유형 별 라벨
const serviceTypeLabels: { value: ServiceType; label: string; icon: any }[] = [
  { value: "3d_printing", label: "3D 프린터", icon: Printer },
  { value: "engineer", label: "엔지니어", icon: User },
  { value: "manufacturing", label: "생산 서비스", icon: Building },
];

// 서비스 등록 폼 스키마
const baseServiceFormSchema = z.object({
  title: z.string().min(1, {
    message: '제목을 입력해주세요',
  }).optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  serviceType: z.enum(["3d_printing", "manufacturing", "engineer", "electronics", "woodworking", "metalworking"]),
  printerModel: z.string().optional().or(z.literal("")),
  contactPhone: z.string().optional().or(z.literal("")),
  contactEmail: z.string().email({
    message: '유효한 이메일을 입력해주세요',
  }).optional().or(z.literal("")),
  pricing: z.string().optional().or(z.literal("")),
  availableHours: z.string().optional().or(z.literal("")),
  isIndividual: z.boolean().default(true),
  isFreeService: z.boolean().default(true), // 기본값을 true로 변경
  tags: z.union([
    z.string().transform(val => val ? val.split(',').map(tag => tag.trim()) : []),
    z.array(z.string()),
    z.undefined()
  ]).optional(),
  address: z.string().optional().or(z.literal("")),
  latitude: z.number().optional().or(z.literal(0)),
  longitude: z.number().optional().or(z.literal(0)),
  nickname: z.string().optional().or(z.literal("")),
  hourlyRate: z.string().optional().or(z.literal("")),
  portfolioUrl: z.string().url("유효한 URL을 입력하세요").optional().or(z.literal("")),
  experience: z.number().optional().or(z.literal(0)),
});

// 무료 서비스와 유료 서비스에 따른 검증 로직을 refinement로 추가
const serviceFormSchema = baseServiceFormSchema.refine(
  (data) => {
    // 유료 서비스인 경우에만 필수 필드 검증
    if (!data.isFreeService) {
      return !!data.title && !!data.description;
    }
    // 무료 서비스는 모든 필드가 선택사항
    return true;
  },
  {
    message: "유료 서비스는 제목과 설명이 필수입니다",
    path: ["title"], // 에러를 표시할 필드
  }
);

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

interface RegisterServiceUnifiedProps {
  defaultType?: ServiceType;
}

export default function RegisterServiceUnified({ defaultType }: RegisterServiceUnifiedProps) {
  const { toast } = useToast();
  const [, navigate] = useWouterLocation();
  const location = useWouterLocation()[0];
  const params = location.split('/').pop(); // 간단히 마지막 세그먼트를 추출
  const { user, isLoading: isAuthLoading } = useAuth();
  const { currentLocation, getLocation } = useLocation();
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sampleInputsRef = useRef<HTMLInputElement>(null);
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedTab, setSelectedTab] = useState("basic");
  // defaultType prop이 있다면 그 값을 초기 상태로 사용
  const [serviceType, setServiceType] = useState<ServiceType>(defaultType || "3d_printing");
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [isPremiumService, setIsPremiumService] = useState(false);
  // 여러 주소 관리를 위한 상태
  const [locationList, setLocationList] = useState<{lat: number; long: number; address: string}[]>([]);
  
  // 빈 배열로 초기화하여 페이지 최초 접속 시 선택된 항목이 없도록 함
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedFileFormats, setSelectedFileFormats] = useState<string[]>([]);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [otherMaterialInput, setOtherMaterialInput] = useState<string>('');
  const [otherSpecializationInput, setOtherSpecializationInput] = useState<string>('');
  const [otherProductInput, setOtherProductInput] = useState<string>('');
  
  const [sampleImages, setSampleImages] = useState<{ file: File; preview: string }[]>([]);
  
  // URL params로부터 서비스 타입 가져오기
  useEffect(() => {
    // URL에서 타입 파라미터 추출 시도
    if (params && typeof params === 'string') {
      const paramType = params as ServiceType;
      if (["3d_printing", "engineer", "manufacturing", "electronics", "woodworking", "metalworking"].includes(paramType)) {
        setServiceType(paramType);
        form.setValue("serviceType", paramType);
      }
    }
  }, [params]);

  // 폼 설정
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      title: '',
      description: '',
      serviceType: serviceType,
      printerModel: '',
      contactPhone: '',
      contactEmail: user?.email || '',
      pricing: '무료',
      availableHours: '평일 10:00-18:00',
      isIndividual: true,
      isFreeService: true, // 기본적으로 무료 서비스로 시작
      tags: [], // 페이지 최초 접속 시 빈 태그 배열로 설정
      address: '',
      latitude: 0,
      longitude: 0,
      nickname: user?.username || '',
    },
  });

  // 위치 정보 사용 토글
  const handleLocationToggle = async (checked: boolean) => {
    setUseCurrentLocation(checked);
    if (checked) {
      await getLocation();
      if (currentLocation) {
        form.setValue('latitude', currentLocation.lat);
        form.setValue('longitude', currentLocation.long);
        
        // 현재 위치는 일단 표시하되, 바로 추가하지는 않음
        // 사용자가 추가 정보를 입력할 수 있도록 함
        const detailAddress = currentLocation.address;
        form.setValue('address', detailAddress);
        setAddressInput(detailAddress);
        
        // 위치 감지 완료 - 팝업 메시지 없이 진행
      } else {
        // 위치 정보를 가져올 수 없음 - 팝업 없이 처리
        setUseCurrentLocation(false);
      }
    }
  };

  // 주소 수동 입력
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressInput(e.target.value);
    form.setValue('address', e.target.value);
  };

  // 서비스 타입 변경 이벤트
  const handleServiceTypeChange = (value: ServiceType) => {
    setServiceType(value);
    form.setValue("serviceType", value);
    // 서비스 타입에 따라 필요한 리셋 작업 수행
    if (value === "3d_printing") {
      setSelectedSpecializations([]);
      setSelectedCapabilities([]);
    } else if (value === "engineer") {
      setSelectedMaterials([]);
      setSelectedFileFormats([]);
      setSelectedCapabilities([]);
    } else if (value === "manufacturing") {
      setSelectedMaterials([]);
      setSelectedFileFormats([]);
      setSelectedSpecializations([]);
    }
  };

  // 이미지 선택 핸들러
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 파일 크기 초과 - 팝업 없이 조용히 무시
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

  // 샘플 이미지 선택 핸들러 (3D 프린터용)
  const handleSampleImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newSampleImages: { file: File; preview: string }[] = [];
      
      Array.from(files).forEach((file) => {
        if (file.size > 5 * 1024 * 1024) {
          // 파일 크기 초과 - 팝업 없이 조용히 무시
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newSampleImages.push({
              file,
              preview: event.target.result as string
            });
            
            if (newSampleImages.length === Array.from(files).length) {
              setSampleImages(prev => [...prev, ...newSampleImages]);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // 샘플 이미지 제거 핸들러
  const removeSampleImage = (index: number) => {
    setSampleImages(prev => prev.filter((_, i) => i !== index));
  };

  // 체크박스 토글 핸들러
  const toggleCheckbox = (array: string[], setArray: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    if (array.includes(value)) {
      setArray(array.filter(item => item !== value));
    } else {
      setArray([...array, value]);
    }
  };

  // 서비스 등록 API 요청
  const registerServiceMutation = useMutation({
    mutationFn: async (data: ServiceFormValues) => {
      try {
        // 서비스 데이터 준비 - JSON으로 전송
        const serviceData: any = {
          title: data.title || '',
          description: data.description || '',
          serviceType: data.serviceType || '',
          isIndividual: data.isIndividual,
          isFreeService: data.isFreeService,
          tags: Array.isArray(data.tags) ? data.tags : [],
          contactPhone: data.contactPhone || '',
          contactEmail: data.contactEmail || '',
          pricing: data.pricing || '',
          availableHours: data.availableHours || ''
        };

        // 위치 정보 추가
        if (useCurrentLocation && currentLocation) {
          // 현재 위치 사용
          serviceData.location = currentLocation;
          // 위치 목록이 있다면 추가 (최대 5개까지만)
          serviceData.locationList = [currentLocation];
        } else if (locationList.length > 0) {
          // 첫 번째 주소를 기본 위치로 설정
          serviceData.location = locationList[0];
          // 여러 주소 목록 추가 (최대 5개까지만)
          serviceData.locationList = locationList.slice(0, 5);
        } else {
          // 주소 입력이 없는 경우 기본값 설정
          serviceData.location = {
            lat: data.latitude || form.getValues('latitude'),
            long: data.longitude || form.getValues('longitude'),
            address: addressInput || data.address || ''
          };
          serviceData.locationList = [];
        }

        // 서비스 유형별 특화 필드 추가
        if (data.serviceType === '3d_printing') {
          serviceData.printerModel = data.printerModel || '';
          serviceData.materials = selectedMaterials;
          serviceData.fileFormats = selectedFileFormats;
        } 
        else if (data.serviceType === 'engineer') {
          serviceData.specialty = selectedSpecializations.join(',');
          serviceData.otherSpecialty = selectedSpecializations.includes('기타') ? otherSpecializationInput : '';
          serviceData.experience = data.experience || 0;
          serviceData.portfolioUrl = data.portfolioUrl || '';
          serviceData.hourlyRate = data.hourlyRate || 0;
          serviceData.availableItems = selectedServices.join(',');
        } 
        else if (data.serviceType === 'manufacturing') {
          serviceData.availableItems = selectedCapabilities.join(',');
          serviceData.otherItems = selectedCapabilities.includes('기타') ? otherProductInput : '';
        }
        else if (data.serviceType === 'electronics' || 
                 data.serviceType === 'woodworking' || 
                 data.serviceType === 'metalworking') {
          serviceData.specialty = selectedSpecializations.join(',');
          serviceData.otherSpecialty = selectedSpecializations.includes('기타') ? otherSpecializationInput : '';
        }

        // 이미지 URL 설정 (향후 실제 파일 업로드로 대체 필요)
        serviceData.imageUrl = 'https://via.placeholder.com/500x300?text=Service+Image';

        console.log('서비스 등록 데이터:', serviceData);

        // API 요청 (JSON 형식으로 전송)
        const response = await fetch('/api/services', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(serviceData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          // 여기서 응답을 상세히 처리할 수 있도록 에러 객체에 response 추가
          const error = new Error(errorData.message || '서비스 등록에 실패했습니다');
          // @ts-ignore - 에러 객체를 확장하여 onError에서 더 많은 정보를 사용할 수 있게 함
          error.response = { 
            status: response.status, 
            data: errorData 
          };
          throw error;
        }
        
        return await response.json();
      } catch (error) {
        console.error('서비스 등록 에러:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // 팝업 메시지 없이 조용히 처리
      console.log('서비스 등록 성공 응답 데이터:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      queryClient.invalidateQueries({
        queryKey: [`/api/services/type/${serviceType}`],
      });
      
      // 서비스 상세 페이지로 이동 (또는 카테고리 페이지)
      if (data && data.id) {
        // 데이터의 ID 값이 유효한지 확인 및 명시적 숫자 변환
        const serviceId = parseInt(data.id.toString(), 10);
        console.log(`서비스 등록 성공, ID: ${serviceId}, 타입: ${typeof serviceId}`);
        
        if (!isNaN(serviceId) && serviceId > 0) {
          // 서비스 상세 페이지로 이동 (ID 경로 패턴 수정 이후 작동함)
          navigate(`/services/${serviceId}`);
          return;
        }
      }
      
      // ID가 유효하지 않으면 서비스 타입 목록 페이지로 이동
      navigate(`/services/type/${serviceType}`);
    },
    onError: (error: any) => {
      console.error('서비스 등록 실패:', error);
      
      // 인증 관련 에러인지 확인
      if (error.response && error.response.data && error.response.data.verificationType === 'required') {
        // 인증 필요 에러인 경우 사용자에게 알리기만 함
        toast({
          title: "유료 서비스 등록 불가",
          description: error.response.data.message || "유료 서비스를 등록하기 위해서는 본인 인증이 필요합니다.",
          variant: "destructive",
        });
      } else {
        // 일반 에러인 경우
        toast({
          title: "서비스 등록 실패",
          description: error.message || "서비스 등록 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    },
  });

  // 폼 제출 처리
  const onSubmit = async (data: ServiceFormValues) => {
    // 유료 서비스인데 로그인하지 않은 경우에만 로그인 필요
    if (!data.isFreeService && !user) {
      toast({
        title: '유료 서비스 등록 제한',
        description: '유료 서비스를 등록하려면 본인인증과 계좌등록이 필요합니다. 로그인 후 진행해주세요.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }
    
    // 무료 서비스는 비회원도 등록 가능

    // 위치 정보가 없으면 기본값을 설정 (서울 중심부로 설정)
    if (data.latitude === 0 || data.longitude === 0) {
      // 위치를 추가하지 않고 계속 진행할 수 있도록 기본값 설정
      form.setValue('latitude', 37.5665);
      form.setValue('longitude', 126.9780);
      form.setValue('address', '서울특별시');
      
      // 기본 위치 정보로 데이터 업데이트
      data.latitude = 37.5665;
      data.longitude = 126.9780;
      data.address = '서울특별시';
    }

    registerServiceMutation.mutate(data);
  };

  // 로딩 중 표시
  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // 유료 서비스 여부 확인 (가격 설정 필드 변경 시)
  const handlePricingChange = (isFree: boolean) => {
    form.setValue('isFreeService', isFree);
    setIsPremiumService(!isFree);
  };

  // 알림 메시지 (유료 서비스 등록 시 로그인 필요)
  const PremiumServiceAlert = () => {
    return (
      <Alert className={`mb-6 ${(isPremiumService && !user) ? 'block' : 'hidden'}`}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>
          {language === 'ko' ? '유료 서비스 안내' : 
           language === 'jp' ? '有料サービスのご案内' : 
           'Premium Service Notice'}
        </AlertTitle>
        <AlertDescription>
          {language === 'ko' ? '유료 서비스를 제공하려면 본인인증과 계좌등록이 필요합니다. 로그인 후 등록해주세요.' : 
           language === 'jp' ? '有料サービスを提供するには本人確認と口座登録が必要です。ログイン後に登録してください。' : 
           'Identity verification and account registration are required to provide paid services. Please log in to register.'}
          <Button
            variant="link"
            className="p-0 ml-2"
            onClick={() => navigate('/login')}
          >
            {language === 'ko' ? '로그인하기' : 
             language === 'jp' ? 'ログインする' : 
             'Log in'}
          </Button>
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <PremiumServiceAlert />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {language === 'ko' ? '서비스 등록' : 
           language === 'jp' ? 'サービス登録' : 
           'Service Registration'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {language === 'ko' ? '여러분의 서비스를 등록하고 다른 사용자들과 연결해보세요' : 
           language === 'jp' ? 'あなたのサービスを登録して他のユーザーとつながりましょう' : 
           'Register your service and connect with other users'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'ko' ? '서비스 정보' : 
                 language === 'jp' ? 'サービス情報' : 
                 'Service Information'}
              </CardTitle>
              <CardDescription>
                {language === 'ko' ? '귀하의 서비스 정보와 조건을 입력해주세요' : 
                 language === 'jp' ? 'サービス情報と条件を入力してください' : 
                 'Enter your service information and conditions'}
              </CardDescription>

              {/* 서비스 유형 선택 */}
              <div className="pt-4">
                <div className="text-sm font-medium mb-2">
                  {language === 'ko' ? '서비스 유형 선택' : 
                   language === 'jp' ? 'サービスタイプの選択' : 
                   'Select Service Type'}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {serviceTypeLabels.map(({ value, label, icon: Icon }) => {
                    // 서비스 라벨 다국어 지원
                    let localizedLabel = label;
                    if (value === "3d_printing") {
                      localizedLabel = language === 'ko' ? '3D 프린터' : 
                                       language === 'jp' ? '3Dプリンター' : 
                                       '3D Printer';
                    } else if (value === "engineer") {
                      localizedLabel = language === 'ko' ? '엔지니어' : 
                                       language === 'jp' ? 'エンジニア' : 
                                       'Engineer';
                    } else if (value === "manufacturing") {
                      localizedLabel = language === 'ko' ? '생산 서비스' : 
                                       language === 'jp' ? '製造サービス' : 
                                       'Manufacturing';
                    }
                    
                    return (
                      <div
                        key={value}
                        className={`border rounded-md p-3 cursor-pointer transition-colors flex items-center ${
                          serviceType === value
                            ? "border-primary bg-primary/5"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => handleServiceTypeChange(value)}
                      >
                        <div className={`mr-2 ${serviceType === value ? "text-primary" : ""}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className={`text-sm ${serviceType === value ? "font-medium" : ""}`}>
                          {localizedLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* 서비스 이미지 */}
                  <div className="space-y-3">
                    <FormLabel>
                      {language === 'ko' ? '서비스 대표 이미지' : 
                       language === 'jp' ? 'サービス代表イメージ' : 
                       'Service Image'}
                    </FormLabel>
                    <div className="border rounded-md p-4 text-center flex flex-col items-center justify-center min-h-[200px]">
                      {imagePreview ? (
                        <div className="relative w-full h-full">
                          <img
                            src={imagePreview}
                            alt={language === 'ko' ? '미리보기' : 
                                language === 'jp' ? 'プレビュー' : 
                                'Preview'}
                            className="max-h-[180px] max-w-full object-contain mx-auto"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              setImagePreview(null);
                              setImageFile(null);
                              if (fileInputRef.current) {
                                fileInputRef.current.value = "";
                              }
                            }}
                          >
                            <X className="h-4 w-4 mr-1" />
                            {language === 'ko' ? '제거' : 
                             language === 'jp' ? '削除' : 
                             'Remove'}
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="flex flex-col items-center justify-center cursor-pointer"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground mb-1">
                            {language === 'ko' ? '클릭하여 이미지 업로드' : 
                             language === 'jp' ? 'クリックして画像をアップロード' : 
                             'Click to upload image'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {language === 'ko' ? 'PNG, JPG, GIF (최대 5MB)' : 
                             language === 'jp' ? 'PNG、JPG、GIF（最大5MB）' : 
                             'PNG, JPG, GIF (max 5MB)'}
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageSelect}
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {language === 'ko' ? '서비스 제목' : 
                           language === 'jp' ? 'サービスタイトル' : 
                           'Service Title'}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={
                              language === 'ko' 
                                ? (serviceType === "3d_printing" 
                                  ? "예: 강남 프로페셔널 3D 프린팅 서비스" 
                                  : "예: 전자회로 설계 및 PCB 제작 서비스")
                              : language === 'jp'
                                ? (serviceType === "3d_printing"
                                  ? "例：ソウル江南専門3Dプリントサービス"
                                  : "例：電子回路設計およびPCB製作サービス")
                                : (serviceType === "3d_printing"
                                  ? "Example: Seoul Professional 3D Printing Services"
                                  : "Example: Electronic Circuit Design and PCB Manufacturing")
                            }
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {language === 'ko' ? '지역명과 특징을 포함하면 검색에 유리합니다' : 
                           language === 'jp' ? '地域名と特徴を含めると検索に有利です' : 
                           'Including location name and features improves searchability'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {language === 'ko' ? '서비스 설명' : 
                           language === 'jp' ? 'サービス説明' : 
                           'Service Description'}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={
                              language === 'ko' ? "제공하는 서비스, 특장점, 재료 등에 대해 상세히 작성해주세요" :
                              language === 'jp' ? "提供するサービス、特徴、材料などについて詳細に記入してください" :
                              "Please describe in detail the services, features, materials, etc. that you provide"
                            }
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 3D 프린터 특화 필드 */}
                  {serviceType === "3d_printing" && (
                    <>
                      <FormField
                        control={form.control}
                        name="printerModel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>3D 프린터 모델</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="예: Prusa i3 MK3S+"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              사용 중인 3D 프린터 모델명을 입력해주세요 (선택사항)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* 지원 파일 형식 */}
                      <div className="space-y-3">
                        <FormLabel>지원 파일 형식</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {fileFormatOptions.map(format => (
                            <div key={format} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`format-${format}`} 
                                checked={selectedFileFormats.includes(format)}
                                onCheckedChange={() => toggleCheckbox(selectedFileFormats, setSelectedFileFormats, format)}
                              />
                              <label
                                htmlFor={`format-${format}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {format}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 사용 가능한 재료 */}
                      <div className="space-y-3">
                        <FormLabel>사용 가능한 재료</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {materialOptions.map(material => (
                            <div key={material} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`material-${material}`} 
                                checked={selectedMaterials.includes(material)}
                                onCheckedChange={() => toggleCheckbox(selectedMaterials, setSelectedMaterials, material)}
                              />
                              <label
                                htmlFor={`material-${material}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {material}
                              </label>
                            </div>
                          ))}
                        </div>
                        
                        {selectedMaterials.includes('기타') && (
                          <div className="mt-2">
                            <Input
                              placeholder="기타 재료를 입력해주세요"
                              value={otherMaterialInput}
                              onChange={(e) => setOtherMaterialInput(e.target.value)}
                            />
                          </div>
                        )}
                      </div>

                      {/* 샘플 이미지 */}
                      <div className="space-y-3">
                        <FormLabel>결과물 샘플 이미지</FormLabel>
                        <div className="flex flex-wrap gap-4">
                          {sampleImages.map((sample, index) => (
                            <div key={index} className="relative w-24 h-24 border rounded-md overflow-hidden">
                              <img 
                                src={sample.preview} 
                                alt={`샘플 ${index+1}`} 
                                className="w-full h-full object-cover"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-0 right-0 w-6 h-6 p-0"
                                onClick={() => removeSampleImage(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          <div className="w-24 h-24 border border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer"
                            onClick={() => sampleInputsRef.current?.click()}
                          >
                            <Plus className="h-6 w-6 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground mt-1">추가</span>
                            <input
                              type="file"
                              ref={sampleInputsRef}
                              className="hidden"
                              accept="image/*"
                              multiple
                              onChange={handleSampleImagesSelect}
                            />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          샘플 이미지는 이전에 진행한 프로젝트나 결과물을 보여주는 이미지입니다.
                        </p>
                      </div>
                    </>
                  )}

                  {/* 엔지니어 특화 필드 */}
                  {serviceType === "engineer" && (
                    <>
                      <FormField
                        control={form.control}
                        name="hourlyRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>시간당 요금</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="예: 50,000원/시간"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              서비스 제공에 대한 시간당 요금을 입력해주세요
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* 전문 분야 */}
                      <div className="space-y-3">
                        <FormLabel>전문 분야</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {specializationOptions.map(specialization => (
                            <div key={specialization} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`spec-${specialization}`} 
                                checked={selectedSpecializations.includes(specialization)}
                                onCheckedChange={() => toggleCheckbox(selectedSpecializations, setSelectedSpecializations, specialization)}
                              />
                              <label
                                htmlFor={`spec-${specialization}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {specialization}
                              </label>
                            </div>
                          ))}
                        </div>
                        
                        {selectedSpecializations.includes('기타') && (
                          <div className="mt-2">
                            <Input
                              placeholder="기타 전문 분야를 입력해주세요"
                              value={otherSpecializationInput}
                              onChange={(e) => setOtherSpecializationInput(e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* 제조업체 특화 필드 */}
                  {serviceType === "manufacturing" && (
                    <>
                      {/* 생산 품목 */}
                      <div className="space-y-3">
                        <FormLabel>생산 품목</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {productionItemOptions.map(item => (
                            <div key={item} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`item-${item}`} 
                                checked={selectedCapabilities.includes(item)}
                                onCheckedChange={() => toggleCheckbox(selectedCapabilities, setSelectedCapabilities, item)}
                              />
                              <label
                                htmlFor={`item-${item}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {item}
                              </label>
                            </div>
                          ))}
                        </div>
                        
                        {selectedCapabilities.includes('기타') && (
                          <div className="mt-2">
                            <Input
                              placeholder="기타 생산 품목을 입력해주세요"
                              value={otherProductInput}
                              onChange={(e) => setOtherProductInput(e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>태그</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={serviceType === "3d_printing" 
                              ? "예: PLA,ABS,시제품,소량생산 (쉼표로 구분)" 
                              : "예: PCB설계,하드웨어,프로토타입 (쉼표로 구분)"}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          검색 최적화를 위해 관련 키워드를 태그로 추가하세요
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>연락처</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="예: 010-1234-5678"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>이메일</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="예: your@email.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="isFreeService"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base mb-2">서비스 유형</FormLabel>
                        <FormDescription className="mb-3">
                          무료 서비스는 인증 요구사항이 없으나, 유료 서비스는 본인 인증 및 계좌 등록이 필요합니다.
                        </FormDescription>
                        <FormControl>
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <div 
                              className={`cursor-pointer border rounded-lg p-4 ${field.value ? 'border-primary bg-primary/5' : 'border-border'}`}
                              onClick={() => {
                                field.onChange(true);
                                form.setValue("pricing", "무료");
                                handlePricingChange(true);
                              }}
                            >
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center">
                                  <Gift className="mr-2 h-5 w-5 text-primary" />
                                  <h3 className="font-medium">무료 서비스</h3>
                                </div>
                                {field.value && <Check className="h-5 w-5 text-primary" />}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                무료로 제공하는 서비스입니다
                              </p>
                            </div>
                            
                            <div 
                              className={`cursor-pointer border rounded-lg p-4 ${!field.value ? 'border-primary bg-primary/5' : 'border-border'}`}
                              onClick={() => {
                                field.onChange(false);
                                // 서비스 유형에 따라 적절한 기본 가격 템플릿 설정
                                if (serviceType === "3d_printing") {
                                  form.setValue("pricing", "10g당 1,000원, 기본 출력비 5,000원 + 재료비");
                                } else if (serviceType === "engineer") {
                                  form.setValue("pricing", "시간당 50,000원, 최소 작업 시간 1시간");
                                } else {
                                  form.setValue("pricing", "기본 서비스 20,000원부터, 작업량에 따라 추가 비용");
                                }
                                handlePricingChange(false);
                              }}
                            >
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center">
                                  <CreditCard className="mr-2 h-5 w-5 text-primary" />
                                  <h3 className="font-medium">유료 서비스</h3>
                                </div>
                                {!field.value && <Check className="h-5 w-5 text-primary" />}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                유료로 제공하는 서비스입니다
                              </p>
                            </div>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {!form.watch("isFreeService") && (
                    <>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                        <h3 className="text-sm font-medium text-amber-800 mb-2 flex items-center">
                          <InfoIcon className="h-4 w-4 mr-1" /> 유료 서비스 인증 요구사항
                        </h3>
                        <p className="text-sm text-amber-700 mb-2">
                          유료 서비스를 제공하기 위해서는 다음 절차를 완료해야 합니다:
                        </p>
                        <ul className="text-xs text-amber-700 list-disc pl-5 space-y-1">
                          <li>휴대폰 본인 인증</li>
                          <li>계좌 정보 등록 및 인증</li>
                        </ul>
                      </div>

                      <FormField
                        control={form.control}
                        name="pricing"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>가격 정책</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="예: 10g당 1,000원, 기본 출력비 5,000원 + 재료비"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              가격 책정 방식을 명확하게 작성해주세요
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <FormField
                    control={form.control}
                    name="availableHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>이용 가능 시간</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="예: 평일 10:00-18:00, 주말 예약제"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isIndividual"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">서비스 제공자 유형</FormLabel>
                        <FormDescription>
                          개인이 제공하는 서비스인지, 업체에서 제공하는 서비스인지 선택해주세요
                        </FormDescription>
                        <FormControl>
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <div 
                              className={`cursor-pointer border rounded-lg p-4 ${field.value ? 'border-primary bg-primary/5' : 'border-border'}`}
                              onClick={() => field.onChange(true)}
                            >
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center">
                                  <User className="mr-2 h-5 w-5 text-primary" />
                                  <h3 className="font-medium">개인 서비스</h3>
                                </div>
                                {field.value && <Check className="h-5 w-5 text-primary" />}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                개인이 제공하는 서비스입니다
                              </p>
                            </div>
                            
                            <div 
                              className={`cursor-pointer border rounded-lg p-4 ${!field.value ? 'border-primary bg-primary/5' : 'border-border'}`}
                              onClick={() => field.onChange(false)}
                            >
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center">
                                  <Building className="mr-2 h-5 w-5 text-primary" />
                                  <h3 className="font-medium">업체 서비스</h3>
                                </div>
                                {!field.value && <Check className="h-5 w-5 text-primary" />}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                회사 또는 업체에서 제공하는 서비스입니다
                              </p>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="border rounded-lg p-4 space-y-4">
                    <div>
                      <h3 className="font-medium">위치 정보</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        서비스 제공 위치를 입력해주세요
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="mb-2">
                          <Input
                            id="address-input"
                            placeholder="정확한 주소를 입력해주세요"
                            value={addressInput}
                            onChange={handleAddressChange}
                          />
                        </div>
                        <div className="flex space-x-2 mb-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              // 현재 위치 가져오기
                              await getLocation();
                              if (currentLocation) {
                                setAddressInput(currentLocation.address);
                              } else {
                                toast({
                                  title: "위치 정보를 가져올 수 없습니다",
                                  description: "수동으로 주소를 입력해주세요",
                                  variant: "destructive",
                                });
                              }
                            }}
                            className="flex-1"
                          >
                            <MapPin className="h-4 w-4 mr-1" />
                            현재 위치 사용
                          </Button>
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={() => {
                              if (!addressInput.trim()) {
                                toast({
                                  title: "주소를 입력해주세요",
                                  description: "추가할 주소를 입력해주세요.",
                                  variant: "destructive",
                                });
                                return;
                              }
                              
                              // 임의의 좌표값 설정 (실제로는 지오코딩 API 사용 필요)
                              const lat = 37.5665 + (Math.random() * 0.02 - 0.01);
                              const long = 126.978 + (Math.random() * 0.02 - 0.01);
                              
                              // 첫 번째 주소라면 폼 값 설정
                              if (locationList.length === 0) {
                                form.setValue('latitude', lat);
                                form.setValue('longitude', long);
                                form.setValue('address', addressInput);
                              }
                              
                              // 주소 목록에 추가
                              setLocationList([...locationList, {
                                lat,
                                long,
                                address: addressInput
                              }]);
                              
                              // 입력 필드 초기화
                              setAddressInput('');
                            }}
                            className="flex-1"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            추가
                          </Button>
                        </div>
                      </div>
                      
                      <FormMessage>
                        {form.formState.errors.latitude?.message ||
                          form.formState.errors.longitude?.message}
                      </FormMessage>
                    </div>
                    
                    {locationList.length > 0 ? (
                      <div className="bg-muted rounded-md overflow-hidden mt-2">
                        <div className="px-3 py-2 bg-muted-foreground/10 border-b font-medium text-sm">
                          서비스 제공 장소 ({locationList.length}개)
                        </div>
                        <div className="p-3 space-y-2">
                          {locationList.map((loc, index) => (
                            <div key={index} className="flex items-center justify-between bg-background rounded-md p-2 text-sm">
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>{loc.address}</span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => {
                                  // 주소 목록에서 제거
                                  const newLocations = [...locationList];
                                  newLocations.splice(index, 1);
                                  setLocationList(newLocations);
                                  
                                  // 첫 번째 주소였다면 다음 주소를 기본값으로 설정
                                  if (index === 0 && newLocations.length > 0) {
                                    form.setValue('latitude', newLocations[0].lat);
                                    form.setValue('longitude', newLocations[0].long);
                                    form.setValue('address', newLocations[0].address);
                                  } else if (newLocations.length === 0) {
                                    // 남은 주소가 없으면 초기화
                                    form.setValue('latitude', 0);
                                    form.setValue('longitude', 0);
                                    form.setValue('address', '');
                                  }
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-3 text-muted-foreground text-sm bg-muted/50 rounded-md border border-dashed">
                        <MapPin className="h-4 w-4 mx-auto mb-1" />
                        서비스 제공 장소를 하나 이상 추가해주세요
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={
                        registerServiceMutation.isPending ||
                        (!form.formState.isValid && !form.watch("isFreeService")) ||
                        (!user && !form.watch("isFreeService"))
                      }
                      onClick={(e) => {
                        // 유료 서비스일 때만 로그인 체크
                        if (!user && !form.watch("isFreeService")) {
                          e.preventDefault();
                          toast({
                            title: language === 'ko' ? '유료 서비스 제한' : 
                                   language === 'jp' ? '有料サービスの制限' : 
                                   'Premium Service Restriction',
                            description: language === 'ko' ? '유료 서비스 등록을 위해 로그인이 필요합니다.' : 
                                        language === 'jp' ? '有料サービスを登録するにはログインが必要です。' : 
                                        'You need to login to register a premium service.',
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      {registerServiceMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {language === 'ko' ? '서비스 등록하기' : 
                       language === 'jp' ? 'サービスを登録する' : 
                       'Register Service'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'ko' ? '등록 안내' : 
                   language === 'jp' ? '登録案内' : 
                   'Registration Guide'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-primary mt-0.5 mr-3" />
                  <p className="text-sm">
                    {language === 'ko' ? '등록한 서비스는 다른 사용자들이 검색하고 이용할 수 있습니다.' : 
                     language === 'jp' ? '登録したサービスは他のユーザーが検索して利用できます。' : 
                     'Registered services can be searched and used by other users.'}
                  </p>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 mr-3" />
                  <p className="text-sm">
                    {language === 'ko' ? '정확한 위치 정보를 제공하면 근처 사용자들이 더 쉽게 찾을 수 있습니다.' : 
                     language === 'jp' ? '正確な位置情報を提供すると、近くのユーザーがより簡単に見つけることができます。' : 
                     'Providing accurate location information makes it easier for nearby users to find you.'}
                  </p>
                </div>
                <div className="flex items-start">
                  <DollarSign className="h-5 w-5 text-primary mt-0.5 mr-3" />
                  <p className="text-sm">
                    {language === 'ko' ? '명확한 가격 정책을 설정하여 사용자들이 예상 비용을 알 수 있게 해주세요.' : 
                     language === 'jp' ? '明確な価格ポリシーを設定して、ユーザーが予想コストを知ることができるようにしてください。' : 
                     'Set clear pricing policies so users know what to expect in terms of costs.'}
                  </p>
                </div>
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-primary mt-0.5 mr-3" />
                  <p className="text-sm">
                    {language === 'ko' ? '운영 시간을 정확히 표시하여 예약과 문의가 원활하게 이루어지도록 하세요.' : 
                     language === 'jp' ? '営業時間を正確に表示して、予約や問い合わせがスムーズに行われるようにしてください。' : 
                     'Display accurate operating hours to facilitate smooth bookings and inquiries.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'ko' ? '서비스 등록 혜택' : 
                   language === 'jp' ? 'サービス登録の特典' : 
                   'Registration Benefits'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-primary/10 p-3 rounded-md">
                    <h4 className="font-medium text-primary">
                      {language === 'ko' ? '추가 수익 창출' : 
                       language === 'jp' ? '追加収益の創出' : 
                       'Additional Income'}
                    </h4>
                    <p className="text-sm mt-1">
                      {language === 'ko' ? '여유 시간에 서비스를 제공하여 추가 수익을 얻을 수 있습니다.' : 
                       language === 'jp' ? '空き時間にサービスを提供することで追加収入を得ることができます。' : 
                       'Earn additional income by providing services in your spare time.'}
                    </p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-md">
                    <h4 className="font-medium text-primary">
                      {language === 'ko' ? '커뮤니티 참여' : 
                       language === 'jp' ? 'コミュニティへの参加' : 
                       'Community Engagement'}
                    </h4>
                    <p className="text-sm mt-1">
                      {language === 'ko' ? '메이커 커뮤니티와 연결되어 다양한 프로젝트와 아이디어를 공유할 수 있습니다.' : 
                       language === 'jp' ? 'メーカーコミュニティとつながり、様々なプロジェクトやアイデアを共有できます。' : 
                       'Connect with the maker community and share various projects and ideas.'}
                    </p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-md">
                    <h4 className="font-medium text-primary">
                      {language === 'ko' ? '프로필 인지도 상승' : 
                       language === 'jp' ? 'プロフィールの認知度向上' : 
                       'Profile Recognition'}
                    </h4>
                    <p className="text-sm mt-1">
                      {language === 'ko' ? '다양한 작업을 통해 포트폴리오를 구축하고 전문성을 인정받을 수 있습니다.' : 
                       language === 'jp' ? '様々な作業を通じてポートフォリオを構築し、専門性を認められることができます。' : 
                       'Build your portfolio and gain recognition for your expertise through various projects.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}