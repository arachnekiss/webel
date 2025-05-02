import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'wouter';
import { Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface PaymentResultProps {
  status: 'success' | 'fail';
}

const PaymentResult = ({ status }: PaymentResultProps) => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // URL에서 결제 정보 파라미터 가져오기
  useEffect(() => {
    // 페이지 리로드 시 쿼리 파라미터 유지를 위한 처리
    const queryParams = new URLSearchParams(window.location.search);
    
    if (status === 'success') {
      // 토스페이먼츠 결제 성공 파라미터
      const paymentKey = queryParams.get('paymentKey');
      const orderIdFromQuery = queryParams.get('orderId');
      const amount = queryParams.get('amount');
      
      if (paymentKey && orderIdFromQuery) {
        // 토스페이먼츠 결제 승인 요청
        handleTossPaymentApproval(paymentKey, orderIdFromQuery, amount);
      } else {
        // 다른 결제 방식의 성공 처리 (카카오페이, 페이팔 등)
        const txId = queryParams.get('txId') || queryParams.get('pg_token');
        if (txId) {
          handleKakaoPaymentApproval(txId);
        } else {
          setLoading(false);
          setError('결제 정보를 찾을 수 없습니다.');
        }
      }
    } else {
      // 결제 실패 시
      const errorMsg = queryParams.get('message') || queryParams.get('error_msg') || '알 수 없는 오류가 발생했습니다.';
      setError(errorMsg);
      setLoading(false);
    }
  }, [status]);
  
  // 토스페이먼츠 결제 승인 처리
  const handleTossPaymentApproval = async (paymentKey: string, orderIdParam: string, amount: string | null) => {
    try {
      setLoading(true);
      
      const response = await apiRequest('POST', '/api/payments/approve', {
        orderId: parseInt(orderIdParam),
        transactionId: paymentKey,
        paymentMethod: 'credit_card',
        paymentGateway: 'toss',
        metadata: {
          paymentKey,
          amount
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setOrderId(orderIdParam);
        setOrderDetails(data.order);
        toast({
          title: '결제 완료',
          description: '결제가 성공적으로 완료되었습니다.',
        });
      } else {
        setError(data.message || '결제 승인 처리 중 오류가 발생했습니다.');
      }
    } catch (error: any) {
      console.error('결제 승인 오류:', error);
      setError(error.message || '결제 승인 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 카카오페이 결제 승인 처리
  const handleKakaoPaymentApproval = async (pgToken: string) => {
    try {
      setLoading(true);
      
      const response = await apiRequest('POST', '/api/payments/kakao-approve', {
        pg_token: pgToken
      });
      
      const data = await response.json();
      
      if (data.success) {
        setOrderId(data.order?.id?.toString() || null);
        setOrderDetails(data.order);
        toast({
          title: '결제 완료',
          description: '결제가 성공적으로 완료되었습니다.',
        });
      } else {
        setError(data.message || '결제 승인 처리 중 오류가 발생했습니다.');
      }
    } catch (error: any) {
      console.error('카카오페이 결제 승인 오류:', error);
      setError(error.message || '결제 승인 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 결제 성공 화면
  if (status === 'success' && !error) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">결제 완료</CardTitle>
            <CardDescription>결제가 성공적으로 완료되었습니다.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center py-4">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4" />
                <p className="text-sm text-muted-foreground">결제 정보를 처리 중입니다...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orderDetails && (
                  <>
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium text-sm mb-2">결제 정보</h3>
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">주문 번호</span>
                          <span className="font-medium">{orderId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">결제 금액</span>
                          <span className="font-medium">{orderDetails.totalAmount?.toLocaleString() || '-'}원</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">결제 상태</span>
                          <span className="font-medium text-green-600">완료</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">결제 방법</span>
                          <span className="font-medium">
                            {(() => {
                              switch (orderDetails.paymentMethod) {
                                case 'paypal': return 'PayPal';
                                case 'kakao_pay': return '카카오페이';
                                case 'toss': return '토스페이먼츠';
                                case 'credit_card': return '신용카드';
                                default: return orderDetails.paymentMethod || '-';
                              }
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center text-sm text-muted-foreground">
                      <p>
                        서비스 제공자에게 주문 정보가 전달되었습니다.<br />
                        마이페이지에서 주문 내역을 확인할 수 있습니다.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button className="w-full" onClick={() => navigate('/user/orders')}>
              주문 내역 확인하기
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
              홈으로 돌아가기
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // 결제 실패 화면
  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">결제 {status === 'success' ? '오류' : '실패'}</CardTitle>
          <CardDescription>
            {error || '결제 처리 중 오류가 발생했습니다.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-sm text-muted-foreground">
            <p>
              결제가 정상적으로 처리되지 않았습니다.<br />
              다시 시도하시거나 다른 결제 수단을 이용해 주세요.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button variant="outline" className="w-full" onClick={() => window.history.back()}>
            이전 페이지로 돌아가기
          </Button>
          <Button className="w-full" onClick={() => navigate('/')}>
            홈으로 돌아가기
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentResult;