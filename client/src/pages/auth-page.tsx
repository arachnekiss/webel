import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation, useRoute } from 'wouter';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2, Eye, EyeOff } from 'lucide-react';

// 로그인 폼 유효성 검사를 위한 스키마 생성 함수
const createLoginSchema = (t: (key: string) => string) => z.object({
  username: z.string().min(3, t('auth.errors.usernameMin')),
  password: z.string().min(6, t('auth.errors.passwordMin'))
});

// 회원가입 폼 유효성 검사를 위한 스키마 생성 함수
const createRegisterSchema = (t: (key: string) => string) => z.object({
  fullName: z.string().max(50, t('auth.errors.fullNameMax')),
  email: z.string().email(t('auth.errors.emailInvalid')),
  username: z.string().min(3, t('auth.errors.usernameMin')),
  password: z.string().min(6, t('auth.errors.passwordMin'))
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

interface AuthPageProps {
  initialTab?: 'login' | 'register';
}

const AuthPage: React.FC<AuthPageProps> = ({ initialTab = 'login' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [, navigate] = useLocation();
  const [matchLogin] = useRoute('/login');
  const [matchRegister] = useRoute('/register');
  const { user, isLoading, loginMutation, registerMutation } = useAuth();
  const { t } = useLanguage();

  // 로그인 상태라면 메인 페이지로 리디렉션
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  // URL에 따라 탭 자동 전환
  useEffect(() => {
    if (matchLogin) {
      setActiveTab('login');
    } else if (matchRegister) {
      setActiveTab('register');
    }
  }, [matchLogin, matchRegister]);

  // 로그인 폼 설정
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: ''
    }
  });

  // 회원가입 폼 설정
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      fullName: ''
    }
  });

  // 로그인 처리
  const handleLogin = async (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  // 회원가입 처리
  const handleRegister = async (values: RegisterFormValues) => {
    registerMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* 왼쪽 인증 폼 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">{t('auth.welcomeTitle')}</CardTitle>
            <CardDescription className="text-center">
              {activeTab === 'login' ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')} className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="login">{t('auth.loginTab')}</TabsTrigger>
                <TabsTrigger value="register">{t('auth.registerTab')}</TabsTrigger>
              </TabsList>
              
              {/* 로그인 폼 */}
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.username')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('auth.username')} {...field} />
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
                          <FormLabel>{t('auth.password')}</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input 
                                type={showLoginPassword ? "text" : "password"} 
                                placeholder={t('auth.password')} 
                                {...field} 
                              />
                            </FormControl>
                            <button 
                              type="button" 
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              onClick={() => setShowLoginPassword(!showLoginPassword)}
                            >
                              {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {t('auth.login')}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              {/* 회원가입 폼 */}
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.fullName')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('auth.fullNamePlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.email')}</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder={t('auth.emailPlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.username')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('auth.usernamePlaceholder')} {...field} />
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
                          <FormLabel>{t('auth.password')}</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input 
                                type={showRegisterPassword ? "text" : "password"} 
                                placeholder={t('auth.passwordPlaceholder')} 
                                {...field} 
                              />
                            </FormControl>
                            <button 
                              type="button" 
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                            >
                              {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {t('auth.register')}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* 오른쪽 소개 영역 */}
      <div className="hidden md:flex flex-1 flex-col bg-primary text-white p-8 items-center justify-center">
        <div className="max-w-md">
          <h2 className="text-3xl font-bold mb-4">{t('auth.welcomeToWebel')}</h2>
          <p className="mb-6 text-lg">
            {t('auth.platformDescription')}
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-white/20 p-2 rounded-full mr-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">{t('auth.resourceSharing')}</h3>
                <p>{t('auth.resourceSharingDescription')}</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-white/20 p-2 rounded-full mr-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">{t('auth.locationBasedServices')}</h3>
                <p>{t('auth.locationBasedServicesDescription')}</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-white/20 p-2 rounded-full mr-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 8V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 8V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">{t('auth.aiAssistant')}</h3>
                <p>{t('auth.aiAssistantDescription')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;