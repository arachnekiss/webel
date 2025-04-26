import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useDeviceDetect } from '@/lib/useDeviceDetect';
import { CheckCircle, Sparkles, ArrowRight, Brain, Bot, Cpu, Camera, Zap } from 'lucide-react';

const AIAssistant: React.FC = () => {
  const { isMobile } = useDeviceDetect();
  
  return (
    <section className="rounded-3xl overflow-hidden border border-slate-100 shadow-xl bg-white mb-12">
      <div className="bg-gradient-to-r from-purple-50 to-violet-50 px-6 py-6 border-b border-violet-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-violet-100 mr-3">
              <Bot className="h-5 w-5 text-violet-500" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">AI 조립 비서</h2>
          </div>
          <Link href="/ai-assembly">
            <Button variant="outline" className="group md:self-start rounded-lg border-violet-200 bg-white/80 hover:border-violet-400 hover:bg-violet-50 text-violet-700 transition-all">
              더 알아보기
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="md:flex">
        <div className="md:w-1/2 p-6 md:p-10 flex flex-col justify-center">
          <div className="inline-block px-3 py-1 mb-6 rounded-full bg-violet-100 text-violet-700">
            <span className="text-xs font-medium flex items-center">
              <Sparkles className="h-3 w-3 mr-1" />
              인공지능 기술로 제작 과정 간소화
            </span>
          </div>
          
          <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">
            AI가 도와주는 스마트한<br/>
            <span className="text-violet-600">조립 과정</span>
          </h3>
          
          <p className="text-slate-600 mb-8">
            복잡한 조립 과정을 AI가 단계별로 안내해드립니다. 실시간으로 진행 상황을 분석하고 
            피드백을 제공하여 실수 없이 완성할 수 있습니다. 
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center mb-3">
                <Camera className="h-5 w-5 text-violet-600" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-1">실시간 분석</h4>
              <p className="text-slate-600 text-sm">카메라를 통해 작업 상황을 실시간으로 파악하고 분석</p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center mb-3">
                <Cpu className="h-5 w-5 text-violet-600" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-1">3D 시각화</h4>
              <p className="text-slate-600 text-sm">직관적인 3D 가이드로 복잡한 부품도 쉽게 조립</p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center mb-3">
                <Brain className="h-5 w-5 text-violet-600" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-1">지능형 안내</h4>
              <p className="text-slate-600 text-sm">음성 안내와 함께 사용자의 숙련도에 맞춘 맞춤형 지원</p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center mb-3">
                <Zap className="h-5 w-5 text-violet-600" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-1">문제 해결</h4>
              <p className="text-slate-600 text-sm">문제 발생 시 즉각적인 진단과 실용적인 해결책 제안</p>
            </div>
          </div>
          
          <Link href="/ai-assembly">
            <Button className="group px-6 py-6 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 shadow-lg hover:shadow-xl transition-all duration-300 text-base w-full md:w-auto">
              <Bot className="h-5 w-5 mr-2" />
              AI 비서 시작하기
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
        
        {!isMobile && (
          <div className="hidden md:block md:w-1/2 relative bg-violet-100">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1563770557918-8c5061cf6bdc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80')] bg-center bg-cover opacity-90"></div>
            <div className="absolute inset-0 bg-gradient-to-l from-violet-900/40 to-violet-900/10"></div>
            
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-violet-100">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center mr-4">
                    <Bot className="h-6 w-6 text-violet-600" />
                  </div>
                  <div>
                    <div className="text-violet-600 font-semibold mb-1">AI 어시스턴트</div>
                    <div className="text-slate-700 text-sm">이 부품을 3mm 간격으로 배치하세요. 올바른 방향으로 조립되고 있습니다.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-gradient-to-r from-violet-50 to-indigo-50 border-t border-violet-100">
        <div className="text-center text-slate-500 text-sm">
          <span>AI 기술 파트너</span>
          <div className="mt-2 flex justify-center items-center space-x-8 text-violet-700 opacity-70">
            {["실시간 객체 인식", "음성 비서", "AR 시각화", "머신러닝 기반 분석"].map((name, idx) => (
              <span key={idx} className="font-medium">{name}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIAssistant;
