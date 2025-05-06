import React, { useEffect, useState } from 'react';
import { SimpleMediaPreview } from './SimpleMediaPreview';
import { placeholderImageBase64 } from './ImagePlaceholder';

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
      
      // Skip blob URLs since they won't work in detail view
      if (src && !src.startsWith('blob:')) {
        extractedItems.push({
          src,
          alt: img.getAttribute('alt') || undefined,
          type: 'image'
        });
      } else if (src && src.startsWith('blob:')) {
        // For blob URLs, we'll replace with the placeholder
        extractedItems.push({
          src: placeholderImageBase64,
          alt: img.getAttribute('alt') || '이미지',
          type: 'image'
        });
        console.log('Replaced blob URL with placeholder', src);
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

  // Process the content to prevent it from being editable
  const processContentForDisplay = (htmlContent: string): string => {
    // Remove blob URLs from images (they'll be shown separately above)
    const processedContent = htmlContent
      // Replace all blob: URLs in img tags with placeholder
      .replace(/<img[^>]*src="blob:[^"]*"[^>]*>/g, '')
      // Remove any contenteditable attributes
      .replace(/contenteditable="[^"]*"/g, '')
      // Remove tiptap-specific classes that might enable editing
      .replace(/class="[^"]*tiptap-image[^"]*"/g, 'class="read-only-image"')
      .replace(/class="[^"]*tiptap-content[^"]*"/g, 'class="read-only-content"');
    
    return processedContent;
  };

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
      {/* Display non-blob media items at the top */}
      {mediaItems.length > 0 && (
        <div className="mb-6">
          {mediaItems.map((item, index) => (
            <div key={index} className="mb-4">
              <SimpleMediaPreview {...item} />
            </div>
          ))}
        </div>
      )}
      
      {/* Display the content in a read-only way */}
      <div 
        dangerouslySetInnerHTML={{ __html: processContentForDisplay(content) }}
        contentEditable={false}
        suppressContentEditableWarning={true}
        style={{
          userSelect: 'text',
          cursor: 'default',
          pointerEvents: readOnly ? 'none' : 'auto'
        }}
        className="read-only-content"
      />
    </div>
  );
}

export default ContentMediaPreview;