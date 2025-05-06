import React, { useEffect } from 'react';
import { placeholderImageBase64 } from './ImagePlaceholder';

type MediaPreviewProps = { 
  src: string; 
  alt?: string; 
  type: 'image' | 'video' | 'file' | 'youtube'
};

export function SimpleMediaPreview({ src, alt, type }: MediaPreviewProps) {
  // 1) blob URL cleanup
  useEffect(() => {
    // Only cleanup if it's a blob URL
    if (src && src.startsWith('blob:')) {
      return () => { 
        try {
          URL.revokeObjectURL(src); 
        } catch (e) {
          console.error('Failed to revoke blob URL:', e);
        }
      };
    }
    return undefined;
  }, [src]);

  // 2) src가 없거나 invalid → placeholder
  if (!src) {
    return <div className="preview-placeholder">이미지 미리보기</div>;
  }

  // 3) 실제 렌더
  switch(type) {
    case 'image':
      return (
        <img
          src={src}
          alt={alt || ''}
          draggable={false}
          style={{ width: '100%', height: 'auto', cursor: 'default' }}
          onError={e => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = placeholderImageBase64;
          }}
        />
      );
    case 'video':
      return (
        <video
          src={src}
          controls
          preload="metadata"
          draggable={false}
          style={{ width: '100%', cursor: 'default' }}
          onLoadedMetadata={e => {
            const v = e.currentTarget;
            v.load(); v.pause();
          }}
          onError={e => console.error('video load error', src)}
        />
      );
    case 'file':
      return (
        <div className="file-preview">
          <a href={src} download target="_blank" rel="noopener noreferrer">
            {alt || 'Download file'}
          </a>
        </div>
      );
    case 'youtube':
      // Extract YouTube video ID from URL
      const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
      };
      
      const videoId = getYoutubeId(src);
      
      return videoId ? (
        <iframe
          width="100%"
          height="315"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ border: 'none' }}
        />
      ) : (
        <div>Invalid YouTube URL</div>
      );
    default:
      return null;
  }
}

export default SimpleMediaPreview;