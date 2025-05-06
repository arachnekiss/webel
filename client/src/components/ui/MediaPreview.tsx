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

  // Blob URL에서 파일명 추출
  const getFileNameFromBlobUrl = (url: string, downloadAttr?: string): string => {
    if (downloadAttr) return downloadAttr;
    
    // URL에서 마지막 부분만 추출
    const urlParts = url.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    
    // 쿼리 파라미터 제거
    return lastPart.split('?')[0] || '파일';
  };

  // 파일 다운로드 함수
  const downloadFile = (url: string, filename: string = 'download') => {
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('파일 다운로드 중 오류:', error);
    }
  };

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
    
    // 콘텐츠에서 blob: URL 추출
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
      // 컴포넌트 언마운트시에만 blob URL 정리
      blobUrls.current.forEach(url => {
        try {
          URL.revokeObjectURL(url);
          console.log('Blob URL 정리됨 (언마운트):', url);
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
      // 이미지 스타일 설정 - 편집 모드에서만 editor-img 클래스 추가
      if (editable) {
        img.classList.add('editor-img');
      } else {
        img.classList.add('reader-img');
      }
      
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
      
      // 편집 모드일 때만 드래그 및 클릭 이벤트 추가
      if (editable) {
        console.log("드래그 가능한 이미지로 설정:", img.src);
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
      } else {
        // 읽기 모드에서는 드래그 비활성화
        img.draggable = false;
        
        // 클릭 이벤트도 추가하지 않음 
        // (원래 있던 이벤트 리스너 제거 필요시 아래 코드 사용)
        // img.removeEventListener('click', ...);
      }
    });
    
    // 비디오 요소 처리
    const videos = container.querySelectorAll('video');
    console.log(`${videos.length}개의 비디오에 이벤트 설정`);
    
    videos.forEach(video => {
      // 메타데이터 로드 이벤트
      video.addEventListener('loadedmetadata', (e) => {
        console.log('비디오 메타데이터 로드 완료:', video.src);
        const videoElement = e.currentTarget as HTMLVideoElement;
        
        // 메타데이터가 로드된 후 비디오 로드 호출하여 첫 프레임 표시 보장
        videoElement.load();
        videoElement.pause();
        mediaLoaded.current[video.src] = true;
      });
      
      // 오류 이벤트
      video.addEventListener('error', () => {
        console.error('비디오 로드 실패:', video.src);
        // 오류가 발생한 비디오에 플레이스홀더 스타일 적용
        video.poster = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_15ba800aa20%20text%20%7B%20fill%3A%23AAA%3Bfont-weight%3Anormal%3Bfont-family%3A%22Helvetica%20Neue%22%2C%20Helvetica%2C%20Arial%2C%20sans-serif%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_15ba800aa20%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23F5F5F5%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22279.2%22%20y%3D%22218.3%22%3E%EB%B9%84%EB%94%94%EC%98%A4%20%EC%98%A4%EB%A5%98%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
        mediaLoaded.current[video.src] = true;
      });
    });
    
    // 첨부 파일 버튼 처리
    const attachmentBtns = container.querySelectorAll('.attachment-btn');
    attachmentBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const link = btn.getAttribute('data-href');
        const filename = btn.getAttribute('data-filename');
        if (link) {
          downloadFile(link, filename || undefined);
        }
      });
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
    // Blob URL 패턴 처리 - blob: URL을 이미지 데이터 URL로 대체
    // 인라인 base64 플레이스홀더 이미지 사용
    const blobImagePlaceholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgODAwIDQwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+PGRlZnM+PHN0eWxlIHR5cGU9InRleHQvY3NzIj4jaG9sZGVyXzE1YmE4MDBhYTIwIHRleHQgeyBmaWxsOiNBQUE7Zm9udC13ZWlnaHQ6bm9ybWFsO2ZvbnQtZmFtaWx5OiJIZWx2ZXRpY2EgTmV1ZSIsIEhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWY7Zm9udC1zaXplOjQwcHQgfSA8L3N0eWxlPjwvZGVmcz48ZyBpZD0iaG9sZGVyXzE1YmE4MDBhYTIwIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI0Y1RjVGNSI+PC9yZWN0PjxnPjx0ZXh0IHg9IjI3OS4yIiB5PSIyMTguMyI+7IOB66Gc7KeAIOyYpOyLoTwvdGV4dD48L2c+PC9nPjwvc3ZnPg==';
    const blobVideoPlaceholder = 'data:video/mp4;base64,AAAAHGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAA9NtZGF0AAACmQYF//+X3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE0MiByMjQ3OSBkZDc5YTYxIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNCAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTIgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MToweDEgbWU9dW1oIHN1Ym1lPTcgcHN5PTEgcHN5X3JkPTEuMDA6MC4wMCBtaXhlZF9yZWY9MSBtZV9yYW5nZT0xNiBjaHJvbWFfbWU9MSB0cmVsbGlzPTEgOHg4ZGN0PTAgY3FtPTAgZGVhZHpvbmU9MjEsMTEgZmFzdF9wc2tpcD0xIGNocm9tYV9xcF9vZmZzZXQ9LTIgdGhyZWFkcz0zIGxvb2thaGVhZF90aHJlYWRzPTEgc2xpY2VkX3RocmVhZHM9MCBucj0wIGRlY2ltYXRlPTEgaW50ZXJsYWNlZD0wIGJsdXJheV9jb21wYXQ9MCBjb25zdHJhaW5lZF9pbnRyYT0wIGJmcmFtZXM9MCB3ZWlnaHRwPTAga2V5aW50PTI1MCBrZXlpbnRfbWluPTEgc2NlbmVjdXQ9NDAgaW50cmFfcmVmcmVzaD0wIHJjPWNyZiBtYnRyZWU9MSBjcmY9MjMuMCBxY29tcD0wLjYwIHFwbWluPTAgcXBtYXg9NjkgcXBzdGVwPTQgdm05PTEgdnJlZj0yIGNtcD00NiBpbnRpYl85NyB2dXZfY21wPTE4IGNoaXBfc2l6ZT0wIHA4eDg9MCBwNHg0PTAgYmx1cj0wIG1heHJhdGU9MjUgYndoaW50PTAgYnJkb3E9NyBjcXBvZmZzZXQ9MCBxcHJpbz0wIHByZXA9MyBkZWFkend1PXNvdXJjZSB3cHJlZD0wIGhyYW5nZT0wIG1heHN0ZXA9MQ==';
    
    // Blob URL 이미지 패턴 처리 (다양한 패턴 대응)
    // 첫 번째 패턴: blob:url이 src 속성에 있는 경우
    const blobImgPattern1 = /<img\s+src="blob:([^"]+)"[^>]*(?:alt="([^"]*)")?[^>]*>/gi;
    // 두 번째 패턴: class="tiptap-image" 등의 클래스 속성이 포함된 경우
    const blobImgPattern2 = /<img[^>]*src="blob:([^"]+)"[^>]*(?:class="[^"]*")[^>]*>/gi;
    // 세 번째 패턴: 모든 종류의 img 태그 (가장 포괄적)
    const blobImgPattern3 = /<img[^>]*blob:[^">]+[^>]*>/gi;

    // 먼저 모든 blob: URL 이미지 추출
    const allBlobImages = Array.from(text.matchAll(/blob:[^"')]+/g)).map(m => m[0]);
    console.log('감지된 blob URL:', allBlobImages);
    
    // 플레이스홀더 이미지로 모든 blob: URL을 대체
    let processedContent = text;
    
    // 첫 번째 패턴 처리
    processedContent = processedContent.replace(
      blobImgPattern1,
      (match, blobUrl, alt = '이미지') => {
        console.log('패턴1 매칭:', match);
        return `<img 
          src="${blobImagePlaceholder}" 
          alt="${alt || '이미지'}"
          class="blob-image-placeholder"
          style="width: 100%; height: auto; max-height: 400px; object-fit: contain; background-color: #f5f5f5; border-radius: 4px;"
        >`;
      }
    );
    
    // 두 번째 패턴 처리
    processedContent = processedContent.replace(
      blobImgPattern2,
      (match) => {
        console.log('패턴2 매칭:', match);
        const alt = match.match(/alt="([^"]*)"/)?.[1] || '이미지';
        return `<img 
          src="${blobImagePlaceholder}" 
          alt="${alt}"
          class="blob-image-placeholder"
          style="width: 100%; height: auto; max-height: 400px; object-fit: contain; background-color: #f5f5f5; border-radius: 4px;"
        >`;
      }
    );
    
    // 세 번째 패턴 처리 (보험용)
    processedContent = processedContent.replace(
      blobImgPattern3,
      (match) => {
        console.log('패턴3 매칭:', match);
        const alt = match.match(/alt="([^"]*)"/)?.[1] || '이미지';
        return `<img 
          src="${blobImagePlaceholder}" 
          alt="${alt}"
          class="blob-image-placeholder"
          style="width: 100%; height: auto; max-height: 400px; object-fit: contain; background-color: #f5f5f5; border-radius: 4px;"
        >`;
      }
    );
    
    // Blob URL 비디오 패턴 처리
    const blobVideoPattern = /<video(?:.*?)>\s*<source\s+src="blob:([^"]+)"(?:.*?)>\s*<\/video>/gi;
    processedContent = processedContent.replace(
      blobVideoPattern,
      (match, blobUrl) => {
        // Blob URL을 플레이스홀더로 대체
        return `<div class="video-container" style="background-color: #f5f5f5; border-radius: 4px; padding: 16px; text-align: center;">
          <div style="max-width: 400px; margin: 0 auto;">
            <video 
              controls 
              width="100%" 
              poster="${blobImagePlaceholder}"
              style="width: 100%; max-height: 300px;" 
              preload="metadata"
              class="editor-video"
            >
              <source src="${blobVideoPlaceholder}" type="video/mp4">
            </video>
            <div style="margin-top: 8px; color: #666;">
              <span>저장된 비디오 (직접 다운로드 필요)</span>
            </div>
          </div>
        </div>`;
      }
    );
    
    // Blob URL 파일 다운로드 링크 처리
    const blobDownloadPattern = /<a\s+href="blob:([^"]+)"\s+download="([^"]+)"(?:.*?)>([^<]+)<\/a>/gi;
    processedContent = processedContent.replace(
      blobDownloadPattern,
      (match, blobUrl, filename, text) => {
        return `<div class="attachment-preview">
          <div class="flex items-center p-3 border rounded-md bg-gray-50">
            <span class="mr-2">📎</span>
            <span>${text || filename}</span>
            <span class="text-xs text-gray-500 ml-2">(저장된 파일)</span>
          </div>
        </div>`;
      }
    );
    
    // YouTube 임베드 처리
    const youtubePattern = /<div class="youtube-embed".*?data-youtube-id="(.*?)".*?<\/div>|<div class="youtube-embed">\s*<iframe\s+width="(.*?)"\s+height="(.*?)"\s+src="https:\/\/www\.youtube\.com\/embed\/(.*?)"\s+frameborder="(.*?)"\s+allow="(.*?)"\s+allowfullscreen[^>]*>\s*<\/iframe>\s*<\/div>/gi;
    
    processedContent = processedContent.replace(
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
    
    // 비디오 태그 처리 - preload="metadata" 속성 추가하고, source 사용하지 않고 직접 src 지정
    // 형식 1: <div><video controls width="100%"><source src="..." type="..."></video></div>
    const videoWrapperPattern = /<div>\s*<video(?:\s+controls|\s+width="([^"]*)"|\s+preload="([^"]*)")*>\s*<source\s+src="([^"]*)"\s+type="([^"]*)">\s*<\/video>\s*<\/div>/gi;
    processedContent = processedContent.replace(
      videoWrapperPattern,
      (match, width, preload, src, type) => {
        // blob: URL이 아닌 경우만 처리
        if (src && !src.startsWith('blob:')) {
          return `<div class="video-container">
            <video 
              src="${src}"
              controls 
              width="${width || '100%'}" 
              style="width: 100%; max-height: 400px" 
              preload="metadata"
              class="editor-video"
            ></video>
          </div>`;
        }
        return match;
      }
    );
    
    // 형식 2: <video controls width="100%"><source src="..." type="..."></video>
    const videoPattern = /<video(?:\s+controls|\s+width="([^"]*)"|\s+preload="([^"]*)")*>\s*<source\s+src="([^"]*)"\s+type="([^"]*)">\s*<\/video>/gi;
    processedContent = processedContent.replace(
      videoPattern,
      (match, width, preload, src, type) => {
        // blob: URL이 아닌 경우만 처리
        if (src && !src.startsWith('blob:')) {
          return `<div class="video-container">
            <video 
              src="${src}"
              controls 
              width="${width || '100%'}" 
              style="width: 100%; max-height: 400px" 
              preload="metadata"
              class="editor-video"
            ></video>
          </div>`;
        }
        return match;
      }
    );
    
    // 이미지 태그 처리 - 직접 src 속성으로 처리
    const imgPattern = /<img(?:\s+src="([^"]+)"|\s+alt="([^"]*)"|\s+class="([^"]*)")*[^>]*>/gi;
    processedContent = processedContent.replace(
      imgPattern,
      (match, src, alt, cls) => {
        if (!src) {
          const srcMatch = match.match(/src="([^"]+)"/);
          src = srcMatch ? srcMatch[1] : '';
        }
        
        if (!src) return match; // src가 없으면 원본 반환
        
        // blob: URL이 아닌 경우만 처리
        if (!src.startsWith('blob:')) {
          return `<img 
            src="${src}" 
            alt="${alt || '이미지'}"
            style="width: 100%; height: auto;" 
            onError="this.onerror=null; this.src='data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_15ba800aa20%20text%20%7B%20fill%3A%23AAA%3Bfont-weight%3Anormal%3Bfont-family%3A%22Helvetica%20Neue%22%2C%20Helvetica%2C%20Arial%2C%20sans-serif%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_15ba800aa20%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23F5F5F5%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22279.2%22%20y%3D%22218.3%22%3E%EC%9D%B4%EB%AF%B8%EC%A7%80%20%EC%98%A4%EB%A5%98%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';"
            onLoad="console.log('img loaded:', this.src);"
          >`;
        }
        return match;
      }
    );
    
    // 파일 다운로드 링크 처리 - 버튼 스타일로 변경
    const fileDownloadPattern = /<p><a\s+href="([^"]+)"\s+download="([^"]+)"\s+class="tiptap-file-link">([^<]+)<\/a><\/p>/gi;
    processedContent = processedContent.replace(
      fileDownloadPattern,
      (match, href, filename, text) => {
        // blob: URL이 아닌 경우만 처리
        if (!href.startsWith('blob:')) {
          const fileSize = ''; // 파일 크기 정보는 이 시점에서 구할 수 없음
          
          return `<div class="attachment-preview">
            <button 
              class="attachment-btn flex items-center p-3 border rounded-md hover:bg-gray-100 transition-colors"
              data-href="${href}" 
              data-filename="${filename}"
            >
              <span class="mr-2">📎</span>
              <span>${text || filename}</span>
              ${fileSize ? `<span class="text-xs text-gray-500 ml-2">(${fileSize})</span>` : ''}
            </button>
          </div>`;
        }
        return match;
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
        className={`media-preview ${editable ? 'editor-preview' : 'reader-preview'}`}
        data-testid="media-preview"
        data-content-length={content?.length || 0}
        style={{ width: '100%', height: '100%', padding: '0.75rem' }}
      ></div>
    </div>
  );
};

export default MediaPreview;