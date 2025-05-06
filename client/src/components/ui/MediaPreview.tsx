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
    // file / youtube 등 다른 타입 처리
    default: 
      return null;
  }
};

export default MediaPreview;