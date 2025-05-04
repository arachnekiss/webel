import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useDeviceDetect } from '@/lib/useDeviceDetect';
import { CheckCircle, Sparkles, ArrowRight, Brain, Bot, Cpu, Camera, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const AIAssistant: React.FC = () => {
  const { isMobile } = useDeviceDetect();
  const { t, formatUrl, language } = useLanguage();
  
  // AI 기술 파트너 텍스트 배열을 언어별로 설정
  const aiTechnologies = {
    ko: ["실시간 객체 인식", "음성 비서", "AR 시각화", "머신러닝 기반 분석"],
    en: ["Real-time Object Detection", "Voice Assistant", "AR Visualization", "ML-based Analysis"],
    jp: ["リアルタイム物体認識", "音声アシスタント", "AR視覚化", "機械学習分析"]
  };
  
  return (
    <section className="rounded-3xl overflow-hidden border border-slate-100 shadow-xl bg-white mb-12">
      <div className="bg-gradient-to-r from-purple-50 to-violet-50 px-6 py-6 border-b border-violet-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-violet-100 mr-3">
              <Bot className="h-5 w-5 text-violet-500" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">{t('features.aiAssembly.title')}</h2>
          </div>
          <Link href={formatUrl('/ai-assembly')}>
            <Button variant="outline" className="group md:self-start rounded-lg border-violet-200 bg-white/80 hover:border-violet-400 hover:bg-violet-50 text-violet-700 transition-all">
              {t('viewMore')}
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
              {t('features.aiAssembly.simplifyWithAI')}
            </span>
          </div>
          
          <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">
            {t('features.aiAssembly.smartAssemblyTitle')}<br/>
            <span className="text-violet-600">{t('features.aiAssembly.smartAssemblyProcess')}</span>
          </h3>
          
          <p className="text-slate-600 mb-8">
            {t('features.aiAssembly.description')}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center mb-3">
                <Camera className="h-5 w-5 text-violet-600" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-1">{t('features.aiAssembly.realTimeAnalysis')}</h4>
              <p className="text-slate-600 text-sm">{t('features.aiAssembly.realTimeAnalysisDesc')}</p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center mb-3">
                <Cpu className="h-5 w-5 text-violet-600" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-1">{t('features.aiAssembly.visualization3D')}</h4>
              <p className="text-slate-600 text-sm">{t('features.aiAssembly.visualization3DDesc')}</p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center mb-3">
                <Brain className="h-5 w-5 text-violet-600" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-1">{t('features.aiAssembly.intelligentGuidance')}</h4>
              <p className="text-slate-600 text-sm">{t('features.aiAssembly.intelligentGuidanceDesc')}</p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center mb-3">
                <Zap className="h-5 w-5 text-violet-600" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-1">{t('features.aiAssembly.problemSolving')}</h4>
              <p className="text-slate-600 text-sm">{t('features.aiAssembly.problemSolvingDesc')}</p>
            </div>
          </div>
          
          <Link href={formatUrl('/ai-assembly')}>
            <Button className="group px-6 py-6 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 shadow-lg hover:shadow-xl transition-all duration-300 text-base w-full md:w-auto">
              <Bot className="h-5 w-5 mr-2" />
              {t('features.aiAssembly.startAIAssistant')}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
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
                    <div className="text-violet-600 font-semibold mb-1">{t('features.aiAssembly.aiAssistant')}</div>
                    <div className="text-slate-700 text-sm">{t('features.aiAssembly.assemblyInstruction')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-gradient-to-r from-violet-50 to-indigo-50 border-t border-violet-100">
        <div className="text-center text-slate-500 text-sm">
          <span>{t('features.aiAssembly.aiTechPartners')}</span>
          <div className="mt-2 flex justify-center items-center space-x-8 text-violet-700 opacity-70">
            {aiTechnologies[language].map((name, idx) => (
              <span key={idx} className="font-medium">{name}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIAssistant;
