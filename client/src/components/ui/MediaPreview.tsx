import React, { useEffect, useRef } from 'react';
import { FileIcon, ImageIcon, Link2Icon, PlayCircleIcon } from 'lucide-react';

interface MediaPreviewProps {
  content: string;
  className?: string;
}

/**
 * 다양한 미디어 컨텐츠(이미지, 비디오, URL, 파일)를 인라인으로 렌더링하는 컴포넌트
 */
const MediaPreview: React.FC<MediaPreviewProps> = ({ content, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // 마운트 시 및 content 변경 시 미디어를 처리합니다
  useEffect(() => {
    if (!containerRef.current) return;
    
    // DOM 요소 초기화
    containerRef.current.innerHTML = '';
    
    if (!content.trim()) return;
    
    // 콘텐츠 처리
    const processedContent = processContent(content);
    containerRef.current.innerHTML = processedContent;
    
    // 드래그앤드롭 이벤트 설정
    setupDragAndDrop(containerRef.current);
  }, [content]);

  // 드래그 앤 드롭 기능 설정
  const setupDragAndDrop = (container: HTMLElement) => {
    const images = container.querySelectorAll('img');
    
    images.forEach(img => {
      img.classList.add('editor-img');
      img.draggable = true;
      
      img.addEventListener('dragstart', (e) => {
        if (e.target instanceof HTMLElement) {
          e.target.classList.add('dragging-media');
        }
      });
      
      img.addEventListener('dragend', (e) => {
        if (e.target instanceof HTMLElement) {
          e.target.classList.remove('dragging-media');
        }
        
        // 순서 변경 처리 로직은 여기에 추가할 수 있습니다
      });
    });
  };

  // 컨텐츠 처리
  const processContent = (text: string): string => {
    // 마크다운 이미지 변환 - ![]()
    const processedText = text.replace(
      /!\[(.*?)\]\((.*?)\)/g, 
      '<img src="$2" alt="$1" class="editor-img" draggable="true" />'
    );
    
    // YouTube 임베드 처리
    const youtubePattern = /<div class="youtube-embed">\s*<iframe\s+width="(.*?)"\s+height="(.*?)"\s+src="https:\/\/www\.youtube\.com\/embed\/(.*?)"\s+frameborder="(.*?)"\s+allow="(.*?)"\s+allowfullscreen\s*>\s*<\/iframe>\s*<\/div>/gi;
    
    const processedWithYoutube = processedText.replace(
      youtubePattern,
      (match, width, height, videoId, frameborder, allow) => {
        return `<div class="youtube-embed">
          <div class="aspect-video">
            <iframe 
              width="100%" 
              height="100%"
              src="https://www.youtube.com/embed/${videoId}" 
              frameborder="${frameborder}" 
              allow="${allow}" 
              allowfullscreen
              class="absolute inset-0 w-full h-full"
            ></iframe>
          </div>
        </div>`;
      }
    );
    
    // 비디오 태그 처리
    const videoPattern = /<video\s+controls\s+width="(.*?)">\s*<source\s+src="(.*?)"\s+type="(.*?)"><\/video>/gi;
    const processedWithVideos = processedWithYoutube.replace(
      videoPattern,
      (match, width, src, type) => {
        return `<div class="video-container">
          <video controls width="${width}" class="editor-video">
            <source src="${src}" type="${type}">
          </video>
        </div>`;
      }
    );
    
    // URL 카드 링크 처리
    const urlCardPattern = /<div class="url-card">(.*?)<\/div>/gs;
    const processedWithUrlCards = processedWithVideos.replace(
      urlCardPattern,
      (match, content) => {
        return match; // 이미 HTML로 구성된 URL 카드는 그대로 유지
      }
    );
    
    // 파일 다운로드 링크 처리
    const filePattern = /\[파일 다운로드: (.*?)\]\((.*?)\)/g;
    const processedWithFiles = processedWithUrlCards.replace(
      filePattern,
      (match, fileName, url) => {
        return `<div class="file-link">
          <a href="${url}" download class="flex items-center p-2 border rounded-md hover:bg-muted/20 transition-colors">
            <FileIcon className="w-5 h-5 mr-2 text-muted-foreground" />
            <span>${fileName}</span>
          </a>
        </div>`;
      }
    );
    
    // 일반 URL 변환 (URL 카드로)
    const urlPattern = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    
    // 이미 처리된 URL(img src, iframe src 등)은 제외하고 독립적인 URL만 처리
    const processedWithUrls = processedWithFiles.replace(
      urlPattern,
      (url) => {
        // 이미 HTML 태그 내에 있는 URL인지 확인
        const dummyDiv = document.createElement('div');
        dummyDiv.innerHTML = processedWithFiles;
        
        // YouTube URL인지 확인
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
        const isYoutubeUrl = youtubeRegex.test(url);
        
        // 이미지 URL인지 확인
        const imageRegex = /\.(jpg|jpeg|png|gif|bmp|webp)(\?.*)?$/i;
        const isImageUrl = imageRegex.test(url);
        
        if (isYoutubeUrl) {
          const match = url.match(youtubeRegex);
          if (match && match[1]) {
            return `<div class="youtube-embed">
              <div class="aspect-video">
                <iframe 
                  width="100%" 
                  height="100%"
                  src="https://www.youtube.com/embed/${match[1]}" 
                  frameborder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowfullscreen
                ></iframe>
              </div>
            </div>`;
          }
        } else if (isImageUrl) {
          return `<img src="${url}" alt="이미지" class="editor-img" draggable="true" />`;
        } else {
          try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname;
            const title = domain.replace('www.', '');
            
            return `<div class="url-card">
              <a href="${url}" target="_blank" rel="noopener noreferrer">
                <div class="url-preview">
                  <div class="url-icon"><Link2Icon className="w-4 h-4" /></div>
                  <div class="url-content">
                    <div class="url-title">${title}</div>
                    <div class="url-link">${url}</div>
                  </div>
                </div>
              </a>
            </div>`;
          } catch (e) {
            return url;
          }
        }
        
        return url;
      }
    );
    
    return processedWithUrls;
  };

  return (
    <div 
      ref={containerRef} 
      className={`media-preview editor-preview ${className}`}
    ></div>
  );
};

export default MediaPreview;