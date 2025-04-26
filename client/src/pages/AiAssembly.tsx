import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Camera, Lightbulb, Mic, HelpCircle, ArrowRight } from 'lucide-react';

const AiAssembly: React.FC = () => {
  return (
    <main className="container mx-auto px-4 py-6">
      {/* Hero section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl overflow-hidden shadow-lg mb-12">
        <div className="md:flex">
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              AI 조립 비서가 도와드립니다
            </h1>
            <p className="text-blue-100 mb-6">
              복잡한 조립 과정을 AI가 단계별로 안내해드립니다. 실시간으로 진행 상황을 분석하고 
              피드백을 제공하여 실수 없이 완성할 수 있습니다.
            </p>
            <Button className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors w-full md:w-auto text-center">
              지금 시작하기
            </Button>
          </div>
          <div className="md:w-1/2 p-6 hidden md:flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1563770557918-8c5061cf6bdc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="AI 조립 비서" 
              className="rounded-lg shadow-md max-h-80 object-cover" 
            />
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">주요 기능</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <Camera className="h-12 w-12 text-blue-500 mb-2" />
              <CardTitle>실시간 진행 상황 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                카메라를 통해 현재 조립 상태를 인식하고 다음 단계를 실시간으로 안내해드립니다.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <Lightbulb className="h-12 w-12 text-blue-500 mb-2" />
              <CardTitle>3D 시각화 가이드</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                복잡한 부품과 조립 방법을 3D로 시각화하여 직관적으로 이해할 수 있습니다.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <Mic className="h-12 w-12 text-blue-500 mb-2" />
              <CardTitle>음성 안내 지원</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                양손으로 작업 중에도 음성 안내를 통해 다음 단계를 확인할 수 있습니다.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <HelpCircle className="h-12 w-12 text-blue-500 mb-2" />
              <CardTitle>실시간 문제 해결</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                문제가 발생할 경우 즉시 감지하고 해결 방법을 제안해 드립니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* How it works */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">이용 방법</h2>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 md:p-8">
            <ol className="relative border-l border-gray-200 ml-3">
              <li className="mb-10 ml-6">
                <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-4 ring-white">
                  <span className="text-blue-600 font-bold">1</span>
                </span>
                <h3 className="flex items-center text-lg font-semibold text-gray-900">
                  프로젝트 선택
                </h3>
                <p className="mb-4 text-base font-normal text-gray-500">
                  조립하려는 제품이나 프로젝트를 선택하거나, 새로운 프로젝트를 시작합니다.
                </p>
              </li>
              <li className="mb-10 ml-6">
                <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-4 ring-white">
                  <span className="text-blue-600 font-bold">2</span>
                </span>
                <h3 className="flex items-center text-lg font-semibold text-gray-900">
                  카메라 및 마이크 설정
                </h3>
                <p className="mb-4 text-base font-normal text-gray-500">
                  AI가 작업을 인식할 수 있도록 카메라와 마이크 접근 권한을 허용합니다.
                </p>
              </li>
              <li className="mb-10 ml-6">
                <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-4 ring-white">
                  <span className="text-blue-600 font-bold">3</span>
                </span>
                <h3 className="flex items-center text-lg font-semibold text-gray-900">
                  AI 가이드 시작
                </h3>
                <p className="mb-4 text-base font-normal text-gray-500">
                  AI가 단계별로 조립 과정을 안내합니다. 필요한 도구와 부품을 준비하세요.
                </p>
              </li>
              <li className="ml-6">
                <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-4 ring-white">
                  <span className="text-blue-600 font-bold">4</span>
                </span>
                <h3 className="flex items-center text-lg font-semibold text-gray-900">
                  조립 완료 및 검증
                </h3>
                <p className="mb-4 text-base font-normal text-gray-500">
                  모든 단계를 완료한 후, AI가 최종 결과물을 검증하고 피드백을 제공합니다.
                </p>
              </li>
            </ol>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="mb-12">
        <div className="bg-gray-50 rounded-xl p-8 md:flex items-center justify-between">
          <div className="md:w-2/3 mb-6 md:mb-0">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">준비되셨나요?</h3>
            <p className="text-gray-600">
              지금 바로 AI 조립 비서와 함께 프로젝트를 시작해보세요.
              어떤 복잡한 조립도 쉽고 빠르게 완성할 수 있습니다.
            </p>
          </div>
          <div>
            <Button className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-blue-600 transition-colors shadow-md w-full md:w-auto flex items-center justify-center gap-2">
              <span>시작하기</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AiAssembly;
