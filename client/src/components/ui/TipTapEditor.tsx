import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Image as ImageIcon, 
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Video,
  FileIcon,
  Smile
} from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

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

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editor) {
    return null;
  }

  // 이미지 업로드 핸들러
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      const file = event.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === 'string') {
          editor.chain().focus().setImage({ src: e.target.result }).run();
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  // 링크 추가 핸들러
  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center p-2 gap-1 border-b bg-muted/10">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn('h-8 w-8', editor.isActive('bold') ? 'bg-muted' : '')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Button>
      
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn('h-8 w-8', editor.isActive('italic') ? 'bg-muted' : '')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </Button>
      
      <div className="mx-1 h-4 border-l border-muted-foreground/20"></div>
      
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn('h-8 w-8', editor.isActive('bulletList') ? 'bg-muted' : '')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </Button>
      
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn('h-8 w-8', editor.isActive('orderedList') ? 'bg-muted' : '')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      
      <div className="mx-1 h-4 border-l border-muted-foreground/20"></div>
      
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => {
          if (fileInputRef.current) {
            fileInputRef.current.click();
          }
        }}
      >
        <ImageIcon className="h-4 w-4" />
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleImageUpload}
        />
      </Button>
      
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn('h-8 w-8', editor.isActive('link') ? 'bg-muted' : '')}
        onClick={() => setShowLinkInput(!showLinkInput)}
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
      
      <div className="mx-1 h-4 border-l border-muted-foreground/20"></div>
      
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn('h-8 w-8', editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : '')}
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn('h-8 w-8', editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : '')}
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn('h-8 w-8', editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : '')}
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
      >
        <AlignRight className="h-4 w-4" />
      </Button>
      
      {showLinkInput && (
        <div className="flex items-center gap-2 ml-auto">
          <input
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="URL 입력"
            className="px-2 py-1 text-sm border rounded"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addLink();
              }
            }}
          />
          <Button type="button" size="sm" onClick={addLink}>추가</Button>
          <Button 
            type="button" 
            size="sm" 
            variant="ghost" 
            onClick={() => {
              setShowLinkInput(false);
              setLinkUrl('');
            }}
          >
            취소
          </Button>
        </div>
      )}
    </div>
  );
};

const TipTapEditor = ({ 
  value, 
  onChange, 
  placeholder = '내용을 입력하세요...', 
  editable = true,
  onImageClick,
  onImageUpload,
  fieldName,
  name
}: TipTapEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'tiptap-image',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'tiptap-link',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
        defaultAlignment: 'left',
      }),
    ],
    content: value || '',
    editable,
    onUpdate: ({ editor }) => {
      // 항상 콘텐츠가 비어있지 않도록 보장
      let newContent = editor.getHTML();
      
      // 완전히 비어있는 경우 기본 <p><br></p>를 추가하여 입력 가능하게 함
      if (newContent === '' || newContent === '<p></p>') {
        newContent = '<p><br></p>';
        setTimeout(() => {
          editor.commands.setContent(newContent);
        }, 0);
      }
      
      onChange(newContent);
    },
    editorProps: {
      attributes: {
        class: 'tiptap-content prose prose-sm sm:prose-base dark:prose-invert focus:outline-none',
        style: 'min-height: 200px; padding: 1rem;'
      },
    },
  });

  // 이미지 삽입 메서드
  const insertImage = useCallback((src: string, alt: string = '이미지') => {
    if (editor) {
      // 현재 커서 위치에 이미지 삽입 후 빈 단락 추가하여 입력 공간 확보
      editor
        .chain()
        .focus()
        .setImage({ src, alt })
        .insertContent('<p><br></p>')
        .run();
    }
  }, [editor]);

  // 비디오 삽입 메서드
  const insertVideo = useCallback((src: string, type: string) => {
    if (editor) {
      const videoHtml = `<div><video controls width="100%"><source src="${src}" type="${type}"></video></div><p><br></p>`;
      editor
        .chain()
        .focus()
        .insertContent(videoHtml)
        .run();
    }
  }, [editor]);

  // 파일 링크 삽입 메서드
  const insertFileLink = useCallback((src: string, fileName: string) => {
    if (editor) {
      const fileLinkHtml = `<p><a href="${src}" download="${fileName}" class="tiptap-file-link">${fileName} 다운로드</a></p><p><br></p>`;
      editor
        .chain()
        .focus()
        .insertContent(fileLinkHtml)
        .run();
    }
  }, [editor]);

  // URL 삽입 메서드 (일반 URL 또는 YouTube)
  const insertUrl = useCallback((url: string, isYoutube: boolean = false) => {
    if (editor) {
      if (isYoutube) {
        // YouTube 비디오 ID 추출
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
        const match = url.match(youtubeRegex);
        
        if (match && match[1]) {
          const videoId = match[1];
          const youtubeHtml = `<div class="youtube-embed">
            <iframe 
              width="100%" 
              height="315" 
              src="https://www.youtube.com/embed/${videoId}" 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen
            ></iframe>
          </div><p><br></p>`;
          
          editor.chain().focus().insertContent(youtubeHtml).run();
        }
      } else {
        // 일반 URL 링크 삽입
        editor
          .chain()
          .focus()
          .setLink({ href: url })
          .insertContent(`<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a><p><br></p>`)
          .run();
      }
    }
  }, [editor]);

  // 외부에서 미디어 삽입 메서드 노출 (멀티미디어 버튼에서 사용)
  useEffect(() => {
    if (editor) {
      // @ts-ignore - 에디터에 사용자 정의 메서드 추가
      editor.insertImage = insertImage;
      // @ts-ignore
      editor.insertVideo = insertVideo;
      // @ts-ignore
      editor.insertFileLink = insertFileLink;
      // @ts-ignore
      editor.insertUrl = insertUrl;
    }
  }, [editor, insertImage, insertVideo, insertFileLink, insertUrl]);

  // 이미지 클릭 이벤트
  useEffect(() => {
    if (editor && onImageClick) {
      const handleImageClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (target.tagName === 'IMG') {
          const src = target.getAttribute('src');
          if (src) {
            onImageClick(src);
          }
        }
      };
      
      const element = editor.view.dom;
      element.addEventListener('click', handleImageClick);
      
      return () => {
        element.removeEventListener('click', handleImageClick);
      };
    }
  }, [editor, onImageClick]);

  // 외부에서 content가 변경될 때 에디터 내용 업데이트
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  return (
    <div className="tiptap-editor border rounded-md overflow-hidden" data-field-name={fieldName || name}>
      {editable && <MenuBar editor={editor} />}
      <EditorContent className="min-h-[200px]" editor={editor} />
    </div>
  );
};

export default TipTapEditor;