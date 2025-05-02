import React, { useState, useEffect } from 'react';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface TossPaymentProps {
  serviceId: number;
  providerId: number;
  amount: number;
  onSuccess: (data: any) => void;
  onError: (error: any) => void;
}

const TossPayment = ({
  serviceId,
  providerId,
  amount,
  onSuccess,
  onError
}: TossPaymentProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [tossConfig, setTossConfig] = useState<any>(null);
  
  useEffect(() => {
    const initializePayment = async () => {
      try {
        setLoading(true);
        
        const response = await apiRequest('POST', '/api/payments/initialize', {
          serviceId,
          providerId,
          totalAmount: amount,
          quantity: 1,
          paymentMethod: 'toss'
        });
        
        const data = await response.json();
        
        if (data.success) {
          setOrderId(data.order.id);
          setTossConfig(data.paymentConfig);
        } else {
          throw new Error(data.message || '결제 초기화 실패');
        }
      } catch (error: any) {
        console.error('토스페이먼츠 결제 초기화 오류:', error);
        toast({
          title: '결제 초기화 실패',
          description: error.message || '결제를 시작할 수 없습니다.',
          variant: 'destructive'
        });
        onError(error);
      } finally {
        setLoading(false);
      }
    };
    
    initializePayment();
  }, [serviceId, providerId, amount]);

  const handlePayment = async () => {
    if (!tossConfig || !tossConfig.clientKey) {
      toast({
        title: '결제 정보 오류',
        description: '결제 정보를 불러올 수 없습니다.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // 토스페이먼츠 결제 SDK 로드
      const tossPayments = await loadTossPayments(tossConfig.clientKey);
      
      // 결제 창 열기
      tossPayments.requestPayment('카드', {
        amount: amount,
        orderId: tossConfig.orderId,
        orderName: tossConfig.orderName || `Webel 서비스 결제 #${orderId}`,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
        // 결제자 정보 (선택사항)
        customerName: '결제자'
      });
    } catch (error: any) {
      console.error('토스페이먼츠 결제 오류:', error);
      toast({
        title: '결제 오류',
        description: error.message || '결제를 시작할 수 없습니다.',
        variant: 'destructive'
      });
      onError(error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4" />
        <p className="text-sm text-muted-foreground">결제 정보를 불러오는 중...</p>
      </div>
    );
  }
  
  if (!tossConfig || !tossConfig.clientKey) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-4">토스페이먼츠 결제 구성을 불러올 수 없습니다.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          다시 시도
        </Button>
      </div>
    );
  }
  
  return (
    <div className="w-full">
      <Button 
        className="w-full py-6 text-lg font-medium" 
        onClick={handlePayment}
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            처리 중...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.1903 3H7.81198C5.20398 3 3.08398 5.12 3.08398 7.73V16.27C3.08398 18.88 5.20398 21 7.81198 21H16.1903C18.7983 21 20.9183 18.88 20.9183 16.27V7.73C20.9183 5.12 18.7983 3 16.1903 3Z" fill="white"/>
              <path d="M15.6971 7.86791H8.26025V10.1035H10.7276V16.1037H13.2209V10.1035H15.6971V7.86791Z" fill="rgb(59 130 246)" />
            </svg>
            토스페이먼츠로 {amount.toLocaleString()}원 결제하기
          </span>
        )}
      </Button>
      <p className="text-xs text-muted-foreground mt-4 text-center">
        토스페이먼츠를 통해 신용카드, 체크카드, 계좌이체 등 다양한 방법으로 결제할 수 있습니다.
      </p>
    </div>
  );
};

export default TossPayment;