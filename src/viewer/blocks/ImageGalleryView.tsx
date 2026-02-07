import React, { useState } from 'react';
import { ImageGalleryBlock } from '../../types/blocks';
import { useOptionalEditorServices, DefaultImage } from '../../context/EditorContext';

interface ImageGalleryViewProps {
  block: ImageGalleryBlock;
}

export default function ImageGalleryView({ block }: ImageGalleryViewProps) {
  const services = useOptionalEditorServices();
  const ImageComp = services?.ImageComponent || DefaultImage;

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!block.images || block.images.length === 0) {
    return null;
  }

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? block.images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === block.images.length - 1 ? 0 : prev + 1));
  };

  const getGridClasses = () => {
    if (block.layout === 'horizontal-scroll') {
      return 'flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory';
    }

    const cols = block.columns || 2;
    const colClasses = {
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
    };

    return `grid gap-2 ${colClasses[cols]}`;
  };

  return (
    <>
      <div className={getGridClasses()}>
        {block.images.map((image, index) => (
          <div
            key={index}
            onClick={() => openLightbox(index)}
            className={`
              relative cursor-pointer overflow-hidden rounded-lg group
              ${block.layout === 'horizontal-scroll' ? 'flex-shrink-0 w-64 snap-start' : ''}
              ${block.layout === 'masonry' ? 'break-inside-avoid' : ''}
            `}
          >
            <div className={`relative ${block.layout === 'horizontal-scroll' ? 'h-48' : 'aspect-square'}`}>
              <ImageComp
                src={image.url}
                alt={image.alt || ''}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
            {image.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <p className="text-white text-sm">{image.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 라이트박스 */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* 닫기 버튼 */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full"
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* 이전 버튼 */}
          {block.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrev();
              }}
              className="absolute left-4 p-2 text-white hover:bg-white/10 rounded-full"
              aria-label="Previous"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          {/* 이미지 */}
          <div
            className="relative max-w-4xl max-h-[80vh] w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <ImageComp
              src={block.images[currentIndex].url}
              alt={block.images[currentIndex].alt || ''}
              fill
              className="object-contain"
            />
          </div>

          {/* 다음 버튼 */}
          {block.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 p-2 text-white hover:bg-white/10 rounded-full"
              aria-label="Next"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}

          {/* 캡션 및 인덱스 */}
          <div className="absolute bottom-4 left-0 right-0 text-center text-white">
            {block.images[currentIndex].caption && (
              <p className="mb-2">{block.images[currentIndex].caption}</p>
            )}
            <p className="text-sm text-white/60">
              {currentIndex + 1} / {block.images.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
