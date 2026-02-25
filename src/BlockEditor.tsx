import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Block,
  ParagraphBlock,
  HeadingBlock,
  ImageBlock,
  ImageGalleryBlock,
  LinkCardBlock,
  LinkEmbedBlock,
  DialogueBlock,
  DividerBlock,
  QuoteBlock,
  ListBlock,
  CodeBlock,
  TableBlock,
  TextNode,
  MarkdownShortcutConfig,
  generateBlockId,
  countBlocksCharacters,
  createEmptyParagraphBlock,
} from './types/blocks';
import BlockMenu from './BlockMenu';
import TextBlockEditor from './blocks/TextBlockEditor';
import ImageGalleryEditor from './blocks/ImageGalleryEditor';
import LinkCardEditor from './blocks/LinkCardEditor';
import LinkEmbedEditor from './blocks/LinkEmbedEditor';
import DialogueEditor from './blocks/DialogueEditor';
import DividerEditor from './blocks/DividerEditor';
import CodeBlockEditor from './blocks/CodeBlockEditor';
import TableEditor from './blocks/TableEditor';
import { importFile, getAcceptString } from './importers';
import { GripVertical, Trash2, Plus } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface BlockEditorProps {
  initialBlocks?: Block[];
  onChange: (blocks: Block[]) => void;
  onCharCountChange?: (count: number) => void;
  markdownShortcuts?: MarkdownShortcutConfig;
}

// 블록 래퍼 컴포넌트 - 모든 블록에 컨트롤 추가
interface BlockItemProps {
  block: Block;
  blockIndex: number;
  onUpdate: (updates: Partial<Block>) => void;
  onDelete: () => void;
  onAddBlock: () => void;
  onMergeWithPrevious?: () => void;
  onSplitBlock?: (beforeText: TextNode[], afterText: TextNode[]) => void;
  onPasteBlocks?: (beforeText: TextNode[], pastedLines: string[], afterText: TextNode[]) => void;
  onDeleteEmptyBlock?: () => void;
  onFocusPrevious?: () => void;
  onFocusNext?: () => void;
  isOnlyBlock?: boolean;
  isSelected?: boolean;
  isFocused?: boolean;
  listOrderIndex?: number;
  onSelect?: (e: React.MouseEvent) => void;
  onConvertBlock?: (newBlockData: Partial<Block>, options?: { insertParagraphAfter?: boolean }) => void;
  onInsertParagraphAfter?: () => void;
  markdownShortcuts?: MarkdownShortcutConfig;
}

function BlockItem({
  block,
  blockIndex,
  onUpdate,
  onDelete,
  onAddBlock,
  onMergeWithPrevious,
  onSplitBlock,
  onPasteBlocks,
  onDeleteEmptyBlock,
  onFocusPrevious,
  onFocusNext,
  isOnlyBlock,
  isSelected,
  isFocused,
  listOrderIndex,
  onSelect,
  onConvertBlock,
  onInsertParagraphAfter,
  markdownShortcuts,
}: BlockItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const renderBlockContent = () => {
    switch (block.type) {
      case 'paragraph':
      case 'heading':
      case 'quote':
        return (
          <TextBlockEditor
            block={block as ParagraphBlock | HeadingBlock | QuoteBlock}
            onUpdate={onUpdate}
            onMergeWithPrevious={onMergeWithPrevious}
            onSplitBlock={onSplitBlock}
            onPasteBlocks={onPasteBlocks}
            onDeleteEmptyBlock={onDeleteEmptyBlock}
            onFocusPrevious={onFocusPrevious}
            onFocusNext={onFocusNext}
            isOnlyBlock={isOnlyBlock}
            onConvertBlock={onConvertBlock}
            markdownShortcuts={markdownShortcuts}
          />
        );

      case 'list':
        return (
          <TextBlockEditor
            block={block as ListBlock}
            onUpdate={onUpdate}
            onMergeWithPrevious={onMergeWithPrevious}
            onSplitBlock={onSplitBlock}
            onPasteBlocks={onPasteBlocks}
            onDeleteEmptyBlock={onDeleteEmptyBlock}
            onFocusPrevious={onFocusPrevious}
            onFocusNext={onFocusNext}
            isOnlyBlock={isOnlyBlock}
            onConvertBlock={onConvertBlock}
            markdownShortcuts={markdownShortcuts}
            listOrderIndex={listOrderIndex}
          />
        );

      case 'image':
        return (
          <TextBlockEditor block={block as ImageBlock} onUpdate={onUpdate} />
        );

      case 'image-gallery':
        return (
          <ImageGalleryEditor
            block={block as ImageGalleryBlock}
            onUpdate={onUpdate}
          />
        );

      case 'link-card':
        return (
          <LinkCardEditor block={block as LinkCardBlock} onUpdate={onUpdate} />
        );

      case 'link-embed':
        return (
          <LinkEmbedEditor
            block={block as LinkEmbedBlock}
            onUpdate={onUpdate}
          />
        );

      case 'dialogue':
        return (
          <DialogueEditor block={block as DialogueBlock} onUpdate={onUpdate} />
        );

      case 'divider':
        return (
          <DividerEditor block={block as DividerBlock} onUpdate={onUpdate} />
        );

      case 'table':
        return (
          <TableEditor block={block as TableBlock} onUpdate={onUpdate} />
        );

      case 'code':
        return (
          <CodeBlockEditor
            block={block as CodeBlock}
            onUpdate={onUpdate}
            onInsertParagraphAfter={onInsertParagraphAfter}
          />
        );

      default:
        return <div className="text-gray-400">Unknown block type</div>;
    }
  };

  // 블록 ref 등록 콜백
  const setBlockRef = useCallback((el: HTMLDivElement | null) => {
    setNodeRef(el);
  }, [setNodeRef]);

  const controlVisibility = isFocused ? 'opacity-100' : 'opacity-0';

  return (
    <div
      ref={setBlockRef}
      style={style}
      className={`flex items-start ${isSelected ? 'bg-blue-50 rounded' : ''}`}
      data-block-id={block.id}
      onClick={onSelect}
    >
      {/* 왼쪽: + 버튼 */}
      <div className={`w-7 flex-shrink-0 pt-1 ${controlVisibility} transition-opacity duration-150`}>
        <button
          onClick={onAddBlock}
          className="rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          title="블록 추가"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* 블록 콘텐츠 */}
      <div className="flex-1 min-w-0">{renderBlockContent()}</div>

      {/* 오른쪽: 삭제 및 드래그 버튼 */}
      <div className={`w-14 flex-shrink-0 pt-1 flex items-center gap-1 ${controlVisibility} transition-opacity duration-150`}>
        <button
          onClick={onDelete}
          className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500"
          title="블록 삭제"
        >
          <Trash2 size={16} />
        </button>
        <button
          {...attributes}
          {...listeners}
          className="p-1 rounded hover:bg-gray-100 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing"
          title="드래그하여 이동"
        >
          <GripVertical size={16} />
        </button>
      </div>
    </div>
  );
}

// --- 크로스 블록 선택 유틸리티 ---

/** DOM 노드에서 [data-block-id] 조상 탐색 */
function findBlockElement(node: Node, container: HTMLElement): HTMLElement | null {
  let current: Node | null = node;
  while (current && current !== container) {
    if (current instanceof HTMLElement && current.hasAttribute('data-block-id')) {
      return current;
    }
    current = current.parentNode;
  }
  return null;
}

/** TreeWalker로 contentEditable 내 문자 오프셋 계산 */
function getCharacterOffsetWithin(rootEl: HTMLElement, targetNode: Node, targetOffset: number): number {
  const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT, null);
  let offset = 0;
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node === targetNode) {
      return offset + targetOffset;
    }
    offset += (node.textContent?.length || 0);
  }
  // targetNode이 rootEl 자체인 경우 (빈 요소 등)
  return offset;
}

interface CrossBlockSelection {
  startBlockId: string;
  startBlockIndex: number;
  startOffset: number;
  endBlockId: string;
  endBlockIndex: number;
  endOffset: number;
}

/** window.getSelection()에서 크로스 블록 선택 정보 추출. 단일 블록이면 null */
function getCrossBlockSelection(blocks: Block[], containerEl: HTMLElement): CrossBlockSelection | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;

  const range = sel.getRangeAt(0);
  const startBlockEl = findBlockElement(range.startContainer, containerEl);
  const endBlockEl = findBlockElement(range.endContainer, containerEl);

  if (!startBlockEl || !endBlockEl) return null;

  const startBlockId = startBlockEl.getAttribute('data-block-id');
  const endBlockId = endBlockEl.getAttribute('data-block-id');
  if (!startBlockId || !endBlockId) return null;

  // 같은 블록이면 단일 블록 선택 → null
  if (startBlockId === endBlockId) return null;

  const startBlockIndex = blocks.findIndex(b => b.id === startBlockId);
  const endBlockIndex = blocks.findIndex(b => b.id === endBlockId);
  if (startBlockIndex === -1 || endBlockIndex === -1) return null;

  // contentEditable 요소 찾기
  const startEditable = startBlockEl.querySelector('[contenteditable="true"]') as HTMLElement | null;
  const endEditable = endBlockEl.querySelector('[contenteditable="true"]') as HTMLElement | null;

  const startOffset = startEditable
    ? getCharacterOffsetWithin(startEditable, range.startContainer, range.startOffset)
    : 0;
  const endOffset = endEditable
    ? getCharacterOffsetWithin(endEditable, range.endContainer, range.endOffset)
    : 0;

  return {
    startBlockId,
    startBlockIndex,
    startOffset,
    endBlockId,
    endBlockIndex,
    endOffset,
  };
}

export default function BlockEditor({
  initialBlocks = [],
  onChange,
  onCharCountChange,
  markdownShortcuts,
}: BlockEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(
    initialBlocks.length > 0 ? initialBlocks : [createEmptyParagraphBlock()],
  );
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [blockMenuPosition, setBlockMenuPosition] = useState({ x: 0, y: 0 });
  const [insertIndex, setInsertIndex] = useState<number>(0);
  const [selectedBlocks, setSelectedBlocks] = useState<Set<string>>(new Set()); // 선택된 블록 ID들
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null); // Shift 선택용
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const blockRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const pendingFocusRef = useRef<{ blockId: string; position: 'start' | 'end' } | null>(null);

  // 전체 선택 활성 플래그 (state 아닌 ref → 동기적, 타이밍 이슈 없음)
  const selectAllActiveRef = useRef(false);

  // ref 미러: useEffect([]) 핸들러에서 최신 상태를 동기적으로 읽기 위함
  const selectedBlocksRef = useRef<Set<string>>(new Set());
  const blocksRef = useRef<Block[]>(blocks);
  selectedBlocksRef.current = selectedBlocks;
  blocksRef.current = blocks;

  // 블록 선택 상태에서 Delete/Backspace 처리 — 의존성 없는 단일 핸들러(등록 1회)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isSelectAll = selectAllActiveRef.current;
      const selected = selectedBlocksRef.current;
      if (!isSelectAll && selected.size === 0) return;

      if (e.key === 'Delete' || e.key === 'Backspace' || e.key === 'Enter') {
        e.preventDefault();
        e.stopImmediatePropagation();
        selectAllActiveRef.current = false;
        setBlocks([createEmptyParagraphBlock()]);
        setSelectedBlocks(new Set());
        setTimeout(() => {
          const el = editorContainerRef.current?.querySelector('[data-block-id] [contenteditable="true"]') as HTMLElement;
          el?.focus();
        }, 50);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'x') {
        e.preventDefault();
        e.stopImmediatePropagation();
        const text = blocksRef.current
          .filter(b => isSelectAll || selected.has(b.id))
          .map(b => {
            if ('content' in b && Array.isArray((b as { content?: unknown }).content))
              return ((b as ParagraphBlock).content).map(n => n.text).join('');
            if (b.type === 'code') return (b as CodeBlock).code;
            if (b.type === 'divider') return '---';
            if (b.type === 'table') {
              const t = b as TableBlock;
              const hdr = '| ' + t.headers.join(' | ') + ' |';
              const sep = '| ' + t.headers.map(() => '---').join(' | ') + ' |';
              const rows = t.rows.map(r => '| ' + r.cells.join(' | ') + ' |').join('\n');
              return [hdr, sep, rows].join('\n');
            }
            return '';
          }).join('\n');
        navigator.clipboard.writeText(text).catch(() => {});
        selectAllActiveRef.current = false;
        setBlocks([createEmptyParagraphBlock()]);
        setSelectedBlocks(new Set());
        setTimeout(() => {
          const el = editorContainerRef.current?.querySelector('[data-block-id] [contenteditable="true"]') as HTMLElement;
          el?.focus();
        }, 50);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
        e.preventDefault();
        e.stopImmediatePropagation();
        const text = blocksRef.current
          .filter(b => isSelectAll || selected.has(b.id))
          .map(b => {
            if ('content' in b && Array.isArray((b as { content?: unknown }).content))
              return ((b as ParagraphBlock).content).map(n => n.text).join('');
            if (b.type === 'code') return (b as CodeBlock).code;
            if (b.type === 'divider') return '---';
            if (b.type === 'table') {
              const t = b as TableBlock;
              const hdr = '| ' + t.headers.join(' | ') + ' |';
              const sep = '| ' + t.headers.map(() => '---').join(' | ') + ' |';
              const rows = t.rows.map(r => '| ' + r.cells.join(' | ') + ' |').join('\n');
              return [hdr, sep, rows].join('\n');
            }
            return '';
          }).join('\n');
        navigator.clipboard.writeText(text).catch(() => {});
        return;
      }
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        selectAllActiveRef.current = false;
        setSelectedBlocks(new Set());
        return;
      }
      if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        e.stopImmediatePropagation();
        selectAllActiveRef.current = false;
        const newId = generateBlockId();
        setBlocks([{ id: newId, type: 'paragraph', content: [{ text: e.key }] } as ParagraphBlock]);
        setSelectedBlocks(new Set());
        pendingFocusRef.current = { blockId: newId, position: 'end' };
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, []);

  // 크로스 블록 드래그 선택 추적용
  const selStartRef = useRef<{ blockId: string; node: Node; offset: number } | null>(null);

  // 포커스 기반 블록 컨트롤 표시
  useEffect(() => {
    const container = editorContainerRef.current;
    if (!container) return;

    const handleFocusIn = (e: FocusEvent) => {
      let current = e.target as HTMLElement | null;
      while (current && current !== container) {
        if (current.hasAttribute('data-block-id')) {
          setFocusedBlockId(current.getAttribute('data-block-id'));
          return;
        }
        current = current.parentElement;
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      const related = e.relatedTarget as HTMLElement | null;
      if (!related || !container.contains(related)) {
        setFocusedBlockId(null);
      }
    };

    container.addEventListener('focusin', handleFocusIn);
    container.addEventListener('focusout', handleFocusOut);
    return () => {
      container.removeEventListener('focusin', handleFocusIn);
      container.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  // 블록 ID로 포커스 이동 (상태에 의존하지 않음)
  const focusBlockById = useCallback((blockId: string, position: 'start' | 'end' = 'start') => {
    // 약간의 지연 후 포커스 (DOM 업데이트 대기)
    setTimeout(() => {
      const blockEl = blockRefs.current.get(blockId);
      if (!blockEl) return;

      // contentEditable 요소 찾기
      const editable = blockEl.querySelector('[contenteditable="true"]') as HTMLElement;
      if (editable) {
        editable.focus();

        // 커서 위치 설정
        const range = document.createRange();
        const selection = window.getSelection();

        if (position === 'end' && editable.lastChild) {
          const lastChild = editable.lastChild;
          if (lastChild.nodeType === Node.TEXT_NODE) {
            range.setStart(lastChild, lastChild.textContent?.length || 0);
          } else {
            range.setStartAfter(lastChild);
          }
        } else {
          range.setStart(editable, 0);
        }

        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);
      } else {
        // input이나 textarea 찾기 (file input 제외)
        const input = blockEl.querySelector('input:not([type="file"]), textarea') as HTMLInputElement | HTMLTextAreaElement;
        if (input) {
          input.focus();
          try {
            if (position === 'end') {
              input.selectionStart = input.selectionEnd = input.value.length;
            } else {
              input.selectionStart = input.selectionEnd = 0;
            }
          } catch (e) {
            // selection이 지원되지 않는 input 타입 무시
          }
        }
      }
    }, 0);
  }, []);

  // 블록 포커스 이동 (인덱스 기반 - blocks 상태 사용)
  const focusBlock = useCallback((index: number, position: 'start' | 'end' = 'start') => {
    const targetBlock = blocks[index];
    if (!targetBlock) return;

    // 약간의 지연 후 포커스 (DOM 업데이트 대기)
    setTimeout(() => {
      const blockEl = blockRefs.current.get(targetBlock.id);
      if (!blockEl) return;

      // contentEditable 요소 찾기
      const editable = blockEl.querySelector('[contenteditable="true"]') as HTMLElement;
      if (editable) {
        editable.focus();

        // 커서 위치 설정
        const range = document.createRange();
        const selection = window.getSelection();

        if (position === 'end' && editable.lastChild) {
          const lastChild = editable.lastChild;
          if (lastChild.nodeType === Node.TEXT_NODE) {
            range.setStart(lastChild, lastChild.textContent?.length || 0);
          } else {
            range.setStartAfter(lastChild);
          }
        } else {
          range.setStart(editable, 0);
        }

        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);
      } else {
        // input이나 textarea 찾기 (file input 제외)
        const input = blockEl.querySelector('input:not([type="file"]), textarea') as HTMLInputElement | HTMLTextAreaElement;
        if (input) {
          input.focus();
          try {
            if (position === 'end') {
              input.selectionStart = input.selectionEnd = input.value.length;
            } else {
              input.selectionStart = input.selectionEnd = 0;
            }
          } catch (e) {
            // selection이 지원되지 않는 input 타입 무시
          }
        }
      }
    }, 0);
  }, [blocks]);

  // 블록 변경 후 포커스 적용 (React 재렌더링 이후 실행 보장)
  useEffect(() => {
    if (pendingFocusRef.current) {
      const { blockId, position } = pendingFocusRef.current;
      pendingFocusRef.current = null;
      focusBlockById(blockId, position);
    }
  }, [blocks, focusBlockById]);

  // 드래그 앤 드롭 센서
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // 블록 변경시 콜백 호출
  useEffect(() => {
    // Strip undefined values recursively to prevent Firestore errors
    const clean = (obj: unknown): unknown => {
      if (Array.isArray(obj)) return obj.map(clean);
      if (obj !== null && typeof obj === 'object') {
        const result: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
          if (v !== undefined) result[k] = clean(v);
        }
        return result;
      }
      return obj;
    };
    onChange(clean(blocks) as Block[]);
    if (onCharCountChange) {
      onCharCountChange(countBlocksCharacters(blocks));
    }
  }, [blocks]);

  // 블록 업데이트
  const handleUpdateBlock = useCallback(
    (id: string, updates: Partial<Block>) => {
      setBlocks((prev) =>
        prev.map((block) => {
          if (block.id !== id) return block;
          const updated = { ...block, ...updates };
          // Strip undefined values to prevent Firestore errors
          for (const key of Object.keys(updated)) {
            if ((updated as Record<string, unknown>)[key] === undefined) {
              delete (updated as Record<string, unknown>)[key];
            }
          }
          return updated as Block;
        }),
      );
    },
    [],
  );

  // 마크다운 단축키로 블록 변환
  const handleConvertBlock = useCallback(
    (id: string, newBlockData: Partial<Block>, options?: { insertParagraphAfter?: boolean }) => {
      if (options?.insertParagraphAfter) {
        // divider 변환: 기존 블록을 divider로 교체 + 빈 paragraph 삽입
        const newParagraphId = generateBlockId();

        setBlocks((prev) => {
          const index = prev.findIndex((b) => b.id === id);
          if (index === -1) return prev;

          const newBlocks = [...prev];
          newBlocks[index] = {
            id,
            ...newBlockData,
          } as Block;

          // divider 뒤에 빈 paragraph 삽입
          const newParagraph: ParagraphBlock = {
            id: newParagraphId,
            type: 'paragraph',
            content: [{ text: '' }],
          };
          newBlocks.splice(index + 1, 0, newParagraph);

          return newBlocks;
        });

        // 새 paragraph에 포커스
        pendingFocusRef.current = { blockId: newParagraphId, position: 'start' };
      } else {
        // 텍스트 타입 변환: 기존 블록을 새 타입으로 교체
        setBlocks((prev) =>
          prev.map((block) =>
            block.id === id
              ? ({ id, ...newBlockData } as Block)
              : block,
          ),
        );

        // 변환된 블록의 시작에 커서 배치
        pendingFocusRef.current = { blockId: id, position: 'start' };
      }
    },
    [],
  );

  // 블록 삭제
  const handleDeleteBlock = useCallback((id: string) => {
    setBlocks((prev) => {
      const filtered = prev.filter((block) => block.id !== id);
      // 최소 하나의 블록은 유지
      if (filtered.length === 0) {
        return [createEmptyParagraphBlock()];
      }
      return filtered;
    });
  }, []);

  // 블록 추가 메뉴 열기
  const handleShowBlockMenu = useCallback(
    (e: React.MouseEvent, index: number) => {
      e.preventDefault();
      e.stopPropagation();

      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setBlockMenuPosition({ x: rect.left, y: rect.bottom + 5 });
      setInsertIndex(index);
      setShowBlockMenu(true);
    },
    [],
  );

  // 블록 추가
  const handleAddBlock = useCallback(
    (type: Block['type']) => {
      let newBlock: Block;
      const id = generateBlockId();

      switch (type) {
        case 'paragraph':
          newBlock = {
            id,
            type: 'paragraph',
            content: [{ text: '' }],
          } as ParagraphBlock;
          break;
        case 'heading':
          newBlock = {
            id,
            type: 'heading',
            level: 2,
            content: [{ text: '' }],
          } as HeadingBlock;
          break;
        case 'quote':
          newBlock = {
            id,
            type: 'quote',
            content: [{ text: '' }],
          } as QuoteBlock;
          break;
        case 'list':
          newBlock = {
            id,
            type: 'list',
            listType: 'unordered',
            content: [{ text: '' }],
          } as ListBlock;
          break;
        case 'divider':
          newBlock = { id, type: 'divider', variant: 'line' } as DividerBlock;
          break;
        case 'table':
          newBlock = {
            id,
            type: 'table',
            headers: ['', ''],
            rows: [{ cells: ['', ''] }],
          } as TableBlock;
          break;
        case 'image':
          newBlock = {
            id,
            type: 'image',
            image: { url: '' },
            alignment: 'center',
          } as ImageBlock;
          break;
        case 'image-gallery':
          newBlock = {
            id,
            type: 'image-gallery',
            images: [],
            layout: 'grid',
            columns: 2,
          } as ImageGalleryBlock;
          break;
        case 'link-card':
          newBlock = { id, type: 'link-card', url: '' } as LinkCardBlock;
          break;
        case 'link-embed':
          newBlock = {
            id,
            type: 'link-embed',
            url: '',
            embedType: 'youtube',
          } as LinkEmbedBlock;
          break;
        case 'dialogue':
          newBlock = {
            id,
            type: 'dialogue',
            lines: [{ speaker: '', content: [{ text: '' }] }],
            style: 'chat',
          } as DialogueBlock;
          break;
        case 'code':
          newBlock = {
            id,
            type: 'code',
            code: '',
            language: 'javascript',
          } as CodeBlock;
          break;
        default:
          return;
      }

      setBlocks((prev) => {
        const newBlocks = [...prev];
        newBlocks.splice(insertIndex + 1, 0, newBlock);
        return newBlocks;
      });
      setShowBlockMenu(false);
    },
    [insertIndex],
  );

  // 파일 가져오기
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelected = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await importFile(file);
    if (result.blocks.length > 0) {
      setBlocks((prev) => {
        const newBlocks = [...prev];
        newBlocks.splice(insertIndex + 1, 0, ...result.blocks);
        return newBlocks;
      });
    }

    // 같은 파일 재선택 허용
    e.target.value = '';
  }, [insertIndex]);

  // 이전 블록과 병합 (Backspace 처리)
  const handleMergeWithPrevious = useCallback((index: number) => {
    if (index <= 0) return;

    const currentBlock = blocks[index];
    const previousBlock = blocks[index - 1];
    if (!currentBlock || !previousBlock) return;

    // 둘 다 텍스트 블록인 경우에만 병합
    const isTextType = (t: string) =>
      t === 'paragraph' || t === 'heading' || t === 'quote' || t === 'list';
    if (!isTextType(currentBlock.type) || !isTextType(previousBlock.type)) return;

    const prevBlockId = previousBlock.id;

    setBlocks((prev) => {
      const merged = [...prev];
      const prevContent = (prev[index - 1] as ParagraphBlock).content;
      const currContent = (prev[index] as ParagraphBlock).content;

      merged[index - 1] = {
        ...prev[index - 1],
        content: [...prevContent, ...currContent],
      } as Block;

      merged.splice(index, 1);
      return merged;
    });

    // 병합 후 이전 블록의 끝에 포커스
    pendingFocusRef.current = { blockId: prevBlockId, position: 'end' };
  }, [blocks]);

  // 빈 블록 삭제 후 이전 블록으로 포커스 (Delete 키 처리)
  const handleDeleteEmptyBlock = useCallback((index: number) => {
    if (index <= 0) return;

    const prevBlockId = blocks[index - 1]?.id;
    if (!prevBlockId) return;

    setBlocks((prev) => {
      if (prev.length <= 1) return prev;
      const newBlocks = [...prev];
      newBlocks.splice(index, 1);
      return newBlocks;
    });

    // 블록 제거 후 이전 블록 끝에 포커스
    pendingFocusRef.current = { blockId: prevBlockId, position: 'end' };
  }, [blocks]);

  // 블록 분할 (Enter 처리)
  const handleSplitBlock = useCallback(
    (index: number, beforeText: TextNode[], afterText: TextNode[]) => {
      // 새 블록 ID를 미리 생성 (포커스에 사용)
      const newBlockId = generateBlockId();

      setBlocks((prev) => {
        const newBlocks = [...prev];
        const currentBlock = newBlocks[index];

        // 현재 블록 업데이트
        newBlocks[index] = {
          ...currentBlock,
          content: beforeText,
        } as Block;

        // 새 블록 생성 - 목록 블록인 경우 같은 타입 유지
        let newBlock: Block;
        if (currentBlock.type === 'list') {
          newBlock = {
            id: newBlockId,
            type: 'list',
            listType: (currentBlock as ListBlock).listType,
            content: afterText.length > 0 ? afterText : [{ text: '' }],
          } as ListBlock;
        } else {
          newBlock = {
            id: newBlockId,
            type: 'paragraph',
            content: afterText.length > 0 ? afterText : [{ text: '' }],
          } as ParagraphBlock;
        }

        newBlocks.splice(index + 1, 0, newBlock);
        return newBlocks;
      });

      // 새 블록으로 포커스 이동 (ID 기반으로 상태 의존 없이)
      setTimeout(() => {
        focusBlockById(newBlockId, 'start');
      }, 10);
    },
    [focusBlockById],
  );

  // 현재 블록 뒤에 빈 paragraph 삽입 (코드 블록 등에서 Shift+Enter)
  const handleInsertParagraphAfter = useCallback(
    (index: number) => {
      const newBlockId = generateBlockId();
      const newParagraph: ParagraphBlock = {
        id: newBlockId,
        type: 'paragraph',
        content: [{ text: '' }],
      };

      setBlocks((prev) => {
        const newBlocks = [...prev];
        newBlocks.splice(index + 1, 0, newParagraph);
        return newBlocks;
      });

      pendingFocusRef.current = { blockId: newBlockId, position: 'start' };
    },
    [],
  );

  // 여러 줄 붙여넣기 처리 (줄바꿈마다 새 블록 생성)
  const handlePasteBlocks = useCallback(
    (index: number, beforeText: TextNode[], pastedLines: string[], afterText: TextNode[]) => {
      // 마지막 블록 ID (포커스 이동용)
      const lastBlockId = generateBlockId();

      setBlocks((prev) => {
        const newBlocks = [...prev];
        const currentBlock = newBlocks[index];

        // 현재 블록을 beforeText (첫 번째 줄 포함)로 업데이트
        newBlocks[index] = {
          ...currentBlock,
          content: beforeText,
        } as Block;

        // 중간 줄들을 새 paragraph 블록으로 생성
        const middleBlocks: Block[] = pastedLines.map((line) => ({
          id: generateBlockId(),
          type: 'paragraph' as const,
          content: [{ text: line }],
        }));

        // 마지막 블록 (마지막 붙여넣기 줄 + afterText)
        const lastBlock: ParagraphBlock = {
          id: lastBlockId,
          type: 'paragraph',
          content: afterText,
        };

        // 현재 블록 뒤에 삽입
        newBlocks.splice(index + 1, 0, ...middleBlocks, lastBlock);
        return newBlocks;
      });

      // 마지막 블록으로 포커스 이동
      setTimeout(() => {
        focusBlockById(lastBlockId, 'end');
      }, 10);
    },
    [focusBlockById],
  );

  // 드래그 앤 드롭 핸들러
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setBlocks((prev) => {
        const oldIndex = prev.findIndex((block) => block.id === active.id);
        const newIndex = prev.findIndex((block) => block.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newBlocks = [...prev];
          const [removed] = newBlocks.splice(oldIndex, 1);
          newBlocks.splice(newIndex, 0, removed);
          return newBlocks;
        }

        return prev;
      });
    }
  }, []);

  // 블록 선택 핸들러
  const handleBlockSelect = useCallback((index: number, e: React.MouseEvent) => {
    // 클릭 시 전체 선택 모드 해제
    selectAllActiveRef.current = false;

    // 블록 내부의 contentEditable 클릭 시에는 선택 무시
    const target = e.target as HTMLElement;
    if (target.closest('[contenteditable="true"]') || target.closest('input') || target.closest('textarea')) {
      // 선택 해제
      if (selectedBlocks.size > 0) {
        setSelectedBlocks(new Set());
      }
      setLastSelectedIndex(index);
      return;
    }

    if (e.shiftKey && lastSelectedIndex !== null) {
      // Shift+클릭: 범위 선택
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      const newSelected = new Set<string>();
      for (let i = start; i <= end; i++) {
        newSelected.add(blocks[i].id);
      }
      setSelectedBlocks(newSelected);
    } else if (e.metaKey || e.ctrlKey) {
      // Cmd/Ctrl+클릭: 토글 선택
      const newSelected = new Set(selectedBlocks);
      if (newSelected.has(blocks[index].id)) {
        newSelected.delete(blocks[index].id);
      } else {
        newSelected.add(blocks[index].id);
      }
      setSelectedBlocks(newSelected);
      setLastSelectedIndex(index);
    } else {
      // 일반 클릭: 단일 선택 해제
      setSelectedBlocks(new Set());
      setLastSelectedIndex(index);
    }
  }, [blocks, selectedBlocks, lastSelectedIndex]);

  // 크로스 블록 선택 삭제 처리
  const handleCrossBlockDelete = useCallback((crossSel: CrossBlockSelection, insertChar?: string) => {
    const { startBlockIndex, endBlockIndex, startOffset, endOffset } = crossSel;

    setBlocks((prev) => {
      const startBlock = prev[startBlockIndex];
      const endBlock = prev[endBlockIndex];

      // 시작 블록의 선택 이전 텍스트
      let beforeText = '';
      if (startBlock.type === 'paragraph' || startBlock.type === 'heading' || startBlock.type === 'quote' || startBlock.type === 'list') {
        const fullText = (startBlock as ParagraphBlock).content.map(n => n.text).join('');
        beforeText = fullText.slice(0, startOffset);
      }

      // 끝 블록의 선택 이후 텍스트
      let afterText = '';
      if (endBlock.type === 'paragraph' || endBlock.type === 'heading' || endBlock.type === 'quote' || endBlock.type === 'list') {
        const fullText = (endBlock as ParagraphBlock).content.map(n => n.text).join('');
        afterText = fullText.slice(endOffset);
      }

      // 병합된 텍스트
      const mergedText = beforeText + (insertChar || '') + afterText;

      // 시작 블록을 병합된 텍스트로 업데이트
      const mergedBlock = {
        ...startBlock,
        content: [{ text: mergedText }],
      } as Block;

      // 새 블록 배열: 시작 블록 이전 + 병합 블록 + 끝 블록 이후
      const newBlocks = [
        ...prev.slice(0, startBlockIndex),
        mergedBlock,
        ...prev.slice(endBlockIndex + 1),
      ];

      if (newBlocks.length === 0) {
        return [createEmptyParagraphBlock()];
      }

      return newBlocks;
    });

    // 병합 지점에 커서 배치
    const cursorPos = startOffset + (insertChar?.length || 0);
    setTimeout(() => {
      const blockEl = blockRefs.current.get(crossSel.startBlockId);
      if (!blockEl) return;
      const editable = blockEl.querySelector('[contenteditable="true"]') as HTMLElement;
      if (!editable) return;
      editable.focus();

      // DOM 업데이트 후 커서 배치
      requestAnimationFrame(() => {
        const walker = document.createTreeWalker(editable, NodeFilter.SHOW_TEXT, null);
        let offset = 0;
        let targetNode: Node | null = null;
        let targetOffset = 0;
        let node: Node | null;
        while ((node = walker.nextNode())) {
          const len = node.textContent?.length || 0;
          if (offset + len >= cursorPos) {
            targetNode = node;
            targetOffset = cursorPos - offset;
            break;
          }
          offset += len;
        }
        if (targetNode) {
          const range = document.createRange();
          range.setStart(targetNode, targetOffset);
          range.collapse(true);
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
      });
    }, 0);
  }, []);

  // 전역 키보드 이벤트 (Cmd+A 에스컬레이팅, 크로스 블록 선택 삭제)
  useEffect(() => {
    const container = editorContainerRef.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      // --- Cmd+A: 에스컬레이팅 전체 선택 ---
      if ((e.metaKey || e.ctrlKey) && e.key === 'a' && container) {
        // 이미 블록 선택 모드 → 전체 선택 활성화
        if (selectedBlocks.size > 0) {
          e.preventDefault();
          selectAllActiveRef.current = true;
          setSelectedBlocks(new Set(blocks.map(b => b.id)));
          return;
        }

        const activeEl = document.activeElement as HTMLElement | null;
        if (!activeEl || !container.contains(activeEl)) return;

        // 컨테이너 자체에 포커스 → 바로 전체 선택
        if (activeEl === container) {
          e.preventDefault();
          selectAllActiveRef.current = true;
          setSelectedBlocks(new Set(blocks.map(b => b.id)));
          return;
        }

        // 블록 내 에디터: 텍스트가 이미 전체 선택되었거나 비어있으면 → 전체 블록 선택
        let isFullySelected = false;
        if (activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement) {
          const len = activeEl.value.length;
          isFullySelected = len === 0 || (activeEl.selectionStart === 0 && activeEl.selectionEnd === len);
        } else {
          const text = activeEl.textContent || '';
          const sel = window.getSelection();
          if (text.length === 0) {
            isFullySelected = true;
          } else if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
            try {
              const range = sel.getRangeAt(0);
              const elRange = document.createRange();
              elRange.selectNodeContents(activeEl);
              isFullySelected =
                range.compareBoundaryPoints(Range.START_TO_START, elRange) <= 0
                && range.compareBoundaryPoints(Range.END_TO_END, elRange) >= 0;
            } catch (_) {
              isFullySelected = false;
            }
          }
        }

        if (isFullySelected) {
          e.preventDefault();
          window.getSelection()?.removeAllRanges();
          activeEl.blur();
          selectAllActiveRef.current = true;
          setSelectedBlocks(new Set(blocks.map(b => b.id)));
          return;
        }
        // 브라우저 기본 동작 (블록 내 전체 선택)
        return;
      }

      // 크로스 블록 텍스트 선택 삭제
      if ((e.key === 'Delete' || e.key === 'Backspace') && !e.isComposing && container) {
        const crossSel = getCrossBlockSelection(blocks, container);
        if (crossSel) {
          e.preventDefault();
          handleCrossBlockDelete(crossSel);
          return;
        }
      }
    };

    // beforeinput: 크로스 블록 선택 상태에서 입력 가로채기 + 컨테이너 직접 편집 방지
    const handleBeforeInput = (e: InputEvent) => {
      if (!container) return;

      // 전체 선택 상태에서 모든 입력 차단 (keydown에서 처리)
      if (selectAllActiveRef.current) {
        e.preventDefault();
        return;
      }

      const crossSel = getCrossBlockSelection(blocks, container);
      if (crossSel) {
        if ((e.inputType === 'insertText' || e.inputType === 'insertCompositionText') && !e.isComposing && e.data) {
          e.preventDefault();
          handleCrossBlockDelete(crossSel, e.data);
        } else if (e.inputType.startsWith('delete')) {
          e.preventDefault();
          handleCrossBlockDelete(crossSel);
        } else {
          e.preventDefault();
        }
        return;
      }

      if (e.target === container) {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    if (container) {
      container.addEventListener('beforeinput', handleBeforeInput);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      if (container) {
        container.removeEventListener('beforeinput', handleBeforeInput);
      }
    };
  }, [selectedBlocks, blocks, handleCrossBlockDelete]);

  // 크로스 블록 드래그 선택: 마우스로 블록 경계를 넘어가면 프로그래밍으로 Selection 생성
  useEffect(() => {
    const container = editorContainerRef.current;
    if (!container) return;

    let docMoveHandler: ((e: MouseEvent) => void) | null = null;
    let docUpHandler: (() => void) | null = null;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const editable = target.closest('[contenteditable="true"]');
      // 컨테이너 자체나 contentEditable 밖이면 무시
      if (!editable || editable === container) return;

      // Shift+Click: 기존 시작점에서 크로스 블록 선택 확장
      if (e.shiftKey && selStartRef.current) {
        const caretRange = document.caretRangeFromPoint(e.clientX, e.clientY);
        if (!caretRange) return;

        const caretBlockEl = findBlockElement(caretRange.startContainer, container);
        if (!caretBlockEl) return;
        const caretBlockId = caretBlockEl.getAttribute('data-block-id');

        if (caretBlockId && caretBlockId !== selStartRef.current.blockId) {
          e.preventDefault();
          const sel = window.getSelection();
          if (sel) {
            try {
              sel.setBaseAndExtent(
                selStartRef.current.node,
                selStartRef.current.offset,
                caretRange.startContainer,
                caretRange.startOffset,
              );
            } catch (_) {}
          }
        }
        return;
      }

      // 일반 클릭: 시작점 기록 (브라우저가 커서를 배치한 후)
      requestAnimationFrame(() => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);

        const blockEl = findBlockElement(range.startContainer, container);
        if (!blockEl) return;

        selStartRef.current = {
          blockId: blockEl.getAttribute('data-block-id')!,
          node: range.startContainer,
          offset: range.startOffset,
        };
      });

      // 드래그 추적 시작
      docMoveHandler = (moveE: MouseEvent) => {
        if (!selStartRef.current) return;

        const caretRange = document.caretRangeFromPoint(moveE.clientX, moveE.clientY);
        if (!caretRange) return;

        const caretBlockEl = findBlockElement(caretRange.startContainer, container);
        if (!caretBlockEl) return;

        const caretBlockId = caretBlockEl.getAttribute('data-block-id');
        if (!caretBlockId || caretBlockId === selStartRef.current.blockId) return;

        // 블록 경계를 넘었으면 프로그래밍으로 Selection 생성
        requestAnimationFrame(() => {
          if (!selStartRef.current) return;
          const sel = window.getSelection();
          if (!sel) return;
          try {
            sel.setBaseAndExtent(
              selStartRef.current.node,
              selStartRef.current.offset,
              caretRange.startContainer,
              caretRange.startOffset,
            );
          } catch (_) {}
        });
      };

      docUpHandler = () => {
        if (docMoveHandler) document.removeEventListener('mousemove', docMoveHandler);
        if (docUpHandler) document.removeEventListener('mouseup', docUpHandler);
        docMoveHandler = null;
        docUpHandler = null;
      };

      document.addEventListener('mousemove', docMoveHandler);
      document.addEventListener('mouseup', docUpHandler);
    };

    container.addEventListener('mousedown', handleMouseDown);
    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      if (docMoveHandler) document.removeEventListener('mousemove', docMoveHandler);
      if (docUpHandler) document.removeEventListener('mouseup', docUpHandler);
    };
  }, []);

  // 크로스 블록 선택 시 빈 블록에 선택 표시 (selectionchange 추적)
  useEffect(() => {
    const container = editorContainerRef.current;
    if (!container) return;

    const handleSelectionChange = () => {
      // 이전 표시 제거
      container.querySelectorAll('[data-cross-selected]').forEach(el => {
        el.removeAttribute('data-cross-selected');
      });

      const crossSel = getCrossBlockSelection(blocks, container);
      if (!crossSel) return;

      const minIdx = Math.min(crossSel.startBlockIndex, crossSel.endBlockIndex);
      const maxIdx = Math.max(crossSel.startBlockIndex, crossSel.endBlockIndex);

      for (let i = minIdx; i <= maxIdx; i++) {
        const wrapper = blockRefs.current.get(blocks[i].id);
        if (wrapper) {
          wrapper.setAttribute('data-cross-selected', 'true');
        }
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [blocks]);

  return (
    <div className="block-editor relative select-text">
      {/* 빈 블록 크로스 선택 표시 스타일 */}
      <style>{`
        [data-cross-selected] [contenteditable]:empty::after {
          content: '\\00a0';
          background-color: rgb(191 219 254);
          border-radius: 1px;
        }
      `}</style>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div
            ref={editorContainerRef}
            contentEditable
            suppressContentEditableWarning
            className="space-y-1 selection:bg-blue-200 outline-none"
          >
            {blocks.map((block, index) => {
              // 순서 목록 번호 계산
              let listOrderIndex: number | undefined;
              if (block.type === 'list' && (block as ListBlock).listType === 'ordered') {
                listOrderIndex = 1;
                for (let i = index - 1; i >= 0; i--) {
                  if (blocks[i].type === 'list' && (blocks[i] as ListBlock).listType === 'ordered') {
                    listOrderIndex++;
                  } else {
                    break;
                  }
                }
              }

              return (
                <div
                  key={block.id}
                  contentEditable={false}
                  ref={(el) => {
                    if (el) blockRefs.current.set(block.id, el);
                    else blockRefs.current.delete(block.id);
                  }}
                >
                  <BlockItem
                    block={block}
                    blockIndex={index}
                    onUpdate={(updates) => handleUpdateBlock(block.id, updates)}
                    onDelete={() => handleDeleteBlock(block.id)}
                    onAddBlock={(e?: React.MouseEvent) => {
                      if (e) {
                        handleShowBlockMenu(e, index);
                      } else {
                        setInsertIndex(index);
                        setShowBlockMenu(true);
                        setBlockMenuPosition({ x: 100, y: 100 });
                      }
                    }}
                    onMergeWithPrevious={
                      index > 0 ? () => handleMergeWithPrevious(index) : undefined
                    }
                    onSplitBlock={(before, after) =>
                      handleSplitBlock(index, before, after)
                    }
                    onPasteBlocks={(before, lines, after) =>
                      handlePasteBlocks(index, before, lines, after)
                    }
                    onDeleteEmptyBlock={
                      index > 0 ? () => handleDeleteEmptyBlock(index) : undefined
                    }
                    onFocusPrevious={
                      index > 0 ? () => focusBlock(index - 1, 'end') : undefined
                    }
                    onFocusNext={
                      index < blocks.length - 1 ? () => focusBlock(index + 1, 'start') : undefined
                    }
                    isOnlyBlock={blocks.length === 1}
                    isSelected={selectedBlocks.has(block.id)}
                    isFocused={focusedBlockId === block.id}
                    listOrderIndex={listOrderIndex}
                    onSelect={(e) => handleBlockSelect(index, e)}
                    onConvertBlock={(data, opts) => handleConvertBlock(block.id, data, opts)}
                    onInsertParagraphAfter={() => handleInsertParagraphAfter(index)}
                    markdownShortcuts={markdownShortcuts}
                  />
                </div>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      {/* 블록 메뉴 */}
      {showBlockMenu && (
        <BlockMenu
          position={blockMenuPosition}
          onClose={() => setShowBlockMenu(false)}
          onSelect={handleAddBlock}
          onImportFile={handleImportFile}
        />
      )}

      {/* 파일 가져오기용 숨겨진 input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptString()}
        onChange={handleFileSelected}
        style={{ display: 'none' }}
      />
    </div>
  );
}
