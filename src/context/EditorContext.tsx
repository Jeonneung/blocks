import React, { createContext, useContext, ReactNode } from 'react';
import { OGData, Character } from '../types/blocks';

// 이미지 컴포넌트 Props
export interface ImageComponentProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

// 에디터 서비스 인터페이스
export interface EditorServices {
  // 이미지 업로드 (Firebase Storage 등 대체)
  uploadImage: (file: File, category: string) => Promise<string>;

  // OG 데이터 조회 (/api/og 대체)
  fetchOGData: (url: string) => Promise<OGData>;

  // 캐릭터 라이브러리 (선택적, Firestore 대체)
  getCharacters?: () => Promise<Character[]>;

  // 이미지 컴포넌트 (next/image 대체)
  ImageComponent?: React.ComponentType<ImageComponentProps>;
}

// Context 생성
const EditorContext = createContext<EditorServices | null>(null);

// Provider Props
interface EditorProviderProps {
  services: EditorServices;
  children: ReactNode;
}

// Provider 컴포넌트
export function EditorProvider({ services, children }: EditorProviderProps) {
  return (
    <EditorContext.Provider value={services}>
      {children}
    </EditorContext.Provider>
  );
}

// Hook: EditorServices 사용
export function useEditorServices(): EditorServices {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditorServices must be used within an EditorProvider');
  }
  return context;
}

// Hook: 선택적 EditorServices 사용 (Provider 없이도 동작)
export function useOptionalEditorServices(): EditorServices | null {
  return useContext(EditorContext);
}

// 기본 이미지 컴포넌트 (next/image가 없을 때 사용)
export function DefaultImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  style,
}: ImageComponentProps) {
  if (fill) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={{
          ...style,
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
    />
  );
}
