import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import PaymentForm from '@/components/payment/PaymentForm';
import { Service } from '@shared/schema';

interface PaymentPageProps {
  id: string;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ id }) => {
  const serviceId = parseInt(id);
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  
  // 서비스 정보 조회
  const { data: service, isLoading, error } = useQuery<Service>({
    queryKey: ['/api/services', serviceId],
    enabled: !isNaN(serviceId),
  });
  
  // 로그인 확인
  useEffect(() => {
    if (!user) {
      toast({
        title: '로그인이 필요합니다',
        description: '결제를 진행하려면 로그인이 필요합니다.',
        variant: 'destructive'
      });
      navigate(`/login?redirect=${encodeURIComponent(location)}`);
    }
  }, [user]);
  
  // 유효한 서비스 확인
  useEffect(() => {
    if (error) {
      toast({
        title: '서비스를 찾을 수 없습니다',
        description: '요청하신 서비스 정보를 불러올 수 없습니다.',
        variant: 'destructive'
      });
      navigate('/services');
    }
  }, [error]);
  
  // 자신의 서비스인지 확인
  useEffect(() => {
    if (service && service.userId === user?.id) {
      toast({
        title: '자신의 서비스는 결제할 수 없습니다',
        description: '다른 제공자의 서비스만 결제할 수 있습니다.',
        variant: 'destructive'
      });
      navigate(`/services/${serviceId}`);
    }
  }, [service, user]);
  
  const handleOpenPaymentModal = (amount: number) => {
    if (!user) {
      toast({
        title: '로그인이 필요합니다',
        description: '결제를 진행하려면 로그인이 필요합니다.',
        variant: 'destructive'
      });
      navigate(`/login?redirect=${encodeURIComponent(location)}`);
      return;
    }
    
    setSelectedAmount(amount);
    setIsPaymentModalOpen(true);
  };
  
  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedAmount(null);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-12 w-3/4 mb-6" />
          <Skeleton className="h-64 w-full mb-8" />
          <div className="grid gap-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!service) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">서비스를 찾을 수 없습니다</h1>
        <p className="text-muted-foreground mb-6">요청하신 서비스 정보를 불러올 수 없습니다.</p>
        <Button onClick={() => navigate('/services')}>
          서비스 목록으로 돌아가기
        </Button>
      </div>
    );
  }
  
  // 서비스 가격 옵션 (기본 가격이 설정되지 않은 경우 샘플 옵션)
  const priceOptions = service.priceOptions || [
    { 
      name: '기본 서비스', 
      price: service.basePrice || 50000, 
      description: '기본 서비스 패키지' 
    },
    { 
      name: '프리미엄 서비스', 
      price: (service.basePrice || 50000) * 2, 
      description: '고급 서비스 패키지' 
    }
  ];
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{service.title} 결제</h1>
          <p className="text-muted-foreground">{service.description}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">서비스 정보</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">서비스 유형</p>
              <p className="font-medium">{service.serviceType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">제공자</p>
              <p className="font-medium">{service.providerName || '알 수 없음'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">평점</p>
              <p className="font-medium">{service.rating ? `${service.rating.toFixed(1)}점 (${service.ratingCount}개 평가)` : '평가 없음'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">위치</p>
              <p className="font-medium">{service.location?.address || '위치 정보 없음'}</p>
            </div>
          </div>
          
          {service.imageUrl && (
            <div className="mb-4">
              <img
                src={service.imageUrl}
                alt={service.title}
                className="rounded-md w-full h-auto max-h-64 object-cover"
              />
            </div>
          )}
          
          <div className="border-t pt-4 mt-4">
            <p className="font-medium mb-2">서비스 설명</p>
            <p className="text-sm whitespace-pre-line">{service.description}</p>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">결제 옵션 선택</h2>
          <div className="grid gap-4">
            {priceOptions.map((option, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md border p-6 hover:border-primary transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium">{option.name}</h3>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{option.price.toLocaleString()}원</p>
                    <p className="text-xs text-muted-foreground">VAT 포함</p>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => handleOpenPaymentModal(option.price)}
                >
                  이 옵션 선택하기
                </Button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-slate-50 rounded-lg p-6 border">
          <h3 className="font-medium mb-2">결제 안내</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 결제 완료 후 서비스 제공자에게 주문 내역이 전달됩니다.</li>
            <li>• 주문 취소는 서비스 제공 전에만 가능합니다.</li>
            <li>• 결제 금액의 10%는 Webel 시스템 이용료로 사용됩니다.</li>
            <li>• 서비스에 대한 문의사항은 제공자에게 직접 연락하시기 바랍니다.</li>
          </ul>
        </div>
      </div>
      
      {/* 결제 모달 */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedAmount !== null && service && (
            <PaymentForm
              serviceId={service.id}
              providerId={service.userId}
              amount={selectedAmount}
              serviceName={service.title}
              serviceDescription={service.description}
              onClose={handleClosePaymentModal}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentPage;