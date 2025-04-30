import React, { useState, useRef, useEffect } from "react";
import { useLocation as useWouterLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ServiceType } from "@shared/schema";
import { useLocation as useGeoLocation } from "@/hooks/use-location"; // 기존 위치 관련 훅
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
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
  Hexagon
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
  "전자공학", "기계공학", "소프트웨어 개발", "3D 모델링", 
  "PCB 설계", "임베디드 시스템", "로봇공학", "AI/ML", 
  "자동화", "IoT", "생산 엔지니어링", "품질 관리", "기타"
];

// 제조 역량 옵션 (제조업체용)
const manufacturingCapabilityOptions = [
  "CNC 가공", "3D 프린팅", "사출 성형", "판금", "용접", 
  "조립", "PCB 제작", "표면 처리", "레이저 가공", 
  "밀링", "터닝", "와이어 컷팅", "드릴링", "기타"
];

// 서비스 유형 별 라벨
const serviceTypeLabels: { value: ServiceType; label: string; icon: any }[] = [
  { value: "3d_printing", label: "3D 프린팅 서비스", icon: Printer },
  { value: "engineer", label: "엔지니어 서비스", icon: User },
  { value: "manufacturing", label: "제조 서비스", icon: Building },
  { value: "electronics", label: "전자기기 서비스", icon: Hexagon },
  { value: "woodworking", label: "목공 서비스", icon: Wrench },
  { value: "metalworking", label: "금속가공 서비스", icon: Wrench },
];

// 서비스 등록 폼 스키마
const serviceFormSchema = z.object({
  title: z.string().min(2, "제목은 최소 2자 이상이어야 합니다").max(100, "제목은 최대 100자까지 가능합니다"),
  description: z.string().min(10, "설명은 최소 10자 이상이어야 합니다").max(2000, "설명은 최대 2000자까지 가능합니다"),
  serviceType: z.enum(["3d_printing", "electronics", "woodworking", "metalworking", "manufacturing", "engineer"]),
  contactEmail: z.string().email("유효한 이메일을 입력하세요").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  printerModel: z.string().optional(),
  hourlyRate: z.string().optional(),
  availableTimes: z.string().optional(),
  portfolioUrl: z.string().url("유효한 URL을 입력하세요").optional().or(z.literal("")),
  nickname: z.string().optional(),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

export default function RegisterService() {
  const { toast } = useToast();
  const [, navigate] = useWouterLocation();
  const [location] = useWouterLocation();
  const params = location.split('/').pop(); // 간단히 마지막 세그먼트를 추출
  const { user } = useAuth();
  const { getLocation, currentLocation, isLoading: isLoadingLocation } = useGeoLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sampleInputsRef = useRef<HTMLInputElement>(null);
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedTab, setSelectedTab] = useState("basic");
  const [serviceType, setServiceType] = useState<ServiceType>("3d_printing");
  
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedFileFormats, setSelectedFileFormats] = useState<string[]>([]);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  
  const [sampleImages, setSampleImages] = useState<{ file: File; preview: string }[]>([]);
  const [clientId, setClientId] = useState<string>("");
  
  // 클라이언트 UUID 생성 (IP 대신 사용)
  useEffect(() => {
    // localStorage에서 기존 clientId 가져오기
    const storedClientId = localStorage.getItem('webel_client_id');
    if (storedClientId) {
      setClientId(storedClientId);
    } else {
      // 새 ID 생성 및 저장
      const newClientId = uuidv4();
      localStorage.setItem('webel_client_id', newClientId);
      setClientId(newClientId);
    }
  }, []);

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

  // 페이지 로드시 위치 정보 가져오기
  useEffect(() => {
    getLocation();
  }, []);

  // 폼 초기화
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      title: "",
      description: "",
      serviceType: serviceType,
      contactEmail: user?.email || "",
      contactPhone: "",
      printerModel: "",
      hourlyRate: "",
      availableTimes: "",
      portfolioUrl: "",
      nickname: user?.username || "",
    },
  });

  // 서비스 타입 변경 이벤트
  const handleServiceTypeChange = (value: ServiceType) => {
    setServiceType(value);
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

  // 서비스 등록 뮤테이션
  const registerServiceMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await apiRequest("POST", "/api/services", formData, true);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "서비스 등록 중 오류가 발생했습니다.");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "등록 성공!",
        description: "서비스가 성공적으로 등록되었습니다.",
      });
      navigate(`/services/type/${serviceType}`);
    },
    onError: (error: Error) => {
      toast({
        title: "등록 실패",
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

  // 샘플 이미지 선택 핸들러 (3D 프린터용)
  const handleSampleImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newSampleImages: { file: File; preview: string }[] = [];
      
      Array.from(files).forEach((file) => {
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "파일 크기 초과",
            description: `${file.name}의 크기가 5MB를 초과합니다.`,
            variant: "destructive",
          });
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

  // 폼 제출 핸들러
  const onSubmit = async (data: ServiceFormValues) => {
    // 필수 위치 정보 확인
    if (!currentLocation) {
      toast({
        title: "위치 정보 필요",
        description: "서비스 등록을 위해 위치 정보가 필요합니다. '위치 가져오기' 버튼을 눌러주세요.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    
    // 기본 정보 추가
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("serviceType", data.serviceType);
    
    // 위치 정보 추가
    formData.append("location", JSON.stringify(currentLocation));
    
    // 선택적 정보 추가
    if (data.contactEmail) formData.append("contactEmail", data.contactEmail);
    if (data.contactPhone) formData.append("contactPhone", data.contactPhone);
    if (data.availableTimes) formData.append("availableTimes", data.availableTimes);
    if (data.portfolioUrl) formData.append("portfolioUrl", data.portfolioUrl);
    if (data.nickname) formData.append("nickname", data.nickname);
    
    // 사용자 ID 추가 (로그인 한 경우)
    if (user) {
      formData.append("userId", user.id.toString());
    } else {
      // 비로그인 사용자는 clientId 추가 (IP 제한 대신)
      formData.append("clientId", clientId);
    }

    // 서비스 유형별 추가 정보
    if (data.serviceType === "3d_printing") {
      if (data.printerModel) formData.append("printerModel", data.printerModel);
      if (selectedMaterials.length > 0) formData.append("materials", selectedMaterials.join(","));
      if (selectedFileFormats.length > 0) formData.append("fileFormats", selectedFileFormats.join(","));
      
      // 샘플 이미지 추가
      sampleImages.forEach((sample, index) => {
        formData.append(`sampleImage${index}`, sample.file);
      });
      formData.append("sampleImagesCount", sampleImages.length.toString());
    } 
    else if (data.serviceType === "engineer") {
      if (data.hourlyRate) formData.append("hourlyRate", data.hourlyRate);
      if (selectedSpecializations.length > 0) formData.append("specializations", selectedSpecializations.join(","));
    }
    else if (data.serviceType === "manufacturing") {
      if (selectedCapabilities.length > 0) formData.append("capabilities", selectedCapabilities.join(","));
    }

    // 메인 이미지 추가
    if (imageFile) {
      formData.append("imageFile", imageFile);
    }
    
    // 등록 요청
    registerServiceMutation.mutate(formData);
  };

  // 서비스 유형별 아이콘 얻기
  const getServiceTypeIcon = (type: ServiceType) => {
    return true; // 아이콘을 직접 렌더링하기 위해 항상 true 반환
  };

  // 서비스 유형별 라벨 얻기
  const getServiceTypeLabel = (type: ServiceType) => {
    const found = serviceTypeLabels.find(st => st.value === type);
    if (!found) return type;
    return found.label;
  };

  // 특정 서비스 유형에 맞는 콘텐츠 랜더링
  const renderServiceTypeContent = () => {
    switch (serviceType) {
      case "3d_printing":
        return (
          <div className="space-y-6">
            {/* 프린터 모델 */}
            <FormField
              control={form.control}
              name="printerModel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>프린터 모델</FormLabel>
                  <FormControl>
                    <Input placeholder="사용 중인 3D 프린터 모델명" {...field} />
                  </FormControl>
                  <FormDescription>
                    보유하신 3D 프린터의 제조사와 모델명을 입력해주세요.
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
                    ref={sampleInputsRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    multiple
                    onChange={handleSampleImagesSelect}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                이전에 제작한 결과물의 사진을 공유해주세요 (최대 5MB, 여러 장 선택 가능)
              </p>
            </div>
          </div>
        );

      case "engineer":
        return (
          <div className="space-y-6">
            {/* 시간당 요금 */}
            <FormField
              control={form.control}
              name="hourlyRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>시간당 요금 (선택사항)</FormLabel>
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-muted-foreground" />
                    <FormControl>
                      <Input placeholder="예: 30,000" {...field} />
                    </FormControl>
                  </div>
                  <FormDescription>
                    시간당 요금을 입력하세요. 비워두시면 "협의 가능"으로 표시됩니다.
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
            </div>

            {/* 포트폴리오 URL */}
            <FormField
              control={form.control}
              name="portfolioUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>포트폴리오 URL (선택사항)</FormLabel>
                  <FormControl>
                    <Input placeholder="포트폴리오 링크를 입력하세요" {...field} />
                  </FormControl>
                  <FormDescription>
                    GitHub, Behance, 개인 웹사이트 등 본인의 작업을 확인할 수 있는 링크
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case "manufacturing":
        return (
          <div className="space-y-6">
            {/* 제조 역량 */}
            <div className="space-y-3">
              <FormLabel>제조 역량</FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {manufacturingCapabilityOptions.map(capability => (
                  <div key={capability} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`cap-${capability}`} 
                      checked={selectedCapabilities.includes(capability)}
                      onCheckedChange={() => toggleCheckbox(selectedCapabilities, setSelectedCapabilities, capability)}
                    />
                    <label
                      htmlFor={`cap-${capability}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {capability}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center">
              {getServiceTypeIcon(serviceType) && 
               <div className="h-8 w-8 mr-3 text-primary">
                 {serviceType === "3d_printing" && <Printer className="h-8 w-8" />}
                 {serviceType === "engineer" && <User className="h-8 w-8" />}
                 {serviceType === "manufacturing" && <Building className="h-8 w-8" />}
                 {serviceType === "electronics" && <Hexagon className="h-8 w-8" />}
                 {serviceType === "woodworking" && <Wrench className="h-8 w-8" />}
                 {serviceType === "metalworking" && <Wrench className="h-8 w-8" />}
               </div>
              }
              <div>
                <CardTitle className="text-2xl font-bold">
                  {getServiceTypeLabel(serviceType)} 등록
                </CardTitle>
                <CardDescription>
                  여러분의 서비스를 등록하고 고객과 연결하세요!
                </CardDescription>
              </div>
            </div>
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
                    {/* 서비스 타입 */}
                    <FormField
                      control={form.control}
                      name="serviceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>서비스 유형 *</FormLabel>
                          <Select
                            onValueChange={(value: ServiceType) => {
                              field.onChange(value);
                              handleServiceTypeChange(value);
                            }}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="서비스 유형을 선택하세요" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {serviceTypeLabels.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex items-center">
                                    <span className="h-4 w-4 mr-2">
                                      {option.value === "3d_printing" && <Printer className="h-4 w-4" />}
                                      {option.value === "engineer" && <User className="h-4 w-4" />}
                                      {option.value === "manufacturing" && <Building className="h-4 w-4" />}
                                      {option.value === "electronics" && <Hexagon className="h-4 w-4" />}
                                      {option.value === "woodworking" && <Wrench className="h-4 w-4" />}
                                      {option.value === "metalworking" && <Wrench className="h-4 w-4" />}
                                    </span>
                                    {option.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 제목 */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>제목 *</FormLabel>
                          <FormControl>
                            <Input placeholder="서비스 제목을 입력하세요" {...field} />
                          </FormControl>
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
                              placeholder="서비스에 대한 설명을 입력하세요"
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 위치 정보 */}
                    <div className="space-y-3">
                      <FormLabel>위치 정보 *</FormLabel>
                      <div className="flex flex-col gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={getLocation}
                          disabled={isLoadingLocation}
                          className="flex items-center justify-center w-full md:w-auto"
                        >
                          {isLoadingLocation ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <MapPin className="mr-2 h-4 w-4" />
                          )}
                          현재 위치 가져오기
                        </Button>
                        
                        {currentLocation ? (
                          <div className="p-4 border rounded-md bg-muted/30">
                            <div className="flex items-start">
                              <MapPin className="mt-1 h-4 w-4 text-primary mr-2" />
                              <div>
                                <p className="font-medium">{currentLocation.address}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  위도: {currentLocation.lat.toFixed(6)}, 경도: {currentLocation.long.toFixed(6)}
                                </p>
                                {(currentLocation.city || currentLocation.country) && (
                                  <p className="text-sm text-muted-foreground">
                                    {[currentLocation.city, currentLocation.country].filter(Boolean).join(", ")}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 border rounded-md bg-muted/30 text-muted-foreground text-sm">
                            위치 정보가 필요합니다. '현재 위치 가져오기' 버튼을 클릭하여 위치를 설정해주세요.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 이미지 업로드 */}
                    <div className="space-y-3">
                      <FormLabel>프로필 이미지 (선택사항)</FormLabel>
                      <div className="flex flex-col items-center justify-center md:flex-row md:items-start gap-4">
                        <div className="border rounded-md p-4 text-center flex flex-col items-center justify-center w-full md:w-1/3 min-h-[200px]">
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
                        
                        <div className="w-full md:w-2/3 space-y-4">
                          {/* 닉네임 */}
                          <FormField
                            control={form.control}
                            name="nickname"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>닉네임 (선택사항)</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="서비스 제공자 닉네임" 
                                    {...field} 
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <FormDescription>
                                  실명 대신 사용할 닉네임을 입력하세요.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => navigate("/services")}>
                      취소
                    </Button>
                    <Button type="button" onClick={() => setSelectedTab("details")}>
                      다음
                    </Button>
                  </CardFooter>
                </TabsContent>

                <TabsContent value="details">
                  <CardContent className="space-y-6 pt-4">
                    {/* 서비스 유형별 특화 필드 */}
                    {renderServiceTypeContent()}

                    <Separator />

                    {/* 연락처 이메일 */}
                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>연락처 이메일 (선택사항)</FormLabel>
                          <div className="flex items-center">
                            <Mail className="w-5 h-5 mr-2 text-muted-foreground" />
                            <FormControl>
                              <Input 
                                placeholder="연락 가능한 이메일" 
                                {...field} 
                                value={field.value || ''}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 연락처 전화번호 */}
                    <FormField
                      control={form.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>연락처 전화번호 (선택사항)</FormLabel>
                          <div className="flex items-center">
                            <Phone className="w-5 h-5 mr-2 text-muted-foreground" />
                            <FormControl>
                              <Input placeholder="연락 가능한 전화번호" {...field} />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 가능 시간 */}
                    <FormField
                      control={form.control}
                      name="availableTimes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>가능 시간 (선택사항)</FormLabel>
                          <div className="flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-muted-foreground" />
                            <FormControl>
                              <Input placeholder="예: 평일 10AM-6PM, 주말 불가" {...field} />
                            </FormControl>
                          </div>
                          <FormDescription>
                            서비스 제공이 가능한 시간대를 입력하세요.
                          </FormDescription>
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
                      {/* 헤더 정보 */}
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-4">
                          {imagePreview ? (
                            <div className="w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden">
                              <img 
                                src={imagePreview} 
                                alt="프로필" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-muted flex items-center justify-center">
                              <div className="h-8 w-8 text-muted-foreground">
                                {serviceType === "3d_printing" && <Printer className="h-8 w-8" />}
                                {serviceType === "engineer" && <User className="h-8 w-8" />}
                                {serviceType === "manufacturing" && <Building className="h-8 w-8" />}
                                {serviceType === "electronics" && <Hexagon className="h-8 w-8" />}
                                {serviceType === "woodworking" && <Wrench className="h-8 w-8" />}
                                {serviceType === "metalworking" && <Wrench className="h-8 w-8" />}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <h2 className="text-2xl font-bold">{form.getValues("title") || "제목 없음"}</h2>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-primary/20">
                              {getServiceTypeLabel(serviceType)}
                            </Badge>
                            {form.getValues("nickname") && (
                              <Badge variant="outline">
                                {form.getValues("nickname")}
                              </Badge>
                            )}
                          </div>
                          
                          {currentLocation && (
                            <div className="flex items-center mt-2 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                              <span>{currentLocation.address}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 상세 정보 */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h3 className="font-semibold">서비스 설명</h3>
                          <p className="text-muted-foreground whitespace-pre-line">
                            {form.getValues("description") || "설명이 없습니다."}
                          </p>
                        </div>

                        {/* 서비스 유형별 특화 정보 */}
                        {serviceType === "3d_printing" && (
                          <>
                            {form.getValues("printerModel") && (
                              <div className="space-y-2">
                                <h3 className="font-semibold">프린터 모델</h3>
                                <p className="text-muted-foreground">{form.getValues("printerModel")}</p>
                              </div>
                            )}
                            
                            {selectedFileFormats.length > 0 && (
                              <div className="space-y-2">
                                <h3 className="font-semibold">지원 파일 형식</h3>
                                <div className="flex flex-wrap gap-2">
                                  {selectedFileFormats.map(format => (
                                    <Badge key={format} variant="secondary">
                                      {format}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {selectedMaterials.length > 0 && (
                              <div className="space-y-2">
                                <h3 className="font-semibold">사용 가능한 재료</h3>
                                <div className="flex flex-wrap gap-2">
                                  {selectedMaterials.map(material => (
                                    <Badge key={material} variant="secondary">
                                      {material}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {sampleImages.length > 0 && (
                              <div className="space-y-2">
                                <h3 className="font-semibold">결과물 샘플</h3>
                                <div className="flex flex-wrap gap-2">
                                  {sampleImages.map((sample, index) => (
                                    <div key={index} className="w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden">
                                      <img 
                                        src={sample.preview} 
                                        alt={`샘플 ${index+1}`} 
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                        
                        {serviceType === "engineer" && (
                          <>
                            {selectedSpecializations.length > 0 && (
                              <div className="space-y-2">
                                <h3 className="font-semibold">전문 분야</h3>
                                <div className="flex flex-wrap gap-2">
                                  {selectedSpecializations.map(spec => (
                                    <Badge key={spec} variant="secondary">
                                      {spec}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {form.getValues("hourlyRate") && (
                              <div className="space-y-2">
                                <h3 className="font-semibold">시간당 요금</h3>
                                <p className="text-muted-foreground">
                                  {form.getValues("hourlyRate")}원
                                </p>
                              </div>
                            )}
                            
                            {form.getValues("portfolioUrl") && (
                              <div className="space-y-2">
                                <h3 className="font-semibold">포트폴리오</h3>
                                <a 
                                  href={form.getValues("portfolioUrl")} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  {form.getValues("portfolioUrl")}
                                </a>
                              </div>
                            )}
                          </>
                        )}
                        
                        {serviceType === "manufacturing" && (
                          <>
                            {selectedCapabilities.length > 0 && (
                              <div className="space-y-2">
                                <h3 className="font-semibold">제조 역량</h3>
                                <div className="flex flex-wrap gap-2">
                                  {selectedCapabilities.map(cap => (
                                    <Badge key={cap} variant="secondary">
                                      {cap}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        <Separator />

                        {/* 연락처 정보 */}
                        <div className="space-y-2">
                          <h3 className="font-semibold">연락처</h3>
                          {(form.getValues("contactEmail") || form.getValues("contactPhone")) ? (
                            <div className="space-y-1">
                              {form.getValues("contactEmail") && (
                                <div className="flex items-center">
                                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span>{form.getValues("contactEmail")}</span>
                                </div>
                              )}
                              {form.getValues("contactPhone") && (
                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span>{form.getValues("contactPhone")}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-muted-foreground">연락처 정보가 없습니다.</p>
                          )}
                        </div>
                        
                        {form.getValues("availableTimes") && (
                          <div className="space-y-2">
                            <h3 className="font-semibold">가능 시간</h3>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{form.getValues("availableTimes")}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setSelectedTab("details")}>
                      이전
                    </Button>
                    <Button
                      type="submit"
                      disabled={registerServiceMutation.isPending}
                    >
                      {registerServiceMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      등록하기
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