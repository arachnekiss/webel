import { useEffect } from "react";

// 멀티미디어 미리보기 컴포넌트 - 텍스트 에디터 내에 직접 렌더링
interface MediaPreviewProps {
  content: string;
  compact?: boolean; // 요약 모드 (미디어 썸네일만 표시)
}

const MediaPreview = ({ content, compact = false }: MediaPreviewProps) => {
  if (!content.trim()) return null;
  
  // 정규식 패턴
  const markdownImageRegex = /!\[(.*?)\]\((.*?)\)/g;
  const uuidImageRegex = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gi; // UUID 패턴 감지
  const youtubeRegex = /https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
  const videoRegex = /<video[\s\S]*?<source src="(.*?)"[\s\S]*?<\/video>/g;
  const fileRegex = /\[파일 다운로드: (.*?)\]\((.*?)\)/g;
  
  // 이미지 드래그 기능 추가 (요약 모드가 아닐 때만)
  useEffect(() => {
    if (compact) return; // 요약 모드에서는 드래그 비활성화
    
    const enableDragAndDrop = () => {
      const container = document.querySelector('.media-preview');
      if (!container) return;
      
      // 모든 이미지에 드래그 속성 추가
      const images = container.querySelectorAll('img');
      images.forEach(img => {
        img.setAttribute('draggable', 'true');
        img.classList.add('editor-img');
        
        // 드래그 시작 이벤트
        img.addEventListener('dragstart', (e) => {
          if (!e.dataTransfer) return;
          img.classList.add('dragging-media');
          e.dataTransfer.setData('text/plain', 'dragging-image');
        });
        
        // 드래그 종료 이벤트
        img.addEventListener('dragend', () => {
          img.classList.remove('dragging-media');
        });
      });
    };
    
    // 컴포넌트 마운트 후 이미지 드래그 기능 추가
    setTimeout(enableDragAndDrop, 100);
    
    // 컴포넌트 언마운트 시 정리
    return () => {
      const container = document.querySelector('.media-preview');
      if (!container) return;
      
      const images = container.querySelectorAll('img');
      images.forEach(img => {
        img.removeAttribute('draggable');
      });
    };
  }, [content, compact]);
  
  // 마크다운 이미지와 UUID 포맷 URL을 HTML 이미지로 변환
  const renderImages = (text: string) => {
    // UUID 패턴을 이미지 URL로 변환
    let processedText = text.replace(uuidImageRegex, (match) => {
      const completeUrl = `/api/resources/media/${match}`;
      return `![이미지](${completeUrl})`;
    });
    
    // 마크다운 이미지 형식 변환
    return processedText.replace(markdownImageRegex, (match, alt, url) => {
      if (compact) {
        // 요약 모드: 더 작은 썸네일 스타일
        return `<img src="${url}" alt="${alt || '이미지'}" class="editor-img inline-block h-8 w-8 object-cover rounded-md shadow-sm border border-border mx-1" />`;
      } else {
        // 일반 모드: 전체 크기 이미지
        return `<img src="${url}" alt="${alt || '이미지'}" class="editor-img max-w-full rounded-md shadow-sm border border-border my-2" />`;
      }
    });
  };
  
  // YouTube 임베드 변환
  const renderYouTube = (text: string) => {
    return text.replace(youtubeRegex, (match, videoId) => {
      if (compact) {
        // 요약 모드: YouTube 아이콘으로 표시
        return `<span class="inline-flex items-center bg-red-50 text-red-600 rounded-md px-2 py-1 text-xs font-medium mr-1 my-1">
          <svg class="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" fill="currentColor" />
            <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#fff" />
          </svg>
          YouTube
        </span>`;
      } else {
        // 일반 모드: 전체 유튜브 임베드
        return `
          <div class="youtube-embed my-3">
            <div class="aspect-video rounded-lg overflow-hidden shadow-md">
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/${videoId}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
              ></iframe>
            </div>
          </div>
        `;
      }
    });
  };
  
  // 비디오 태그 처리
  const renderVideos = (text: string) => {
    if (compact) {
      // 요약 모드: 비디오를 아이콘으로 대체
      return text.replace(videoRegex, () => {
        return `<span class="inline-flex items-center bg-blue-50 text-blue-600 rounded-md px-2 py-1 text-xs font-medium mr-1 my-1">
          <svg class="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="6" width="15" height="12" rx="2" stroke="currentColor" stroke-width="2" />
            <path d="M22 12L17 8V16L22 12Z" fill="currentColor" />
          </svg>
          비디오
        </span>`;
      });
    }
    return text; // 일반 모드: 원본 비디오 유지
  };
  
  // 파일 다운로드 링크 스타일링
  const renderFileLinks = (text: string) => {
    return text.replace(fileRegex, (match, fileName, url) => {
      if (compact) {
        // 요약 모드: 파일을 아이콘으로 표시
        return `<span class="inline-flex items-center bg-green-50 text-green-600 rounded-md px-2 py-1 text-xs font-medium mr-1 my-1">
          <svg class="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" />
            <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" />
            <path d="M16 13H8" stroke="currentColor" stroke-width="2" />
            <path d="M16 17H8" stroke="currentColor" stroke-width="2" />
            <path d="M10 9H9H8" stroke="currentColor" stroke-width="2" />
          </svg>
          파일
        </span>`;
      } else {
        // 일반 모드: 전체 다운로드 링크
        return `
          <a href="${url}" download="${fileName}" class="inline-flex items-center px-3 py-2 border border-input rounded-md bg-background hover:bg-accent transition-colors text-sm my-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            ${fileName}
          </a>
        `;
      }
    });
  };
  
  // URL 링크 카드로 변환
  const renderUrlCards = (text: string) => {
    // 이미지와 YouTube URL 제외한 URL 패턴
    const urlRegex = /https?:\/\/(?!.*\.(jpg|jpeg|png|gif|webp)(?:\?\S+)?$)(?!(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/))[^\s]+/gi;
    
    return text.replace(urlRegex, (url) => {
      try {
        const domain = new URL(url).hostname.replace('www.', '');
        
        if (compact) {
          // 요약 모드: 간단한 링크 아이콘
          return `<span class="inline-flex items-center bg-purple-50 text-purple-600 rounded-md px-2 py-1 text-xs font-medium mr-1 my-1">
            <svg class="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 13C11.3132 14.3765 13.0267 15.1447 14.8285 15.1447C16.6303 15.1447 18.3438 14.3765 19.657 13C20.8846 11.6318 21.5918 9.83703 21.6518 7.95329C21.7118 6.06954 21.1198 4.22925 19.9861 2.77611C18.8524 1.32296 17.2437 0.388758 15.4647 0.16375C13.6858 -0.0612583 11.8846 0.437872 10.4308 1.55554C8.97695 2.67321 8.00335 4.33101 7.72636 6.15632C7.44938 7.98162 7.88986 9.84344 8.9445 11.3555" stroke="currentColor" stroke-width="2" />
              <path d="M14 11C12.6868 9.62349 10.9733 8.85526 9.17154 8.85526C7.36978 8.85526 5.65625 9.62349 4.343 11C3.11539 12.3682 2.40815 14.163 2.34817 16.0467C2.2882 17.9305 2.88019 19.7707 4.01389 21.2239C5.14759 22.677 6.75631 23.6112 8.53527 23.8362C10.3142 24.0613 12.1154 23.5621 13.5692 22.4445C15.0231 21.3268 15.9967 19.669 16.2736 17.8437C16.5506 16.0184 16.1101 14.1566 15.0555 12.6445" stroke="currentColor" stroke-width="2" />
            </svg>
            ${domain}
          </span>`;
        } else {
          // 일반 모드: 전체 URL 카드
          return `
            <div class="url-card my-3">
              <div class="url-preview p-3 border rounded-lg shadow-sm bg-gray-50">
                <div class="flex items-center">
                  <div class="url-icon mr-3 text-xl">🔗</div>
                  <div class="url-content overflow-hidden">
                    <div class="url-title font-medium text-gray-900 truncate">${domain}</div>
                    <div class="url-link text-sm text-blue-600 truncate">
                      <a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;
        }
      } catch (e) {
        return url;
      }
    });
  };
  
  // 모든 변환 적용
  let processedContent = content;
  processedContent = renderImages(processedContent);
  processedContent = renderYouTube(processedContent);
  processedContent = renderVideos(processedContent);
  processedContent = renderFileLinks(processedContent);
  processedContent = renderUrlCards(processedContent);
  
  // 컨테이너 클래스 설정 (요약 모드에 따라 다름)
  const containerClass = compact 
    ? "media-preview media-preview-compact flex flex-wrap items-center gap-1 p-2 bg-gray-50 rounded-md border"
    : "media-preview";
  
  return (
    <div 
      className={containerClass}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
};

export default MediaPreview;