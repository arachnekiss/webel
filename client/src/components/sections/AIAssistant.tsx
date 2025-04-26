import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useDeviceDetect } from '@/lib/useDeviceDetect';
import { CheckCircle } from 'lucide-react';

const AIAssistant: React.FC = () => {
  const { isMobile } = useDeviceDetect();
  
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">AI 조립 비서</h2>
        <Link href="/ai-assembly">
          <a className="text-primary hover:underline text-sm font-medium">더 알아보기</a>
        </Link>
      </div>
      
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 p-8 flex flex-col justify-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              AI가 도와주는 스마트한 조립 과정
            </h3>
            <p className="text-blue-100 mb-6">
              복잡한 조립 과정을 AI가 단계별로 안내해드립니다. 실시간으로 진행 상황을 분석하고 
              피드백을 제공하여 실수 없이 완성할 수 있습니다. 
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-300 mr-2 mt-0.5" />
                <span className="text-white">카메라를 통한 실시간 진행 상황 분석</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-300 mr-2 mt-0.5" />
                <span className="text-white">직관적인 3D 시각화 가이드</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-300 mr-2 mt-0.5" />
                <span className="text-white">음성 안내 지원</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-300 mr-2 mt-0.5" />
                <span className="text-white">문제 발생 시 실시간 해결책 제안</span>
              </li>
            </ul>
            <Link href="/ai-assembly">
              <Button className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors w-full md:w-auto text-center">
                AI 비서 시작하기
              </Button>
            </Link>
          </div>
          {!isMobile && (
            <div className="md:w-1/2 flex items-center justify-center p-8">
              <img 
                src="https://images.unsplash.com/photo-1563770557918-8c5061cf6bdc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="AI 조립 비서" 
                className="rounded-lg shadow-md max-h-80 object-cover" 
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AIAssistant;
