import React from 'react';
import { Button } from '@/components/ui/button';
import TopLink from '@/components/ui/TopLink';
import { useDeviceDetect } from '@/lib/useDeviceDetect';
import { CheckCircle, Sparkles, ArrowRight, Brain, Bot, Cpu, Camera, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const AIAssistant: React.FC = () => {
  const { isMobile } = useDeviceDetect();
  const { language } = useLanguage();
  
  return (
    <section className="rounded-3xl overflow-hidden border border-slate-100 shadow-xl bg-white mb-12">
      <div className="bg-gradient-to-r from-purple-50 to-violet-50 px-6 py-6 border-b border-violet-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-violet-100 mr-3">
              <Bot className="h-5 w-5 text-violet-500" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
              {language === 'ko' ? 'AI 조립 비서' : 
               language === 'jp' ? 'AI組立アシスタント' : 
               'AI Assembly Assistant'}
            </h2>
          </div>
          <TopLink href="/ai-assembly">
            <Button variant="outline" className="group md:self-start rounded-lg border-violet-200 bg-white/80 hover:border-violet-400 hover:bg-violet-50 text-violet-700 transition-all">
              {language === 'ko' ? '더 알아보기' : 
               language === 'jp' ? '詳細を見る' : 
               'Learn More'}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </TopLink>
        </div>
      </div>
      
      <div className="md:flex">
        <div className="md:w-1/2 p-6 md:p-10 flex flex-col justify-center">
          <div className="inline-block px-3 py-1 mb-6 rounded-full bg-violet-100 text-violet-700">
            <span className="text-xs font-medium flex items-center">
              <Sparkles className="h-3 w-3 mr-1" />
              {language === 'ko' ? '인공지능 기술로 제작 과정 간소화' : 
               language === 'jp' ? 'AI技術で製作プロセスを簡素化' : 
               'Simplify Building with AI Technology'}
            </span>
          </div>
          
          <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">
            {language === 'ko' ? (
              <>
                AI가 도와주는 스마트한<br/>
                <span className="text-violet-600">조립 과정</span>
              </>
            ) : language === 'jp' ? (
              <>
                AIがサポートするスマートな<br/>
                <span className="text-violet-600">組立プロセス</span>
              </>
            ) : (
              <>
                Smart Assembly Process<br/>
                <span className="text-violet-600">Powered by AI</span>
              </>
            )}
          </h3>
          
          <p className="text-slate-600 mb-8">
            {language === 'ko' ? '복잡한 조립 과정을 AI가 단계별로 안내해드립니다. 실시간으로 진행 상황을 분석하고 피드백을 제공하여 실수 없이 완성할 수 있습니다.' : 
             language === 'jp' ? '複雑な組立プロセスをAIがステップバイステップでガイドします。リアルタイムで進捗状況を分析し、フィードバックを提供することでミスなく完成させることができます。' : 
             'AI guides you through complex assembly processes step by step. It analyzes your progress in real-time and provides feedback to help you complete without mistakes.'}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center mb-3">
                <Camera className="h-5 w-5 text-violet-600" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-1">
                {language === 'ko' ? '실시간 분석' : 
                 language === 'jp' ? 'リアルタイム分析' : 
                 'Real-time Analysis'}
              </h4>
              <p className="text-slate-600 text-sm">
                {language === 'ko' ? '카메라를 통해 작업 상황을 실시간으로 파악하고 분석' : 
                 language === 'jp' ? 'カメラを通じて作業状況をリアルタイムで把握し分析' : 
                 'Analyze your assembly progress in real-time through camera'}
              </p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center mb-3">
                <Cpu className="h-5 w-5 text-violet-600" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-1">
                {language === 'ko' ? '3D 시각화' : 
                 language === 'jp' ? '3D可視化' : 
                 '3D Visualization'}
              </h4>
              <p className="text-slate-600 text-sm">
                {language === 'ko' ? '직관적인 3D 가이드로 복잡한 부품도 쉽게 조립' : 
                 language === 'jp' ? '直感的な3Dガイドで複雑な部品も簡単に組立' : 
                 'Easily assemble complex parts with intuitive 3D guides'}
              </p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center mb-3">
                <Brain className="h-5 w-5 text-violet-600" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-1">
                {language === 'ko' ? '지능형 안내' : 
                 language === 'jp' ? 'インテリジェントガイド' : 
                 'Intelligent Guidance'}
              </h4>
              <p className="text-slate-600 text-sm">
                {language === 'ko' ? '음성 안내와 함께 사용자의 숙련도에 맞춘 맞춤형 지원' : 
                 language === 'jp' ? '音声ガイドと共にユーザーのスキルレベルに合わせたカスタマイズ支援' : 
                 'Custom support with voice guidance tailored to your skill level'}
              </p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center mb-3">
                <Zap className="h-5 w-5 text-violet-600" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-1">
                {language === 'ko' ? '문제 해결' : 
                 language === 'jp' ? '問題解決' : 
                 'Problem Solving'}
              </h4>
              <p className="text-slate-600 text-sm">
                {language === 'ko' ? '문제 발생 시 즉각적인 진단과 실용적인 해결책 제안' : 
                 language === 'jp' ? '問題発生時に即座な診断と実用的な解決策を提案' : 
                 'Immediate diagnosis and practical solutions when problems occur'}
              </p>
            </div>
          </div>
          
          <TopLink href="/ai-assembly">
            <Button className="group px-6 py-6 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 shadow-lg hover:shadow-xl transition-all duration-300 text-base w-full md:w-auto">
              <Bot className="h-5 w-5 mr-2" />
              {language === 'ko' ? 'AI 비서 시작하기' : 
               language === 'jp' ? 'AIアシスタントを起動' : 
               'Start AI Assistant'}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </TopLink>
        </div>
        
        {!isMobile && (
          <div className="hidden md:block md:w-1/2 relative bg-violet-100">
            <div className="absolute inset-0 bg-[url('/images/ai-assistant.png')] bg-center bg-cover opacity-100"></div>
            <div className="absolute inset-0 bg-gradient-to-l from-violet-900/30 to-violet-900/5"></div>
            
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-violet-100">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center mr-4">
                    <Bot className="h-6 w-6 text-violet-600" />
                  </div>
                  <div>
                    <div className="text-violet-600 font-semibold mb-1">
                      {language === 'ko' ? 'AI 어시스턴트' : 
                       language === 'jp' ? 'AIアシスタント' : 
                       'AI Assistant'}
                    </div>
                    <div className="text-slate-700 text-sm">
                      {language === 'ko' ? '이 부품을 3mm 간격으로 배치하세요. 올바른 방향으로 조립되고 있습니다.' : 
                       language === 'jp' ? 'この部品を3mm間隔で配置してください。正しい方向に組み立てられています。' : 
                       'Place this part with 3mm spacing. You are assembling in the correct direction.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-gradient-to-r from-violet-50 to-indigo-50 border-t border-violet-100">
        <div className="text-center text-slate-500 text-sm">
          <span>
            {language === 'ko' ? 'AI 기술 파트너' : 
             language === 'jp' ? 'AI技術パートナー' : 
             'AI Technology Partners'}
          </span>
          <div className="mt-2 flex justify-center items-center space-x-8 text-violet-700 opacity-70">
            {language === 'ko' ? 
              ["실시간 객체 인식", "음성 비서", "AR 시각화", "머신러닝 기반 분석"].map((name, idx) => (
                <span key={idx} className="font-medium">{name}</span>
              )) :
             language === 'jp' ? 
              ["リアルタイム物体認識", "音声アシスタント", "AR視覚化", "機械学習分析"].map((name, idx) => (
                <span key={idx} className="font-medium">{name}</span>
              )) :
              ["Real-time Object Detection", "Voice Assistant", "AR Visualization", "ML-based Analysis"].map((name, idx) => (
                <span key={idx} className="font-medium">{name}</span>
              ))
            }
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIAssistant;
