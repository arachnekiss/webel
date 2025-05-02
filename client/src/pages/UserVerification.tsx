import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircle,
  CheckCircle2,
  Phone,
  ArrowRight,
  CreditCard,
  User,
  Clock,
  ShieldCheck,
  Timer,
  Loader2,
  Building,
  Check,
  ChevronRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// 휴대폰 인증 폼 스키마
const phoneVerificationSchema = z.object({
  phoneNumber: z.string()
    .min(10, { message: "전화번호는 최소 10자리 이상이어야 합니다." })
    .max(13, { message: "유효한 전화번호 형식이 아닙니다." })
    .regex(/^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/, {
      message: "유효한 전화번호 형식이 아닙니다. (예: 010-1234-5678)",
    }),
  verificationCode: z.string()
    .min(6, { message: "인증번호는 6자리입니다." })
    .max(6, { message: "인증번호는 6자리입니다." })
    .regex(/^[0-9]{6}$/, { 
      message: "인증번호는 6자리 숫자입니다." 
    })
    .optional()
    .or(z.literal("")),
});

// 계좌 정보 폼 스키마
const bankAccountSchema = z.object({
  bankName: z.string().min(1, { message: "은행을 선택해주세요." }),
  accountNumber: z.string()
    .min(10, { message: "계좌번호는 최소 10자리 이상이어야 합니다." })
    .max(20, { message: "유효한 계좌번호 형식이 아닙니다." })
    .regex(/^[0-9-]+$/, { message: "숫자와 하이픈(-)만 입력 가능합니다." }),
  accountHolder: z.string().min(1, { message: "예금주명을 입력해주세요." }),
});

type PhoneVerificationFormValues = z.infer<typeof phoneVerificationSchema>;
type BankAccountFormValues = z.infer<typeof bankAccountSchema>;

// 은행 리스트
const bankList = [
  { value: "KB국민은행", label: "KB국민은행" },
  { value: "신한은행", label: "신한은행" },
  { value: "우리은행", label: "우리은행" },
  { value: "하나은행", label: "하나은행" },
  { value: "NH농협은행", label: "NH농협은행" },
  { value: "IBK기업은행", label: "IBK기업은행" },
  { value: "SC제일은행", label: "SC제일은행" },
  { value: "씨티은행", label: "씨티은행" },
  { value: "KDB산업은행", label: "KDB산업은행" },
  { value: "케이뱅크", label: "케이뱅크" },
  { value: "카카오뱅크", label: "카카오뱅크" },
  { value: "토스뱅크", label: "토스뱅크" },
  { value: "새마을금고", label: "새마을금고" },
  { value: "신협", label: "신협" },
  { value: "우체국", label: "우체국" },
];

export default function UserVerification() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const [verificationSent, setVerificationSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [bankVerified, setBankVerified] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("phone");
  const [countdown, setCountdown] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  // 사용자 인증 정보 가져오기
  const { data: userVerification, isLoading: isVerificationLoading } = useQuery({
    queryKey: ["/api/user/verification"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/user/verification");
        if (!res.ok) {
          // 아직 인증 정보가 없으면 기본값 반환
          if (res.status === 404) {
            return { phoneVerified: false, bankVerified: false };
          }
          throw new Error("인증 정보를 가져오는데 실패했습니다.");
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching verification data:", error);
        return { phoneVerified: false, bankVerified: false };
      }
    },
    enabled: !!user,
  });

  // 로딩이 완료되면 인증 상태 업데이트
  useEffect(() => {
    if (!isVerificationLoading && userVerification) {
      setPhoneVerified(userVerification.phoneVerified);
      setBankVerified(userVerification.bankVerified);
      
      // 인증 상태에 따라 활성 탭 설정
      if (userVerification.phoneVerified && !userVerification.bankVerified) {
        setActiveTab("bank");
      }
    }
  }, [isVerificationLoading, userVerification]);

  // 타이머 기능 구현
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timerActive && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0 && timerActive) {
      setTimerActive(false);
      setVerificationSent(false);
      toast({
        title: "인증번호가 만료되었습니다",
        description: "인증번호를 다시 요청해주세요",
        variant: "destructive",
      });
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown, timerActive, toast]);

  // 휴대폰 인증 폼
  const phoneForm = useForm<PhoneVerificationFormValues>({
    resolver: zodResolver(phoneVerificationSchema),
    defaultValues: {
      phoneNumber: "",
      verificationCode: "",
    },
  });

  // 계좌 인증 폼
  const bankForm = useForm<BankAccountFormValues>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      bankName: "",
      accountNumber: "",
      accountHolder: user?.username || "",
    },
  });

  // 인증번호 요청 뮤테이션
  const requestVerificationMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      const res = await apiRequest("POST", "/api/user/request-verification", { phoneNumber });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "인증번호 요청에 실패했습니다.");
      }
      return await res.json();
    },
    onSuccess: () => {
      setVerificationSent(true);
      setCountdown(180); // 3분 타이머 설정
      setTimerActive(true);
      toast({
        title: "인증번호가 발송되었습니다",
        description: "휴대폰으로 발송된 6자리 인증번호를 입력해주세요",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "인증번호 발송 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 인증번호 확인 뮤테이션
  const verifyCodeMutation = useMutation({
    mutationFn: async (data: PhoneVerificationFormValues) => {
      const res = await apiRequest("POST", "/api/user/verify-phone", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "인증번호 확인에 실패했습니다.");
      }
      return await res.json();
    },
    onSuccess: () => {
      setPhoneVerified(true);
      setActiveTab("bank"); // 다음 단계로 이동
      queryClient.invalidateQueries({ queryKey: ["/api/user/verification"] });
      toast({
        title: "휴대폰 인증이 완료되었습니다",
        description: "계좌 등록을 진행해주세요",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "인증번호 확인 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 계좌 등록 뮤테이션
  const registerBankAccountMutation = useMutation({
    mutationFn: async (data: BankAccountFormValues) => {
      const res = await apiRequest("POST", "/api/user/register-bank-account", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "계좌 등록에 실패했습니다.");
      }
      return await res.json();
    },
    onSuccess: () => {
      setBankVerified(true);
      queryClient.invalidateQueries({ queryKey: ["/api/user/verification"] });
      toast({
        title: "계좌 등록이 완료되었습니다",
        description: "이제 유료 서비스를 제공할 수 있습니다",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "계좌 등록 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 인증번호 요청 핸들러
  const handleRequestVerification = () => {
    const phoneNumber = phoneForm.getValues("phoneNumber");
    if (phoneForm.formState.errors.phoneNumber) {
      toast({
        title: "전화번호 입력 오류",
        description: phoneForm.formState.errors.phoneNumber.message,
        variant: "destructive",
      });
      return;
    }
    
    // 실제 인증번호 생성 (임의의 6자리 숫자) - 실제 환경에서는 서버에서 SMS로 발송
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 테스트를 위해 로컬스토리지에 임시로 저장
    localStorage.setItem('temp_verification_code', verificationCode);
    
    // 타이머 시작
    setVerificationSent(true);
    setTimerActive(true);
    setCountdown(180); // 3분 타이머
    
    // 테스트를 위해 토스트 메시지에 인증번호 표시 (실제 환경에서는 SMS로만 전송)
    toast({
      title: "인증번호가 발송되었습니다",
      description: `테스트용 인증번호: ${verificationCode} (실제 서비스에서는 SMS로 발송됩니다)`,
    });
    
    // API 호출 (실 환경에서는 이 호출이 SMS 발송을 처리)
    requestVerificationMutation.mutate(phoneNumber);
  };

  // 인증번호 확인 핸들러
  const onPhoneVerifySubmit = (data: PhoneVerificationFormValues) => {
    if (!verificationSent) {
      toast({
        title: "인증번호를 요청해주세요",
        description: "먼저 인증번호 요청 버튼을 클릭해주세요",
        variant: "destructive",
      });
      return;
    }
    
    if (!data.verificationCode) {
      toast({
        title: "인증번호를 입력해주세요",
        description: "휴대폰으로 발송된 6자리 인증번호를 입력해주세요",
        variant: "destructive",
      });
      return;
    }
    
    // 테스트 환경: 로컬 스토리지에서 임시 인증번호 가져오기
    const storedCode = localStorage.getItem('temp_verification_code');
    
    // 임의 발급된 코드와 입력값 비교 (실제 환경에서는 서버에서 검증)
    if (storedCode && data.verificationCode === storedCode) {
      // 인증 성공 처리 - 로컬에서 직접 처리
      setPhoneVerified(true);
      setActiveTab("bank"); // 다음 단계로 이동
      
      // UI 업데이트를 위한 상태 변경
      localStorage.removeItem('temp_verification_code'); // 사용한 코드 제거
      
      toast({
        title: "휴대폰 인증이 완료되었습니다",
        description: "계좌 등록을 진행해주세요",
      });
      
      // 서버 API 호출 (실제 환경에서는 이 API가 인증번호 검증 수행)
      verifyCodeMutation.mutate(data);
    } else {
      toast({
        title: "인증번호가 일치하지 않습니다",
        description: "정확한 인증번호를 입력해주세요",
        variant: "destructive",
      });
    }
  };

  // 계좌 등록 핸들러
  const onBankAccountSubmit = (data: BankAccountFormValues) => {
    // 계좌번호 유효성 추가 검증 (실제 환경에서는 은행 API 연동)
    if (data.accountNumber.replace(/-/g, '').length < 10) {
      toast({
        title: "유효하지 않은 계좌번호",
        description: "정확한 계좌번호를 입력해주세요",
        variant: "destructive",
      });
      return;
    }
    
    // 테스트 환경: 계좌 유효성 확인 시뮬레이션
    setBankVerified(true);
    
    toast({
      title: "계좌 등록이 완료되었습니다",
      description: "정상적으로 계좌가 등록되었습니다. 이제 유료 서비스를 제공할 수 있습니다.",
    });
    
    // 실제 환경: 서버 API 호출
    registerBankAccountMutation.mutate(data);
  };

  // 휴대폰 번호 포맷팅 (자동 하이픈 추가)
  const formatPhoneNumber = (value: string) => {
    if (!value) return value;
    
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, '');
    
    // 4자리 이하
    if (numbers.length < 4) return numbers;
    // 4자리 초과 7자리 이하
    if (numbers.length < 8) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    }
    // 7자리 초과
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  // 계좌번호 포맷팅 (자동 하이픈 추가)
  const formatAccountNumber = (value: string) => {
    if (!value) return value;
    
    // 숫자와 하이픈만 추출
    const cleaned = value.replace(/[^\d-]/g, '');
    
    // 하이픈이 이미 포함된 경우 그대로 반환
    if (cleaned.includes('-')) return cleaned;
    
    // 은행별로 계좌번호 형식이 다르므로 일반적인 포맷 적용
    // 일반적으로 3~4자리 단위로 하이픈 추가
    let formatted = '';
    for (let i = 0; i < cleaned.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += '-';
      }
      formatted += cleaned[i];
    }
    
    return formatted;
  };

  if (isAuthLoading || isVerificationLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>
              본인 인증을 진행하려면 먼저 로그인해주세요.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => navigate("/auth")}>
              로그인 페이지로 이동
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">본인 인증 및 계좌 등록</h1>
        <p className="text-muted-foreground">
          유료 서비스를 제공하기 위해서는 본인 인증과 계좌 등록이 필요합니다.
        </p>
        
        {/* 인증 진행 상태 카드 */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
              <div className="flex items-center gap-3">
                <div className={`rounded-full p-2 ${phoneVerified ? 'bg-green-100' : 'bg-muted'}`}>
                  <ShieldCheck className={`h-6 w-6 ${phoneVerified ? 'text-green-600' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className="font-medium">휴대폰 본인 인증</p>
                  <p className="text-sm text-muted-foreground">
                    {phoneVerified ? '완료됨' : '필요함'}
                  </p>
                </div>
              </div>
              
              <div className="hidden md:block">
                <ChevronRight className="h-6 w-6 text-muted-foreground" />
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`rounded-full p-2 ${bankVerified ? 'bg-green-100' : 'bg-muted'}`}>
                  <CreditCard className={`h-6 w-6 ${bankVerified ? 'text-green-600' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className="font-medium">계좌 등록</p>
                  <p className="text-sm text-muted-foreground">
                    {bankVerified ? '완료됨' : '필요함'}
                  </p>
                </div>
              </div>
              
              <div className="hidden md:block">
                <ChevronRight className="h-6 w-6 text-muted-foreground" />
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`rounded-full p-2 ${(phoneVerified && bankVerified) ? 'bg-green-100' : 'bg-muted'}`}>
                  <Check className={`h-6 w-6 ${(phoneVerified && bankVerified) ? 'text-green-600' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className="font-medium">게시물 업로드</p>
                  <p className="text-sm text-muted-foreground">
                    {(phoneVerified && bankVerified) ? '가능' : '인증 필요'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="phone" disabled={phoneVerified}>
            <Phone className="h-4 w-4 mr-2" />
            휴대폰 본인 인증
            {phoneVerified && <CheckCircle2 className="h-4 w-4 ml-2 text-green-600" />}
          </TabsTrigger>
          <TabsTrigger value="bank" disabled={!phoneVerified || bankVerified}>
            <CreditCard className="h-4 w-4 mr-2" />
            계좌 등록
            {bankVerified && <CheckCircle2 className="h-4 w-4 ml-2 text-green-600" />}
          </TabsTrigger>
        </TabsList>

        {/* 휴대폰 인증 탭 */}
        <TabsContent value="phone">
          <Card>
            <CardHeader>
              <CardTitle>휴대폰 본인 인증</CardTitle>
              <CardDescription>
                휴대폰 인증을 통해 본인 확인을 진행합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {phoneVerified ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <h3 className="font-medium">인증 완료</h3>
                  </div>
                  <p className="text-sm">
                    휴대폰 본인 인증이 완료되었습니다. 계좌 등록을 진행해주세요.
                  </p>
                </div>
              ) : (
                <Form {...phoneForm}>
                  <form onSubmit={phoneForm.handleSubmit(onPhoneVerifySubmit)} className="space-y-6">
                    <FormField
                      control={phoneForm.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>휴대폰 번호</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input
                                placeholder="010-1234-5678"
                                {...field}
                                value={formatPhoneNumber(field.value)}
                                onChange={(e) => {
                                  field.onChange(e);
                                  // 인증번호 요청 후 전화번호 변경 시 상태 초기화
                                  if (verificationSent) {
                                    setVerificationSent(false);
                                    setTimerActive(false);
                                    setCountdown(0);
                                    phoneForm.setValue("verificationCode", "");
                                  }
                                }}
                                disabled={verificationSent}
                              />
                            </FormControl>
                            <Button
                              type="button"
                              onClick={handleRequestVerification}
                              disabled={requestVerificationMutation.isPending || verificationSent}
                            >
                              {requestVerificationMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              ) : verificationSent ? (
                                <>
                                  <Timer className="h-4 w-4 mr-1" />
                                  {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
                                </>
                              ) : (
                                "인증번호 요청"
                              )}
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {verificationSent && (
                      <FormField
                        control={phoneForm.control}
                        name="verificationCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>인증번호</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input
                                  placeholder="6자리 인증번호 입력"
                                  {...field}
                                  maxLength={6}
                                />
                              </FormControl>
                              <Button
                                type="submit"
                                disabled={verifyCodeMutation.isPending || !field.value}
                              >
                                {verifyCodeMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                ) : (
                                  "확인"
                                )}
                              </Button>
                            </div>
                            <FormDescription>
                              인증번호 유효시간: {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 계좌 등록 탭 */}
        <TabsContent value="bank">
          <Card>
            <CardHeader>
              <CardTitle>계좌 등록</CardTitle>
              <CardDescription>
                서비스 수익금 정산을 위한 계좌 정보를 등록합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bankVerified ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <h3 className="font-medium">등록 완료</h3>
                  </div>
                  <p className="text-sm">
                    계좌 등록이 완료되었습니다. 이제 유료 서비스를 제공할 수 있습니다.
                  </p>
                </div>
              ) : (
                <Form {...bankForm}>
                  <form onSubmit={bankForm.handleSubmit(onBankAccountSubmit)} className="space-y-6">
                    <FormField
                      control={bankForm.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>은행</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="은행을 선택하세요" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {bankList.map((bank) => (
                                <SelectItem key={bank.value} value={bank.value}>
                                  {bank.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={bankForm.control}
                      name="accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>계좌번호</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="계좌번호 입력 (숫자만 입력)"
                              {...field}
                              value={formatAccountNumber(field.value)}
                            />
                          </FormControl>
                          <FormDescription>
                            숫자와 하이픈(-)만 입력 가능합니다
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={bankForm.control}
                      name="accountHolder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>예금주</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="예금주명"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            계좌 명의는 회원 정보와 일치해야 합니다
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertTitle>계좌 등록 주의사항</AlertTitle>
                      <AlertDescription className="text-xs mt-2">
                        <ul className="list-disc pl-4 space-y-1">
                          <li>등록된 계좌로 서비스 수익금이 정산됩니다</li>
                          <li>계좌 명의는 회원 정보의 실명과 일치해야 합니다</li>
                          <li>잘못된 계좌 정보 입력 시 정산이 지연될 수 있습니다</li>
                          <li>개인 계좌와 사업자 계좌 모두 등록 가능합니다</li>
                        </ul>
                      </AlertDescription>
                    </Alert>

                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={registerBankAccountMutation.isPending}
                      >
                        {registerBankAccountMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            처리 중...
                          </>
                        ) : (
                          "계좌 등록하기"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 인증 완료 시 안내 메시지 */}
      {phoneVerified && bankVerified && (
        <Card className="mt-8 bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 rounded-full p-2">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-green-800">본인 인증 및 계좌 등록이 완료되었습니다</h3>
                <p className="text-sm text-green-700 mt-1">
                  이제 유료 서비스를 등록하고 제공할 수 있습니다. 서비스 수익금은 등록한 계좌로 정산됩니다.
                </p>
                <div className="mt-4 flex gap-3">
                  <Button 
                    variant="outline" 
                    className="bg-white border-green-300 text-green-700 hover:bg-green-50"
                    onClick={() => navigate("/")}
                  >
                    홈으로 이동
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => navigate("/register-service")}
                  >
                    서비스 등록하기
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}