import React, { useEffect, useRef } from 'react';
import { MediaPreview } from './MediaPreview';

interface ContentMediaPreviewProps {
  content: string;
  className?: string;
  readOnly?: boolean;
}

/**
 * TipTap 에디터의 HTML 내용을 안전하게 보여주는 미디어 콘텐츠 프리뷰 컴포넌트
 * - 미디어 요소(이미지, 비디오)에 대해 읽기 전용 설정
 * - blob URL 대신 실제 업로드된 URL 사용
 */
const ContentMediaPreview: React.FC<ContentMediaPreviewProps> = ({ 
  content, 
  className = "", 
  readOnly = true 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // 콘텐츠가 마운트된 후 미디어 요소 처리
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    
    // 이미지 요소 찾기 및 처리
    const images = container.querySelectorAll('img');
    images.forEach(img => {
      // blob URL 감지 및 처리
      const src = img.getAttribute('src') || '';
      if (src) {
        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'media-preview-wrapper';
        
        // 원본 이미지 대체
        img.replaceWith(imgWrapper);
        
        // React로 MediaPreview 컴포넌트를 직접 렌더링할 수 없으므로
        // DOM 조작으로 필요한 속성을 설정
        const imgElement = document.createElement('img');
        imgElement.src = src;
        imgElement.alt = img.alt || '';
        imgElement.className = 'reader-img';
        imgElement.style.width = '100%';
        imgElement.style.height = 'auto';
        imgElement.style.cursor = 'default';
        imgElement.style.pointerEvents = 'none';
        imgElement.draggable = false;
        
        // 이미지 로드 실패 시 플레이스홀더 표시
        imgElement.onerror = function() {
          this.onerror = null;
          this.src = '/static/placeholder.png';
        };
        
        imgWrapper.appendChild(imgElement);
      }
    });
    
    // 비디오 요소 찾기 및 처리
    const videos = container.querySelectorAll('video');
    videos.forEach(video => {
      const src = video.getAttribute('src') || '';
      const sourceElement = video.querySelector('source');
      const sourceSrc = sourceElement ? sourceElement.getAttribute('src') : '';
      const finalSrc = src || sourceSrc;
      
      if (finalSrc) {
        const videoWrapper = document.createElement('div');
        videoWrapper.className = 'media-preview-wrapper';
        
        // 원본 비디오 대체
        video.replaceWith(videoWrapper);
        
        // 새 비디오 요소 생성
        const videoElement = document.createElement('video');
        videoElement.src = finalSrc;
        videoElement.controls = true;
        videoElement.preload = 'metadata';
        videoElement.className = 'reader-video';
        videoElement.style.width = '100%';
        videoElement.style.pointerEvents = 'none';
        videoElement.draggable = false;
        
        videoWrapper.appendChild(videoElement);
      }
    });
    
    // YouTube 임베드 찾기 및 처리
    const youtubeEmbeds = container.querySelectorAll('.youtube-embed');
    youtubeEmbeds.forEach(embed => {
      const youtubeId = embed.getAttribute('data-youtube-id');
      if (youtubeId) {
        const iframe = embed.querySelector('iframe');
        if (iframe && iframe instanceof HTMLElement) {
          // iframe의 상호작용 방지
          iframe.style.pointerEvents = 'none';
        }
      }
    });
    
    // 파일 링크 찾기 및 처리
    const fileLinks = container.querySelectorAll('a.tiptap-file-link');
    fileLinks.forEach(link => {
      // 링크의 상호작용 방지 (다운로드 비활성화)
      if (link instanceof HTMLElement) {
        link.style.pointerEvents = 'none';
        link.style.color = 'gray';
        link.style.cursor = 'default';
        
        // 읽기 전용 표시 추가
        const readOnlySpan = document.createElement('span');
        readOnlySpan.textContent = ' (읽기 전용)';
        readOnlySpan.style.fontSize = '0.8em';
        readOnlySpan.style.color = 'gray';
        link.parentNode?.insertBefore(readOnlySpan, link.nextSibling);
      }
    });
    
  }, [content]);

  return (
    <div 
      ref={containerRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: content }}
      contentEditable={false}
      style={{
        cursor: 'default',
        WebkitUserSelect: readOnly ? 'text' : 'auto',
        userSelect: readOnly ? 'text' : 'auto',
      }}
    />
  );
};

export default ContentMediaPreview;