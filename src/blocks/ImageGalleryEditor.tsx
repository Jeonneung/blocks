import React, { useState } from 'react';
import { ImageGalleryBlock, ImageData } from '../types/blocks';
import { useEditorServices, DefaultImage } from '../context/EditorContext';
import { Upload, X, Grid, MoveHorizontal, LayoutGrid } from 'lucide-react';

interface ImageGalleryEditorProps {
  block: ImageGalleryBlock;
  onUpdate: (updates: Partial<ImageGalleryBlock>) => void;
}

export default function ImageGalleryEditor({ block, onUpdate }: ImageGalleryEditorProps) {
  const [uploading, setUploading] = useState(false);
  const services = useEditorServices();
  const ImageComponent = services.ImageComponent || DefaultImage;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const uploadedImages: ImageData[] = [];

      for (const file of Array.from(files)) {
        const url = await services.uploadImage(file, 'gallery');
        uploadedImages.push({
          url,
          alt: '',
          caption: '',
        });
      }

      onUpdate({
        images: [...block.images, ...uploadedImages],
      });
    } catch (error) {
      console.error('Image upload error:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = block.images.filter((_, i) => i !== index);
    onUpdate({ images: newImages });
  };

  const handleLayoutChange = (layout: ImageGalleryBlock['layout']) => {
    onUpdate({ layout });
  };

  const handleColumnsChange = (columns: 2 | 3 | 4) => {
    onUpdate({ columns });
  };

  const handleImageCaptionChange = (index: number, caption: string) => {
    const newImages = [...block.images];
    newImages[index] = { ...newImages[index], caption };
    onUpdate({ images: newImages });
  };

  return (
    <div className="space-y-4">
      {/* 레이아웃 선택 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => handleLayoutChange('grid')}
            className={`p-2 rounded flex items-center gap-1 text-sm ${
              block.layout === 'grid' ? 'bg-white shadow' : 'hover:bg-gray-200'
            }`}
            title="그리드"
          >
            <Grid size={16} />
            <span>그리드</span>
          </button>
          <button
            onClick={() => handleLayoutChange('horizontal-scroll')}
            className={`p-2 rounded flex items-center gap-1 text-sm ${
              block.layout === 'horizontal-scroll' ? 'bg-white shadow' : 'hover:bg-gray-200'
            }`}
            title="가로 스크롤"
          >
            <MoveHorizontal size={16} />
            <span>가로 스크롤</span>
          </button>
          <button
            onClick={() => handleLayoutChange('masonry')}
            className={`p-2 rounded flex items-center gap-1 text-sm ${
              block.layout === 'masonry' ? 'bg-white shadow' : 'hover:bg-gray-200'
            }`}
            title="매소니"
          >
            <LayoutGrid size={16} />
            <span>매소니</span>
          </button>
        </div>

        {/* 열 수 (그리드/매소니에서만) */}
        {(block.layout === 'grid' || block.layout === 'masonry') && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">열:</span>
            <select
              value={block.columns || 2}
              onChange={(e) => handleColumnsChange(parseInt(e.target.value) as 2 | 3 | 4)}
              className="px-2 py-1 border border-gray-200 rounded text-sm"
            >
              <option value={2}>2열</option>
              <option value={3}>3열</option>
              <option value={4}>4열</option>
            </select>
          </div>
        )}
      </div>

      {/* 이미지 그리드 */}
      {block.images.length > 0 && (
        <div
          className={`grid gap-2 ${
            block.layout === 'horizontal-scroll'
              ? 'grid-flow-col auto-cols-[200px] overflow-x-auto pb-2'
              : block.columns === 2
              ? 'grid-cols-2'
              : block.columns === 3
              ? 'grid-cols-3'
              : 'grid-cols-4'
          }`}
        >
          {block.images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="relative aspect-square">
                <ImageComponent
                  src={image.url}
                  alt={image.alt || ''}
                  fill
                  className="object-cover rounded-lg"
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
              <input
                type="text"
                value={image.caption || ''}
                onChange={(e) => handleImageCaptionChange(index, e.target.value)}
                placeholder="캡션"
                className="w-full mt-1 px-2 py-1 text-xs border border-gray-200 rounded"
              />
            </div>
          ))}
        </div>
      )}

      {/* 이미지 추가 버튼 */}
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
        <input
          type="file"
          accept="image/*"
          multiple
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
            <span className="text-sm text-gray-500">이미지 추가 (여러 개 선택 가능)</span>
          </div>
        )}
      </label>
    </div>
  );
}
