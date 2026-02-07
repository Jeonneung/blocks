import React, { useState } from 'react';
import { DividerBlock } from '../types/blocks';
import { useEditorServices, DefaultImage } from '../context/EditorContext';
import { Minus, MoreHorizontal, Image as ImageIcon, X, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface DividerEditorProps {
  block: DividerBlock;
  onUpdate: (updates: Partial<DividerBlock>) => void;
}

export default function DividerEditor({ block, onUpdate }: DividerEditorProps) {
  const [uploading, setUploading] = useState(false);
  const services = useEditorServices();
  const ImageComponent = services.ImageComponent || DefaultImage;

  const handleVariantChange = (variant: DividerBlock['variant']) => {
    const alignment = variant === 'line' ? undefined : (block.alignment || 'center');
    onUpdate({ variant, customImage: variant === 'custom-image' ? block.customImage : undefined, alignment });
  };

  const handleAlignmentChange = (alignment: DividerBlock['alignment']) => {
    onUpdate({ alignment });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await services.uploadImage(file, 'divider');
      onUpdate({ variant: 'custom-image', customImage: url, alignment: block.alignment || 'center' });
    } catch (error) {
      console.error('Image upload error:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onUpdate({ variant: 'line', customImage: undefined, alignment: undefined });
  };

  // 구분선 미리보기 렌더링
  const renderDivider = () => {
    const alignClass = block.alignment === 'left' ? 'justify-start' :
                       block.alignment === 'right' ? 'justify-end' : 'justify-center';

    switch (block.variant) {
      case 'line':
        return <hr className="border-t border-black" />;

      case 'short-line':
        return (
          <div className={`flex ${alignClass}`}>
            <hr className="border-t border-black w-1/5" />
          </div>
        );

      case 'dots':
        return (
          <div className={`flex items-center ${alignClass} gap-2`}>
            <span className="w-1 h-1 bg-black rounded-full"></span>
            <span className="w-1 h-1 bg-black rounded-full"></span>
            <span className="w-1 h-1 bg-black rounded-full"></span>
          </div>
        );

      case 'custom-image':
        if (block.customImage) {
          return (
            <div className={`flex ${alignClass}`}>
              <div className="relative w-12 h-12">
                <ImageComponent
                  src={block.customImage}
                  alt="구분선"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          );
        }
        return <hr className="border-t border-black" />;

      default:
        return <hr className="border-t border-black" />;
    }
  };

  const showAlignment = block.variant !== 'line';

  return (
    <div className="space-y-3">
      {/* 스타일 선택 - 작은 슬라이드 바 형태 */}
      <div className="flex items-center justify-center gap-1">
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => handleVariantChange('line')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              block.variant === 'line'
                ? 'bg-white shadow text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            title="직선"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={() => handleVariantChange('short-line')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              block.variant === 'short-line'
                ? 'bg-white shadow text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            title="짧은 선"
          >
            <span className="inline-block w-3 border-t border-current"></span>
          </button>
          <button
            onClick={() => handleVariantChange('dots')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              block.variant === 'dots'
                ? 'bg-white shadow text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            title="점"
          >
            <MoreHorizontal size={14} />
          </button>
          <label
            className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
              block.variant === 'custom-image'
                ? 'bg-white shadow text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            title="커스텀 이미지"
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
            {uploading ? (
              <div className="w-3.5 h-3.5 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <ImageIcon size={14} />
            )}
          </label>
        </div>

        {/* 정렬 옵션 (line 제외) */}
        {showAlignment && (
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5 ml-2">
            <button
              onClick={() => handleAlignmentChange('left')}
              className={`px-1.5 py-1 rounded text-xs transition-colors ${
                block.alignment === 'left'
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="왼쪽"
            >
              <AlignLeft size={12} />
            </button>
            <button
              onClick={() => handleAlignmentChange('center')}
              className={`px-1.5 py-1 rounded text-xs transition-colors ${
                (!block.alignment || block.alignment === 'center')
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="가운데"
            >
              <AlignCenter size={12} />
            </button>
            <button
              onClick={() => handleAlignmentChange('right')}
              className={`px-1.5 py-1 rounded text-xs transition-colors ${
                block.alignment === 'right'
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="오른쪽"
            >
              <AlignRight size={12} />
            </button>
          </div>
        )}
      </div>

      {/* 커스텀 이미지 삭제 버튼 */}
      {block.variant === 'custom-image' && block.customImage && (
        <div className="flex items-center justify-center">
          <button
            onClick={handleRemoveImage}
            className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"
            title="이미지 삭제"
          >
            <X size={12} />
            <span>이미지 제거</span>
          </button>
        </div>
      )}

      {/* 미리보기 */}
      <div className="py-4">
        {renderDivider()}
      </div>
    </div>
  );
}
