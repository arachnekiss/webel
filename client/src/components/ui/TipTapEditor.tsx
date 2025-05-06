import { Editor, EditorContent, useEditor, Node, mergeAttributes, ReactNodeViewRenderer } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { keymap } from '@tiptap/pm/keymap';
import { useCallback, useEffect, useState, useRef, useImperativeHandle, forwardRef, ReactNode } from 'react';
import { Button } from './button';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, Link2, ImageIcon, X } from 'lucide-react';

// 커스텀 비디오 확장 만들기
const Video = Node.create({
  name: 'video',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      controls: {
        default: true,
      },
      width: {
        default: '100%',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'video',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['video', mergeAttributes(HTMLAttributes)];
  },

  addCommands() {
    return {
      setVideo: (options: { src: string, controls?: boolean, width?: string }) => ({ commands }: any) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        });
      },
    };
  },
});

// 이미지 자동 삭제 방지 확장
const PreventImageNodeDeletion = Extension.create({
  name: 'preventImageNodeDeletion',
  
  addKeyboardShortcuts() {
    return {
      'Backspace': ({ editor }) => {
        const { selection } = editor.state;
        const { empty, $anchor } = selection;
        
        // 이미지 노드 앞에서 Backspace 눌렀을 때 이미지 삭제되지 않도록
        if (empty && $anchor.nodeBefore && $anchor.nodeBefore.type.name === 'image') {
          return true; // 기본 동작 취소
        }
        
        return false; // 원래 동작 실행
      },
      'Delete': ({ editor }) => {
        const { selection } = editor.state;
        const { empty, $head } = selection;
        
        // 이미지 노드 뒤에서 Delete 눌렀을 때 이미지 삭제되지 않도록
        if (empty && $head.nodeAfter && $head.nodeAfter.type.name === 'image') {
          return true; // 기본 동작 취소
        }
        
        return false; // 원래 동작 실행
      }
    };
  }
});

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

  // 이미지 노드 확장 - 이미지에 삭제 버튼 추가
  const ImageWithDeleteButton = Image.extend({
    renderHTML({ HTMLAttributes }) {
      const { src, alt, title } = HTMLAttributes;
      
      // 원래의 HTML 렌더링을 사용하지만, 커스텀 클래스 추가
      HTMLAttributes.class = 'tiptap-image-wrapper';
      
      return [
        'img',
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      ]
    },
    addNodeView() {
      return ({ HTMLAttributes, node, editor, getPos }) => {
        const dom = document.createElement('div');
        dom.classList.add('tiptap-image-wrapper');
        
        const img = document.createElement('img');
        Object.entries(HTMLAttributes).forEach(([key, value]) => {
          img.setAttribute(key, String(value));
        });
        
        // 삭제 버튼 추가
        if (editor.isEditable) {
          const deleteButton = document.createElement('button');
          deleteButton.classList.add('tiptap-image-delete-button');
          deleteButton.innerHTML = '×';
          deleteButton.addEventListener('click', () => {
            if (typeof getPos === 'function') {
              const pos = getPos();
              editor.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).run();
            }
          });
          
          dom.appendChild(img);
          dom.appendChild(deleteButton);
        } else {
          dom.appendChild(img);
        }
        
        return {
          dom,
          contentDOM: null,
        };
      };
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageWithDeleteButton,
      Video,
      PreventImageNodeDeletion,
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
      // 직접 Video 명령 사용으로 변경
      if (src.includes('youtube.com') || src.includes('youtu.be')) {
        // YouTube 비디오인 경우 iframe 사용
        const embedId = src.includes('youtu.be') 
          ? src.split('/').pop() 
          : src.includes('v=') 
            ? new URLSearchParams(src.split('?')[1]).get('v') 
            : null;
        
        if (embedId) {
          const youtubeHtml = `<div class="youtube-embed"><iframe src="https://www.youtube.com/embed/${embedId}" frameborder="0" allowfullscreen></iframe></div><p><br></p>`;
          editor?.chain().focus().insertContent(youtubeHtml).run();
        }
      } else {
        // 일반 비디오 파일인 경우 video 태그 사용
        const videoHtml = `<video controls width="100%" src="${src}"></video><p><br></p>`;
        editor?.chain().focus().insertContent(videoHtml).run();
      }
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