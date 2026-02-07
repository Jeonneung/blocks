import React, { useRef, useState, useEffect } from 'react';
import { DialogueBlock, DialogueLine, TextNode, Character } from '../types/blocks';
import { useEditorServices, DefaultImage } from '../context/EditorContext';
import { Plus, X, MessageCircle, Theater, User, Loader2, AlignLeft, AlignRight } from 'lucide-react';

interface DialogueEditorProps {
  block: DialogueBlock;
  onUpdate: (updates: Partial<DialogueBlock>) => void;
}

// 기본 말풍선 색상 팔레트
const BUBBLE_COLORS = [
  '#FEE500', // 카카오 노란색
  '#A8D8EA', // 하늘색
  '#FFB7B2', // 연분홍
  '#BAFFC9', // 연두색
  '#E2D1F9', // 연보라
  '#FFFFFF', // 흰색
];

export default function DialogueEditor({ block, onUpdate }: DialogueEditorProps) {
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [uploadingIndices, setUploadingIndices] = useState<Set<number>>(new Set());
  const [characters, setCharacters] = useState<Character[]>([]);
  const [showProfileMenu, setShowProfileMenu] = useState<number | null>(null);

  const services = useEditorServices();
  const ImageComponent = services.ImageComponent || DefaultImage;

  // 캐릭터 라이브러리 로드
  useEffect(() => {
    if (services.getCharacters) {
      services.getCharacters().then(setCharacters).catch(console.error);
    }
  }, [services]);

  // 메뉴 바깥 클릭시 닫기
  useEffect(() => {
    if (showProfileMenu === null) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.profile-menu-container')) {
        setShowProfileMenu(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showProfileMenu]);

  // 캐릭터 선택 핸들러
  const handleSelectCharacter = (index: number, character: Character) => {
    handleUpdateLine(index, {
      speaker: character.name,
      profileImage: character.profileImage || undefined,
      speakerColor: character.defaultColor,
    });
    setShowProfileMenu(null);
  };

  const handleAddLine = () => {
    const newLine: DialogueLine = {
      speaker: '',
      content: [{ text: '' }],
      speakerColor: block.style === 'chat' ? '#FEE500' : undefined,
      alignment: 'left',
    };
    onUpdate({
      lines: [...block.lines, newLine],
    });
  };

  const handleRemoveLine = (index: number) => {
    if (block.lines.length <= 1) return;
    const newLines = block.lines.filter((_, i) => i !== index);
    onUpdate({ lines: newLines });
  };

  const handleUpdateLine = (index: number, updates: Partial<DialogueLine>) => {
    const newLines = block.lines.map((line, i) =>
      i === index ? { ...line, ...updates } : line
    );
    onUpdate({ lines: newLines });
  };

  const handleSpeakerChange = (index: number, speaker: string) => {
    // 같은 화자가 이미 있는지 확인하여 프로필과 색상 자동 복사
    const existingLine = block.lines.find(
      (line, i) => i !== index && line.speaker.trim().toLowerCase() === speaker.trim().toLowerCase() && line.speaker.trim() !== ''
    );

    if (existingLine && speaker.trim() !== '') {
      // 같은 화자가 있으면 프로필 이미지와 색상 복사
      handleUpdateLine(index, {
        speaker,
        profileImage: existingLine.profileImage,
        speakerColor: existingLine.speakerColor,
      });
    } else {
      handleUpdateLine(index, { speaker });
    }
  };

  const handleContentChange = (index: number, text: string) => {
    handleUpdateLine(index, { content: [{ text }] });
  };

  const handleColorChange = (index: number, color: string) => {
    handleUpdateLine(index, { speakerColor: color || undefined });
  };

  const handleAlignmentChange = (index: number, alignment: 'left' | 'right') => {
    handleUpdateLine(index, { alignment });
  };

  const handleProfileImageUpload = async (index: number, file: File) => {
    setUploadingIndices(prev => new Set(prev).add(index));

    try {
      const url = await services.uploadImage(file, 'profile');
      handleUpdateLine(index, { profileImage: url });
    } catch (error) {
      console.error('Profile image upload error:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploadingIndices(prev => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  };

  const handleRemoveProfileImage = (index: number) => {
    handleUpdateLine(index, { profileImage: undefined });
  };

  const handleStyleChange = (style: DialogueBlock['style']) => {
    const updatedLines = block.lines.map(line => ({
      ...line,
      speakerColor: style === 'chat' ? (line.speakerColor || '#FEE500') : undefined,
      alignment: style === 'chat' ? (line.alignment || 'left') : undefined,
    }));
    onUpdate({ style, lines: updatedLines });
  };

  const getLineText = (nodes: TextNode[]): string => {
    return nodes.map(node => node.text).join('');
  };

  // 채팅 스타일 에디터
  const renderChatEditor = (line: DialogueLine, index: number) => {
    const isUploading = uploadingIndices.has(index);
    const isRight = line.alignment === 'right';

    return (
      <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
        {/* 상단: 정렬 버튼 + 화자 이름 + 색상 */}
        <div className="flex items-center gap-2">
          {/* 정렬 버튼 */}
          <div className="flex items-center gap-0.5 bg-gray-200 rounded p-0.5">
            <button
              onClick={() => handleAlignmentChange(index, 'left')}
              className={`p-1 rounded ${!isRight ? 'bg-white shadow' : 'hover:bg-gray-300'}`}
              title="왼쪽 정렬"
            >
              <AlignLeft size={14} />
            </button>
            <button
              onClick={() => handleAlignmentChange(index, 'right')}
              className={`p-1 rounded ${isRight ? 'bg-white shadow' : 'hover:bg-gray-300'}`}
              title="오른쪽 정렬"
            >
              <AlignRight size={14} />
            </button>
          </div>

          {/* 화자 이름 */}
          <input
            type="text"
            value={line.speaker}
            onChange={(e) => handleSpeakerChange(index, e.target.value)}
            placeholder="화자 이름"
            className="flex-1 px-2 py-1 text-sm font-medium border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-gray-200"
          />

          {/* 말풍선 색상 선택 */}
          <div className="flex items-center gap-1">
            {BUBBLE_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(index, color)}
                className={`w-5 h-5 rounded-full border-2 transition-transform ${
                  line.speakerColor === color ? 'border-gray-600 scale-110' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>

          {/* 삭제 버튼 */}
          <button
            onClick={() => handleRemoveLine(index)}
            disabled={block.lines.length <= 1}
            className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
            title="대사 삭제"
          >
            <X size={16} />
          </button>
        </div>

        {/* 하단: 프로필 + 말풍선 (정렬에 따라) */}
        <div className={`flex items-start gap-2 ${isRight ? 'flex-row-reverse' : ''}`}>
          {/* 프로필 이미지 */}
          <div className="flex-shrink-0 relative profile-menu-container">
            <input
              type="file"
              accept="image/*"
              ref={el => { fileInputRefs.current[index] = el; }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleProfileImageUpload(index, file);
                e.target.value = '';
                setShowProfileMenu(null);
              }}
              className="hidden"
            />

            {isUploading ? (
              <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full">
                <Loader2 size={16} className="text-gray-400 animate-spin" />
              </div>
            ) : line.profileImage ? (
              <div className="relative w-10 h-10">
                <ImageComponent
                  src={line.profileImage}
                  alt={line.speaker || '프로필'}
                  fill
                  className="rounded-full object-cover cursor-pointer"
                />
                <button
                  onClick={() => handleRemoveProfileImage(index)}
                  className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600 z-10"
                >
                  <X size={10} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowProfileMenu(showProfileMenu === index ? null : index)}
                className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
              >
                <User size={16} className="text-gray-400" />
              </button>
            )}

            {/* 프로필 메뉴 */}
            {showProfileMenu === index && (
              <div className="absolute top-full mt-1 left-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]">
                {/* 이미지 업로드 옵션 */}
                <button
                  onClick={() => {
                    fileInputRefs.current[index]?.click();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-left text-sm"
                >
                  <User size={16} className="text-gray-500" />
                  <span>프로필 사진 설정</span>
                </button>

                {/* 캐릭터 선택 (캐릭터가 있을 때만) */}
                {characters.length > 0 && (
                  <>
                    <div className="border-t border-gray-100 my-1" />
                    <div className="px-3 py-1 text-xs text-gray-500">캐릭터 선택</div>
                    <div className="max-h-40 overflow-y-auto">
                      {characters.map((char) => (
                        <button
                          key={char.id}
                          onClick={() => handleSelectCharacter(index, char)}
                          className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-left"
                        >
                          {char.profileImage ? (
                            <ImageComponent
                              src={char.profileImage}
                              alt={char.name}
                              width={20}
                              height={20}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                              style={{ backgroundColor: char.defaultColor }}
                            >
                              {char.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="text-sm truncate flex-1">{char.name}</span>
                          <div
                            className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0"
                            style={{ backgroundColor: char.defaultColor }}
                          />
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 말풍선 */}
          <div
            className={`flex-1 px-3 py-2 rounded-lg ${isRight ? 'ml-8' : 'mr-8'}`}
            style={{ backgroundColor: line.speakerColor || '#FEE500' }}
          >
            <textarea
              value={getLineText(line.content)}
              onChange={(e) => handleContentChange(index, e.target.value)}
              placeholder="대사를 입력하세요..."
              rows={2}
              className="w-full bg-transparent text-sm resize-none focus:outline-none"
              style={{ color: isLightColor(line.speakerColor || '#FEE500') ? '#000' : '#fff' }}
            />
          </div>
        </div>
      </div>
    );
  };

  // 희극 스타일 에디터 (심플)
  const renderSimpleEditor = (line: DialogueLine, index: number) => (
    <div key={index} className="flex items-start gap-3">
      <input
        type="text"
        value={line.speaker}
        onChange={(e) => handleSpeakerChange(index, e.target.value)}
        placeholder="화자"
        className="w-24 px-2 py-1.5 text-sm font-bold border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-gray-200"
      />
      <textarea
        value={getLineText(line.content)}
        onChange={(e) => handleContentChange(index, e.target.value)}
        placeholder="대사를 입력하세요..."
        rows={1}
        className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none"
      />
      <button
        onClick={() => handleRemoveLine(index)}
        disabled={block.lines.length <= 1}
        className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
        title="대사 삭제"
      >
        <X size={16} />
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* 스타일 선택 */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">스타일:</span>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => handleStyleChange('chat')}
            className={`p-1.5 rounded flex items-center gap-1 text-sm ${
              block.style === 'chat' ? 'bg-white shadow' : 'hover:bg-gray-200'
            }`}
            title="채팅 스타일"
          >
            <MessageCircle size={14} />
            <span>채팅</span>
          </button>
          <button
            onClick={() => handleStyleChange('play')}
            className={`p-1.5 rounded flex items-center gap-1 text-sm ${
              block.style === 'play' ? 'bg-white shadow' : 'hover:bg-gray-200'
            }`}
            title="희극 스타일"
          >
            <Theater size={14} />
            <span>희극</span>
          </button>
        </div>
      </div>

      {/* 대사 라인 목록 */}
      <div className="space-y-3">
        {block.lines.map((line, index) =>
          block.style === 'chat'
            ? renderChatEditor(line, index)
            : renderSimpleEditor(line, index)
        )}
      </div>

      {/* 대사 추가 버튼 */}
      <button
        onClick={handleAddLine}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors flex items-center justify-center gap-1"
      >
        <Plus size={16} />
        <span className="text-sm">대사 추가</span>
      </button>
    </div>
  );
}

function isLightColor(hexColor: string): boolean {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}
