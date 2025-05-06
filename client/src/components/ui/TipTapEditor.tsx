import { Editor, EditorContent, useEditor, Node, mergeAttributes, ReactNodeViewRenderer } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { keymap } from '@tiptap/pm/keymap';
import { TextSelection } from '@tiptap/pm/state';
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

  // TipTap v2 형식으로 addCommands 수정
  addCommands() {
    // 명시적인 타입 정의를 추가하여 TypeScript 오류 방지
    return {
      insertVideo: (attributes: Record<string, any>) => ({ chain }: { chain: any }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: attributes,
          })
          .run();
      },
    } as any;
  },
  
  // 비디오 노드를 위한 nodeView 추가
  addNodeView() {
    return ({ HTMLAttributes, node, editor, getPos }) => {
      const dom = document.createElement('div');
      dom.classList.add('tiptap-video-wrapper');
      
      // 비디오 엘리먼트 생성
      const video = document.createElement('video');
      // HTMLAttributes에서 속성 적용
      Object.entries(HTMLAttributes).forEach(([key, value]) => {
        video.setAttribute(key, String(value));
      });
      
      // 편집 모드일 때 삭제 버튼 추가
      if (editor.isEditable) {
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('tiptap-video-delete-button');
        deleteButton.innerHTML = '×';
        deleteButton.addEventListener('click', (e) => {
          e.stopPropagation();
          if (typeof getPos === 'function') {
            const pos = getPos();
            
            // 비디오 URL 가져오기 (onMediaDelete 콜백용)
            // 노드 속성에서 직접 URL 추출
            const src = node.attrs.src;
            
            // ProseMirror 트랜잭션으로 노드 삭제
            const { state, dispatch } = editor.view;
            const { tr } = state;
            
            // 노드 삭제
            tr.delete(pos, pos + node.nodeSize);
            
            // 불필요한 빈 단락이 생성되지 않도록 처리
            // TextSelection.near 사용하여 가장 가까운 적절한 위치에 커서 배치
            tr.setSelection(TextSelection.near(tr.doc.resolve(pos)));
            
            // 트랜잭션 적용
            dispatch(tr);
            
            // 에디터 포커스
            setTimeout(() => {
              editor.view.focus();
            }, 0);
            
            // 외부 이벤트 핸들러 호출 (미디어 삭제 알림)
            if (src) {
              console.log('비디오 삭제:', src); // 디버깅용
              
              // 에디터에서 삭제 이벤트 발생 타임스탬프 기록
              if (typeof window !== 'undefined') {
                window.lastEditorDeletionTimestamp = Date.now();
              }
              
              // editor.options에서 onMediaDelete 핸들러와 fieldName 가져오기
              const mediaDeleteHandler = (editor.options as any)?.onMediaDelete;
              const fieldName = (editor.options as any)?.fieldName || '';
              
              if (typeof mediaDeleteHandler === 'function') {
                mediaDeleteHandler(src, 'video', fieldName);
              }
            }
          }
        });
        
        dom.appendChild(video);
        dom.appendChild(deleteButton);
      } else {
        dom.appendChild(video);
      }
      
      return {
        dom,
        contentDOM: null,
      };
    };
  },
});

// YouTube 노드 확장
const YouTube = Node.create({
  name: 'youtube',
  group: 'block',
  atom: true,
  
  addAttributes() {
    return {
      videoId: {
        default: null,
      },
      width: {
        default: '100%',
      },
      height: {
        default: '315',
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'div[data-youtube-id]',
      },
      // Legacy format
      {
        tag: 'div.youtube-embed',
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    const { videoId } = HTMLAttributes;
    
    // If no videoId is provided, render an empty div
    if (!videoId) {
      return ['div', { class: 'youtube-embed-placeholder' }, 'Invalid YouTube video'];
    }
    
    // Return the YouTube iframe wrapped in a div
    return [
      'div',
      { class: 'youtube-embed', 'data-youtube-id': videoId },
      [
        'iframe',
        {
          width: HTMLAttributes.width || '100%',
          height: HTMLAttributes.height || '315',
          src: `https://www.youtube.com/embed/${videoId}`,
          frameborder: '0',
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
          allowfullscreen: 'true',
        },
      ],
    ];
  },
  
  addCommands() {
    return {
      insertYouTube: (attributes: Record<string, any>) => ({ chain }: { chain: any }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: attributes,
          })
          .run();
      },
    } as any;
  },
  
  // Add a nodeView for YouTube to handle deletion
  addNodeView() {
    return ({ HTMLAttributes, node, editor, getPos }) => {
      const dom = document.createElement('div');
      dom.classList.add('tiptap-youtube-wrapper');
      
      // Create the YouTube iframe container
      const youtubeContainer = document.createElement('div');
      youtubeContainer.classList.add('youtube-embed');
      youtubeContainer.setAttribute('data-youtube-id', HTMLAttributes.videoId);
      
      // Create iframe
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${HTMLAttributes.videoId}`;
      iframe.width = HTMLAttributes.width || '100%';
      iframe.height = HTMLAttributes.height || '315';
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.setAttribute('allowfullscreen', 'true');
      
      youtubeContainer.appendChild(iframe);
      
      // Add delete button when editable
      if (editor.isEditable) {
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('tiptap-youtube-delete-button');
        deleteButton.innerHTML = '×';
        deleteButton.addEventListener('click', (e) => {
          e.stopPropagation();
          if (typeof getPos === 'function') {
            const pos = getPos();
            
            // Get videoId for deletion callback
            const videoId = node.attrs.videoId;
            const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
            
            // Delete the node
            const { state, dispatch } = editor.view;
            const { tr } = state;
            
            tr.delete(pos, pos + node.nodeSize);
            
            // Fix cursor position
            tr.setSelection(TextSelection.near(tr.doc.resolve(pos)));
            
            // Apply transaction
            dispatch(tr);
            
            // Focus editor
            setTimeout(() => {
              editor.view.focus();
            }, 0);
            
            // Call external delete handler
            if (videoId) {
              console.log('YouTube 비디오 삭제:', videoId);
              
              // Set timestamp for deletion tracking
              if (typeof window !== 'undefined') {
                window.lastEditorDeletionTimestamp = Date.now();
              }
              
              // Get handler from editor options
              const mediaDeleteHandler = (editor.options as any)?.onMediaDelete;
              const fieldName = (editor.options as any)?.fieldName || '';
              
              if (typeof mediaDeleteHandler === 'function') {
                mediaDeleteHandler(youtubeUrl, 'youtube', fieldName);
              }
            }
          }
        });
        
        dom.appendChild(youtubeContainer);
        dom.appendChild(deleteButton);
      } else {
        dom.appendChild(youtubeContainer);
      }
      
      return {
        dom,
        contentDOM: null,
      };
    };
  },

});

// 이미지 및 미디어 노드 자동 삭제 방지 확장 (강화된 버전)
const PreventImageNodeDeletion = Extension.create({
  name: 'preventImageNodeDeletion',
  
  addKeyboardShortcuts() {
    return {
      'Backspace': ({ editor }) => {
        const { selection } = editor.state;
        const { empty, $anchor } = selection;
        
        // 이미지 노드를 직접 선택한 경우가 아니고
        // 이미지 노드 바로 앞에서 Backspace 눌렀을 때 이미지 삭제되지 않도록
        if (empty && $anchor.nodeBefore) {
          const nodeBeforeType = $anchor.nodeBefore.type.name;
          // 미디어 노드 유형 목록 (필요시 추가)
          const mediaNodeTypes = ['image', 'video'];
          
          if (mediaNodeTypes.includes(nodeBeforeType)) {
            return true; // 기본 동작 취소
          }
          
          // 이미지 또는 비디오를 포함하는 복합 노드 확인
          if ($anchor.nodeBefore.content) {
            let hasMediaNode = false;
            $anchor.nodeBefore.descendants((node) => {
              if (mediaNodeTypes.includes(node.type.name)) {
                hasMediaNode = true;
                return false; // 순회 중단
              }
              return true; // 계속 순회
            });
            
            if (hasMediaNode) {
              return true; // 기본 동작 취소
            }
          }
        }
        
        // 현재 선택된 노드나 범위가 이미지/비디오를 포함하는지 확인
        if (!empty) {
          let hasMediaNode = false;
          editor.state.doc.nodesBetween(selection.from, selection.to, (node) => {
            if (node.type.name === 'image' || node.type.name === 'video') {
              hasMediaNode = true;
              return false; // 순회 중단
            }
            return true; // 계속 순회
          });
          
          // 선택 범위에 미디어 노드가 포함된 경우 삭제 차단
          if (hasMediaNode) {
            return true; // 기본 동작 취소
          }
        }
        
        return false; // 원래 동작 실행
      },
      
      'Delete': ({ editor }) => {
        const { selection } = editor.state;
        const { empty, $head } = selection;
        
        // 이미지 노드를 직접 선택한 경우가 아니고
        // 이미지 노드 바로 뒤에서 Delete 눌렀을 때 이미지 삭제되지 않도록
        if (empty && $head.nodeAfter) {
          const nodeAfterType = $head.nodeAfter.type.name;
          // 미디어 노드 유형 목록 (필요시 추가)
          const mediaNodeTypes = ['image', 'video'];
          
          if (mediaNodeTypes.includes(nodeAfterType)) {
            return true; // 기본 동작 취소
          }
          
          // 이미지 또는 비디오를 포함하는 복합 노드 확인
          if ($head.nodeAfter.content) {
            let hasMediaNode = false;
            $head.nodeAfter.descendants((node) => {
              if (mediaNodeTypes.includes(node.type.name)) {
                hasMediaNode = true;
                return false; // 순회 중단
              }
              return true; // 계속 순회
            });
            
            if (hasMediaNode) {
              return true; // 기본 동작 취소
            }
          }
        }
        
        // 현재 선택된 노드나 범위가 이미지/비디오를 포함하는지 확인
        if (!empty) {
          let hasMediaNode = false;
          editor.state.doc.nodesBetween(selection.from, selection.to, (node) => {
            if (node.type.name === 'image' || node.type.name === 'video') {
              hasMediaNode = true;
              return false; // 순회 중단
            }
            return true; // 계속 순회
          });
          
          // 선택 범위에 미디어 노드가 포함된 경우 삭제 차단
          if (hasMediaNode) {
            return true; // 기본 동작 취소
          }
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
  onMediaDelete?: (src: string, type: 'image' | 'video', fieldName?: string) => void; // 미디어 삭제 이벤트 핸들러
  fieldName?: string; // 필드 이름 (멀티미디어 추적용)
  name?: string; // input name 속성
  hideLinkButton?: boolean; // 링크 버튼을 숨길지 여부
}

// 전역 이미지 클릭 핸들러 관리를 위한 인터페이스
interface GlobalTipTapHandlers {
  [editorId: string]: {
    onImageClick?: (src: string) => void;
  }
}

// 타입 선언이 없으므로 window에 전역 속성 추가
declare global {
  interface Window {
    __TIPTAP_GLOBAL_HANDLERS: GlobalTipTapHandlers;
  }
}

// 초기화
if (typeof window !== 'undefined' && !window.__TIPTAP_GLOBAL_HANDLERS) {
  window.__TIPTAP_GLOBAL_HANDLERS = {};
}

export const TipTapEditor = forwardRef<TipTapEditorHandle, TipTapEditorProps>(({
  value,
  onChange,
  placeholder = "내용을 입력하세요...",
  editable = true,
  onImageClick,
  onImageUpload,
  onMediaDelete,
  fieldName,
  name,
  hideLinkButton,
}, ref) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 에디터 인스턴스를 식별하기 위한 고유 ID
  const editorIdRef = useRef<string>(`tiptap-${Math.random().toString(36).substring(2, 9)}`);

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
        
        // 삭제 버튼 추가 (편집 모드일 때만)
        if (editor.isEditable) {
          const deleteButton = document.createElement('button');
          deleteButton.classList.add('tiptap-image-delete-button');
          deleteButton.innerHTML = '×';
          deleteButton.addEventListener('click', (e) => {
            e.stopPropagation(); // 이벤트 버블링 방지
            if (typeof getPos === 'function') {
              const pos = getPos();
              
              // 이미지 URL 가져오기 (onMediaDelete 콜백용)
              // 이미지 엘리먼트 대신 노드 속성에서 직접 URL 추출
              const src = node.attrs.src;
              
              // ProseMirror 트랜잭션으로 노드 삭제
              const { state, dispatch } = editor.view;
              const { tr } = state;
              
              // 노드 삭제
              tr.delete(pos, pos + node.nodeSize);
              
              // 불필요한 빈 단락이 생성되지 않도록 처리
              // TextSelection.near 사용하여 가장 가까운 적절한 위치에 커서 배치
              tr.setSelection(TextSelection.near(tr.doc.resolve(pos)));
              
              // 트랜잭션 적용
              dispatch(tr);
              
              // 에디터 포커스
              setTimeout(() => {
                editor.view.focus();
              }, 0);
              
              // 외부 이벤트 핸들러 호출 (미디어 삭제 알림)
              if (src) {
                console.log('이미지 삭제:', src); // 디버깅용
                
                // 에디터에서 삭제 이벤트 발생 타임스탬프 기록
                if (typeof window !== 'undefined') {
                  (window as any).lastEditorDeletionTimestamp = Date.now();
                }
                
                // editor.options에서 onMediaDelete 핸들러와 fieldName 가져오기
                const mediaDeleteHandler = (editor.options as any)?.onMediaDelete;
                const fieldName = (editor.options as any)?.fieldName || '';
                
                if (typeof mediaDeleteHandler === 'function') {
                  mediaDeleteHandler(src, 'image', fieldName);
                }
              }
            }
          });
          
          dom.appendChild(img);
          dom.appendChild(deleteButton);
        } else {
          dom.appendChild(img);
        }
        
        // 데이터 속성에 에디터 ID 저장
        const editorId = dom.dataset.editorId = dom.dataset.editorId || 
          `tiptap-${Math.random().toString(36).substring(2, 9)}`;
          
        // 이미지 클릭 핸들러 설정 - 기본 동작은 아무것도 하지 않음
        img.addEventListener('click', () => {
          const src = img.getAttribute('src');
          if (src) {
            // 전역에서 해당 에디터에 설정된 이미지 클릭 핸들러 찾기
            const handlers = window.__TIPTAP_GLOBAL_HANDLERS;
            
            // 현재 포커스된 에디터의 핸들러 가져오기
            const activeEditorId = Object.keys(handlers).find(id => {
              return document.querySelector(`.tiptap-editor-container[data-editor-id="${id}"]`);
            });
            
            // 핸들러가 있을 경우에만 호출 (불필요한 토스트 메시지 제거)
            if (activeEditorId && handlers[activeEditorId]?.onImageClick) {
              handlers[activeEditorId].onImageClick(src);
            }
            // onImageClick이 있어도 기본적으로 호출하지 않음 - 불필요한 메시지 제거
          }
        });
        
        return {
          dom,
          contentDOM: null,
        };
      };
    },
  });

  // 커스텀 옵션을 확장한 useEditor 형태
  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageWithDeleteButton,
      Video,
      YouTube, // Add our YouTube extension
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
  
  // 에디터 인스턴스에 onMediaDelete 핸들러와 fieldName 추가 (타입 단언 사용)
  if (editor) {
    (editor as any).options.onMediaDelete = onMediaDelete;
    (editor as any).options.fieldName = fieldName || '';
  }

  // 외부에서 에디터 기능에 접근할 수 있는 핸들 제공
  useImperativeHandle(ref, () => ({
    // 이미지 삽입
    insertImage: (src: string, alt: string = "이미지") => {
      editor?.chain().focus().setImage({ src, alt }).insertContent('<p><br></p>').run();
    },
    
    // 비디오 삽입
    insertVideo: (src: string) => {
      // YouTube 비디오 여부 확인
      if (src.includes('youtube.com') || src.includes('youtu.be')) {
        // YouTube 비디오 ID 추출
        let videoId = null;
        
        // 글로벌 getYouTubeVideoId 함수 사용 (ResourceUploadPage에서 정의)
        if (typeof window !== 'undefined' && window.getYouTubeVideoId) {
          videoId = window.getYouTubeVideoId(src);
        } else {
          // 폴백: 기본 ID 추출 방식
          videoId = src.includes('youtu.be') 
            ? src.split('/').pop() 
            : src.includes('v=') 
              ? new URLSearchParams(src.split('?')[1]).get('v') 
              : null;
        }
        
        if (videoId) {
          // YouTube 확장 사용 - 커맨드 직접 호출 대신 원시 노드 삽입
          editor?.chain().focus().insertContent({
            type: 'youtube',
            attrs: {
              videoId: videoId,
              width: '100%',
              height: '315'
            }
          }).run();
          
          // 빈 단락 삽입으로 커서 위치 조정
          editor?.chain().focus().insertContent('<p><br></p>').run();
        }
      } else {
        // 일반 비디오 파일인 경우 video 태그 사용 - 커맨드 직접 호출 대신 원시 노드 삽입
        editor?.chain().focus().insertContent({
          type: 'video',
          attrs: {
            src: src, 
            controls: true,
            width: '100%' 
          }
        }).run();
        
        // 빈 단락 삽입으로 커서 위치 조정
        editor?.chain().focus().insertContent('<p><br></p>').run();
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
  
  // 에디터가 초기화된 후 onImageClick 핸들러 등록
  useEffect(() => {
    if (editor && onImageClick) {
      // 전역 스토어에 onImageClick 핸들러 저장
      const editorId = editorIdRef.current;
      window.__TIPTAP_GLOBAL_HANDLERS = {
        ...window.__TIPTAP_GLOBAL_HANDLERS,
        [editorId]: {
          onImageClick
        }
      };
    }
    
    return () => {
      // 컴포넌트 언마운트 시 핸들러 제거
      const editorId = editorIdRef.current;
      const handlers = window.__TIPTAP_GLOBAL_HANDLERS;
      if (handlers && handlers[editorId]) {
        delete handlers[editorId];
      }
    };
  }, [editor, onImageClick]);

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
    <div 
      className="tiptap-editor-container" 
      data-editor-id={editorIdRef.current}
    >
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
          
          {!hideLinkButton && (
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={handleInsertLink}
              className={`h-8 px-2 ${editor.isActive('link') ? 'bg-accent' : ''}`}
            >
              <Link2 className="h-4 w-4" />
            </Button>
          )}
          
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
        // 이미지 클릭 이벤트는 이제 이미지 노드뷰에서 처리하므로 onClick 제거
        // onSelectionUpdate에서 이미지 노드 선택 시 onImageClick 호출됨
      />
    </div>
  );
});