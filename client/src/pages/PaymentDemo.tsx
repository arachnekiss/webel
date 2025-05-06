import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { FormField, Form } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PayPalButton from '../components/PayPalButton';
import { useLanguage } from '@/contexts/LanguageContext';

// Define validation schema for the payment form
const formSchema = z.object({
  amount: z.string().min(1, "금액을 입력하세요"),
  currency: z.string().min(1, "통화를 선택하세요"),
  intent: z.string().min(1, "결제 유형을 선택하세요"),
});

type FormData = z.infer<typeof formSchema>;

const PaymentDemo: React.FC = () => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [showPayPalButton, setShowPayPalButton] = useState(false);
  const [paymentData, setPaymentData] = useState<FormData | null>(null);

  // Initialize form with default values
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "10.00",
      currency: "USD",
      intent: "CAPTURE",
    },
  });

  // Handle form submission
  const onSubmit = (data: FormData) => {
    console.log("Payment form data:", data);
    
    // Validate the amount is a valid number
    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: language === 'ko' ? "유효하지 않은 금액" : "Invalid Amount",
        description: language === 'ko' ? "올바른 금액을 입력하세요" : "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    // Set payment data and show PayPal button
    setPaymentData(data);
    setShowPayPalButton(true);
    
    toast({
      title: language === 'ko' ? "결제 준비 완료" : "Payment Ready",
      description: language === 'ko' ? "PayPal 버튼을 클릭하여 결제를 진행하세요" : "Click the PayPal button to proceed with payment",
    });
  };

  const handlePaymentCancel = () => {
    setShowPayPalButton(false);
    setPaymentData(null);
    
    toast({
      title: language === 'ko' ? "결제 취소됨" : "Payment Cancelled",
      description: language === 'ko' ? "결제가 취소되었습니다" : "Payment has been cancelled",
    });
  };

  const handlePaymentError = (error: Error) => {
    console.error("Payment error:", error);
    
    toast({
      title: language === 'ko' ? "결제 오류" : "Payment Error",
      description: error.message || (language === 'ko' ? "결제 처리 중 오류가 발생했습니다" : "An error occurred during payment processing"),
      variant: "destructive",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        {language === 'ko' ? '결제 데모' : language === 'jp' ? '決済デモ' : 'Payment Demo'}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Payment Configuration Form */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'ko' ? '결제 설정' : language === 'jp' ? '決済設定' : 'Payment Configuration'}
            </CardTitle>
            <CardDescription>
              {language === 'ko' 
                ? '결제 테스트를 위한 설정을 구성하세요' 
                : language === 'jp' 
                  ? '決済テストのための設定を構成してください' 
                  : 'Configure settings for payment testing'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="amount">
                        {language === 'ko' ? '금액' : language === 'jp' ? '金額' : 'Amount'}
                      </Label>
                      <Input
                        id="amount"
                        placeholder="10.00"
                        {...field}
                      />
                      {form.formState.errors.amount && (
                        <p className="text-sm text-red-500">{form.formState.errors.amount.message}</p>
                      )}
                    </div>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="currency">
                        {language === 'ko' ? '통화' : language === 'jp' ? '通貨' : 'Currency'}
                      </Label>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                          <SelectItem value="KRW">KRW - Korean Won</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.currency && (
                        <p className="text-sm text-red-500">{form.formState.errors.currency.message}</p>
                      )}
                    </div>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="intent"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="intent">
                        {language === 'ko' ? '결제 유형' : language === 'jp' ? '決済タイプ' : 'Payment Type'}
                      </Label>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CAPTURE">CAPTURE - Immediate Payment</SelectItem>
                          <SelectItem value="AUTHORIZE">AUTHORIZE - Auth and Capture Later</SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.intent && (
                        <p className="text-sm text-red-500">{form.formState.errors.intent.message}</p>
                      )}
                    </div>
                  )}
                />
                
                <Button type="submit" className="w-full">
                  {language === 'ko' 
                    ? '결제 정보 확인' 
                    : language === 'jp' 
                      ? '決済情報を確認' 
                      : 'Confirm Payment Details'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        {/* Payment Processing Section */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'ko' ? '결제 처리' : language === 'jp' ? '決済処理' : 'Payment Processing'}
            </CardTitle>
            <CardDescription>
              {language === 'ko' 
                ? '결제 정보를 확인하고 PayPal 결제를 진행하세요' 
                : language === 'jp' 
                  ? '決済情報を確認して、PayPal決済を進めてください' 
                  : 'Verify payment details and proceed with PayPal payment'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paymentData ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="font-medium mb-2">
                    {language === 'ko' ? '결제 요약' : language === 'jp' ? '決済概要' : 'Payment Summary'}
                  </h3>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">
                      {language === 'ko' ? '금액' : language === 'jp' ? '金額' : 'Amount'}:
                    </span>
                    <span className="font-medium">{paymentData.amount} {paymentData.currency}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">
                      {language === 'ko' ? '결제 유형' : language === 'jp' ? '決済タイプ' : 'Payment Type'}:
                    </span>
                    <span className="font-medium">{paymentData.intent}</span>
                  </div>
                </div>
                
                {showPayPalButton && (
                  <div className="flex flex-col items-center mt-6">
                    <div className="mb-4 w-full max-w-xs">
                      <PayPalButton 
                        amount={paymentData.amount}
                        currency={paymentData.currency}
                        intent={paymentData.intent}
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={handlePaymentCancel}
                      className="mt-4"
                    >
                      {language === 'ko' 
                        ? '취소' 
                        : language === 'jp' 
                          ? 'キャンセル' 
                          : 'Cancel'}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                <p className="text-center">
                  {language === 'ko' 
                    ? '왼쪽 양식에서 결제 설정을 구성하세요.' 
                    : language === 'jp' 
                      ? '左側のフォームで決済設定を構成してください。' 
                      : 'Configure payment settings in the form on the left.'}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t p-4">
            <p className="text-xs text-slate-500 text-center">
              {language === 'ko' 
                ? '이 페이지는 테스트용이며 실제 결제가 이루어지지 않습니다.' 
                : language === 'jp' 
                  ? 'このページはテスト用であり、実際の決済は行われません。' 
                  : 'This page is for testing purposes only and no actual charges will be made.'}
            </p>
          </CardFooter>
        </Card>
      </div>
      
      {/* Additional Information */}
      <div className="mt-8 p-6 bg-slate-50 rounded-lg border border-slate-200">
        <h2 className="text-xl font-bold mb-4">
          {language === 'ko' ? '결제 데모 정보' : language === 'jp' ? '決済デモ情報' : 'Payment Demo Information'}
        </h2>
        <div className="space-y-4">
          <p>
            {language === 'ko' 
              ? '이 데모는 PayPal 결제 통합을 테스트하기 위한 것입니다. 샌드박스 모드에서 실행되므로 실제 결제는 이루어지지 않습니다.' 
              : language === 'jp' 
                ? 'このデモはPayPal決済統合をテストするためのものです。サンドボックスモードで実行されるため、実際の決済は行われません。' 
                : 'This demo is for testing PayPal payment integration. It runs in sandbox mode, so no actual charges are made.'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <h3 className="font-medium mb-2">
                {language === 'ko' ? '테스트 기능' : language === 'jp' ? 'テスト機能' : 'Test Features'}
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>{language === 'ko' ? '다양한 통화 설정' : language === 'jp' ? '複数の通貨設定' : 'Multiple currency settings'}</li>
                <li>{language === 'ko' ? '금액 구성' : language === 'jp' ? '金額の構成' : 'Amount configuration'}</li>
                <li>{language === 'ko' ? '다양한 결제 유형' : language === 'jp' ? '複数の決済タイプ' : 'Different payment intents'}</li>
                <li>{language === 'ko' ? 'PayPal 결제 흐름' : language === 'jp' ? 'PayPal決済フロー' : 'PayPal payment flow'}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">
                {language === 'ko' ? '참고 사항' : language === 'jp' ? '注意事項' : 'Notes'}
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  {language === 'ko' 
                    ? 'KRW와 같은 일부 통화는 PayPal 샌드박스에서 제한될 수 있습니다.' 
                    : language === 'jp' 
                      ? 'KRWなどの一部の通貨はPayPalサンドボックスで制限される場合があります。' 
                      : 'Some currencies like KRW may be restricted in PayPal sandbox.'}
                </li>
                <li>
                  {language === 'ko' 
                    ? '결제 성공 및 실패는 콘솔에서 확인할 수 있습니다.' 
                    : language === 'jp' 
                      ? '決済の成功と失敗はコンソールで確認できます。' 
                      : 'Payment success and failure can be monitored in the console.'}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDemo;