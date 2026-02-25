// 블록 타입 정의
export type BlockType =
  | 'paragraph'      // 일반 텍스트
  | 'heading'        // 제목 (H1, H2, H3)
  | 'image'          // 단일 이미지
  | 'image-gallery'  // 이미지 갤러리 (그리드, 가로스크롤)
  | 'link-card'      // 링크 카드 (OG 미리보기)
  | 'link-embed'     // 임베드 (YouTube 등)
  | 'dialogue'       // 대사 (이름 + 대사)
  | 'divider'        // 구분선/구분기호
  | 'quote'          // 인용문
  | 'list'           // 목록
  | 'code'           // 코드 블록
  | 'table';         // 표

// 텍스트 노드 (인라인 서식용)
export interface TextNode {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  link?: string;
}

// 기본 블록 인터페이스
interface BaseBlock {
  id: string;
  type: BlockType;
}

// 문단 블록
export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph';
  content: TextNode[];
}

// 제목 블록
export interface HeadingBlock extends BaseBlock {
  type: 'heading';
  level: 1 | 2 | 3;
  content: TextNode[];
}

// 이미지 데이터
export interface ImageData {
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}

// 단일 이미지 블록
export interface ImageBlock extends BaseBlock {
  type: 'image';
  image: ImageData;
  alignment: 'left' | 'center' | 'right' | 'full-width';
}

// 이미지 갤러리 블록
export interface ImageGalleryBlock extends BaseBlock {
  type: 'image-gallery';
  images: ImageData[];
  layout: 'grid' | 'horizontal-scroll' | 'masonry';
  columns?: 2 | 3 | 4;
}

// OG 데이터
export interface OGData {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

// 링크 카드 블록
export interface LinkCardBlock extends BaseBlock {
  type: 'link-card';
  url: string;
  ogData?: OGData;
}

// 임베드 블록
export interface LinkEmbedBlock extends BaseBlock {
  type: 'link-embed';
  url: string;
  embedType: 'youtube' | 'twitter' | 'generic';
  videoId?: string;
}

// 대사 라인
export interface DialogueLine {
  speaker: string;
  content: TextNode[];
  speakerColor?: string;      // 채팅 스타일: 말풍선 배경색
  profileImage?: string;      // 채팅 스타일: 프로필 이미지 URL
  alignment?: 'left' | 'right';  // 채팅 스타일: 정렬 방향
}

// 대사 블록
export interface DialogueBlock extends BaseBlock {
  type: 'dialogue';
  lines: DialogueLine[];
  style?: 'chat' | 'play';  // chat: 카톡 스타일, play: 희극 스타일
}

// 구분선 블록
export interface DividerBlock extends BaseBlock {
  type: 'divider';
  variant: 'line' | 'short-line' | 'dots' | 'custom-image';
  customImage?: string;
  alignment?: 'left' | 'center' | 'right';  // line 제외한 나머지 타입에 적용
}

// 인용문 블록
export interface QuoteBlock extends BaseBlock {
  type: 'quote';
  content: TextNode[];
  citation?: string;
}

// 목록 블록 (단일 항목 - 각 항목이 개별 블록)
export interface ListBlock extends BaseBlock {
  type: 'list';
  listType: 'ordered' | 'unordered';
  content: TextNode[];
}

// 코드 블록
export interface CodeBlock extends BaseBlock {
  type: 'code';
  code: string;
  language?: string;
}

// 표 블록
export interface TableBlock extends BaseBlock {
  type: 'table';
  headers: string[];
  rows: string[][];
}

// 블록 유니온 타입
export type Block =
  | ParagraphBlock
  | HeadingBlock
  | ImageBlock
  | ImageGalleryBlock
  | LinkCardBlock
  | LinkEmbedBlock
  | DialogueBlock
  | DividerBlock
  | QuoteBlock
  | ListBlock
  | CodeBlock
  | TableBlock;

// 마크다운 단축키 설정 (개별 단축키 활성/비활성)
export interface MarkdownShortcutConfig {
  heading1?: boolean;        // # → H1, default: true
  heading2?: boolean;        // ## → H2, default: true
  heading3?: boolean;        // ### → H3, default: true
  bulletDash?: boolean;      // - → 비순서 목록, default: true
  bulletAsterisk?: boolean;  // * → 비순서 목록, default: true
  orderedList?: boolean;     // 1. → 순서 목록, default: true
  quote?: boolean;           // > → 인용문, default: true
  divider?: boolean;         // --- → 구분선, default: true
  codeBlock?: boolean;       // ``` → 코드 블록, default: true
}

// 블록 콘텐츠 전체 구조
export interface BlockContent {
  version: 2;
  blocks: Block[];
}

// 캐릭터 (대사 블록용)
export interface Character {
  id: string;
  name: string;
  profileImage: string | null;
  defaultColor: string;
  description?: string | null;
}

// 헬퍼 함수: 빈 문단 블록 생성
export function createEmptyParagraphBlock(): ParagraphBlock {
  return {
    id: generateBlockId(),
    type: 'paragraph',
    content: [{ text: '' }],
  };
}

// 헬퍼 함수: 블록 ID 생성
export function generateBlockId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 헬퍼 함수: TextNode 배열을 일반 텍스트로 변환
export function textNodesToPlainText(nodes: TextNode[]): string {
  return nodes.map(node => node.text).join('');
}

// 헬퍼 함수: 블록 배열에서 미리보기 텍스트 생성
export function generatePreviewFromBlocks(blocks: Block[], maxLength: number = 150): string {
  const textParts: string[] = [];

  for (const block of blocks) {
    if (textParts.join(' ').length >= maxLength) break;

    switch (block.type) {
      case 'paragraph':
      case 'heading':
      case 'quote':
        textParts.push(textNodesToPlainText(block.content));
        break;
      case 'dialogue':
        for (const line of block.lines) {
          textParts.push(`${line.speaker}: ${textNodesToPlainText(line.content)}`);
        }
        break;
      case 'list':
        textParts.push(textNodesToPlainText(block.content));
        break;
      case 'code':
        textParts.push(block.code.split('\n')[0] || '');
        break;
    }
  }

  const fullText = textParts.join(' ').replace(/\s+/g, ' ').trim();
  return fullText.slice(0, maxLength);
}

// 헬퍼 함수: 블록 배열의 총 글자 수 계산
export function countBlocksCharacters(blocks: Block[]): number {
  let count = 0;

  for (const block of blocks) {
    switch (block.type) {
      case 'paragraph':
      case 'heading':
      case 'quote':
        count += textNodesToPlainText(block.content).length;
        break;
      case 'dialogue':
        for (const line of block.lines) {
          count += line.speaker.length + textNodesToPlainText(line.content).length;
        }
        break;
      case 'list':
        count += textNodesToPlainText(block.content).length;
        break;
      case 'code':
        count += block.code.length;
        break;
    }
  }

  return count;
}
