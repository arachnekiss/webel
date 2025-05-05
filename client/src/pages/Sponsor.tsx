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
  
  // 실제 코멘트 데이터 로드
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest('GET', '/api/sponsor/comments');
        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error('후원 코멘트 로드 오류:', error);
        // 오류 발생 시 빈 배열로 설정
        setComments([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchComments();
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
  
  // 결제 완료 처리 (실제 API와 연동)
  const handlePaymentComplete = async () => {
    // 결제 정보와 코멘트를 서버에 전송
    setIsLoading(true);
    
    try {
      // 코멘트 데이터 구성
      const commentData = {
        username: user?.username || '익명 후원자',
        amount: selectedAmount,
        tier: selectedTier,
        message: comment.trim() || null,
        paymentMethod: selectedPaymentMethod,
        // 실제 결제 처리 후 트랜잭션 ID가 있다면 추가
        transactionId: `simulated_${Date.now()}`
      };
      
      // API 호출하여 코멘트 저장
      const response = await apiRequest('POST', '/api/sponsor/comments', commentData);
      
      if (response.ok) {
        const savedComment = await response.json();
        
        // 새 코멘트를 목록에 추가
        setComments(prev => [savedComment, ...prev]);
        
        // 결제 완료 알림 애니메이션
        setActivatedAmount(selectedAmount);
        
        // 5초 후에 활성화된 캐릭터 상태 초기화
        if (activationTimer) {
          clearTimeout(activationTimer);
        }
        
        const timer = setTimeout(() => {
          setActivatedAmount(null);
        }, 5000);
        
        setActivationTimer(timer);
        
        // 성공 메시지 표시
        toast({
          title: language === 'ko' 
            ? '후원 완료' 
            : language === 'jp' 
              ? 'サポート完了' 
              : 'Support Complete',
          description: language === 'ko' 
            ? '소중한 후원에 진심으로 감사드립니다.' 
            : language === 'jp' 
              ? '貴重なサポートに心より感謝申し上げます。' 
              : 'Thank you for your valuable support.',
        });
      } else {
        // 오류 발생 시 메시지 표시
        const errorData = await response.json();
        throw new Error(errorData.message || '후원 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('후원 코멘트 저장 오류:', error);
      toast({
        title: language === 'ko' 
          ? '오류 발생' 
          : language === 'jp' 
            ? 'エラーが発生しました' 
            : 'Error Occurred',
        description: error instanceof Error ? error.message : '후원 처리 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setShowPaymentDialog(false);
      
      // 폼 초기화
      setComment('');
      setCustomAmount('');
    }
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
      case 'jp': return { symbol: '¥', code: 'JPY', standard: true };
      case 'en': return { symbol: '$', code: 'USD', standard: true };
      default: return { symbol: '₩', code: 'KRW', standard: false };
    }
  };
  
  const currency = getCurrency();
  
  // 금액 표시 포맷
  const formatAmount = (amount: number) => {
    // 외화는 환율로 환산하지 않고 1, 5, 10, 50, 100, 1000 단위로 표시
    let displayAmount = amount;
    if (currency.standard) {
      // 한국 원화 기준 금액을 외화 표준 금액으로 변환
      if (amount === 500) displayAmount = 1;
      else if (amount === 1000) displayAmount = 2;
      else if (amount === 5000) displayAmount = 5;
      else if (amount === 10000) displayAmount = 10;
      else if (amount === 50000) displayAmount = 50;
      else if (amount === 100000) displayAmount = 100;
      else {
        // 사용자 지정 금액의 경우
        // 1,000원 당 1달러/1엔 비율로 계산 (엔화는 100엔 단위로 반올림)
        if (language === 'jp') {
          displayAmount = Math.ceil(amount / 1000) * 100;
        } else {
          displayAmount = Math.ceil(amount / 1000);
        }
      }
    }
    
    return `${currency.symbol}${displayAmount.toLocaleString(
      language === 'jp' ? 'ja-JP' : language === 'en' ? 'en-US' : 'ko-KR',
      { maximumFractionDigits: 0 }
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
                  ? '더 많은 사용자와 메이커들이 참여하고 교류할 수 있는 커뮤니티를 만들어 갑니다.' 
                  : language === 'jp' 
                    ? 'より多くのユーザーやメーカーが参加し、交流できるコミュニティを作ります。' 
                    : 'We are building a community where more users and makers can participate and interact.'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <Shield className="h-12 w-12 text-amber-500 mb-2" />
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
                  ? '더 안정적이고 지속 가능한 서비스를 제공하기 위한 인프라를 구축합니다.' 
                  : language === 'jp' 
                    ? 'より安定的で持続可能なサービスを提供するためのインフラを構築します。' 
                    : 'We build infrastructure to provide more stable and sustainable services.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* 후원하기 섹션 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {language === 'ko' 
            ? '후원하기' 
            : language === 'jp' 
              ? 'サポートする' 
              : 'Become a Supporter'}
        </h2>
        
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  {language === 'ko' 
                    ? '금액 선택' 
                    : language === 'jp' 
                      ? '金額の選択' 
                      : 'Select Amount'}
                </h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {[500, 1000, 5000, 10000, 50000, 100000].map((amt) => (
                    <Button
                      key={amt}
                      variant="outline"
                      className={`h-auto py-4 flex flex-col items-center gap-2 ${activatedAmount === amt ? 'ring-2 ring-amber-500' : ''}`}
                      onClick={() => handleSponsorAmount(amt)}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 ${getCharacterColor(amt, activatedAmount === amt)}`}>
                        {getAmountIcon(amt)}
                      </div>
                      <span className="font-medium">{formatAmount(amt)}</span>
                    </Button>
                  ))}
                </div>
                
                <div className="flex flex-col gap-2 mb-6">
                  <label htmlFor="customAmount" className="text-sm font-medium text-gray-700">
                    {language === 'ko' 
                      ? '직접 입력' 
                      : language === 'jp' 
                        ? '金額を入力' 
                        : 'Custom Amount'}
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="customAmount"
                      type="number"
                      min="1000"
                      step="1000"
                      placeholder={language === 'ko' 
                        ? '1000원 이상' 
                        : language === 'jp' 
                          ? '1000ウォン以上' 
                          : 'Min 1000 KRW'}
                      value={customAmount}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCustomAmount(value === '' ? '' : parseInt(value));
                      }}
                      className="flex-1"
                    />
                    <Button 
                      variant="secondary" 
                      onClick={() => {
                        if (customAmount && typeof customAmount === 'number' && customAmount >= 1000) {
                          handleSponsorAmount(customAmount);
                        } else {
                          toast({
                            title: language === 'ko' 
                              ? '금액 오류' 
                              : language === 'jp' 
                                ? '金額エラー' 
                                : 'Amount Error',
                            description: language === 'ko' 
                              ? '1,000원 이상의 금액을 입력해주세요.' 
                              : language === 'jp' 
                                ? '1,000ウォン以上の金額を入力してください。' 
                                : 'Please enter an amount of 1,000 KRW or more.',
                            variant: 'destructive'
                          });
                        }
                      }}
                      disabled={!customAmount || typeof customAmount !== 'number' || customAmount < 1000}
                    >
                      {language === 'ko' 
                        ? '적용' 
                        : language === 'jp' 
                          ? '適用' 
                          : 'Apply'}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  {language === 'ko' 
                    ? '후원 코멘트 (선택사항)' 
                    : language === 'jp' 
                      ? 'サポートコメント (任意)' 
                      : 'Comment (Optional)'}
                </h3>
                
                <Textarea
                  placeholder={language === 'ko' 
                    ? '응원 메시지를 남겨주세요 (선택사항)' 
                    : language === 'jp' 
                      ? '応援メッセージを残してください (任意)' 
                      : 'Leave a message of support (optional)'}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="mb-6 min-h-[120px]"
                />
                
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <h4 className="text-base font-medium text-gray-800">
                      {language === 'ko' 
                        ? '📝 후원계좌 정보' 
                        : language === 'jp' 
                          ? '📝 サポート口座情報' 
                          : '📝 Support Account Info'}
                    </h4>
                    <div className="bg-amber-50 p-3 rounded-md text-amber-900 text-sm">
                      <p className="mb-1">KB 국민은행 089501-04-288396 예금주: 허무</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs"
                          onClick={() => {
                            navigator.clipboard.writeText('089501-04-288396');
                            toast({
                              title: language === 'ko' 
                                ? '계좌번호 복사됨' 
                                : language === 'jp' 
                                  ? '口座番号がコピーされました' 
                                  : 'Account Number Copied',
                              description: language === 'ko' 
                                ? '계좌번호가 클립보드에 복사되었습니다.' 
                                : language === 'jp' 
                                  ? '口座番号がクリップボードにコピーされました。' 
                                  : 'Account number has been copied to clipboard.',
                            });
                          }}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          {language === 'ko' 
                            ? '복사' 
                            : language === 'jp' 
                              ? 'コピー' 
                              : 'Copy'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {language === 'ko' ? (
                    <>
                      <Button 
                        className="bg-yellow-400 hover:bg-yellow-500 text-black"
                        onClick={() => {
                          window.open('https://qr.kakaopay.com/Ej9mw91ku', '_blank');
                        }}
                      >
                        <img src="/images/kakaopay-icon.png" className="h-4 w-4 mr-2" alt="KakaoPay" />
                        카카오페이로 후원하기
                      </Button>
                    </>
                  ) : (
                    <Button 
                      className="bg-[#003087] hover:bg-[#001e53] text-white" 
                      id="paypal-button"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      {language === 'jp' 
                        ? 'PayPalでサポート' 
                        : 'Support with PayPal'}
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline"
                    className="border-amber-500 text-amber-500 hover:bg-amber-50"
                    onClick={() => {
                      const tierName = language === 'ko' 
                        ? '후원 코멘트' 
                        : language === 'jp' 
                          ? 'サポートコメント' 
                          : 'Support Comment';
                      setSelectedTier(tierName);
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
              </div>
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
        
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
          </div>
        ) : comments.length === 0 ? (
          <Card className="overflow-hidden bg-amber-50/50">
            <CardContent className="p-10 text-center">
              <MessageSquare className="h-12 w-12 text-amber-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {language === 'ko' 
                  ? '아직 후원 코멘트가 없습니다' 
                  : language === 'jp' 
                    ? 'まだサポートコメントがありません' 
                    : 'No support comments yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {language === 'ko' 
                  ? '첫 번째 후원자가 되어 Webel을 응원해주세요!' 
                  : language === 'jp' 
                    ? '最初のサポーターになってWebelを応援してください！' 
                    : 'Be the first to support Webel with your comment!'}
              </p>
              <Button
                className="bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600"
                onClick={() => handleSponsorAmount(5000)}
              >
                {language === 'ko' 
                  ? '첫 후원자 되기' 
                  : language === 'jp' 
                    ? '最初のサポーターになる' 
                    : 'Become first supporter'}
              </Button>
            </CardContent>
          </Card>
        ) : (
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
                  {language === 'ko' 
                    ? '처리중...' 
                    : language === 'jp' 
                      ? '処理中...' 
                      : 'Processing...'}
                </>
              ) : (
                language === 'ko' 
                  ? '결제하기' 
                  : language === 'jp' 
                    ? '支払う' 
                    : 'Pay'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Sponsor;