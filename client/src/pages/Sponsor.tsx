import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Heart, Star, Zap, Shield, CheckCircle, Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Sponsor: React.FC = () => {
  const { toast } = useToast();
  
  const handleSponsor = (amount: string) => {
    toast({
      title: "후원해주셔서 감사합니다!",
      description: `${amount} 후원이 완료되었습니다. Webel이 더 좋은 서비스를 제공할 수 있도록 도와주셔서 감사합니다.`,
    });
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
                onClick={() => handleSponsor('서포터 (₩5,000)')}
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
                onClick={() => handleSponsor('파트너 (₩15,000)')}
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
                onClick={() => handleSponsor('혁신가 (₩30,000)')}
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
                  <Input id="custom-amount" className="pl-8" placeholder="금액 입력" type="number" min="1000" />
                </div>
              </div>
              <Button 
                className="bg-primary hover:bg-blue-600"
                onClick={() => handleSponsor('사용자 지정 금액')}
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
                className="w-full min-h-[120px]"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button variant="outline" className="sm:w-auto w-full">
                코멘트 없이 후원하기
              </Button>
              <Button className="sm:w-auto w-full bg-primary hover:bg-blue-600">
                코멘트와 함께 후원하기
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default Sponsor;