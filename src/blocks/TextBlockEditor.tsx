import React, { useRef, useEffect, useCallback, useState } from 'react';
import {
  Block,
  ParagraphBlock,
  HeadingBlock,
  QuoteBlock,
  ListBlock,
  ImageBlock,
  TextNode,
  MarkdownShortcutConfig,
} from '../types/blocks';
import { useEditorServices, DefaultImage } from '../context/EditorContext';
import { matchSpaceShortcut, isDividerShortcut, isCodeBlockShortcut } from '../utils/markdownShortcuts';
import { Upload, X, AlignLeft, AlignCenter, AlignRight, Maximize } from 'lucide-react';

interface TextBlockEditorProps {
  block: ParagraphBlock | HeadingBlock | QuoteBlock | ListBlock | ImageBlock;
  onUpdate: (updates: Partial<Block>) => void;
  onMergeWithPrevious?: () => void;
  onSplitBlock?: (beforeText: TextNode[], afterText: TextNode[]) => void;
  onPasteBlocks?: (beforeText: TextNode[], pastedLines: string[], afterText: TextNode[]) => void;
  onDeleteEmptyBlock?: () => void;
  onFocusPrevious?: () => void;
  onFocusNext?: () => void;
  isOnlyBlock?: boolean;
  onConvertBlock?: (newBlockData: Partial<Block>, options?: { insertParagraphAfter?: boolean }) => void;
  markdownShortcuts?: MarkdownShortcutConfig;
  listOrderIndex?: number;
}

// TextNode 배열을 HTML로 변환
function textNodesToHtml(nodes: TextNode[]): string {
  return nodes.map(node => {
    let html = node.text;

    // 특수 문자 이스케이프
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    if (node.bold) html = `<strong>${html}</strong>`;
    if (node.italic) html = `<em>${html}</em>`;
    if (node.underline) html = `<u>${html}</u>`;
    if (node.strikethrough) html = `<s>${html}</s>`;
    if (node.link) html = `<a href="${node.link}" class="text-blue-600 underline">${html}</a>`;

    return html;
  }).join('');
}

// HTML을 TextNode 배열로 변환 (단순 버전)
function htmlToTextNodes(html: string): TextNode[] {
  // 단순히 텍스트만 추출 (서식 정보는 나중에 개선)
  const div = document.createElement('div');
  div.innerHTML = html;
  const text = div.textContent || '';
  return [{ text }];
}

export default function TextBlockEditor({ block, onUpdate, onMergeWithPrevious, onSplitBlock, onPasteBlocks, onDeleteEmptyBlock, onFocusPrevious, onFocusNext, isOnlyBlock, onConvertBlock, markdownShortcuts, listOrderIndex }: TextBlockEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const isComposingRef = useRef(false);
  const lastContentRef = useRef<string>(''); // 마지막으로 설정한 content 추적

  const services = useEditorServices();
  const ImageComponent = services.ImageComponent || DefaultImage;

  // 커서가 맨 앞에 있는지 확인
  const isCursorAtStart = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;
    const range = selection.getRangeAt(0);
    if (!range.collapsed) return false;

    const editor = editorRef.current;
    if (!editor) return false;

    // 첫 번째 노드의 처음에 커서가 있는지 확인
    if (range.startOffset === 0) {
      const startNode = range.startContainer;
      if (startNode === editor || startNode === editor.firstChild) {
        return true;
      }
      // 첫 번째 텍스트 노드인지 확인
      if (startNode.nodeType === Node.TEXT_NODE) {
        let node = startNode;
        while (node.previousSibling === null && node.parentNode && node.parentNode !== editor) {
          node = node.parentNode as unknown as ChildNode;
        }
        if (node.previousSibling === null) return true;
      }
    }
    return false;
  }, []);

  // 커서가 맨 끝에 있는지 확인
  const isCursorAtEnd = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;
    const range = selection.getRangeAt(0);
    if (!range.collapsed) return false;

    const editor = editorRef.current;
    if (!editor) return false;

    const endNode = range.endContainer;
    const endOffset = range.endOffset;

    // 텍스트 노드의 끝에 있는지 확인
    if (endNode.nodeType === Node.TEXT_NODE) {
      if (endOffset !== endNode.textContent?.length) return false;
      // 마지막 노드인지 확인
      let node = endNode;
      while (node.nextSibling === null && node.parentNode && node.parentNode !== editor) {
        node = node.parentNode as unknown as ChildNode;
      }
      if (node.nextSibling === null) return true;
    } else if (endNode === editor) {
      return endOffset === editor.childNodes.length;
    }
    return false;
  }, []);

  // 이미지 블록 처리
  if (block.type === 'image') {
    const imageBlock = block as ImageBlock;

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        setUploading(true);
        const url = await services.uploadImage(file, 'editor');
        onUpdate({
          image: { ...imageBlock.image, url },
        });
      } catch (error) {
        console.error('Image upload error:', error);
        alert('이미지 업로드에 실패했습니다.');
      } finally {
        setUploading(false);
      }
    };

    const handleRemove = () => {
      onUpdate({ image: { url: '', alt: '', caption: '' } });
    };

    const handleAlignmentChange = (alignment: ImageBlock['alignment']) => {
      onUpdate({ alignment });
    };

    if (!imageBlock.image.url) {
      return (
        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <span className="text-sm text-gray-500">업로드 중...</span>
            </div>
          ) : (
            <div className="text-center">
              <Upload size={24} className="mx-auto mb-2 text-gray-400" />
              <span className="text-sm text-gray-500">이미지 업로드</span>
            </div>
          )}
        </label>
      );
    }

    return (
      <div className="space-y-2">
        <div className="relative">
          <div
            className={`relative ${
              imageBlock.alignment === 'full-width' ? 'w-full' : 'max-w-md'
            } ${
              imageBlock.alignment === 'left' ? 'mr-auto' :
              imageBlock.alignment === 'right' ? 'ml-auto' : 'mx-auto'
            }`}
          >
            <div className="relative aspect-video">
              <ImageComponent
                src={imageBlock.image.url}
                alt={imageBlock.image.alt || ''}
                fill
                className="object-contain rounded-lg"
              />
            </div>
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X size={14} />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => handleAlignmentChange('left')}
            className={`p-1.5 rounded ${imageBlock.alignment === 'left' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            <AlignLeft size={14} />
          </button>
          <button
            onClick={() => handleAlignmentChange('center')}
            className={`p-1.5 rounded ${imageBlock.alignment === 'center' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            <AlignCenter size={14} />
          </button>
          <button
            onClick={() => handleAlignmentChange('right')}
            className={`p-1.5 rounded ${imageBlock.alignment === 'right' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            <AlignRight size={14} />
          </button>
          <button
            onClick={() => handleAlignmentChange('full-width')}
            className={`p-1.5 rounded ${imageBlock.alignment === 'full-width' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            <Maximize size={14} />
          </button>
        </div>
        <input
          type="text"
          value={imageBlock.image.caption || ''}
          onChange={(e) => onUpdate({ image: { ...imageBlock.image, caption: e.target.value } })}
          placeholder="캡션 (선택)"
          className="w-full text-center text-sm text-gray-500 border-none outline-none"
        />
      </div>
    );
  }

  // 목록 블록인지 확인
  const isListBlock = block.type === 'list';

  // 텍스트 블록 (paragraph, heading, quote, list)
  const textBlock = block as ParagraphBlock | HeadingBlock | QuoteBlock | ListBlock;
  const content = textBlock.content;

  // HTML 설정 및 외부 변경 동기화
  useEffect(() => {
    if (editorRef.current && !isComposingRef.current) {
      const html = textNodesToHtml(content);
      const currentHtml = editorRef.current.innerHTML;

      // 내용이 실제로 다른 경우에만 업데이트 (입력 중 커서 이동 방지)
      // lastContentRef와 비교하여 외부에서 변경된 경우에만 DOM 업데이트
      if (html !== lastContentRef.current && currentHtml !== html) {
        editorRef.current.innerHTML = html || '';
        lastContentRef.current = html;
      }
    }
  }, [content]);

  // 붙여넣기 이벤트 처리 - 줄바꿈마다 새 블록 생성
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text/plain');
    const lines = text.split('\n');

    // 줄바꿈이 없으면 기본 동작 (단일 블록 내 붙여넣기)
    if (lines.length <= 1 || !onPasteBlocks) return;

    e.preventDefault();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const editor = editorRef.current;
    if (!editor) return;

    // 선택 영역이 있으면 먼저 삭제
    if (!range.collapsed) {
      range.deleteContents();
    }

    // 커서 기준으로 앞/뒤 텍스트 분리
    const beforeRange = document.createRange();
    beforeRange.setStart(editor, 0);
    beforeRange.setEnd(range.startContainer, range.startOffset);
    const beforeText = beforeRange.toString();

    const afterRange = document.createRange();
    afterRange.setStart(range.endContainer, range.endOffset);
    afterRange.setEnd(editor, editor.childNodes.length);
    const afterText = afterRange.toString();

    // 현재 블록 DOM을 첫 번째 줄로 업데이트
    const firstLineText = beforeText + lines[0];
    const firstLineHtml = textNodesToHtml([{ text: firstLineText }]);
    editor.innerHTML = firstLineHtml;
    lastContentRef.current = firstLineHtml;

    onPasteBlocks(
      [{ text: firstLineText }],
      lines.slice(1, -1),
      [{ text: lines[lines.length - 1] + afterText }]
    );
  }, [onPasteBlocks]);

  // 키보드 이벤트 처리
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // 크로스 블록 선택 가드: 선택이 현재 블록 밖으로 나가면 처리하지 않고 버블링
    if (e.key === 'Delete' || e.key === 'Backspace') {
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const editor = editorRef.current;
        if (editor && (!editor.contains(range.startContainer) || !editor.contains(range.endContainer))) {
          return; // 부모(BlockEditor)의 전역 핸들러가 처리
        }
      }
    }

    // Space 키: 마크다운 단축키 감지
    if (e.key === ' ' && !isComposingRef.current && onConvertBlock) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        const editor = editorRef.current;
        if (editor) {
          const beforeRange = document.createRange();
          beforeRange.setStart(editor, 0);
          beforeRange.setEnd(range.startContainer, range.startOffset);
          const textBeforeCursor = beforeRange.toString();

          // 커서 뒤에 텍스트가 없어야 함 (prefix만 있는 상태)
          const afterRange = document.createRange();
          afterRange.setStart(range.endContainer, range.endOffset);
          afterRange.setEnd(editor, editor.childNodes.length);
          const textAfterCursor = afterRange.toString();

          if (textAfterCursor === '') {
            const match = matchSpaceShortcut(textBeforeCursor, markdownShortcuts);
            if (match) {
              e.preventDefault();
              // DOM 선정리 (깜빡임 방지)
              editor.innerHTML = '';
              lastContentRef.current = '';
              onConvertBlock(match.createBlock());
              return;
            }
          }
        }
      }
    }

    // Ctrl/Cmd + B for bold
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      document.execCommand('bold');
      return;
    }
    // Ctrl/Cmd + I for italic
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      document.execCommand('italic');
      return;
    }
    // Ctrl/Cmd + U for underline
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
      e.preventDefault();
      document.execCommand('underline');
      return;
    }

    // Arrow up at start - move to previous block
    if (e.key === 'ArrowUp' && onFocusPrevious && isCursorAtStart()) {
      e.preventDefault();
      onFocusPrevious();
      return;
    }

    // Arrow down at end - move to next block
    if (e.key === 'ArrowDown' && onFocusNext && isCursorAtEnd()) {
      e.preventDefault();
      onFocusNext();
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey && onSplitBlock) {
      // IME 조합 중이면 무시
      if (isComposingRef.current) return;

      e.preventDefault();

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const editor = editorRef.current;
      if (!editor) return;

      // 선택 영역이 있으면 먼저 삭제
      if (!range.collapsed) {
        range.deleteContents();
      }

      // 커서 위치 기준으로 텍스트 분할
      const beforeRange = document.createRange();
      beforeRange.setStart(editor, 0);
      beforeRange.setEnd(range.startContainer, range.startOffset);

      const afterRange = document.createRange();
      afterRange.setStart(range.endContainer, range.endOffset);
      afterRange.setEnd(editor, editor.childNodes.length);

      const beforeText = beforeRange.toString();
      const afterText = afterRange.toString();

      // 현재 블록의 DOM을 직접 업데이트 (beforeText만 남김)
      const beforeHtml = textNodesToHtml([{ text: beforeText }]);
      editor.innerHTML = beforeHtml;
      lastContentRef.current = beforeHtml;

      onSplitBlock(
        [{ text: beforeText }],
        [{ text: afterText }]
      );
    } else if (e.key === 'Backspace') {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);

      // 커서가 맨 앞에 있고 선택 영역이 없을 때
      if (range.collapsed && range.startOffset === 0) {
        const editor = editorRef.current;
        if (editor && (range.startContainer === editor.firstChild || range.startContainer === editor)) {
          // 비-paragraph 블록 → paragraph로 전환 (내용 유지)
          if (block.type !== 'paragraph' && onConvertBlock) {
            e.preventDefault();
            const currentContent = (block as HeadingBlock | QuoteBlock | ListBlock).content;
            onConvertBlock({ type: 'paragraph', content: currentContent });
          } else if (onMergeWithPrevious) {
            e.preventDefault();
            onMergeWithPrevious();
          }
        }
      }
    } else if (e.key === 'Delete') {
      const editor = editorRef.current;
      const text = editor?.textContent || '';
      if (text.length === 0) {
        // 빈 비-paragraph 블록 → paragraph로 전환
        if (block.type !== 'paragraph' && onConvertBlock) {
          e.preventDefault();
          onConvertBlock({ type: 'paragraph', content: [{ text: '' }] });
        } else if (onDeleteEmptyBlock) {
          // 빈 paragraph 블록 → 삭제 후 이전 블록으로 포커스
          e.preventDefault();
          onDeleteEmptyBlock();
        }
      }
    }
  }, [onSplitBlock, onMergeWithPrevious, onDeleteEmptyBlock, onFocusPrevious, onFocusNext, isCursorAtStart, isCursorAtEnd, block.type, onConvertBlock, markdownShortcuts]);

  // 입력 이벤트 처리
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const nodes = htmlToTextNodes(html);

      // --- 감지: config에서 비활성화되지 않은 경우
      const fullText = nodes.map(n => n.text).join('');

      if (
        onConvertBlock &&
        (!markdownShortcuts || markdownShortcuts.divider !== false) &&
        isDividerShortcut(fullText)
      ) {
        editorRef.current.innerHTML = '';
        lastContentRef.current = '';
        onConvertBlock(
          { type: 'divider', variant: 'line' },
          { insertParagraphAfter: true },
        );
        return;
      }

      // ``` 감지: 코드 블록 변환
      if (
        onConvertBlock &&
        (!markdownShortcuts || markdownShortcuts.codeBlock !== false) &&
        isCodeBlockShortcut(fullText)
      ) {
        editorRef.current.innerHTML = '';
        lastContentRef.current = '';
        onConvertBlock({ type: 'code', code: '', language: 'javascript' });
        return;
      }

      // lastContentRef에 모델 기준 HTML 저장 (useEffect의 textNodesToHtml과 일치시킴)
      // DOM innerHTML은 &nbsp;를 사용하지만 모델은 \u00A0을 사용하므로 불일치 방지
      lastContentRef.current = textNodesToHtml(nodes);
      onUpdate({ content: nodes });
    }
  }, [onUpdate, block.type, onConvertBlock, markdownShortcuts]);

  // IME 조합 이벤트 처리
  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(() => {
    isComposingRef.current = false;
  }, []);

  // 블록 타입에 따른 스타일
  const getBlockStyle = () => {
    switch (block.type) {
      case 'heading':
        const headingBlock = block as HeadingBlock;
        switch (headingBlock.level) {
          case 1:
            return 'text-3xl font-bold';
          case 2:
            return 'text-2xl font-semibold';
          case 3:
            return 'text-xl font-semibold';
          default:
            return 'text-2xl font-semibold';
        }
      case 'quote':
        return 'border-l-4 border-gray-300 pl-4 text-gray-600 italic';
      default:
        return 'text-base';
    }
  };

  // 플레이스홀더 - paragraph는 블록이 하나뿐일 때만 표시
  const getPlaceholder = () => {
    switch (block.type) {
      case 'heading':
        return '제목을 입력하세요...';
      case 'quote':
        return '인용문을 입력하세요...';
      case 'list':
        return '목록 항목...';
      default:
        return isOnlyBlock ? '내용을 입력하세요...' : '';
    }
  };

  // 목록 블록은 마커와 함께 렌더링
  if (isListBlock) {
    const listBlock = block as ListBlock;
    return (
      <div className="flex items-start gap-2">
        <span className="flex-shrink-0 select-none text-gray-500 mt-0.5">
          {listBlock.listType === 'ordered' ? `${listOrderIndex ?? 1}.` : '•'}
        </span>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          data-placeholder={getPlaceholder()}
          className="flex-1 outline-none min-h-[1.5em] empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300"
        />
      </div>
    );
  }

  return (
    <div
      ref={editorRef}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      data-placeholder={getPlaceholder()}
      className={`outline-none min-h-[1.5em] ${getBlockStyle()} empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300`}
    />
  );
}
