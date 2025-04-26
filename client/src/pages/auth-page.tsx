import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

// 로그인 폼 스키마
const loginSchema = z.object({
  username: z.string().min(1, { message: '사용자 이름을 입력해주세요.' }),
  password: z.string().min(1, { message: '비밀번호를 입력해주세요.' }),
});

// 회원가입 폼 스키마
const registerSchema = z.object({
  username: z.string().min(3, { message: '사용자 이름은 최소 3자 이상이어야 합니다.' }),
  email: z.string().email({ message: '유효한 이메일 주소를 입력해주세요.' }),
  fullName: z.string().min(2, { message: '이름을 입력해주세요.' }),
  password: z.string().min(6, { message: '비밀번호는 최소 6자 이상이어야 합니다.' }),
  confirmPassword: z.string().min(1, { message: '비밀번호 확인을 입력해주세요.' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다.",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const AuthPage: React.FC = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);

  // 현재 로그인된 사용자 정보 확인
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['/api/user'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/user');
        if (res.status === 401) return null;
        return await res.json();
      } catch (error) {
        return null;
      }
    },
  });

  // 로그인 폼 설정
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // 회원가입 폼 설정
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      fullName: '',
      password: '',
      confirmPassword: '',
    },
  });

  // 로그인 처리
  const handleLogin = async (values: LoginFormValues) => {
    setIsLoginLoading(true);
    try {
      const res = await apiRequest('POST', '/api/login', values);
      
      if (!res.ok) {
        throw new Error('로그인에 실패했습니다. 사용자 이름과 비밀번호를 확인해주세요.');
      }
      
      toast({
        title: '로그인 성공',
        description: '환영합니다!',
      });
      
      setLocation('/');
    } catch (error) {
      toast({
        title: '로그인 실패',
        description: error instanceof Error ? error.message : '오류가 발생했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
    } finally {
      setIsLoginLoading(false);
    }
  };

  // 회원가입 처리
  const handleRegister = async (values: RegisterFormValues) => {
    setIsRegisterLoading(true);
    try {
      // confirmPassword 제거
      const { confirmPassword, ...registerData } = values;
      
      const res = await apiRequest('POST', '/api/register', registerData);
      
      if (!res.ok) {
        throw new Error('회원가입에 실패했습니다. 다시 시도해주세요.');
      }
      
      toast({
        title: '회원가입 성공',
        description: '환영합니다! 로그인하여 Webel의 모든 기능을 이용해보세요.',
      });
      
      // 로그인 탭으로 전환
      document.getElementById('login-tab')?.click();
      
      // 로그인 폼에 사용자 이름 자동 채우기
      loginForm.setValue('username', values.username);
    } catch (error) {
      toast({
        title: '회원가입 실패',
        description: error instanceof Error ? error.message : '오류가 발생했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
    } finally {
      setIsRegisterLoading(false);
    }
  };

  // 사용자가 이미 로그인한 경우 홈페이지로 리다이렉트
  if (user && !isUserLoading) {
    setLocation('/');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8 items-center">
        {/* 왼쪽: 인증 폼 */}
        <div className="w-full md:w-1/2 max-w-md mx-auto">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger id="login-tab" value="login">로그인</TabsTrigger>
              <TabsTrigger value="register">회원가입</TabsTrigger>
            </TabsList>
            
            {/* 로그인 폼 */}
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Webel에 로그인</CardTitle>
                  <CardDescription>
                    계정 정보를 입력하여 로그인하세요.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>사용자 이름</FormLabel>
                            <FormControl>
                              <Input placeholder="사용자 이름을 입력하세요" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>비밀번호</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="비밀번호를 입력하세요" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={isLoginLoading}>
                        {isLoginLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            로그인 중...
                          </>
                        ) : (
                          '로그인'
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* 회원가입 폼 */}
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Webel 회원가입</CardTitle>
                  <CardDescription>
                    계정을 만들어 Webel의 모든 기능을 이용해보세요.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>사용자 이름</FormLabel>
                            <FormControl>
                              <Input placeholder="사용자 이름을 입력하세요" {...field} />
                            </FormControl>
                            <FormDescription>
                              로그인에 사용할 사용자 이름입니다.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>이메일</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="이메일을 입력하세요" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>이름</FormLabel>
                            <FormControl>
                              <Input placeholder="이름을 입력하세요" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>비밀번호</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="비밀번호를 입력하세요" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>비밀번호 확인</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="비밀번호를 다시 입력하세요" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={isRegisterLoading}>
                        {isRegisterLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            가입 중...
                          </>
                        ) : (
                          '회원가입'
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* 오른쪽: 소개 섹션 */}
        <div className="w-full md:w-1/2 space-y-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-primary mb-2">Webel에 오신 것을 환영합니다</h1>
            <p className="text-lg text-gray-600 mb-6">
              엔지니어, 소비자, 제조업체를 연결하는 지능형 플랫폼
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">리소스 접근</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  하드웨어 설계도, 소프트웨어, AI 모델, 3D 모델링 파일 등 다양한 리소스에 접근하고 공유할 수 있습니다.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-teal-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">위치 기반 서비스</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  가까운 3D 프린팅 서비스와 제조업체를 쉽게 찾고 연결할 수 있습니다.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">AI 조립 비서</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  OpenAI의 최신 GPT-4o 모델을 활용한 AI 비서가 조립과 제작 과정을 도와드립니다.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">전문가 지원</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Webel 커뮤니티의 전문가들에게 실시간으로 도움을 요청하고 받을 수 있습니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;