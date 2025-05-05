import React, { useEffect, useRef } from 'react';
import { FileIcon, ImageIcon, Link2 } from 'lucide-react';

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
    
    console.log("MediaPreview 컨텐츠 처리 중:", content);
    
    // 콘텐츠 처리
    const processedContent = processContent(content);
    console.log("처리된 컨텐츠:", processedContent);
    
    containerRef.current.innerHTML = processedContent;
    
    // 드래그앤드롭 이벤트 설정
    setupDragAndDrop(containerRef.current);
  }, [content]);

  // 드래그 앤 드롭 기능 설정
  const setupDragAndDrop = (container: HTMLElement) => {
    const images = container.querySelectorAll('img');
    console.log(`${images.length}개의 이미지에 드래그앤드롭 설정`);
    
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
      });
    });
  };

  // 컨텐츠 처리
  const processContent = (text: string): string => {
    // 디버깅을 위한 로그
    console.log("원본 텍스트:", text);
    
    // 마크다운 이미지 변환 - ![]()
    let processedText = text.replace(
      /!\[(.*?)\]\((.*?)\)/g, 
      '<img src="$2" alt="$1" class="editor-img" draggable="true" />'
    );
    
    console.log("이미지 마크다운 변환 후:", processedText);
    
    // YouTube 임베드 처리
    const youtubePattern = /<div class="youtube-embed">\s*<iframe\s+width="(.*?)"\s+height="(.*?)"\s+src="https:\/\/www\.youtube\.com\/embed\/(.*?)"\s+frameborder="(.*?)"\s+allow="(.*?)"\s+allowfullscreen\s*>\s*<\/iframe>\s*<\/div>/gi;
    
    let processedWithYoutube = processedText.replace(
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
    let processedWithVideos = processedWithYoutube.replace(
      videoPattern,
      (match, width, src, type) => {
        return `<div class="video-container">
          <video controls width="${width}" class="editor-video">
            <source src="${src}" type="${type}">
          </video>
        </div>`;
      }
    );
    
    // 파일 다운로드 링크 처리
    const filePattern = /\[파일 다운로드: (.*?)\]\((.*?)\)/g;
    let processedWithFiles = processedWithVideos.replace(
      filePattern,
      (match, fileName, url) => {
        return `<div class="file-link">
          <a href="${url}" download class="flex items-center p-2 border rounded-md hover:bg-muted/20 transition-colors">
            <span class="file-icon">📄</span>
            <span>${fileName}</span>
          </a>
        </div>`;
      }
    );
    
    // 독립적인 URL 패턴 처리 (URL만 단독으로 있는 경우)
    const standaloneUrlPattern = /^(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*))$/gm;
    
    let processedWithUrls = processedWithFiles.replace(
      standaloneUrlPattern,
      (url) => {
        console.log("URL 감지됨:", url);
        
        // YouTube URL인지 확인
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
        const match = url.match(youtubeRegex);
        
        // 이미지 URL인지 확인
        const imageRegex = /\.(jpg|jpeg|png|gif|bmp|webp)(\?.*)?$/i;
        const isImageUrl = imageRegex.test(url);
        
        if (match && match[1]) {
          console.log("YouTube URL 감지:", match[1]);
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
        } else if (isImageUrl) {
          console.log("이미지 URL 감지");
          return `<img src="${url}" alt="이미지" class="editor-img" draggable="true" />`;
        } else {
          try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname;
            const title = domain.replace('www.', '');
            
            return `<div class="url-card">
              <a href="${url}" target="_blank" rel="noopener noreferrer">
                <div class="url-preview">
                  <div class="url-icon">🔗</div>
                  <div class="url-content">
                    <div class="url-title">${title}</div>
                    <div class="url-link">${url}</div>
                  </div>
                </div>
              </a>
            </div>`;
          } catch (e) {
            console.error("URL 파싱 오류:", e);
            return url;
          }
        }
      }
    );
    
    return processedWithUrls;
  };

  return (
    <div 
      ref={containerRef} 
      className={`media-preview editor-preview ${className}`}
      data-testid="media-preview"
      data-content-length={content?.length || 0}
    ></div>
  );
};

export default MediaPreview;