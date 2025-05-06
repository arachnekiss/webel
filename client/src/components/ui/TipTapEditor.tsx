import { Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { useCallback, useEffect, useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { Button } from './button';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, Link2, ImageIcon } from 'lucide-react';

// 에디터 인스턴스를 외부에서 참조하기 위한 핸들 타입 정의
export interface TipTapEditorHandle {
  insertImage: (src: string, alt?: string) => void;
  insertVideo: (src: string) => void;
  insertFile: (url: string, fileName: string) => void;
  insertLink: (url: string, text?: string) => void;
  insertHtml: (html: string) => void;
  getEditor: () => Editor | null;
}

interface TipTapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  editable?: boolean;
  onImageClick?: (src: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  fieldName?: string; // 필드 이름 (멀티미디어 추적용)
  name?: string; // input name 속성
}

export const TipTapEditor = forwardRef<TipTapEditorHandle, TipTapEditorProps>(({
  value,
  onChange,
  placeholder = "내용을 입력하세요...",
  editable = true,
  onImageClick,
  onImageUpload,
  fieldName,
  name,
}, ref) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 에디터 내 이미지 클릭 핸들링은 아래 EditorContent의 onClick 이벤트로 처리
  // TipTap API에서 요구하는 handleClick 함수 시그니처와 맞지 않아 제거함

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
      }),
    ],
    content: value || "",
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      if (onImageClick) {
        const selectedNode = editor.state.selection.$anchor.parent;
        if (selectedNode.type.name === 'image') {
          const attrs = selectedNode.attrs;
          onImageClick(attrs.src);
        }
      }
    },
    editorProps: {
      handleClick: undefined,
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none',
        'data-placeholder': placeholder,
        ...(fieldName ? { 'data-field-name': fieldName } : {}),
        ...(name ? { 'name': name } : {}),
      },
    },
  });

  // 외부에서 에디터 기능에 접근할 수 있는 핸들 제공
  useImperativeHandle(ref, () => ({
    // 이미지 삽입
    insertImage: (src: string, alt: string = "이미지") => {
      editor?.chain().focus().setImage({ src, alt }).insertContent('<p><br></p>').run();
    },
    
    // 비디오 삽입
    insertVideo: (src: string) => {
      const videoHtml = `<div><video controls width="100%"><source src="${src}"></video></div><p><br></p>`;
      editor?.chain().focus().insertContent(videoHtml).run();
    },
    
    // 파일 링크 삽입
    insertFile: (url: string, fileName: string) => {
      const fileHtml = `<p><a href="${url}" download="${fileName}" class="tiptap-file-link">${fileName} 다운로드</a></p><p><br></p>`;
      editor?.chain().focus().insertContent(fileHtml).run();
    },
    
    // 링크 삽입
    insertLink: (url: string, text?: string) => {
      if (text) {
        editor?.chain().focus().insertContent(`<a href="${url}" target="_blank">${text}</a>`).run();
      } else {
        editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
      }
    },
    
    // HTML 직접 삽입
    insertHtml: (html: string) => {
      editor?.chain().focus().insertContent(html).run();
    },
    
    // 에디터 인스턴스 반환
    getEditor: () => editor,
  }));

  // 에디터 내용이 외부에서 변경될 경우 업데이트
  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  // 이미지 파일 선택 핸들러
  const handleSelectImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // 이미지 업로드 처리
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor || !onImageUpload) return;

    try {
      setImageFile(file);
      const imageUrl = await onImageUpload(file);
      
      // 이미지 삽입
      editor.chain().focus().setImage({ src: imageUrl, alt: file.name }).run();
      
      // 입력 필드 초기화
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setImageFile(null);
    }
  }, [editor, onImageUpload]);

  // URL 삽입 핸들러
  const handleInsertLink = useCallback(() => {
    if (!editor) return;
    
    const url = window.prompt('URL을 입력하세요:');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-editor-container">
      {editable && (
        <div className="tiptap-toolbar">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().toggleBold()}
            className={`h-8 px-2 ${editor.isActive('bold') ? 'bg-accent' : ''}`}
          >
            <Bold className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().toggleItalic()}
            className={`h-8 px-2 ${editor.isActive('italic') ? 'bg-accent' : ''}`}
          >
            <Italic className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`h-8 px-2 ${editor.isActive({ textAlign: 'left' }) ? 'bg-accent' : ''}`}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`h-8 px-2 ${editor.isActive({ textAlign: 'center' }) ? 'bg-accent' : ''}`}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`h-8 px-2 ${editor.isActive({ textAlign: 'right' }) ? 'bg-accent' : ''}`}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={handleInsertLink}
            className={`h-8 px-2 ${editor.isActive('link') ? 'bg-accent' : ''}`}
          >
            <Link2 className="h-4 w-4" />
          </Button>
          
          {onImageUpload && (
            <>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={handleSelectImage}
                className="h-8 px-2"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </>
          )}
        </div>
      )}
      
      <EditorContent 
        editor={editor} 
        className={`tiptap-content ${!editable ? 'read-only' : ''}`} 
        onClick={(e) => {
          // 이미지 클릭 처리
          if (onImageClick) {
            const target = e.target as HTMLElement;
            if (target.tagName === 'IMG') {
              const src = target.getAttribute('src');
              if (src) {
                onImageClick(src);
              }
            }
          }
        }}
      />
    </div>
  );
});