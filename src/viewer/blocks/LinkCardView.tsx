import React from 'react';
import { LinkCardBlock } from '../../types/blocks';
import { useOptionalEditorServices, DefaultImage } from '../../context/EditorContext';

interface LinkCardViewProps {
  block: LinkCardBlock;
}

export default function LinkCardView({ block }: LinkCardViewProps) {
  const services = useOptionalEditorServices();
  const ImageComp = services?.ImageComponent || DefaultImage;

  if (!block.url) {
    return null;
  }

  let hostname = '';
  try {
    hostname = new URL(block.url).hostname;
  } catch {
    hostname = block.url;
  }

  return (
    <a
      href={block.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all"
    >
      <div className="flex">
        {/* 이미지 */}
        {block.ogData?.image && (
          <div className="relative w-40 flex-shrink-0 bg-gray-100">
            <div className="absolute inset-0">
              <ImageComp
                src={block.ogData.image}
                alt=""
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        {/* 텍스트 정보 */}
        <div className="flex-1 p-4">
          {block.ogData?.siteName && (
            <p className="text-xs text-gray-500 mb-1">{block.ogData.siteName}</p>
          )}
          <h4 className="font-medium text-gray-900 line-clamp-2 mb-1">
            {block.ogData?.title || block.url}
          </h4>
          {block.ogData?.description && (
            <p className="text-sm text-gray-500 line-clamp-2">
              {block.ogData.description}
            </p>
          )}
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            <span className="truncate">{hostname}</span>
          </div>
        </div>
      </div>
    </a>
  );
}
