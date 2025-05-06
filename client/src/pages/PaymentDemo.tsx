import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import PayPalButton from '@/components/PayPalButton';
import { useToast } from '@/hooks/use-toast';

const PaymentDemo = () => {
  const [activeTab, setActiveTab] = useState('paypal');
  const [amount, setAmount] = useState('10.00');
  const [currency, setCurrency] = useState('USD');
  const { toast } = useToast();

  const handlePaymentSuccess = () => {
    toast({
      title: '결제 성공',
      description: '결제가 성공적으로 처리되었습니다.',
      variant: 'default',
    });
  };

  const handlePaymentError = (error: Error) => {
    toast({
      title: '결제 오류',
      description: error.message || '결제 처리 중 오류가 발생했습니다.',
      variant: 'destructive',
    });
  };

  return (
    <div className="container py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">결제 시스템 성능 테스트</h1>
      <p className="text-lg mb-6">
        다양한 결제 시스템에 대한 성능 테스트와 최적화를 위한 데모 페이지입니다.
        실제 결제는 발생하지 않으므로 안심하고 테스트해보세요.
      </p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>결제 방법 선택</CardTitle>
          <CardDescription>
            테스트하려는 결제 방법을 선택하고 결제를 진행해보세요.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="paypal">PayPal</TabsTrigger>
              <TabsTrigger value="stripe">Stripe</TabsTrigger>
              <TabsTrigger value="tosspayments">Toss Payments</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="amount">결제 금액</Label>
                  <Input
                    id="amount"
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="10.00"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">통화</Label>
                  <Input
                    id="currency"
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    placeholder="USD"
                  />
                </div>
              </div>

              <TabsContent value="paypal" className="mt-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>PayPal 결제</CardTitle>
                    <CardDescription>
                      PayPal 계정을 사용하여 안전하게 결제할 수 있습니다.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="py-4 px-6 bg-blue-50 rounded-md mb-4">
                      <p className="text-blue-800 text-sm">
                        <strong>테스트 모드:</strong> 실제 결제는 진행되지 않습니다. 결제 흐름만 테스트됩니다.
                      </p>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-medium">총 결제 금액:</p>
                        <p className="text-2xl font-bold">{amount} {currency}</p>
                      </div>
                      <div 
                        className="bg-blue-500 text-white px-4 py-2 rounded-full text-xs font-medium"
                      >
                        샌드박스 환경
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-center my-6">
                      <PayPalButton 
                        amount={amount}
                        currency={currency}
                        intent="CAPTURE"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <p className="text-xs text-gray-500 w-full text-center">
                      PayPal 계정으로 로그인하여 결제를 완료하세요. 결제는 샌드박스 환경에서 진행됩니다.
                    </p>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="stripe" className="mt-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Stripe 결제</CardTitle>
                    <CardDescription>
                      신용카드를 사용하여 안전하게 결제할 수 있습니다.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="py-4 px-6 bg-gray-100 rounded-md mb-4">
                      <p className="text-gray-700 text-sm">
                        Stripe 결제 시스템은 현재 준비 중입니다. 곧 이용하실 수 있습니다.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tosspayments" className="mt-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Toss Payments 결제</CardTitle>
                    <CardDescription>
                      토스페이먼츠를 통해 다양한 결제 수단으로 결제할 수 있습니다.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="py-4 px-6 bg-gray-100 rounded-md mb-4">
                      <p className="text-gray-700 text-sm">
                        Toss Payments 결제 시스템은 현재 준비 중입니다. 곧 이용하실 수 있습니다.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>결제 성능 테스트 안내</CardTitle>
          <CardDescription>
            결제 시스템 성능 테스트를 위한 가이드
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              <span className="font-medium">샌드박스 환경:</span> 모든 결제는 테스트 환경에서 진행되며, 실제 결제는 이루어지지 않습니다.
            </li>
            <li>
              <span className="font-medium">응답 시간 측정:</span> 각 결제 방식별 응답 시간이 콘솔에 기록됩니다.
            </li>
            <li>
              <span className="font-medium">동시 처리 테스트:</span> 여러 결제 요청이 동시에 처리될 때의 시스템 안정성을 테스트합니다.
            </li>
            <li>
              <span className="font-medium">오류 복구 테스트:</span> 결제 오류 발생 시 시스템의 복구 능력을 테스트합니다.
            </li>
            <li>
              <span className="font-medium">보안 검증:</span> 모든 결제 데이터는 안전하게 암호화되어 전송됩니다.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentDemo;