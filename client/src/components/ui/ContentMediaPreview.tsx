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
        
        // blob URL 감지 및 경고 메시지 표시
        if (src.startsWith('blob:')) {
          console.warn('ContentMediaPreview: blob URL이 감지되었습니다:', src);
          
          // 플레이스홀더 이미지로 대체
          imgElement.src = '/static/placeholder.png';
          imgElement.alt = '임시 이미지 (다시 업로드 필요)';
          
          // 경고 메시지 추가
          const errorMsg = document.createElement('div');
          errorMsg.textContent = '임시 이미지 URL입니다. 편집 모드에서 다시 업로드해주세요.';
          errorMsg.style.color = 'red';
          errorMsg.style.fontSize = '0.8rem';
          errorMsg.style.marginTop = '0.25rem';
          imgWrapper.appendChild(errorMsg);
        } else {
          imgElement.src = src;
          imgElement.alt = img.alt || '';
        }
        
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
          this.alt = '이미지를 불러올 수 없습니다';
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
        
        // blob URL 감지 및 처리
        if (finalSrc.startsWith('blob:')) {
          console.warn('ContentMediaPreview: blob URL이 감지되었습니다 (비디오):', finalSrc);
          
          // 플레이스홀더 메시지 표시
          const errorElement = document.createElement('div');
          errorElement.className = 'broken-video';
          errorElement.style.width = '100%';
          errorElement.style.height = '200px';
          errorElement.style.backgroundColor = '#f1f1f1';
          errorElement.style.display = 'flex';
          errorElement.style.alignItems = 'center';
          errorElement.style.justifyContent = 'center';
          errorElement.style.borderRadius = '0.375rem';
          errorElement.style.color = '#666';
          errorElement.textContent = '임시 비디오 URL입니다. 편집 모드에서 다시 업로드해주세요.';
          
          videoWrapper.appendChild(errorElement);
        } else {
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
      }
    });
    
    // YouTube 임베드 찾기 및 처리
    const youtubeEmbeds = container.querySelectorAll('.youtube-embed');
    youtubeEmbeds.forEach(embed => {
      const youtubeId = embed.getAttribute('data-youtube-id');
      if (youtubeId) {
        const iframe = embed.querySelector('iframe');
        if (iframe instanceof HTMLIFrameElement) {
          // iframe의 상호작용 방지
          iframe.style.pointerEvents = 'none';
        }
      }
    });
    
    // 파일 링크 찾기 및 처리
    const fileLinks = container.querySelectorAll('a.tiptap-file-link');
    fileLinks.forEach(link => {
      // href 속성 가져오기
      const href = link.getAttribute('href') || '';
      
      // 링크의 상호작용 방지 (다운로드 비활성화)
      if (link instanceof HTMLElement) {
        link.style.pointerEvents = 'none';
        link.style.color = 'gray';
        link.style.cursor = 'default';
        
        // blob URL 감지 및 처리
        if (href.startsWith('blob:')) {
          console.warn('ContentMediaPreview: blob URL이 감지되었습니다 (파일 링크):', href);
          link.style.textDecoration = 'line-through';
          
          // 읽기 전용 및 사용 불가 표시 추가
          const errorSpan = document.createElement('span');
          errorSpan.textContent = ' (임시 URL, 사용 불가)';
          errorSpan.style.fontSize = '0.8em';
          errorSpan.style.color = 'red';
          link.parentNode?.insertBefore(errorSpan, link.nextSibling);
        } else {
          // 읽기 전용 표시 추가
          const readOnlySpan = document.createElement('span');
          readOnlySpan.textContent = ' (읽기 전용)';
          readOnlySpan.style.fontSize = '0.8em';
          readOnlySpan.style.color = 'gray';
          link.parentNode?.insertBefore(readOnlySpan, link.nextSibling);
        }
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