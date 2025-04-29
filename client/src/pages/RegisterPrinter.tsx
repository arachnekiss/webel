import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from '@/contexts/LocationContext';
import { useLocation as useWouterLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

// 컴포넌트
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Printer,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Info,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// 벨리데이션 스키마
const printerFormSchema = z.object({
  title: z.string().min(5, {
    message: '제목은 최소 5글자 이상이어야 합니다',
  }),
  description: z.string().min(10, {
    message: '설명은 최소 10글자 이상이어야 합니다',
  }),
  printerModel: z.string().min(3, {
    message: '프린터 모델명을 입력해주세요',
  }),
  contactPhone: z.string().min(8, {
    message: '유효한 전화번호를 입력해주세요',
  }),
  contactEmail: z.string().email({
    message: '유효한 이메일을 입력해주세요',
  }),
  pricing: z.string().min(3, {
    message: '가격 정보를 입력해주세요',
  }),
  availableHours: z.string().min(3, {
    message: '이용 가능 시간을 입력해주세요',
  }),
  isIndividual: z.boolean().default(true),
  tags: z.string().transform((val) => val.split(',').map((tag) => tag.trim())),
  address: z.string().min(5, {
    message: '주소를 입력해주세요',
  }),
  latitude: z.number(),
  longitude: z.number(),
});

type PrinterFormValues = z.infer<typeof printerFormSchema>;

export default function RegisterPrinter() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { currentLocation, getLocation } = useLocation();
  const { toast } = useToast();
  const [, navigate] = useWouterLocation();
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const queryClient = useQueryClient();

  // 폼 설정
  const form = useForm<PrinterFormValues>({
    resolver: zodResolver(printerFormSchema),
    defaultValues: {
      title: '',
      description: '',
      printerModel: '',
      contactPhone: '',
      contactEmail: user?.email || '',
      pricing: '10g당 1,000원',
      availableHours: '평일 10:00-18:00',
      isIndividual: true,
      tags: 'PLA,ABS,시제품',
      address: '',
      latitude: 0,
      longitude: 0,
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
        form.setValue('address', currentLocation.address);
        setAddressInput(currentLocation.address);
      }
    }
  };

  // 주소 수동 입력
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressInput(e.target.value);
    form.setValue('address', e.target.value);
  };

  // 프린터 등록 API 요청
  const registerPrinterMutation = useMutation({
    mutationFn: async (data: PrinterFormValues) => {
      const serviceData = {
        title: data.title,
        description: data.description,
        serviceType: '3d_printing',
        location: {
          lat: data.latitude,
          long: data.longitude,
          address: data.address,
        },
        tags: data.tags,
        printerModel: data.printerModel,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        pricing: data.pricing,
        availableHours: data.availableHours,
        isIndividual: data.isIndividual,
      };

      const response = await apiRequest('POST', '/api/services', serviceData);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '서비스 등록에 실패했습니다');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: '등록 완료',
        description: '3D 프린터가 성공적으로 등록되었습니다',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      queryClient.invalidateQueries({
        queryKey: ['/api/services/type/3d_printing'],
      });
      navigate('/services');
    },
    onError: (error: Error) => {
      toast({
        title: '등록 실패',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // 폼 제출 처리
  const onSubmit = (data: PrinterFormValues) => {
    if (!user) {
      toast({
        title: '로그인이 필요합니다',
        description: '3D 프린터를 등록하려면 로그인이 필요합니다',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    if (data.latitude === 0 || data.longitude === 0) {
      toast({
        title: '위치 정보가 필요합니다',
        description: '현재 위치를 사용하거나 주소를 입력해주세요',
        variant: 'destructive',
      });
      return;
    }

    registerPrinterMutation.mutate(data);
  };

  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>로그인이 필요합니다</AlertTitle>
          <AlertDescription>
            3D 프린터를 등록하려면 로그인이 필요합니다.
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
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">3D 프린터 등록</h1>
        <p className="text-muted-foreground mt-2">
          나의 3D 프린터를 등록하고 다른 사용자들에게 인쇄 서비스를 제공해보세요
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>프린터 정보</CardTitle>
              <CardDescription>
                귀하의 3D 프린터 정보와 서비스 조건을 입력해주세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>서비스 제목*</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="예: 강남 프로페셔널 3D 프린팅 서비스"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          지역명과 특징을 포함하면 검색에 유리합니다
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
                        <FormLabel>서비스 설명*</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="제공하는 서비스, 특장점, 재료 등에 대해 상세히 작성해주세요"
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="printerModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>3D 프린터 모델*</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="예: Prusa i3 MK3S+"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          사용 중인 3D 프린터의 정확한 모델명을 입력해주세요
                        </FormDescription>
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
                            placeholder="예: PLA,ABS,시제품,소량생산 (쉼표로 구분)"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          사용하는 재료나 서비스 특징을 태그로 추가하세요
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
                          <FormLabel>연락처*</FormLabel>
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
                          <FormLabel>이메일*</FormLabel>
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
                    name="pricing"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>가격 정책*</FormLabel>
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

                  <FormField
                    control={form.control}
                    name="availableHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>이용 가능 시간*</FormLabel>
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
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            개인 서비스인가요?
                          </FormLabel>
                          <FormDescription>
                            개인이 운영하는 서비스인지, 업체에서 운영하는
                            서비스인지 선택해주세요
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">위치 정보</h3>
                        <p className="text-sm text-muted-foreground">
                          현재 위치를 사용하거나 주소를 직접 입력해주세요
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label
                          htmlFor="use-location"
                          className="text-sm text-muted-foreground"
                        >
                          현재 위치 사용
                        </Label>
                        <Switch
                          id="use-location"
                          checked={useCurrentLocation}
                          onCheckedChange={handleLocationToggle}
                        />
                      </div>
                    </div>

                    {!useCurrentLocation && (
                      <div className="space-y-2">
                        <Label htmlFor="address-input">주소 입력</Label>
                        <Input
                          id="address-input"
                          placeholder="정확한 주소를 입력해주세요"
                          value={addressInput}
                          onChange={handleAddressChange}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            // 임의의 좌표값 설정 (실제로는 지오코딩 API 사용 필요)
                            form.setValue('latitude', 37.5665);
                            form.setValue('longitude', 126.978);
                          }}
                          className="w-full"
                        >
                          주소 확인
                        </Button>
                        <FormMessage>
                          {form.formState.errors.latitude ||
                            form.formState.errors.longitude ||
                            form.formState.errors.address}
                        </FormMessage>
                      </div>
                    )}

                    {useCurrentLocation && currentLocation && (
                      <div className="bg-muted p-3 rounded-md">
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 text-primary mt-0.5 mr-2" />
                          <div>
                            <p className="font-medium">{currentLocation.address}</p>
                            <p className="text-xs text-muted-foreground">
                              좌표: {currentLocation.lat.toFixed(6)},{' '}
                              {currentLocation.long.toFixed(6)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={
                        registerPrinterMutation.isPending ||
                        !form.formState.isValid
                      }
                    >
                      {registerPrinterMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      프린터 등록하기
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
                    등록한 3D 프린터는 다른 사용자들이 검색하고 서비스를 요청할
                    수 있습니다.
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
                <CardTitle>프린터 등록 혜택</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-primary/10 p-3 rounded-md">
                    <h4 className="font-medium text-primary">
                      추가 수익 창출
                    </h4>
                    <p className="text-sm mt-1">
                      사용하지 않는 시간에 3D 프린터를 통해 추가 수익을 얻을 수
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