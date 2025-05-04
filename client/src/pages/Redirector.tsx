import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';

interface RedirectorProps {
  to: string;
  type?: string;
}

/**
 * 라우팅 리다이렉션을 처리하는 컴포넌트
 * 특히 /resources/type/:type 및 /services/type/:type 등의 경로를 올바르게 처리하기 위함
 */
const Redirector: React.FC<RedirectorProps> = ({ to, type }) => {
  const [_, navigate] = useLocation();
  const { language } = useLanguage();
  
  useEffect(() => {
    let targetPath = to;
    
    // type이 제공된 경우, 경로에 추가
    if (type) {
      targetPath = targetPath.replace(':type', type);
    }
    
    // 언어에 따라 경로 접두사 추가 (ko는 접두사 없음)
    const fullPath = language === 'ko' ? targetPath : `/${language}${targetPath}`;
    
    console.log(`[Redirector] Redirecting to: ${fullPath} (original to: ${to}, type: ${type || 'none'})`);
    
    // 리다이렉션 실행
    navigate(fullPath);
  }, [to, type, language, navigate]);
  
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div>
      <p className="ml-3 text-gray-600">
        {language === 'ko' ? '페이지 이동 중...' : 
         language === 'jp' ? 'ページ移動中...' : 
         'Redirecting...'}
      </p>
    </div>
  );
};

export default Redirector;