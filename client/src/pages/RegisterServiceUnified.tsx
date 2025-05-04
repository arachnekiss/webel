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

// 서비스 유형 별 라벨 (동적으로 언어에 따라 변경되도록 함수형태로 생성)
const getServiceTypeLabels = (t: (key: string) => string): { value: ServiceType; label: string; icon: any }[] => [
  { value: "3d_printing", label: t('serviceType.3d_printing'), icon: Printer },
  { value: "engineer", label: t('serviceType.engineer'), icon: User },
  { value: "manufacturing", label: t('serviceType.manufacturing'), icon: Building },
];

// 서비스 등록 폼 스키마
const serviceFormSchema = z.object({
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
  isFreeService: z.boolean().default(false),
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
  const { t, language } = useLanguage();
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
  
  // 서비스 유형 라벨 생성
  const serviceTypeLabels = getServiceTypeLabels(t);
  
  // 서비스 유형별 섹션 라벨 생성
  const getServiceTypeSectionLabel = () => {
    if (serviceType === "3d_printing") return t('registerService.serviceInfo') + ' - ' + t('serviceType.3d_printing');
    if (serviceType === "engineer") return t('registerService.serviceInfo') + ' - ' + t('serviceType.engineer');
    if (serviceType === "manufacturing") return t('registerService.serviceInfo') + ' - ' + t('serviceType.manufacturing');
    return t('registerService.serviceInfo');
  };

  // 폼 제출 처리
  const onSubmit = async (data: ServiceFormValues) => {
    // 유료 서비스인 경우 서버 측에서 인증 상태 검증
    // 클라이언트에서는 사전 검증 없이 바로 서버로 요청

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

  // 비로그인 사용자를 위한 정보 알림
  const NotLoggedInAlert = () => {
    if (!user) {
      return (
        <Alert className="mb-6">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>{t('registerService.notLoggedIn.title')}</AlertTitle>
          <AlertDescription>
            {t('registerService.notLoggedIn.description')}
            <Button
              variant="link"
              className="p-0 mx-1"
              onClick={() => navigate('/auth')}
            >
              {t('common.login')}
            </Button>
            {t('registerService.notLoggedIn.postLogin')}
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t('registerService.title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('registerService.subtitle')}
        </p>
      </div>

      {/* 비로그인 사용자를 위한 알림 표시 */}
      <NotLoggedInAlert />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('registerService.serviceInfo')}</CardTitle>
              <CardDescription>
                {t('registerService.serviceInfoDesc')}
              </CardDescription>

              {/* 서비스 유형 선택 */}
              <div className="pt-4">
                <div className="text-sm font-medium mb-2">{t('registerService.selectServiceType')}</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {serviceTypeLabels.map(({ value, label, icon: Icon }) => (
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
                        {label}
                      </span>
                    </div>
                  ))}
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
                    <FormLabel>{t('registerService.serviceImage')}</FormLabel>
                    <div className="border rounded-md p-4 text-center flex flex-col items-center justify-center min-h-[200px]">
                      {imagePreview ? (
                        <div className="relative w-full h-full">
                          <img
                            src={imagePreview}
                            alt={t('common.preview')}
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
                            {t('common.remove')}
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="flex flex-col items-center justify-center cursor-pointer"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground mb-1">{t('registerService.clickToUploadImage')}</p>
                          <p className="text-xs text-muted-foreground">{t('registerService.imageFormatAndSize')}</p>
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
                        <FormLabel>{t('registerService.serviceTitle')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={serviceType === "3d_printing" 
                              ? t('registerService.placeholders.3dPrintingTitle') 
                              : t('registerService.placeholders.engineerTitle')}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {t('registerService.titleDescription')}
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
                        <FormLabel>{t('registerService.serviceDescription')}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('registerService.placeholders.description')}
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
                            <FormLabel>{t('registerService.3dPrinter.modelName')}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t('registerService.3dPrinter.modelNamePlaceholder')}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              {t('registerService.3dPrinter.modelNameDesc')}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* 지원 파일 형식 */}
                      <div className="space-y-3">
                        <FormLabel>{t('registerService.3dPrinter.supportedFileFormats')}</FormLabel>
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
                        <FormLabel>{t('registerService.3dPrinter.availableMaterials')}</FormLabel>
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
                        <FormLabel>{t('registerService.3dPrinter.sampleImages')}</FormLabel>
                        <div className="flex flex-wrap gap-4">
                          {sampleImages.map((sample, index) => (
                            <div key={index} className="relative w-24 h-24 border rounded-md overflow-hidden">
                              <img 
                                src={sample.preview} 
                                alt={`${t('registerService.3dPrinter.sampleNumber')} ${index+1}`} 
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
                            <span className="text-xs text-muted-foreground mt-1">{t('common.add')}</span>
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
                          {t('registerService.3dPrinter.sampleImagesDesc')}
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
                            <FormLabel>{t('registerService.engineer.hourlyRate')}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t('registerService.engineer.hourlyRatePlaceholder')}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              {t('registerService.engineer.hourlyRateDesc')}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* 전문 분야 */}
                      <div className="space-y-3">
                        <FormLabel>{t('registerService.engineer.specialization')}</FormLabel>
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
                        <FormLabel>{t('registerService.manufacturing.products')}</FormLabel>
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
                        <FormLabel>{t('common.tags')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={serviceType === "3d_printing" 
                              ? t('registerService.placeholders.3dPrintingTags') 
                              : t('registerService.placeholders.engineerTags')}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {t('registerService.tagsDescription')}
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
                          <FormLabel>{t('common.contactPhone')}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t('registerService.placeholders.contactPhone')}
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
                          <FormLabel>{t('common.email')}</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder={t('registerService.placeholders.email')}
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
                        <FormLabel className="text-base mb-2">{t('registerService.serviceType')}</FormLabel>
                        <FormDescription className="mb-3">
                          {t('registerService.serviceTypeDescription')}
                        </FormDescription>
                        <FormControl>
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <div 
                              className={`cursor-pointer border rounded-lg p-4 ${field.value ? 'border-primary bg-primary/5' : 'border-border'}`}
                              onClick={() => {
                                field.onChange(true);
                                form.setValue("pricing", "무료");
                              }}
                            >
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center">
                                  <Gift className="mr-2 h-5 w-5 text-primary" />
                                  <h3 className="font-medium">{t('registerService.freeService')}</h3>
                                </div>
                                {field.value && <Check className="h-5 w-5 text-primary" />}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {t('registerService.freeServiceDesc')}
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
                              }}
                            >
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center">
                                  <CreditCard className="mr-2 h-5 w-5 text-primary" />
                                  <h3 className="font-medium">{t('registerService.paidService')}</h3>
                                </div>
                                {!field.value && <Check className="h-5 w-5 text-primary" />}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {t('registerService.paidServiceDesc')}
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
                          <InfoIcon className="h-4 w-4 mr-1" /> {t('registerService.paidServiceRequirements.title')}
                        </h3>
                        <p className="text-sm text-amber-700 mb-2">
                          {t('registerService.paidServiceRequirements.description')}
                        </p>
                        <ul className="text-xs text-amber-700 list-disc pl-5 space-y-1">
                          <li>{t('registerService.paidServiceRequirements.phoneVerification')}</li>
                          <li>{t('registerService.paidServiceRequirements.bankAccount')}</li>
                        </ul>
                      </div>

                      <FormField
                        control={form.control}
                        name="pricing"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('registerService.pricing.title')}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t('registerService.pricing.placeholder')}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              {t('registerService.pricing.description')}
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
                        <FormLabel>{t('registerService.availableHours.title')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('registerService.availableHours.placeholder')}
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
                        <FormLabel className="text-base">{t('registerService.providerType.title')}</FormLabel>
                        <FormDescription>
                          {t('registerService.providerType.description')}
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
                                  <h3 className="font-medium">{t('registerService.providerType.individual')}</h3>
                                </div>
                                {field.value && <Check className="h-5 w-5 text-primary" />}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {t('registerService.providerType.individualDesc')}
                              </p>
                            </div>
                            
                            <div 
                              className={`cursor-pointer border rounded-lg p-4 ${!field.value ? 'border-primary bg-primary/5' : 'border-border'}`}
                              onClick={() => field.onChange(false)}
                            >
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center">
                                  <Building className="mr-2 h-5 w-5 text-primary" />
                                  <h3 className="font-medium">{t('registerService.providerType.company')}</h3>
                                </div>
                                {!field.value && <Check className="h-5 w-5 text-primary" />}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {t('registerService.providerType.companyDesc')}
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
                      <h3 className="font-medium">{t('registerService.location.title')}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {t('registerService.location.description')}
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
                        !form.formState.isValid
                      }
                    >
                      {registerServiceMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      서비스 등록하기
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
                <CardTitle>등록 안내</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-primary mt-0.5 mr-3" />
                  <p className="text-sm">
                    등록한 서비스는 다른 사용자들이 검색하고 이용할 수 있습니다.
                  </p>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 mr-3" />
                  <p className="text-sm">
                    정확한 위치 정보를 제공하면 근처 사용자들이 더 쉽게 찾을 수
                    있습니다.
                  </p>
                </div>
                <div className="flex items-start">
                  <DollarSign className="h-5 w-5 text-primary mt-0.5 mr-3" />
                  <p className="text-sm">
                    명확한 가격 정책을 설정하여 사용자들이 예상 비용을 알 수
                    있게 해주세요.
                  </p>
                </div>
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-primary mt-0.5 mr-3" />
                  <p className="text-sm">
                    운영 시간을 정확히 표시하여 예약과 문의가 원활하게
                    이루어지도록 하세요.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>서비스 등록 혜택</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-primary/10 p-3 rounded-md">
                    <h4 className="font-medium text-primary">
                      추가 수익 창출
                    </h4>
                    <p className="text-sm mt-1">
                      여유 시간에 서비스를 제공하여 추가 수익을 얻을 수
                      있습니다.
                    </p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-md">
                    <h4 className="font-medium text-primary">
                      커뮤니티 참여
                    </h4>
                    <p className="text-sm mt-1">
                      메이커 커뮤니티와 연결되어 다양한 프로젝트와 아이디어를
                      공유할 수 있습니다.
                    </p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-md">
                    <h4 className="font-medium text-primary">
                      프로필 인지도 상승
                    </h4>
                    <p className="text-sm mt-1">
                      다양한 작업을 통해 포트폴리오를 구축하고 전문성을 인정받을
                      수 있습니다.
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