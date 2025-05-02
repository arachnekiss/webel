import React, { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface PayPalPaymentProps {
  serviceId: number;
  providerId: number;
  amount: number;
  onSuccess: (data: any) => void;
  onError: (error: any) => void;
}

const PayPalPayment = ({
  serviceId,
  providerId,
  amount,
  onSuccess,
  onError
}: PayPalPaymentProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [paypalConfig, setPaypalConfig] = useState<any>(null);
  
  // PayPal에 표시할 실제 금액은 KRW->USD 환율을 고려합니다
  // 실제 애플리케이션에서는 실시간 환율 API를 사용해야 합니다
  const usdAmount = (amount / 1200).toFixed(2); // 간단한 고정 환율 사용
  
  useEffect(() => {
    const initializePayment = async () => {
      try {
        setLoading(true);
        
        const response = await apiRequest('POST', '/api/payments/initialize', {
          serviceId,
          providerId,
          totalAmount: amount,
          quantity: 1,
          paymentMethod: 'paypal'
        });
        
        const data = await response.json();
        
        if (data.success) {
          setOrderId(data.order.id);
          setPaypalConfig(data.paymentConfig);
        } else {
          throw new Error(data.message || '결제 초기화 실패');
        }
      } catch (error: any) {
        console.error('PayPal 결제 초기화 오류:', error);
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
  
  const handleApprovePayment = async (paypalOrderId: string, details: any) => {
    try {
      setLoading(true);
      
      // 서버에 결제 승인 요청
      const response = await apiRequest('POST', '/api/payments/approve', {
        orderId: orderId,
        transactionId: paypalOrderId,
        paymentMethod: 'paypal',
        paymentGateway: 'paypal',
        metadata: details
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: '결제 성공',
          description: '결제가 성공적으로 완료되었습니다.',
        });
        onSuccess(data);
      } else {
        throw new Error(data.message || '결제 승인 실패');
      }
    } catch (error: any) {
      console.error('PayPal 결제 승인 오류:', error);
      toast({
        title: '결제 승인 실패',
        description: error.message || '결제 승인 중 오류가 발생했습니다.',
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
  
  if (!paypalConfig || !paypalConfig.clientId) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-4">PayPal 결제 구성을 불러올 수 없습니다.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          다시 시도
        </Button>
      </div>
    );
  }
  
  return (
    <div className="w-full">
      <PayPalScriptProvider options={{ 
        "client-id": paypalConfig.clientId,
        currency: "USD"
      }}>
        <PayPalButtons
          style={{ 
            layout: "vertical",
            color: "blue",
            shape: "rect",
            label: "pay"
          }}
          createOrder={(_data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: usdAmount,
                    currency_code: "USD"
                  },
                  description: `Webel 서비스 결제 #${orderId}`
                }
              ]
            });
          }}
          onApprove={async (data, actions) => {
            if (actions.order) {
              const details = await actions.order.capture();
              await handleApprovePayment(data.orderID, details);
            }
          }}
          onError={(err) => {
            console.error('PayPal 결제 오류:', err);
            toast({
              title: 'PayPal 결제 오류',
              description: '결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
              variant: 'destructive'
            });
            onError(err);
          }}
        />
      </PayPalScriptProvider>
      <p className="text-xs text-muted-foreground mt-4 text-center">
        한화 {amount.toLocaleString()}원은 USD ${usdAmount}로 결제됩니다.
        <br />(PayPal 수수료와 환율은 별도로 적용될 수 있습니다)
      </p>
    </div>
  );
};

export default PayPalPayment;