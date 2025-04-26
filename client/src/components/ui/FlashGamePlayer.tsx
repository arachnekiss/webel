import React, { useState, useRef, useEffect } from 'react';
import { Resource } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gamepad2, Maximize2, Minimize2, RefreshCw, Download } from 'lucide-react';

interface FlashGamePlayerProps {
  resource: Resource;
  onDownload?: () => void;
}

const FlashGamePlayer: React.FC<FlashGamePlayerProps> = ({ resource, onDownload }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.onload = () => {
        setIsLoading(false);
      };
    }

    // Clean up on unmount
    return () => {
      if (iframeRef.current) {
        iframeRef.current.onload = null;
      }
    };
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const reloadGame = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <Card className="w-full bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center">
          <Gamepad2 className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="font-medium text-slate-800">{resource.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={reloadGame}
            title="게임 새로고침"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={toggleFullscreen}
            title={isFullscreen ? "전체 화면 종료" : "전체 화면"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <div 
        ref={containerRef} 
        className={`relative ${isFullscreen ? 'w-screen h-screen' : 'aspect-[4/3] w-full'} bg-black`}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-white z-10">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-2"></div>
              <span>게임 로딩 중...</span>
            </div>
          </div>
        )}
        <iframe 
          ref={iframeRef}
          src={resource.downloadUrl}
          className="w-full h-full border-0"
          title={`${resource.title} 플래시 게임`}
          allow="fullscreen"
          sandbox="allow-scripts allow-same-origin"
        ></iframe>
      </div>
      
      <CardFooter className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
        <div className="text-sm text-slate-500">
          조작법: 화살표 키와 스페이스 바를 사용하세요
        </div>
        {onDownload && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onDownload}
            className="h-8 flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            다운로드
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default FlashGamePlayer;