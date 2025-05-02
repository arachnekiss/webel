import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import PayPalPayment from './PayPalPayment';
import TossPayment from './TossPayment';
import KakaoPayment from './KakaoPayment';

interface PaymentFormProps {
  serviceId: number;
  providerId: number;
  amount: number;
  serviceName: string;
  serviceDescription?: string;
  onClose?: () => void;
}

const PaymentForm = ({
  serviceId,
  providerId,
  amount,
  serviceName,
  serviceDescription,
  onClose
}: PaymentFormProps) => {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  
  const handlePaymentSuccess = (data: any) => {
    setLoading(false);
    toast({
      title: '결제 성공',
      description: '결제가 성공적으로 완료되었습니다.',
    });
    
    // 주문 상세 페이지로 이동
    setTimeout(() => {
      navigate(`/orders/${data.order?.id || 'success'}`);
    }, 1500);
  };
  
  const handlePaymentError = (error: any) => {
    setLoading(false);
    toast({
      title: '결제 오류',
      description: error.message || '결제 처리 중 오류가 발생했습니다.',
      variant: 'destructive'
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>결제하기</CardTitle>
        <CardDescription>
          {serviceName} - {amount.toLocaleString()}원
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="font-medium mb-1">결제 정보</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {serviceDescription || '선택하신 서비스에 대한 결제를 진행합니다.'}
          </p>
          
          <div className="grid gap-2 mb-4">
            <div className="flex justify-between">
              <span className="text-sm">서비스 금액</span>
              <span className="font-medium">{amount.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span className="text-sm">수수료 (10%)</span>
              <span className="text-sm">{Math.round(amount * 0.1).toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span className="text-sm">제공자 정산액</span>
              <span className="text-sm">{Math.round(amount * 0.9).toLocaleString()}원</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between font-medium">
              <span>총 결제 금액</span>
              <span>{amount.toLocaleString()}원</span>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="toss" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="toss">토스페이먼츠</TabsTrigger>
            <TabsTrigger value="kakaopay">카카오페이</TabsTrigger>
            <TabsTrigger value="paypal">PayPal</TabsTrigger>
          </TabsList>
          
          <TabsContent value="toss">
            <TossPayment
              serviceId={serviceId}
              providerId={providerId}
              amount={amount}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </TabsContent>
          
          <TabsContent value="kakaopay">
            <KakaoPayment
              serviceId={serviceId}
              providerId={providerId}
              amount={amount}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </TabsContent>
          
          <TabsContent value="paypal">
            <PayPalPayment
              serviceId={serviceId}
              providerId={providerId}
              amount={amount}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          취소
        </Button>
        <div className="text-xs text-right text-muted-foreground">
          결제는 안전하게 처리되며<br />
          개인정보는 보호됩니다.
        </div>
      </CardFooter>
    </Card>
  );
};

export default PaymentForm;