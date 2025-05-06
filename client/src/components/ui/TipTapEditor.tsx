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
  AlignRight
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
  onImageUpload
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
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-content prose prose-sm sm:prose-base dark:prose-invert focus:outline-none',
        style: 'min-height: 200px; padding: 1rem;'
      },
    },
  });

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
    <div className="tiptap-editor border rounded-md overflow-hidden">
      {editable && <MenuBar editor={editor} />}
      <EditorContent className="min-h-[200px]" editor={editor} />
    </div>
  );
};

export default TipTapEditor;