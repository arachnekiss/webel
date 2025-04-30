import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Resource } from '@/types';
import { Button } from '@/components/ui/button';
import { Download, Share, Phone, Award, Sparkles, Star, FileCode, ChevronRight, ArrowRight } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// 씨드 데이터에서 리소스 ID를 가져옵니다 (ID 1 사용)
const FEATURED_RESOURCE_ID = 1;

const FeaturedProduct: React.FC = () => {
  const { toast } = useToast();
  
  const { data: resource, isLoading, error } = useQuery<Resource>({
    queryKey: [`/api/resources/${FEATURED_RESOURCE_ID}`],
  });

  const handleDownload = async () => {
    if (!resource) return;
    
    try {
      await apiRequest('GET', resource.downloadUrl, undefined);
      toast({
        title: "다운로드 시작됨",
        description: `${resource.title} 다운로드가 시작되었습니다.`,
      });
    } catch (error) {
      toast({
        title: "다운로드 실패",
        description: "파일을 다운로드 하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    if (navigator.share && resource) {
      navigator.share({
        title: resource.title,
        text: resource.description,
        url: document.location.href,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      toast({
        title: "공유 실패",
        description: "이 브라우저에서는 공유 기능을 지원하지 않습니다.",
      });
    }
  };

  // 인기 하드웨어 설계도를 가져오지 못했을 경우에 대비해 fallback 데이터
  const fallbackResource: Resource = {
    id: 999,
    title: 'AI 기반 자동화 작물 관리 시스템',
    description: '이 설계는 카메라와 다양한 센서로 작물 상태를 실시간으로 모니터링하고, AI 알고리즘을 통해 작물의 건강 상태를 분석하여 자동으로 물과 영양분을 공급하는 시스템입니다. 라즈베리 파이와 오픈소스 소프트웨어로 구성되어 있으며, 모든 설계도와 소스 코드가 포함되어 있습니다.',
    resourceType: 'hardware_design',
    tags: ['라즈베리 파이', 'IoT', '스마트 농업', 'AI'],
    imageUrl: 'https://images.unsplash.com/photo-1638815401319-690010ac2ffc',
    downloadUrl: '/api/resources/1/download',
    downloadCount: 3400,
    materialsList: [
      '라즈베리 파이 4B',
      '라즈베리 파이 카메라 모듈',
      '토양 습도 센서',
      '온도 및 습도 센서 (DHT22)',
      '물 펌프 및 릴레이 모듈',
      '광량 센서'
    ],
    recipe: {
      steps: [
        { title: '하드웨어 조립', description: '라즈베리 파이에 센서들을 연결 다이어그램에 따라 연결합니다.' },
        { title: 'OS 및 소프트웨어 설치', description: 'Raspberry Pi OS를 설치하고 제공된 Python 스크립트를 복사합니다.' },
        { title: '알고리즘 설정', description: '작물 유형에 따라 config.json 파일의 매개변수를 조정합니다.' },
        { title: '시스템 가동', description: '자동 실행 스크립트를 설정하고 시스템을 테스트합니다.' }
      ]
    },
    createdAt: new Date().toISOString(),
    isCrawled: false,
    sourceSite: ""
  };

  // 로딩 중이거나 에러 발생 시 실제 리소스 또는 대체 리소스 사용
  const displayResource = isLoading || error ? fallbackResource : (resource || fallbackResource);

  // Recipe 타입을 위한 인터페이스 정의
  interface RecipeStep {
    title: string;
    description: string;
  }
  
  // type 단언으로 recipe steps 타입 처리
  const recipeSteps = displayResource.recipe?.steps as RecipeStep[] || [];

  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 mr-3">
              <Award className="h-5 w-5 text-amber-500" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">인기 하드웨어 설계도</h2>
          </div>
          <Link href="/resources/hardware_design">
            <Button variant="ghost" className="text-primary hover:text-primary-600 font-medium">
              <span>더 보기</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
          <div className="md:flex">
            <div className="md:w-1/3 bg-slate-200 h-80"></div>
            <div className="md:w-2/3 p-8">
              <div className="h-8 bg-slate-200 rounded-lg w-3/4 mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/4 mb-6"></div>
              <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-8"></div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="h-6 bg-slate-200 rounded"></div>
                <div className="h-6 bg-slate-200 rounded"></div>
                <div className="h-6 bg-slate-200 rounded"></div>
                <div className="h-6 bg-slate-200 rounded"></div>
              </div>
              <div className="flex gap-3">
                <div className="h-10 bg-slate-200 rounded-lg w-1/3"></div>
                <div className="h-10 bg-slate-200 rounded-lg w-1/4"></div>
                <div className="h-10 bg-slate-200 rounded-lg w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl overflow-hidden border border-slate-100 shadow-xl bg-white">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-6 border-b border-amber-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 mr-3">
              <Award className="h-5 w-5 text-amber-500" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">인기 하드웨어 설계도</h2>
          </div>
          <Link href="/resources/hardware_design">
            <Button variant="outline" className="group md:self-start rounded-lg border-amber-200 bg-white/80 hover:border-amber-400 hover:bg-amber-50 text-amber-800 transition-all">
              하드웨어 설계도 더 보기
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="md:flex">
        <div className="md:w-2/5 lg:w-1/3 relative">
          <div className="aspect-[4/3] md:h-full relative overflow-hidden">
            {displayResource.imageUrl ? (
              <img 
                src={displayResource.imageUrl} 
                alt={displayResource.title} 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
              />
            ) : (
              <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                <FileCode className="h-16 w-16 text-slate-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden"></div>
          </div>
          
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <div className="bg-green-500 text-white px-3 py-1 text-sm font-medium rounded-full shadow-md flex items-center">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              하드웨어 설계도
            </div>
            <div className="bg-amber-500 text-white px-3 py-1 text-sm font-medium rounded-full shadow-md flex items-center">
              <Star className="h-3.5 w-3.5 mr-1" />
              인기 리소스
            </div>
          </div>
          
          <div className="absolute bottom-4 right-4 md:hidden">
            <div className="bg-white/80 backdrop-blur-sm text-slate-800 px-3 py-1 text-sm font-medium rounded-full shadow-md">
              {displayResource.downloadCount.toLocaleString()}+ 다운로드
            </div>
          </div>
        </div>
        
        <div className="md:w-3/5 lg:w-2/3 p-6 md:p-8 lg:p-10">
          <div className="hidden md:flex items-center mb-4 text-sm">
            <div className="flex items-center text-amber-700 mr-4">
              <Star className="h-4 w-4 mr-1 text-amber-500 fill-amber-500" />
              <span>인기 리소스</span>
            </div>
            <div className="flex items-center text-slate-500">
              <Download className="h-4 w-4 mr-1" />
              <span>{displayResource.downloadCount.toLocaleString()}+ 다운로드</span>
            </div>
          </div>
          
          <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">{displayResource.title}</h3>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {displayResource.tags && displayResource.tags.map((tag, index) => (
              <span key={index} className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium border border-blue-100">
                {tag}
              </span>
            ))}
          </div>
          
          <p className="text-slate-600 text-lg mb-8">{displayResource.description}</p>
          
          {/* Materials section */}
          {displayResource.materialsList && displayResource.materialsList.length > 0 && (
            <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <h4 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                필요 재료
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {displayResource.materialsList.map((material, index) => (
                  <div key={index} className="flex items-center py-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-slate-700">{material}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Recipe steps preview */}
          {recipeSteps.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                조립 단계 ({recipeSteps.length}단계)
              </h4>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                {recipeSteps.slice(0, 2).map((step, index) => (
                  <div 
                    key={index} 
                    className={`p-3 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} ${index !== 0 ? 'border-t border-slate-200' : ''}`}
                  >
                    <div className="flex">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 mt-1">
                        {index + 1}
                      </div>
                      <div>
                        <h5 className="font-medium text-slate-800">{step.title}</h5>
                        <p className="text-slate-600 text-sm">{step.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {recipeSteps.length > 2 && (
                  <div className="bg-slate-50 p-3 border-t border-slate-200 text-center">
                    <span className="text-sm text-slate-500">+ {recipeSteps.length - 2}단계 더 보기</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="flex flex-wrap gap-4">
            <Button
              className="group px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={handleDownload}
            >
              <Download className="h-5 w-5 mr-2" />
              설계도 다운로드
              <span className="ml-2 text-blue-200 text-sm">{displayResource.downloadCount.toLocaleString()}+</span>
            </Button>
            <Button
              variant="outline"
              className="px-6 py-3 bg-white text-primary font-medium rounded-xl border border-primary/30 hover:border-primary hover:bg-blue-50 transition-all"
              onClick={handleShare}
            >
              <Share className="h-5 w-5 mr-2" />
              공유하기
            </Button>
            <Button
              variant="outline"
              className="px-6 py-3 bg-white text-slate-700 font-medium rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
            >
              <Phone className="h-5 w-5 mr-2" />
              제작 문의
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProduct;
