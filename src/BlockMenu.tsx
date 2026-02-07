import React, { useEffect, useRef } from 'react';
import { Block } from './types/blocks';
import {
  Type,
  Heading2,
  Quote,
  List,
  Image,
  Images,
  Link2,
  Youtube,
  MessageSquare,
  Minus,
  Code,
  FileUp,
} from 'lucide-react';

interface BlockMenuProps {
  position: { x: number; y: number };
  onClose: () => void;
  onSelect: (type: Block['type']) => void;
  onImportFile?: () => void;
}

interface MenuItem {
  type: Block['type'] | 'heading1' | 'heading2' | 'heading3' | 'bullet-list' | 'ordered-list';
  icon: React.ReactNode;
  label: string;
  description: string;
  category: 'basic' | 'advanced';
}

const menuItems: MenuItem[] = [
  {
    type: 'paragraph',
    icon: <Type size={20} />,
    label: '본문',
    description: '일반 텍스트',
    category: 'basic',
  },
  {
    type: 'heading',
    icon: <Heading2 size={20} />,
    label: '제목',
    description: '섹션 제목',
    category: 'basic',
  },
  {
    type: 'quote',
    icon: <Quote size={20} />,
    label: '인용문',
    description: '인용 텍스트',
    category: 'basic',
  },
  {
    type: 'list',
    icon: <List size={20} />,
    label: '목록',
    description: '글머리 목록',
    category: 'basic',
  },
  {
    type: 'divider',
    icon: <Minus size={20} />,
    label: '구분선',
    description: '섹션 구분',
    category: 'basic',
  },
  {
    type: 'code',
    icon: <Code size={20} />,
    label: '코드',
    description: '코드 블록',
    category: 'basic',
  },
  {
    type: 'image',
    icon: <Image size={20} />,
    label: '이미지',
    description: '단일 이미지',
    category: 'basic',
  },
  {
    type: 'image-gallery',
    icon: <Images size={20} />,
    label: '이미지 갤러리',
    description: '여러 이미지 그리드/슬라이드',
    category: 'advanced',
  },
  {
    type: 'link-card',
    icon: <Link2 size={20} />,
    label: '링크 카드',
    description: 'OG 미리보기 카드',
    category: 'advanced',
  },
  {
    type: 'link-embed',
    icon: <Youtube size={20} />,
    label: '임베드',
    description: 'YouTube, Twitter 등',
    category: 'advanced',
  },
  {
    type: 'dialogue',
    icon: <MessageSquare size={20} />,
    label: '대사',
    description: '캐릭터 대화',
    category: 'advanced',
  },
];

export default function BlockMenu({ position, onClose, onSelect, onImportFile }: BlockMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleSelect = (item: MenuItem) => {
    onSelect(item.type as Block['type']);
  };

  // 화면 경계를 고려한 위치 계산
  const adjustedPosition = {
    x: Math.min(position.x, typeof window !== 'undefined' ? window.innerWidth - 280 : position.x),
    y: Math.min(position.y, typeof window !== 'undefined' ? window.innerHeight - 400 : position.y),
  };

  const basicItems = menuItems.filter(item => item.category === 'basic');
  const advancedItems = menuItems.filter(item => item.category === 'advanced');

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white rounded-xl shadow-xl border border-gray-200 py-2 w-64 max-h-96 overflow-y-auto"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      <div className="px-3 py-2">
        <p className="text-xs font-medium text-gray-400 uppercase">블록 추가</p>
      </div>

      <div className="divide-y divide-gray-100">
        {/* 기본 블록 */}
        <div className="py-1">
          <p className="px-3 py-1 text-xs text-gray-400">기본</p>
          {basicItems.map((item) => (
            <button
              key={item.type}
              onClick={() => handleSelect(item)}
              className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors"
            >
              <div className="text-gray-500">{item.icon}</div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* 고급 블록 */}
        <div className="py-1">
          <p className="px-3 py-1 text-xs text-gray-400">고급</p>
          {advancedItems.map((item) => (
            <button
              key={item.type}
              onClick={() => handleSelect(item)}
              className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors"
            >
              <div className="text-gray-500">{item.icon}</div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* 파일 가져오기 */}
        {onImportFile && (
          <div className="py-1">
            <p className="px-3 py-1 text-xs text-gray-400">가져오기</p>
            <button
              onClick={() => {
                onImportFile();
                onClose();
              }}
              className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors"
            >
              <div className="text-gray-500"><FileUp size={20} /></div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">파일 가져오기</p>
                <p className="text-xs text-gray-500">.md, .docx, .ipynb</p>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
