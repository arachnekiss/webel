import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Heart, Star, Zap, Shield, CheckCircle, Gift, 
  MessageSquare, User, Calendar, Copy, ExternalLink 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
  DialogClose
} from '@/components/ui/dialog';

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
type PaymentMethod = 'card' | 'bank' | 'kakaopay' | 'naverpay' | 'payco' | 'tosspay' | 'phone' | 'virtualaccount' | 'foreigncard';

const Sponsor: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
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
  
  // 선택한 등급에 따라 결제 대화상자 표시
  const handleSponsorTier = (tier: string, tierAmount: number) => {
    if (!user) {
      toast({
        title: "로그인이 필요합니다",
        description: "후원하려면 먼저 로그인해 주세요.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedTier(tier);
    setSelectedAmount(tierAmount);
    setShowPaymentDialog(true);
  };
  
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
      
      // 결제 완료 알림
      toast({
        title: "후원해주셔서 감사합니다!",
        description: `${selectedTier} (₩${selectedAmount.toLocaleString()}) 후원이 완료되었습니다. Webel이 더 좋은 서비스를 제공할 수 있도록 도와주셔서 감사합니다.`,
      });
      
      // 폼 초기화
      setComment('');
      setCustomAmount('');
    }, 1500);
  };
  
  // 결제 수단 선택 핸들러
  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
  };
  
  return (
    <main className="container mx-auto px-4 py-6">
      {/* Hero section */}
      <section className="bg-gradient-to-r from-amber-500 to-pink-500 rounded-2xl overflow-hidden shadow-lg mb-12">
        <div className="md:flex">
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Webel을 후원해주세요
            </h1>
            <p className="text-amber-50 mb-6">
              여러분의 후원은 더 많은 무료 리소스와 혁신적인 서비스를 제공하는 데 큰 도움이 됩니다.
              Webel과 함께 생산 생태계의 혁신을 만들어가세요.
            </p>
            <div className="flex items-center gap-3">
              <Heart className="h-6 w-6 text-white" />
              <span className="text-white font-medium">현재까지 256명이 후원에 참여했습니다</span>
            </div>
          </div>
          <div className="md:w-1/2 p-6 hidden md:flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1579389083046-e3df9c2b3325?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="Webel 후원" 
              className="rounded-lg shadow-md max-h-80 object-cover" 
            />
          </div>
        </div>
      </section>
      
      {/* 후원 의미 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">후원의 의미</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <Star className="h-12 w-12 text-amber-500 mb-2" />
              <CardTitle>오픈 소스 지원</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                여러분의 후원은 Webel이 더 많은 오픈 소스 하드웨어 및 소프트웨어 프로젝트를 지원하는 데 사용됩니다.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <Zap className="h-12 w-12 text-amber-500 mb-2" />
              <CardTitle>커뮤니티 성장</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                엔지니어와 소비자를 연결하는 커뮤니티 플랫폼을 운영하고 발전시키는 데 도움이 됩니다.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <Gift className="h-12 w-12 text-amber-500 mb-2" />
              <CardTitle>서비스 안정성</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Webel 서비스의 안정적인 운영과 지속 가능한 발전을 위한 인프라 유지에 기여합니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Sponsorship tiers */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">후원 등급</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle>서포터</CardTitle>
              <CardDescription>Webel을 응원하는 첫 걸음</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">₩5,000</span>
                <span className="text-gray-600"> / 월</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>서포터 배지</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>월간 뉴스레터</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>후원자 디스코드 채널 액세스</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={() => handleSponsorTier('서포터', 5000)}
              >
                후원하기
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="border-2 border-amber-500">
            <CardHeader>
              <div className="py-1 px-3 rounded-full bg-amber-100 text-amber-700 text-xs font-medium w-fit mb-2">인기 선택</div>
              <CardTitle>파트너</CardTitle>
              <CardDescription>Webel과 함께 성장하기</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">₩15,000</span>
                <span className="text-gray-600"> / 월</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>모든 서포터 혜택 포함</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>파트너 배지 업그레이드</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>우선 고객 지원</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>월간 독점 리소스 패키지</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-amber-500 hover:bg-amber-600"
                onClick={() => handleSponsorTier('파트너', 15000)}
              >
                후원하기
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle>혁신가</CardTitle>
              <CardDescription>Webel의 미래를 함께 만들기</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">₩30,000</span>
                <span className="text-gray-600"> / 월</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>모든 파트너 혜택 포함</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>혁신가 배지 업그레이드</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>직접 개발팀과 월간 미팅</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>새로운 기능 베타 테스트 참여</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>개인 맞춤형 프로젝트 컨설팅</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={() => handleSponsorTier('혁신가', 30000)}
              >
                후원하기
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>
      
      {/* Custom amount */}
      <section className="mb-12">
        <Card>
          <CardHeader>
            <CardTitle>직접 금액 설정하기</CardTitle>
            <CardDescription>원하는 금액으로 Webel을 후원해주세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₩</span>
                  <Input 
                    className="pl-8" 
                    placeholder="금액 입력" 
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
                    handleSponsorTier('사용자 지정', customAmount);
                  } else {
                    toast({
                      title: "금액을 확인해주세요",
                      description: "최소 1,000원 이상 입력해주세요.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                후원하기
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
      
      {/* 후원 코멘트 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">후원 시 코멘트 남기기</h2>
        
        <Card>
          <CardContent className="p-6">
            <div className="mb-5">
              <p className="text-gray-700 mb-4">
                원하신다면 후원과 함께 코멘트를 남겨주세요. 여러분의 격려와 피드백은 Webel 팀에게 큰 힘이 됩니다.
              </p>
              <Textarea
                placeholder="후원 코멘트를 남겨주세요 (선택사항)"
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
                  if (!user) {
                    toast({
                      title: "로그인이 필요합니다",
                      description: "후원하려면 먼저 로그인해 주세요.",
                      variant: "destructive",
                    });
                    return;
                  }
                  setSelectedTier('사용자 지정');
                  setSelectedAmount(customAmount && typeof customAmount === 'number' && customAmount >= 1000 ? customAmount : 5000);
                  setComment('');
                  setShowPaymentDialog(true);
                }}
              >
                결제하기
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 후원자 코멘트 목록 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">후원자 코멘트</h2>
        
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
                        {comment.tier} (₩{comment.amount.toLocaleString()})
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{comment.message}</p>
                    
                    <div className="flex justify-end mt-2">
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        <span className="text-xs">감사 인사하기</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      
      {/* 결제 다이얼로그 */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">후원 결제</DialogTitle>
            <DialogDescription className="text-center">
              Webel을 후원해주셔서 감사합니다.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">후원 등급:</span>
                <span className="font-medium">{selectedTier}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">금액:</span>
                <span className="font-medium">₩{selectedAmount?.toLocaleString() || '0'}</span>
              </div>
              {comment && (
                <div className="mb-2">
                  <span className="text-gray-600">코멘트:</span>
                  <p className="text-sm mt-1 p-2 bg-white rounded border border-gray-200">{comment}</p>
                </div>
              )}
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-3">결제 수단 선택</h4>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant={selectedPaymentMethod === 'card' ? 'default' : 'outline'} 
                  size="sm"
                  className="justify-start"
                  onClick={() => handlePaymentMethodChange('card')}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  신용카드
                </Button>
                <Button 
                  variant={selectedPaymentMethod === 'foreigncard' ? 'default' : 'outline'} 
                  size="sm"
                  className="justify-start"
                  onClick={() => handlePaymentMethodChange('foreigncard')}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  해외카드
                </Button>
                <Button 
                  variant={selectedPaymentMethod === 'bank' ? 'default' : 'outline'} 
                  size="sm"
                  className="justify-start"
                  onClick={() => handlePaymentMethodChange('bank')}
                >
                  <Building className="h-4 w-4 mr-2" />
                  계좌이체
                </Button>
                <Button 
                  variant={selectedPaymentMethod === 'virtualaccount' ? 'default' : 'outline'} 
                  size="sm"
                  className="justify-start"
                  onClick={() => handlePaymentMethodChange('virtualaccount')}
                >
                  <Building className="h-4 w-4 mr-2" />
                  가상계좌
                </Button>
                <Button 
                  variant={selectedPaymentMethod === 'phone' ? 'default' : 'outline'} 
                  size="sm"
                  className="justify-start"
                  onClick={() => handlePaymentMethodChange('phone')}
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  휴대폰
                </Button>
                <Button 
                  variant={selectedPaymentMethod === 'kakaopay' ? 'default' : 'outline'} 
                  size="sm"
                  className="justify-start text-yellow-500"
                  onClick={() => handlePaymentMethodChange('kakaopay')}
                >
                  <span className="mr-2 font-bold">K</span>
                  카카오페이
                </Button>
                <Button 
                  variant={selectedPaymentMethod === 'naverpay' ? 'default' : 'outline'} 
                  size="sm"
                  className="justify-start text-green-600"
                  onClick={() => handlePaymentMethodChange('naverpay')}
                >
                  <span className="mr-2 font-bold">N</span>
                  네이버페이
                </Button>
                <Button 
                  variant={selectedPaymentMethod === 'payco' ? 'default' : 'outline'} 
                  size="sm"
                  className="justify-start text-red-500"
                  onClick={() => handlePaymentMethodChange('payco')}
                >
                  <span className="mr-2 font-bold">P</span>
                  페이코
                </Button>
                <Button 
                  variant={selectedPaymentMethod === 'tosspay' ? 'default' : 'outline'} 
                  size="sm"
                  className="justify-start text-blue-500"
                  onClick={() => handlePaymentMethodChange('tosspay')}
                >
                  <span className="mr-2 font-bold">T</span>
                  토스페이
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowPaymentDialog(false)}
              disabled={isLoading}
            >
              취소
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