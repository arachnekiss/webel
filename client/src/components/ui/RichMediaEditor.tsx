import React, { useRef, useEffect, useState } from 'react';
import MediaPreview from './MediaPreview';

interface RichMediaEditorProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  name: string;
  editable?: boolean;
  onImageClick?: (src: string) => void;
  onImageMove?: (draggedImageSrc: string, targetImageSrc: string, direction: 'before' | 'after') => void;
}

/**
 * RichMediaEditor 컴포넌트
 * 
 * 텍스트와 멀티미디어를 함께 편집할 수 있는 통합 리치 에디터 컴포넌트입니다.
 * 텍스트 입력과 이미지 및 미디어를 동시에 볼 수 있으며, 미디어 요소를 드래그하여 위치를 변경할 수 있습니다.
 */
export function RichMediaEditor({
  value,
  onChange,
  placeholder,
  name,
  editable = true,
  onImageClick,
  onImageMove
}: RichMediaEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  
  // 드래그 중인 이미지 추적
  const [draggingImageSrc, setDraggingImageSrc] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    target: HTMLElement | null;
    direction: 'before' | 'after';
  }>({ target: null, direction: 'after' });

  useEffect(() => {
    // 포커스 상태에 따라 커서 위치와 스크롤 위치 유지
    if (isFocused && textareaRef.current) {
      const { selectionStart, selectionEnd } = textareaRef.current;
      
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = selectionStart;
          textareaRef.current.selectionEnd = selectionEnd;
        }
      });
    }
  }, [value, isFocused]);

  // 드래그 앤 드롭 핸들러 (이미지 재배치용)
  const handleImageDragStart = (src: string) => {
    setDraggingImageSrc(src);
  };

  const handleImageDragEnd = () => {
    // 드래그 상태 초기화
    setDraggingImageSrc(null);
    
    // 드롭 타겟 리셋
    if (dropTarget.target) {
      dropTarget.target.classList.remove('drop-before', 'drop-after');
      setDropTarget({ target: null, direction: 'after' });
    }
  };

  // 이미지 클릭 핸들러
  const handleImageClick = (src: string) => {
    if (onImageClick) {
      onImageClick(src);
    }
  };
  
  // 이미지 이동 핸들러
  const handleImageMove = (draggedSrc: string, targetSrc: string, direction: 'before' | 'after') => {
    if (onImageMove) {
      onImageMove(draggedSrc, targetSrc, direction);
    }
  };

  return (
    <div className="rich-editor-wrapper">
      <div 
        className={`rich-editor-content ${isFocused ? 'focused' : ''}`}
        onClick={() => textareaRef.current?.focus()}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          name={name}
          placeholder={placeholder}
          className="rich-editor-textarea"
          disabled={!editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <MediaPreview 
          content={value} 
          className="rich-editor-preview"
          onImageClick={handleImageClick}
          onImageMove={handleImageMove}
          editable={editable}
        />
      </div>
    </div>
  );
}