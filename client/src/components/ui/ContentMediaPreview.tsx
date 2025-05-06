import React, { useEffect, useState } from 'react';
import { SimpleMediaPreview } from './SimpleMediaPreview';

interface ContentMediaPreviewProps {
  content: string;
  className?: string;
  readOnly?: boolean;
}

/**
 * This component extracts media elements from HTML content and renders them
 * as plain, non-editable media without the editor functionality
 */
export function ContentMediaPreview({ content, className = "", readOnly = true }: ContentMediaPreviewProps) {
  const [mediaItems, setMediaItems] = useState<Array<{ src: string; alt?: string; type: 'image' | 'video' | 'file' | 'youtube' }>>([]);

  useEffect(() => {
    if (!content) {
      setMediaItems([]);
      return;
    }

    // Create a parser to extract media elements from the HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    
    // Extract all media elements
    const extractedItems: Array<{ src: string; alt?: string; type: 'image' | 'video' | 'file' | 'youtube' }> = [];
    
    // Extract images
    const images = doc.querySelectorAll('img');
    images.forEach(img => {
      const src = img.getAttribute('src');
      if (src) {
        extractedItems.push({
          src,
          alt: img.getAttribute('alt') || undefined,
          type: 'image'
        });
      }
    });
    
    // Extract videos
    const videos = doc.querySelectorAll('video');
    videos.forEach(video => {
      const src = video.getAttribute('src') || video.querySelector('source')?.getAttribute('src');
      if (src) {
        extractedItems.push({
          src,
          alt: video.getAttribute('title') || undefined,
          type: 'video'
        });
      }
    });
    
    // Extract file links
    const fileLinks = doc.querySelectorAll('a.tiptap-file-link');
    fileLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        extractedItems.push({
          src: href,
          alt: link.textContent || undefined,
          type: 'file'
        });
      }
    });
    
    // Extract YouTube iframes
    const iframes = doc.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      const src = iframe.getAttribute('src');
      if (src && (src.includes('youtube.com') || src.includes('youtu.be'))) {
        extractedItems.push({
          src,
          alt: iframe.getAttribute('title') || undefined,
          type: 'youtube'
        });
      }
    });
    
    setMediaItems(extractedItems);
  }, [content]);

  if (!content || mediaItems.length === 0) {
    return null;
  }

  return (
    <div 
      className={className}
      contentEditable={false}
      suppressContentEditableWarning={true}
      style={{
        userSelect: 'text',
        cursor: 'default',
        pointerEvents: 'auto'
      }}
    >
      {mediaItems.map((item, index) => (
        <div key={index} className="mb-4">
          <SimpleMediaPreview {...item} />
        </div>
      ))}
      
      {/* Also add the original content but make it non-editable */}
      <div 
        dangerouslySetInnerHTML={{ __html: content }}
        contentEditable={false}
        suppressContentEditableWarning={true}
        style={{
          userSelect: 'text',
          cursor: 'default',
          pointerEvents: readOnly ? 'none' : 'auto'
        }}
      />
    </div>
  );
}

export default ContentMediaPreview;