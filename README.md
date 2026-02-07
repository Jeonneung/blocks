# @buildingbite/blocks

블로그용 블록 기반 리치 텍스트 에디터

## 설치

```bash
npm install @buildingbite/blocks
```

## 사용법

### 1. EditorServices 구현

`EditorServices` 인터페이스를 구현하여 이미지 업로드, OG 데이터 조회 등을 처리합니다.

```tsx
import { EditorServices } from '@buildingbite/blocks';

export const editorServices: EditorServices = {
  // 이미지 업로드
  uploadImage: async (file: File, category: string): Promise<string> => {
    // Firebase Storage 등에 업로드 후 URL 반환
    const url = await uploadToStorage(file, category);
    return url;
  },

  // OG 데이터 조회
  fetchOGData: async (url: string) => {
    const response = await fetch(`/api/og?url=${encodeURIComponent(url)}`);
    return response.json();
  },

  // 캐릭터 라이브러리 (선택적)
  getCharacters: async () => {
    return await fetchCharactersFromDB();
  },

  // 이미지 컴포넌트 (선택적, Next.js의 경우)
  ImageComponent: NextImage,
};
```

### 2. EditorProvider로 감싸기

```tsx
import { EditorProvider, BlockEditor } from '@buildingbite/blocks';
import { editorServices } from '@/lib/editorServices';

function MyEditor() {
  const [blocks, setBlocks] = useState([]);

  return (
    <EditorProvider services={editorServices}>
      <BlockEditor
        initialBlocks={blocks}
        onChange={setBlocks}
        onCharCountChange={(count) => console.log(`글자 수: ${count}`)}
        markdownShortcuts={{ bulletDash: true, divider: true }} // 개별 활성/비활성 가능
      />
    </EditorProvider>
  );
}
```

## 마크다운 단축키

빈 줄 또는 블록의 내용이 비어있을 때 마크다운 기호를 입력하면 자동으로 해당 블록 타입으로 변환됩니다. 모든 writable 블록 타입(paragraph, heading, quote, list)에서 동작합니다.

| 입력 | 변환 |
|------|------|
| `# ` | 제목 H1 |
| `## ` | 제목 H2 |
| `### ` | 제목 H3 |
| `- ` 또는 `* ` | 비순서 목록 |
| `1. ` | 순서 목록 |
| `> ` | 인용문 |
| `---` | 구분선 |

`markdownShortcuts` prop으로 개별 단축키를 비활성화할 수 있습니다:

```tsx
<BlockEditor
  markdownShortcuts={{
    heading1: true,     // # → H1 (기본: true)
    heading2: true,     // ## → H2 (기본: true)
    heading3: true,     // ### → H3 (기본: true)
    bulletDash: false,   // - → 비순서 목록 비활성화
    bulletAsterisk: true,// * → 비순서 목록 (기본: true)
    orderedList: true,   // 1. → 순서 목록 (기본: true)
    quote: true,         // > → 인용문 (기본: true)
    divider: true,       // --- → 구분선 (기본: true)
  }}
/>
```

## BlockViewer (읽기 전용 뷰어)

에디터에서 작성한 블록 데이터를 읽기 전용으로 렌더링합니다. 블로그 게시물 본문 표시 등에 사용합니다.

### 기본 사용법

```tsx
import { BlockViewer } from '@buildingbite/blocks';

function PostBody({ blocks }: { blocks: Block[] }) {
  return <BlockViewer blocks={blocks} className="prose" />;
}
```

`BlockViewer`는 `EditorProvider` 없이도 동작합니다. 이미지는 기본 `<img>` 태그로 렌더링됩니다.

### Next.js Image 등 커스텀 이미지 컴포넌트 사용

`EditorProvider`로 감싸면 `ImageComponent`를 주입할 수 있습니다:

```tsx
import { BlockViewer, EditorProvider } from '@buildingbite/blocks';
import NextImage from 'next/image';

function PostBody({ blocks }: { blocks: Block[] }) {
  return (
    <EditorProvider services={{
      uploadImage: async () => '',   // 뷰어에서는 미사용
      fetchOGData: async () => ({}), // 뷰어에서는 미사용
      ImageComponent: NextImage,
    }}>
      <BlockViewer blocks={blocks} />
    </EditorProvider>
  );
}
```

### renderTextNodes 유틸리티

`TextNode[]`를 서식이 적용된 React 노드로 변환하는 헬퍼 함수입니다. 커스텀 렌더러를 만들 때 사용할 수 있습니다:

```tsx
import { renderTextNodes, TextNode } from '@buildingbite/blocks';

function CustomParagraph({ content }: { content: TextNode[] }) {
  return <p className="my-custom-class">{renderTextNodes(content)}</p>;
}
```

### 지원 블록 타입

BlockViewer는 에디터의 모든 블록 타입을 지원합니다:

| 블록 타입 | 설명 |
|-----------|------|
| `paragraph` | 일반 텍스트 (bold/italic/underline/strikethrough/link) |
| `heading` | 제목 (H1, H2, H3) |
| `image` | 단일 이미지 (정렬, 캡션) |
| `image-gallery` | 이미지 갤러리 (그리드/가로스크롤/메이슨리 + 라이트박스) |
| `link-card` | OG 미리보기 카드 |
| `link-embed` | YouTube iframe / Twitter 링크 / 일반 링크 |
| `dialogue` | 대사 (채팅/희극 스타일) |
| `divider` | 구분선 (실선/짧은선/점/커스텀 이미지) |
| `quote` | 인용문 (출처 포함) |
| `list` | 목록 (순서/비순서, 자동 번호 매기기) |
| `code` | 코드 블록 (Prism.js 구문 강조, 18개 언어) |

## 블록 타입

- `paragraph` - 일반 텍스트
- `heading` - 제목 (H1, H2, H3)
- `image` - 단일 이미지
- `image-gallery` - 이미지 갤러리
- `link-card` - OG 미리보기 카드
- `link-embed` - YouTube/Twitter 임베드
- `dialogue` - 대사 (채팅/희극 스타일)
- `divider` - 구분선
- `quote` - 인용문
- `list` - 목록
- `code` - 코드 블록 (구문 강조)

## 헬퍼 함수

```tsx
import {
  createEmptyParagraphBlock,
  generateBlockId,
  textNodesToPlainText,
  generatePreviewFromBlocks,
  countBlocksCharacters,
} from '@buildingbite/blocks';

// 빈 문단 블록 생성
const newBlock = createEmptyParagraphBlock();

// 블록 ID 생성
const id = generateBlockId();

// 블록에서 미리보기 텍스트 생성
const preview = generatePreviewFromBlocks(blocks, 150);

// 총 글자 수 계산
const charCount = countBlocksCharacters(blocks);
```

## 의존성

- React 19+
- Tailwind CSS 4+ (소비 앱에서 설정 필요)
- @dnd-kit/core (드래그 앤 드롭)
- lucide-react (아이콘)

### Tailwind CSS 설정

이 라이브러리는 Tailwind CSS 클래스를 사용합니다. 소비 앱에서 Tailwind CSS를 설정하고 라이브러리 소스를 content 스캔에 포함해야 합니다:

```css
/* index.css */
@import "tailwindcss";
@source "node_modules/@buildingbite/blocks/src/**/*.tsx";
```

## 라이선스

MIT
