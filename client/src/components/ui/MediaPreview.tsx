import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FileIcon, ImageIcon, Link2, Loader2 } from 'lucide-react';

interface MediaPreviewProps {
  content: string;
  className?: string;
  onImageClick?: (src: string) => void;
  onImageMove?: (draggedImageSrc: string, targetImageSrc: string, direction: 'before' | 'after') => void;
  editable?: boolean;
}

/**
 * 다양한 미디어 컨텐츠(이미지, 비디오, URL, 파일)를 인라인으로 렌더링하는 컴포넌트
 */
function MediaPreview({ 
  content, 
  className = '', 
  onImageClick, 
  onImageMove,
  editable = false 
}: MediaPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggedImage, setDraggedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const mediaLoaded = useRef<{[key: string]: boolean}>({});

  // URL 객체 정리용 레퍼런스
  const blobUrls = useRef<string[]>([]);

  // 마운트 시 및 content 변경 시 미디어를 처리합니다
  useEffect(() => {
    if (!containerRef.current) return;
    
    // DOM 요소 초기화
    containerRef.current.innerHTML = '';
    setLoading(true);
    
    if (!content.trim()) {
      setLoading(false);
      return;
    }
    
    // 기존 Blob URL 정리
    blobUrls.current.forEach(url => {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        console.error('Blob URL 정리 오류:', e);
      }
    });
    blobUrls.current = [];
    
    // 콘텐츠에서 blob: URL 추출 (새로운 배열로 저장)
    const blobUrlPattern = /blob:[^"')]+/g;
    const matches = content.match(blobUrlPattern);
    if (matches) {
      blobUrls.current = matches;
    }

    console.log("MediaPreview 컨텐츠 처리 중:", content.slice(0, 150) + "...");
    
    // 콘텐츠 처리
    const processedContent = processContent(content);
    
    // DOM에 콘텐츠 삽입
    containerRef.current.innerHTML = processedContent;
    
    // 이미지 및 비디오 이벤트 설정
    setupMediaEvents(containerRef.current);
    
    // 모든 미디어가 로드되었는지 확인하는 타이머
    const allMediaLoaded = () => {
      const images = containerRef.current?.querySelectorAll('img') || [];
      const videos = containerRef.current?.querySelectorAll('video') || [];
      const iframes = containerRef.current?.querySelectorAll('iframe') || [];
      
      // 아직 미디어 요소가 DOM에 삽입되지 않은 경우
      if (images.length === 0 && videos.length === 0 && iframes.length === 0) {
        setLoading(false);
        return;
      }
      
      const allLoaded = Array.from(images).every(img => img.complete) && 
                      Array.from(videos).every(video => video.readyState >= 2) &&
                      Array.from(iframes).every(iframe => iframe.dataset.loaded === 'true');
      
      if (allLoaded) {
        setLoading(false);
      }
    };
    
    // 초기 확인
    allMediaLoaded();
    
    // 1초 후 다시 확인 (이미지가 아직 로드 중일 수 있음)
    const timer = setTimeout(() => {
      allMediaLoaded();
      // 최대 3초 후에는 무조건 로딩 상태 종료
      setTimeout(() => setLoading(false), 2000); 
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      // 컴포넌트 언마운트시 blob URL 정리
      blobUrls.current.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          console.error('Blob URL 정리 오류:', e);
        }
      });
    };
  }, [content, onImageClick, onImageMove, editable]);

  // 이미지 및 비디오 이벤트 설정
  const setupMediaEvents = useCallback((container: HTMLElement) => {
    // 이미지 이벤트 설정
    const images = container.querySelectorAll('img');
    console.log(`${images.length}개의 이미지에 이벤트 설정`);
    
    // 컨테이너에 드래그 오버 이벤트 추가
    if (editable && onImageMove) {
      container.addEventListener('dragover', (e) => {
        e.preventDefault();
        const draggingEl = container.querySelector('.dragging-media');
        if (!draggingEl) return;
      });

      container.addEventListener('drop', (e) => {
        e.preventDefault();
        if (!draggedImage) return;
        
        // 드롭 위치 계산
        const dropTarget = document.elementFromPoint(e.clientX, e.clientY);
        if (dropTarget && (dropTarget.tagName === 'IMG' || dropTarget.closest('img'))) {
          const targetImg = dropTarget.tagName === 'IMG' ? dropTarget as HTMLImageElement : dropTarget.closest('img') as HTMLImageElement;
          const targetSrc = targetImg.src;
          
          // 이미지 위치 이동 콜백 호출
          const rect = targetImg.getBoundingClientRect();
          const middle = rect.top + rect.height / 2;
          const direction = e.clientY < middle ? 'before' : 'after';
          
          console.log(`이미지 이동: ${draggedImage} -> ${targetSrc} (${direction})`);
          onImageMove(draggedImage, targetSrc, direction);
        }
        
        setDraggedImage(null);
      });
    }
    
    // 이미지 로드 및 에러 처리
    images.forEach(img => {
      // 이미지 스타일 및 드래그 설정
      img.classList.add('editor-img');
      
      // 로드 및 에러 이벤트 핸들러
      img.addEventListener('load', () => {
        console.log('이미지 로드 완료:', img.src);
        img.style.display = 'block';
        mediaLoaded.current[img.src] = true;
      });
      
      img.addEventListener('error', () => {
        console.error('이미지 로드 실패:', img.src);
        img.style.display = 'block';
        // 오류가 발생한 이미지에 플레이스홀더 스타일 적용
        img.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_15ba800aa20%20text%20%7B%20fill%3A%23AAA%3Bfont-weight%3Anormal%3Bfont-family%3A%22Helvetica%20Neue%22%2C%20Helvetica%2C%20Arial%2C%20sans-serif%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_15ba800aa20%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23F5F5F5%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22279.2%22%20y%3D%22218.3%22%3E%EC%9D%B4%EB%AF%B8%EC%A7%80%20%EC%98%A4%EB%A5%98%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
        img.alt = '이미지 오류';
        mediaLoaded.current[img.src] = true;
      });
      
      if (editable) {
        img.draggable = true;
        
        // 클릭 이벤트
        if (onImageClick) {
          img.addEventListener('click', () => {
            console.log("이미지 클릭:", img.src);
            onImageClick(img.src);
          });
        }
        
        // 드래그 이벤트
        img.addEventListener('dragstart', (e) => {
          if (e.target instanceof HTMLImageElement) {
            e.target.classList.add('dragging-media');
            setDraggedImage(e.target.src);
            
            // 드래그 이미지 설정 (조금 투명하게)
            const dragImage = new Image();
            dragImage.src = e.target.src;
            dragImage.style.opacity = '0.7';
            dragImage.style.position = 'absolute';
            dragImage.style.top = '-1000px';
            document.body.appendChild(dragImage);
            e.dataTransfer?.setDragImage(dragImage, 0, 0);
            
            // 이미지 URL을 데이터로 설정
            e.dataTransfer?.setData('text/plain', e.target.src);
            
            // 1ms 후 제거
            setTimeout(() => {
              document.body.removeChild(dragImage);
            }, 1);
          }
        });
        
        img.addEventListener('dragend', (e) => {
          if (e.target instanceof HTMLElement) {
            e.target.classList.remove('dragging-media');
          }
        });
      }
    });
    
    // 비디오 요소 처리
    const videos = container.querySelectorAll('video');
    console.log(`${videos.length}개의 비디오에 이벤트 설정`);
    
    videos.forEach(video => {
      // 메타데이터 로드 이벤트
      video.addEventListener('loadedmetadata', (e) => {
        console.log('비디오 메타데이터 로드 완료:', video.src);
        // 메타데이터 로드 후 비디오가 재생 가능함
        const videoElement = e.currentTarget as HTMLVideoElement;
        
        // 프레임을 로드하기 위해 재생 후 즉시 일시 정지
        videoElement.play().then(() => {
          videoElement.pause();
          // 타임라인 위치를 처음으로 설정
          videoElement.currentTime = 0;
          
          mediaLoaded.current[video.src] = true;
        }).catch(err => {
          console.error('비디오 로드 오류:', err);
          mediaLoaded.current[video.src] = true;
        });
      });
      
      // 오류 이벤트
      video.addEventListener('error', () => {
        console.error('비디오 로드 실패:', video.src);
        // 오류가 발생한 비디오에 플레이스홀더 스타일 적용
        video.poster = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_15ba800aa20%20text%20%7B%20fill%3A%23AAA%3Bfont-weight%3Anormal%3Bfont-family%3A%22Helvetica%20Neue%22%2C%20Helvetica%2C%20Arial%2C%20sans-serif%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_15ba800aa20%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23F5F5F5%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22279.2%22%20y%3D%22218.3%22%3E%EB%B9%84%EB%94%94%EC%98%A4%20%EC%98%A4%EB%A5%98%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
        mediaLoaded.current[video.src] = true;
      });
      
      // preload 속성 설정
      video.preload = 'metadata';
    });
    
    // YouTube iframe 처리
    const iframes = container.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      // 로드 완료 표시
      iframe.addEventListener('load', () => {
        iframe.dataset.loaded = 'true';
        mediaLoaded.current[iframe.src] = true;
      });
    });
    
  }, [onImageClick, onImageMove, editable, draggedImage]);

  // 컨텐츠 처리
  const processContent = (text: string): string => {
    // YouTube 임베드 처리
    const youtubePattern = /<div class="youtube-embed".*?data-youtube-id="(.*?)".*?<\/div>|<div class="youtube-embed">\s*<iframe\s+width="(.*?)"\s+height="(.*?)"\s+src="https:\/\/www\.youtube\.com\/embed\/(.*?)"\s+frameborder="(.*?)"\s+allow="(.*?)"\s+allowfullscreen[^>]*>\s*<\/iframe>\s*<\/div>/gi;
    
    let processedContent = text.replace(
      youtubePattern,
      (match, dataId, width, height, videoId, frameborder, allow) => {
        // 두 패턴 중 하나로 매칭되는데, dataId가 있으면 그것을 사용하고, 없으면 videoId 사용
        const finalVideoId = dataId || videoId;
        
        if (!finalVideoId) {
          console.error("YouTube 비디오 ID를 찾을 수 없음");
          return match;
        }
        
        return `<div class="youtube-embed">
          <div class="aspect-video">
            <iframe 
              width="100%" 
              height="100%"
              src="https://www.youtube.com/embed/${finalVideoId}" 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen
              class="absolute inset-0 w-full h-full"
            ></iframe>
          </div>
        </div>`;
      }
    );
    
    // 비디오 태그 처리 - <div><video...></video></div>
    const videoWrapperPattern = /<div>\s*<video\s+controls\s+width="(.*?)">\s*<source\s+src="(.*?)"\s+type="(.*?)">\s*<\/video>\s*<\/div>/gi;
    processedContent = processedContent.replace(
      videoWrapperPattern,
      (match, width, src, type) => {
        return `<div class="video-container">
          <video controls width="${width}" class="editor-video" preload="metadata">
            <source src="${src}" type="${type}">
          </video>
        </div>`;
      }
    );
    
    // 비디오 태그 처리 - 단독 <video> 태그
    const videoPattern = /<video\s+controls\s+width="(.*?)">\s*<source\s+src="(.*?)"\s+type="(.*?)"><\/video>/gi;
    processedContent = processedContent.replace(
      videoPattern,
      (match, width, src, type) => {
        return `<div class="video-container">
          <video controls width="${width}" class="editor-video" preload="metadata">
            <source src="${src}" type="${type}">
          </video>
        </div>`;
      }
    );
    
    // 이미지 태그 처리 - alt 속성 확인하여 표시
    const imgPattern = /<img\s+src="([^"]+)"\s+alt="([^"]*)"\s+class="([^"]*)"\s*[^>]*>/gi;
    processedContent = processedContent.replace(
      imgPattern,
      (match, src, alt, cls) => {
        return `<img src="${src}" alt="${alt || '이미지'}" class="${cls}" 
                style="width: 100%; height: auto;" loading="eager"
                onload="console.log('image loaded')">`;
      }
    );
    
    // 파일 다운로드 링크 처리
    const fileDownloadPattern = /<p><a\s+href="([^"]+)"\s+download="([^"]+)"\s+class="tiptap-file-link">([^<]+)<\/a><\/p>/gi;
    processedContent = processedContent.replace(
      fileDownloadPattern,
      (match, href, filename, text) => {
        return `<div class="file-link">
          <a href="${href}" download="${filename}" class="flex items-center p-2 border rounded-md hover:bg-muted/20 transition-colors">
            <span class="file-icon">📎</span>
            <span>${text}</span>
          </a>
        </div>`;
      }
    );
    
    return processedContent;
  };

  return (
    <div className={`media-preview-container ${className} relative`}>
      {loading && (
        <div className="absolute inset-0 bg-background/30 flex items-center justify-center z-10">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      )}
      <div 
        ref={containerRef} 
        className={`media-preview editor-preview`}
        data-testid="media-preview"
        data-content-length={content?.length || 0}
        style={{ width: '100%', height: '100%', padding: '0.75rem' }}
      ></div>
    </div>
  );
};

export default MediaPreview;