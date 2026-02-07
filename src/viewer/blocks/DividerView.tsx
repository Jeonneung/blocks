import React from 'react';
import { DividerBlock } from '../../types/blocks';
import { useOptionalEditorServices, DefaultImage } from '../../context/EditorContext';

interface DividerViewProps {
  block: DividerBlock;
}

export default function DividerView({ block }: DividerViewProps) {
  const services = useOptionalEditorServices();
  const ImageComp = services?.ImageComponent || DefaultImage;

  const alignClass = block.alignment === 'left' ? 'justify-start' :
                     block.alignment === 'right' ? 'justify-end' : 'justify-center';

  switch (block.variant) {
    case 'line':
      return <hr className="border-t border-black my-8" />;

    case 'short-line':
      return (
        <div className={`flex ${alignClass} my-8`}>
          <hr className="border-t border-black w-1/5" />
        </div>
      );

    case 'dots':
      return (
        <div className={`flex items-center ${alignClass} gap-3 my-8`}>
          <span className="w-1 h-1 bg-black rounded-full"></span>
          <span className="w-1 h-1 bg-black rounded-full"></span>
          <span className="w-1 h-1 bg-black rounded-full"></span>
        </div>
      );

    case 'custom-image':
      if (block.customImage) {
        return (
          <div className={`flex ${alignClass} my-8`}>
            <div className="relative w-16 h-16">
              <ImageComp
                src={block.customImage}
                alt=""
                fill
                className="object-contain"
              />
            </div>
          </div>
        );
      }
      return <hr className="border-t border-black my-8" />;

    default:
      return <hr className="border-t border-black my-8" />;
  }
}
