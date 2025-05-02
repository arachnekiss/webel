import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface KakaoPaymentProps {
  serviceId: number;
  providerId: number;
  amount: number;
  onSuccess: (data: any) => void;
  onError: (error: any) => void;
}

const KakaoPayment = ({
  serviceId,
  providerId,
  amount,
  onSuccess,
  onError
}: KakaoPaymentProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [kakaoConfig, setKakaoConfig] = useState<any>(null);
  
  useEffect(() => {
    const initializePayment = async () => {
      try {
        setLoading(true);
        
        const response = await apiRequest('POST', '/api/payments/initialize', {
          serviceId,
          providerId,
          totalAmount: amount,
          quantity: 1,
          paymentMethod: 'kakao_pay'
        });
        
        const data = await response.json();
        
        if (data.success) {
          setOrderId(data.order.id);
          setKakaoConfig(data.paymentConfig);
        } else {
          throw new Error(data.message || '결제 초기화 실패');
        }
      } catch (error: any) {
        console.error('카카오페이 결제 초기화 오류:', error);
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

  const handleKakaoPayment = async () => {
    if (!kakaoConfig) {
      toast({
        title: '결제 정보 오류',
        description: '카카오페이 결제 정보를 불러올 수 없습니다.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // 카카오페이 결제 요청 생성 API 호출
      const response = await apiRequest('POST', '/api/payments/kakao-ready', {
        orderId,
        ...kakaoConfig
      });
      
      const data = await response.json();
      
      if (data.success && data.next_redirect_pc_url) {
        // 결제 페이지로 이동
        window.location.href = data.next_redirect_pc_url;
      } else {
        throw new Error(data.message || '카카오페이 결제 요청 실패');
      }
    } catch (error: any) {
      console.error('카카오페이 결제 요청 오류:', error);
      toast({
        title: '결제 오류',
        description: error.message || '카카오페이 결제를 시작할 수 없습니다.',
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
  
  if (!kakaoConfig) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-4">카카오페이 결제 구성을 불러올 수 없습니다.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          다시 시도
        </Button>
      </div>
    );
  }
  
  return (
    <div className="w-full">
      <Button 
        className="w-full py-6 text-lg font-medium bg-yellow-400 hover:bg-yellow-500 text-black" 
        onClick={handleKakaoPayment}
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
            처리 중...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3C7.03125 3 3 6.03125 3 9.75C3 12.3125 4.71875 14.5312 7.15625 15.75C6.84375 16.7812 6.28125 18.8438 6.1875 19.3125C6.09375 19.875 6.46875 19.875 6.75 19.6875C6.9375 19.5938 9.28125 18 10.0312 17.4688C10.6875 17.5625 11.3438 17.625 12 17.625C16.9688 17.625 21 14.5938 21 9.75C21 6.03125 16.9688 3 12 3Z" fill="black"/>
            </svg>
            카카오페이로 {amount.toLocaleString()}원 결제하기
          </span>
        )}
      </Button>
      <p className="text-xs text-muted-foreground mt-4 text-center">
        카카오톡 앱이 설치된 기기에서 간편하게 결제할 수 있습니다.
      </p>
    </div>
  );
};

export default KakaoPayment;