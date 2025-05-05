import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Heart, Star, Zap, Shield, CheckCircle, Gift, 
  MessageSquare, User, Calendar, Copy, ExternalLink,
  CreditCard, Building, Smartphone, DollarSign, Globe, Coffee
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiRequest } from '@/lib/queryClient';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import PayPalButton from '@/components/PayPalButton';

// 후원 코멘트 타입 정의
interface SponsorComment {
  id: number;
  userId: number;
  username: string;
  amount: number;
  tier: string;
  message: string;
  createdAt: string;
  avatarUrl?: string;
}

// 결제 수단 타입 정의
type PaymentMethod = 'card' | 'bank' | 'kakaopay' | 'naverpay' | 'payco' | 'tosspay' | 'phone' | 'virtualaccount' | 'foreigncard' | 'paypal' | 'alipay';

const Sponsor: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [comment, setComment] = useState('');
  const [amount, setAmount] = useState<number>(5000);
  const [customAmount, setCustomAmount] = useState<number | ''>('');
  const [comments, setComments] = useState<SponsorComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('bank');
  
  // 샘플 코멘트 데이터
  useEffect(() => {
    // 실제로는 API에서 데이터를 가져와야 함
    const sampleComments: SponsorComment[] = [
      {
        id: 1,
        userId: 1,
        username: '엔지니어1',
        amount: 15000,
        tier: '파트너',
        message: 'Webel 팀의 노고에 감사드립니다. 앞으로도 좋은 서비스 기대할게요!',
        createdAt: '2025-04-20T12:00:00Z',
      },
      {
        id: 2,
        userId: 2,
        username: '메이커1',
        amount: 30000,
        tier: '혁신가',
        message: '3D 프린팅 커뮤니티를 위한 여러분의 노력이 정말 대단합니다. 앞으로도 응원합니다!',
        createdAt: '2025-04-19T10:30:00Z',
      },
      {
        id: 3,
        userId: 3,
        username: 'JohnDoe',
        amount: 5000,
        tier: '서포터',
        message: '리소스 공유 기능이 매우 유용하게 사용하고 있습니다. 감사합니다!',
        createdAt: '2025-04-18T15:45:00Z',
      }
    ];
    
    setComments(sampleComments);
  }, []);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // 선택한 금액에 따라 결제 대화상자 표시
  const handleSponsorAmount = (amount: number) => {
    setSelectedTier('후원');
    setSelectedAmount(amount);
    setShowPaymentDialog(true);
  };
  
  // 후원 완료 효과를 위한 상태
  const [activatedAmount, setActivatedAmount] = useState<number | null>(null);
  const [activationTimer, setActivationTimer] = useState<NodeJS.Timeout | null>(null);
  
  // 결제 완료 처리
  const handlePaymentComplete = () => {
    // 실제로는 여기서 서버에 결제 정보와 코멘트를 전송
    setIsLoading(true);
    
    // 결제 처리 시뮬레이션 (실제로는 API 호출)
    setTimeout(() => {
      setIsLoading(false);
      setShowPaymentDialog(false);
      
      // 새 코멘트를 목록에 추가 (실제로는 서버에서 받아와야 함)
      if (comment.trim()) {
        const newComment: SponsorComment = {
          id: comments.length + 1,
          userId: user?.id || 0,
          username: user?.username || '익명',
          amount: selectedAmount,
          tier: selectedTier,
          message: comment,
          createdAt: new Date().toISOString(),
        };
        
        setComments(prev => [newComment, ...prev]);
      }
      
      // 결제 완료 알림 (토스트는 제거하고 캐릭터 애니메이션으로 대체)
      setActivatedAmount(selectedAmount);
      
      // 5초 후에 활성화된 캐릭터 상태 초기화
      if (activationTimer) {
        clearTimeout(activationTimer);
      }
      
      const timer = setTimeout(() => {
        setActivatedAmount(null);
      }, 5000);
      
      setActivationTimer(timer);
      
      // 폼 초기화
      setComment('');
      setCustomAmount('');
    }, 1500);
  };
  
  // 결제 수단 선택 핸들러
  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    
    // PayPal이 선택되면 결제 다이얼로그 열기
    if (method === 'paypal') {
      setSelectedTier(language === 'ko' 
        ? 'PayPal 후원' 
        : language === 'jp' 
          ? 'PayPalサポート' 
          : 'PayPal Support');
      setSelectedAmount(customAmount && typeof customAmount === 'number' && customAmount >= 1000 ? customAmount : 5000);
      setShowPaymentDialog(true);
    }
  };
  
  // PayPal 버튼 초기화
  useEffect(() => {
    // 바깥 스코프의 language와 customAmount 값을 클로저로 캡처
    const paypalButton = document.getElementById('paypal-button');
    
    if (paypalButton) {
      // 클릭 핸들러 함수 - 클릭 시 결제 모달 열기
      const clickHandler = () => {
        // 티어 이름 설정
        const tierName = language === 'jp' ? 'PayPalサポート' : 'PayPal Support';
        // 금액 설정 (customAmount가 있으면 그 값, 없으면 5000)
        const amount = customAmount && typeof customAmount === 'number' && customAmount >= 1000 ? customAmount : 5000;
        
        // 결제 정보 설정 및 다이얼로그 열기
        setSelectedPaymentMethod('paypal');
        setSelectedTier(tierName);
        setSelectedAmount(amount);
        setShowPaymentDialog(true);
      };
      
      // 이벤트 리스너 등록
      paypalButton.addEventListener('click', clickHandler);
      
      // 클린업 함수 - 컴포넌트 언마운트 시 이벤트 리스너 제거
      return () => {
        paypalButton.removeEventListener('click', clickHandler);
      };
    }
  }, [language, customAmount]);
  
  // 금액에 따라 캐릭터 배경색 결정
  const getCharacterColor = (amount: number, isActivated = false): string => {
    // 기본 색상 (활성화 상태일 때 더 밝은 색상)
    const colors: Record<number, [string, string]> = {
      500: ['bg-blue-50', 'bg-blue-100'], // 라이트 블루
      1000: ['bg-green-50', 'bg-green-100'], // 라이트 그린
      5000: ['bg-orange-50', 'bg-orange-100'], // 라이트 오렌지
      10000: ['bg-red-50', 'bg-red-100'], // 라이트 레드
      50000: ['bg-purple-50', 'bg-purple-100'], // 라이트 퍼플
      100000: ['bg-yellow-50', 'bg-yellow-100'], // 라이트 옐로우
    };
    
    return colors[amount] ? colors[amount][isActivated ? 1 : 0] : 'bg-gray-50'; // 기본값은 라이트 그레이
  };
  
  // 금액별 아이콘 결정
  const getAmountIcon = (amount: number) => {
    const icons: Record<number, React.ReactNode> = {
      500: <Star className="h-8 w-8 text-blue-500" />,
      1000: <Zap className="h-8 w-8 text-green-500" />,
      5000: <Heart className="h-8 w-8 text-orange-500" />,
      10000: <Gift className="h-8 w-8 text-red-500" />,
      50000: <Shield className="h-8 w-8 text-purple-500" />,
      100000: <DollarSign className="h-8 w-8 text-yellow-500" />,
    };
    
    return icons[amount] || <Star className="h-8 w-8 text-gray-500" />;
  };
  
  // 통화 단위 설정
  const getCurrency = () => {
    switch(language) {
      case 'jp': return { symbol: '¥', code: 'JPY', rate: 100 }; // 환율 적용 (예: 1원 = 0.1엔)
      case 'en': return { symbol: '$', code: 'USD', rate: 0.00075 }; // 환율 적용 (예: 1원 = 0.00075달러)
      default: return { symbol: '₩', code: 'KRW', rate: 1 };
    }
  };
  
  const currency = getCurrency();
  
  // 금액 표시 포맷
  const formatAmount = (amount: number) => {
    const convertedAmount = amount * currency.rate;
    return `${currency.symbol}${convertedAmount.toLocaleString(
      language === 'jp' ? 'ja-JP' : language === 'en' ? 'en-US' : 'ko-KR',
      { maximumFractionDigits: currency.code === 'KRW' ? 0 : 2 }
    )}`;
  };
  
  return (
    <main className="container mx-auto px-4 py-6">
      {/* Hero section */}
      <section className="bg-gradient-to-r from-amber-500 to-pink-500 rounded-2xl overflow-hidden shadow-lg mb-12">
        <div className="md:flex">
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {language === 'ko' 
                ? 'Webel을 후원해주세요' 
                : language === 'jp' 
                  ? 'Webelをサポートしてください' 
                  : 'Support Webel'}
            </h1>
            <p className="text-amber-50 mb-6">
              {language === 'ko' 
                ? '여러분의 후원은 더 많은 무료 리소스와 혁신적인 서비스를 제공하는 데 큰 도움이 됩니다. Webel과 함께 생산 생태계의 혁신을 만들어가세요.' 
                : language === 'jp' 
                  ? 'あなたのサポートは、より多くの無料リソースと革新的なサービスを提供するのに大きな助けとなります。Webelと一緒に生産エコシステムのイノベーションを作りましょう。' 
                  : 'Your support helps us provide more free resources and innovative services. Join Webel in creating innovations for the production ecosystem.'}
            </p>
            <div className="flex items-center gap-3">
              <Heart className="h-6 w-6 text-white" />
              <span className="text-white font-medium">
                {language === 'ko' 
                  ? '여러분의 후원으로 더 나은 서비스를 만들어갑니다' 
                  : language === 'jp' 
                    ? 'あなたのサポートでより良いサービスを作ります' 
                    : 'We create better services with your support'}
              </span>
            </div>
          </div>
          <div className="md:w-1/2 p-6 hidden md:flex items-center justify-center">
            <img 
              src="/images/sponsor-donation.png" 
              alt={language === 'ko' 
                ? '후원과 기부' 
                : language === 'jp' 
                  ? 'サポートと寄付' 
                  : 'Support and Donation'} 
              className="rounded-lg shadow-lg max-h-96 object-cover" 
            />
          </div>
        </div>
      </section>
      
      {/* 후원 의미 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {language === 'ko' 
            ? '후원의 의미' 
            : language === 'jp' 
              ? 'サポートの意味' 
              : 'Meaning of Support'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <Star className="h-12 w-12 text-amber-500 mb-2" />
              <CardTitle>
                {language === 'ko' 
                  ? '오픈 소스 지원' 
                  : language === 'jp' 
                    ? 'オープンソースのサポート' 
                    : 'Open Source Support'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                {language === 'ko' 
                  ? '여러분의 후원은 Webel이 더 많은 오픈 소스 하드웨어 및 소프트웨어 프로젝트를 지원하는 데 사용됩니다.' 
                  : language === 'jp' 
                    ? 'あなたのサポートは、Webelがより多くのオープンソースハードウェアやソフトウェアプロジェクトをサポートするために使用されます。' 
                    : 'Your support will be used to help Webel support more open source hardware and software projects.'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <Zap className="h-12 w-12 text-amber-500 mb-2" />
              <CardTitle>
                {language === 'ko' 
                  ? '커뮤니티 성장' 
                  : language === 'jp' 
                    ? 'コミュニティの成長' 
                    : 'Community Growth'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                {language === 'ko' 
                  ? '엔지니어와 소비자를 연결하는 커뮤니티 플랫폼을 운영하고 발전시키는 데 도움이 됩니다.' 
                  : language === 'jp' 
                    ? 'エンジニアと消費者をつなぐコミュニティプラットフォームの運営と発展に役立ちます。' 
                    : 'It helps to operate and develop a community platform that connects engineers and consumers.'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <Gift className="h-12 w-12 text-amber-500 mb-2" />
              <CardTitle>
                {language === 'ko' 
                  ? '서비스 안정성' 
                  : language === 'jp' 
                    ? 'サービスの安定性' 
                    : 'Service Stability'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                {language === 'ko' 
                  ? 'Webel 서비스의 안정적인 운영과 지속 가능한 발전을 위한 인프라 유지에 기여합니다.' 
                  : language === 'jp' 
                    ? 'Webelサービスの安定した運営と持続可能な発展のためのインフラ維持に貢献します。' 
                    : 'It contributes to maintaining infrastructure for stable operation and sustainable development of Webel services.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* 계좌 정보 표시 */}
      <section className="mb-8">
        <Card className="border-2 border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-center gap-2 min-w-[210px]">
                <Building className="h-5 w-5 text-amber-600" />
                <span className="font-semibold text-amber-900">
                  {language === 'ko' 
                    ? '직접 계좌이체로 후원하기:' 
                    : language === 'jp' 
                      ? '直接口座振込でサポート:' 
                      : 'Direct Bank Transfer:'}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <span className="text-gray-600">
                    {language === 'ko' 
                      ? 'KB국민은행' 
                      : language === 'jp' 
                        ? 'KB国民銀行' 
                        : 'KB Kookmin Bank'}
                  </span>
                  <span className="font-medium">089501-04-288396</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-0 h-6 w-6 ml-1"
                    onClick={() => {
                      navigator.clipboard.writeText('089501-04-288396');
                      toast({
                        title: language === 'ko' 
                          ? "복사됨" 
                          : language === 'jp' 
                            ? "コピーされました" 
                            : "Copied",
                        description: language === 'ko' 
                          ? "계좌번호가 클립보드에 복사되었습니다." 
                          : language === 'jp' 
                            ? "口座番号がクリップボードにコピーされました。" 
                            : "Account number copied to clipboard.",
                      });
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="text-gray-700">
                  <span className="text-gray-600 mr-1">
                    {language === 'ko' 
                      ? '예금주:' 
                      : language === 'jp' 
                        ? '口座名義:' 
                        : 'Account holder:'}
                  </span>
                  <span className="font-medium">
                    {language === 'ko' || language === 'en'
                      ? '허무' 
                      : 'ホ・ム'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
      
      {/* Buy Me a Coffee 후원 */}
      <section className="mb-8">
        <Card 
          className="border-2 border-amber-200 bg-gradient-to-r from-[#ffdd00]/10 to-[#ffdd00]/30 hover:shadow-lg transition-shadow"
        >
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-shrink-0 cursor-pointer bg-[#ffdd00] rounded-md px-3 py-2 flex items-center" onClick={(e) => {
                e.stopPropagation();
                window.open('https://buymeacoffee.com/webel', '_blank');
              }}>
                <Coffee className="h-5 w-5 mr-2 text-black" />
                <span className="font-bold text-black">Buy Me a Coffee</span>
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {language === 'ko' 
                    ? 'Buy Me a Coffee로 후원하기' 
                    : language === 'jp' 
                      ? 'Buy Me a Coffeeでサポート' 
                      : 'Support with Buy Me a Coffee'}
                </h3>
                <p className="text-gray-600 mb-3">
                  {language === 'ko' 
                    ? '커피 한잔 가격으로 Webel 프로젝트 개발을 응원해주세요!' 
                    : language === 'jp' 
                      ? 'コーヒー1杯の価格でWebelプロジェクトの開発を応援してください！' 
                      : 'Support Webel project development with the price of a cup of coffee!'}
                </p>
                <div className="flex md:flex-row flex-col gap-2">
                  <Button 
                    variant="outline" 
                    className="bg-[#ffdd00]/20 border-[#ffdd00] text-[#825f00] hover:bg-[#ffdd00]/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open('https://buymeacoffee.com/webel', '_blank');
                    }}
                  >
                    <Coffee className="h-4 w-4 mr-2" />
                    {language === 'ko' 
                      ? '커피 한잔 선물하기' 
                      : language === 'jp' 
                        ? 'コーヒーを1杯贈る' 
                        : 'Buy a coffee'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="bg-[#ffdd00]/20 border-[#ffdd00] text-[#825f00] hover:bg-[#ffdd00]/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open('https://buymeacoffee.com/webel', '_blank');
                    }}
                  >
                    <Coffee className="h-4 w-4 mr-2" />
                    {language === 'ko' 
                      ? '커피 다섯잔 선물하기' 
                      : language === 'jp' 
                        ? 'コーヒーを5杯贈る' 
                        : 'Buy 5 coffees'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
      
      {/* PayPal 후원 (only visible for non-Korean languages) */}
      {language !== 'ko' && (
        <section className="mb-8">
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100/30 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div 
                  className="flex-shrink-0 bg-blue-500 rounded-md px-3 py-2 flex items-center cursor-pointer" 
                  onClick={() => setSelectedPaymentMethod('paypal')}
                >
                  <Globe className="h-5 w-5 mr-2 text-white" />
                  <span className="font-bold text-white">PayPal</span>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    {language === 'jp' 
                      ? 'PayPalでサポート' 
                      : 'Support with PayPal'}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    {language === 'jp' 
                      ? '国際的な支払いが簡単なPayPalでWebelをサポートしましょう！' 
                      : 'Support Webel with PayPal for easy international payments!'}
                  </p>
                  <div className="mt-2">
                    <div id="paypal-button" className="w-full p-2 bg-blue-50 rounded-md shadow cursor-pointer hover:bg-blue-100 transition-colors flex items-center justify-center">
                      <Globe className="h-5 w-5 mr-2 text-blue-600" />
                      <span className="font-bold text-blue-600">
                        {language === 'jp' 
                          ? 'PayPalで支払う' 
                          : 'Pay with PayPal'}
                      </span>
                    </div>
                    <div className="mt-4 hidden">
                      <PayPalButton
                        amount={(customAmount || 5000 * currency.rate).toString()}
                        currency={currency.code}
                        intent="CAPTURE"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}
      
      {/* 후원 금액 버튼 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {language === 'ko' 
            ? '바로 후원하기' 
            : language === 'jp' 
              ? '今すぐサポート' 
              : 'Support Now'}
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[500, 1000, 5000, 10000, 50000, 100000].map((amount) => (
            <Card 
              key={amount} 
              className="border-2 transition-all duration-300 hover:shadow-lg overflow-hidden group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <CardContent className="p-4 relative">
                <div className="w-full aspect-square flex items-center justify-center mb-3 relative overflow-hidden">
                  {/* 금액별 아이콘으로 변경 */}
                  <div className={`rounded-full w-24 h-24 ${getCharacterColor(amount)} flex items-center justify-center transition-all duration-300 ${activatedAmount === amount ? 'opacity-0 scale-90' : 'group-hover:scale-110'}`}>
                    {getAmountIcon(amount)}
                  </div>
                  
                  {/* 후원 완료 시 표시되는 극적인 변화 */}
                  {activatedAmount === amount && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
                      <div className={`rounded-full w-24 h-24 ${getCharacterColor(amount, true)} flex items-center justify-center animate-bounce`}>
                        {getAmountIcon(amount)}
                      </div>
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 animate-float">
                        <div className="bg-amber-500 text-white text-lg font-bold px-3 py-1 rounded-full shadow-lg">
                          {language === 'ko' 
                            ? '감사합니다!' 
                            : language === 'jp' 
                              ? 'ありがとう！' 
                              : 'Thank you!'}
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-amber-300/30 animate-pulse rounded-full"></div>
                    </div>
                  )}
                  
                  {/* 호버 효과 (텍스트 없이 배경 효과만) */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-amber-200/40 to-transparent opacity-0 ${activatedAmount === amount ? '' : 'group-hover:opacity-100'} rounded-full transition-all duration-500`}></div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-bold mb-2">{formatAmount(amount)}</div>
                  <Button 
                    className="w-full bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600"
                    onClick={() => handleSponsorAmount(amount)}
                  >
                    {language === 'ko' 
                      ? '후원하기' 
                      : language === 'jp' 
                        ? 'サポート' 
                        : 'Support'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      
      {/* Custom amount */}
      <section className="mb-12">
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'ko' 
                ? '직접 금액 설정하기' 
                : language === 'jp' 
                  ? '金額を直接設定する' 
                  : 'Set Custom Amount'}
            </CardTitle>
            <CardDescription>
              {language === 'ko' 
                ? '원하는 금액으로 Webel을 후원해주세요' 
                : language === 'jp' 
                  ? 'ご希望の金額でWebelをサポートしてください' 
                  : 'Support Webel with your desired amount'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {currency.symbol}
                  </span>
                  <Input 
                    className="pl-8" 
                    placeholder={language === 'ko' 
                      ? '금액 입력' 
                      : language === 'jp' 
                        ? '金額を入力' 
                        : 'Enter amount'}
                    type="number" 
                    min="1000" 
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value === '' ? '' : parseInt(e.target.value))}
                  />
                </div>
              </div>
              <Button 
                className="bg-primary hover:bg-blue-600"
                onClick={() => {
                  if (customAmount && typeof customAmount === 'number' && customAmount >= 1000) {
                    handleSponsorAmount(customAmount);
                  } else {
                    toast({
                      title: language === 'ko' 
                        ? "금액을 확인해주세요" 
                        : language === 'jp' 
                          ? "金額をご確認ください" 
                          : "Please check the amount",
                      description: language === 'ko' 
                        ? "최소 1,000원 이상 입력해주세요." 
                        : language === 'jp' 
                          ? "最低1,000ウォン以上入力してください。" 
                          : "Please enter at least 1,000 KRW.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                {language === 'ko' 
                  ? '후원하기' 
                  : language === 'jp' 
                    ? 'サポート' 
                    : 'Support'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
      
      {/* 후원 코멘트 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {language === 'ko' 
            ? '후원 시 코멘트 남기기' 
            : language === 'jp' 
              ? 'サポート時にコメントを残す' 
              : 'Leave a Comment with Your Support'}
        </h2>
        
        <Card>
          <CardContent className="p-6">
            <div className="mb-5">
              <p className="text-gray-700 mb-4">
                {language === 'ko' 
                  ? '원하신다면 후원과 함께 코멘트를 남겨주세요. 여러분의 격려와 피드백은 Webel 팀에게 큰 힘이 됩니다.' 
                  : language === 'jp' 
                    ? 'ご希望の場合は、サポートと一緒にコメントを残してください。皆様の励ましとフィードバックは、Webelチームに大きな力となります。' 
                    : 'If you wish, please leave a comment with your support. Your encouragement and feedback are a great help to the Webel team.'}
              </p>
              <Textarea
                placeholder={language === 'ko' 
                  ? "후원 코멘트를 남겨주세요 (선택사항)" 
                  : language === 'jp' 
                    ? "サポートコメントを残してください（任意）" 
                    : "Leave your support comment (optional)"}
                className="w-full min-h-[100px]"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button 
                variant="outline" 
                className="sm:w-auto w-full"
                onClick={() => {
                  setSelectedTier(language === 'ko' 
                    ? '후원 코멘트' 
                    : language === 'jp' 
                      ? 'サポートコメント' 
                      : 'Support Comment');
                  setSelectedAmount(customAmount && typeof customAmount === 'number' && customAmount >= 1000 ? customAmount : 5000);
                  setShowPaymentDialog(true);
                }}
              >
                {language === 'ko' 
                  ? '결제하기' 
                  : language === 'jp' 
                    ? '支払う' 
                    : 'Pay'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 후원자 코멘트 목록 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {language === 'ko' 
            ? '후원자 코멘트' 
            : language === 'jp' 
              ? 'サポーターのコメント' 
              : 'Supporter Comments'}
        </h2>
        
        <div className="space-y-6">
          {comments.map((comment) => (
            <Card key={comment.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12 border-2 border-amber-300">
                    {comment.avatarUrl ? (
                      <AvatarImage src={comment.avatarUrl} alt={comment.username} />
                    ) : (
                      <AvatarFallback className="bg-amber-100 text-amber-600">
                        {comment.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                      <div className="font-semibold text-gray-900">{comment.username}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(comment.createdAt)}
                      </div>
                      <div className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                        {comment.tier}
                      </div>
                      <div className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        {formatAmount(comment.amount)}
                      </div>
                    </div>
                    
                    <p className="text-gray-700">{comment.message}</p>
                    
                    <div className="flex justify-end mt-2">
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {language === 'ko' 
                          ? '답글' 
                          : language === 'jp' 
                            ? '返信' 
                            : 'Reply'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 결제 모달 */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {language === 'ko' 
                ? '후원 결제' 
                : language === 'jp' 
                  ? 'サポートのお支払い' 
                  : 'Support Payment'}
            </DialogTitle>
            <DialogDescription>
              {language === 'ko' 
                ? `선택하신 ${formatAmount(selectedAmount)}로 Webel을 후원합니다.` 
                : language === 'jp' 
                  ? `選択された${formatAmount(selectedAmount)}でWebelをサポートします。` 
                  : `Support Webel with your selected ${formatAmount(selectedAmount)}.`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium mb-2">
                {language === 'ko' 
                  ? '결제 수단 선택' 
                  : language === 'jp' 
                    ? 'お支払い方法の選択' 
                    : 'Select Payment Method'}
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div 
                  className={`p-3 border rounded-md flex items-center gap-2 cursor-pointer transition-colors ${selectedPaymentMethod === 'bank' ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}`}
                  onClick={() => handlePaymentMethodChange('bank')}
                >
                  <Building className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">
                    {language === 'ko' 
                      ? '계좌이체' 
                      : language === 'jp' 
                        ? '口座振込' 
                        : 'Bank Transfer'}
                  </span>
                </div>
                
                <div 
                  className={`p-3 border rounded-md flex items-center gap-2 cursor-pointer transition-colors ${selectedPaymentMethod === 'card' ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}`}
                  onClick={() => handlePaymentMethodChange('card')}
                >
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">
                    {language === 'ko' 
                      ? '카드결제' 
                      : language === 'jp' 
                        ? 'カード決済' 
                        : 'Card Payment'}
                  </span>
                </div>
                
                {language === 'ko' && (
                  <>
                    <div 
                      className={`p-3 border rounded-md flex items-center gap-2 cursor-pointer transition-colors ${selectedPaymentMethod === 'kakaopay' ? 'bg-yellow-50 border-yellow-300' : 'hover:bg-gray-50'}`}
                      onClick={() => handlePaymentMethodChange('kakaopay')}
                    >
                      <img src="/images/kakaopay-icon.png" className="h-4 w-4 object-contain" alt="KakaoPay" />
                      <span className="text-sm font-medium">KakaoPay</span>
                    </div>
                    
                    <div 
                      className={`p-3 border rounded-md flex items-center gap-2 cursor-pointer transition-colors ${selectedPaymentMethod === 'naverpay' ? 'bg-green-50 border-green-300' : 'hover:bg-gray-50'}`}
                      onClick={() => handlePaymentMethodChange('naverpay')}
                    >
                      <img src="/images/naverpay-icon.png" className="h-4 w-4 object-contain" alt="NaverPay" />
                      <span className="text-sm font-medium">NaverPay</span>
                    </div>
                  </>
                )}
                
                {language !== 'ko' && (
                  <div 
                    className={`p-3 border rounded-md flex items-center gap-2 cursor-pointer transition-colors ${selectedPaymentMethod === 'paypal' ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}`}
                    onClick={() => handlePaymentMethodChange('paypal')}
                  >
                    <Globe className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">PayPal</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium">
                {language === 'ko' 
                  ? '후원 정보' 
                  : language === 'jp' 
                    ? 'サポート情報' 
                    : 'Support Information'}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">
                    {language === 'ko' 
                      ? '후원 금액' 
                      : language === 'jp' 
                        ? 'サポート金額' 
                        : 'Support Amount'}
                  </span>
                  <span className="font-medium">{formatAmount(selectedAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {language === 'ko' 
                      ? '후원 티어' 
                      : language === 'jp' 
                        ? 'サポートティア' 
                        : 'Support Tier'}
                  </span>
                  <span className="font-medium">{selectedTier}</span>
                </div>
                
                {comment && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-gray-600 mb-1">
                      {language === 'ko' 
                        ? '코멘트' 
                        : language === 'jp' 
                          ? 'コメント' 
                          : 'Comment'}
                    </div>
                    <div className="text-sm bg-white p-2 rounded border">
                      {comment}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              {language === 'ko' 
                ? '취소' 
                : language === 'jp' 
                  ? 'キャンセル' 
                  : 'Cancel'}
            </Button>
            <Button 
              onClick={handlePaymentComplete}
              disabled={isLoading}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  처리중...
                </>
              ) : '결제하기'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Sponsor;