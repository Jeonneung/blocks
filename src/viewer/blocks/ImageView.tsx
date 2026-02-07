import React from 'react';
import { ImageBlock } from '../../types/blocks';
import { useOptionalEditorServices, DefaultImage } from '../../context/EditorContext';

interface ImageViewProps {
  block: ImageBlock;
}

export default function ImageView({ block }: ImageViewProps) {
  const services = useOptionalEditorServices();
  const ImageComp = services?.ImageComponent || DefaultImage;

  if (!block.image.url) {
    return null;
  }

  const alignmentClasses = {
    left: 'mr-auto',
    center: 'mx-auto',
    right: 'ml-auto',
    'full-width': 'w-full',
  };

  const sizeClasses = {
    left: 'max-w-lg',
    center: 'max-w-2xl',
    right: 'max-w-lg',
    'full-width': 'w-full',
  };

  return (
    <figure className={`${alignmentClasses[block.alignment]} ${sizeClasses[block.alignment]}`}>
      <div className="relative aspect-video overflow-hidden rounded-lg">
        <ImageComp
          src={block.image.url}
          alt={block.image.alt || ''}
          fill
          className="object-contain"
        />
      </div>
      {block.image.caption && (
        <figcaption className="mt-2 text-sm text-gray-500 text-center">
          {block.image.caption}
        </figcaption>
      )}
    </figure>
  );
}
