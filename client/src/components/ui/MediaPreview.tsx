import React from 'react';

type Props = { 
  src: string; 
  alt?: string; 
  type: 'image' | 'video' | 'file' | 'youtube' 
};

export const MediaPreview = ({ src, alt, type }: Props) => {
  if (!src) return <div className="bg-gray-100 flex items-center justify-center h-40 w-full">이미지 없음</div>;
  
  const onError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = '/static/placeholder.png';
  };
  
  switch (type) {
    case 'image': 
      return (
        <img 
          src={src} 
          alt={alt ?? ''} 
          onError={onError}
          className="reader-img"
          style={{
            width: '100%',
            height: 'auto',
            cursor: 'default',
            pointerEvents: 'none'
          }} 
          draggable={false}
        />
      );
    case 'video': 
      return (
        <video 
          src={src} 
          controls 
          preload="metadata"
          className="reader-video"
          style={{
            width: '100%',
            pointerEvents: 'none'
          }} 
          draggable={false}
        />
      );
    case 'youtube':
      // YouTube ID 추출 
      let videoId = '';
      try {
        if (src.includes('youtube.com/watch?v=')) {
          const url = new URL(src);
          videoId = url.searchParams.get('v') || '';
        } else if (src.includes('youtu.be/')) {
          const parts = src.split('/');
          videoId = parts[parts.length - 1].split('?')[0];
        }
      } catch (e) {
        console.error('YouTube URL 파싱 오류:', e);
      }
      
      return videoId ? (
        <div className="youtube-embed-readonly">
          <iframe 
            width="100%" 
            height="315" 
            src={`https://www.youtube.com/embed/${videoId}`} 
            title="YouTube video player"
            frameBorder="0" 
            allowFullScreen
            style={{
              pointerEvents: 'none'
            }}
          ></iframe>
        </div>
      ) : <div className="bg-gray-100 flex items-center justify-center h-40 w-full">YouTube 동영상 로드 실패</div>;
      
    case 'file':
      const fileName = src.split('/').pop() || '파일';
      return (
        <div className="file-preview">
          <a 
            href={src} 
            className="file-link" 
            target="_blank" 
            rel="noreferrer" 
            style={{ 
              pointerEvents: 'none', 
              textDecoration: 'underline',
              color: 'gray'
            }}
          >
            {fileName}
          </a>
          <span className="ml-2">(읽기 전용 모드)</span>
        </div>
      );
      
    default: 
      return <div className="bg-gray-100 flex items-center justify-center h-40 w-full">미지원 미디어 타입</div>;
  }
};

export default MediaPreview;