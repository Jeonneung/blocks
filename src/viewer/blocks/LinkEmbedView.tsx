import React from 'react';
import { LinkEmbedBlock } from '../../types/blocks';

interface LinkEmbedViewProps {
  block: LinkEmbedBlock;
}

export default function LinkEmbedView({ block }: LinkEmbedViewProps) {
  if (!block.url) {
    return null;
  }

  switch (block.embedType) {
    case 'youtube':
      if (block.videoId) {
        return (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${block.videoId}`}
              title="YouTube video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        );
      }
      break;

    case 'twitter':
      return (
        <a
          href={block.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
        >
          <div className="flex items-center gap-2 text-gray-600">
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="currentColor"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span className="text-sm">Twitter/X에서 보기</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </div>
          <p className="mt-2 text-sm text-gray-500 truncate">{block.url}</p>
        </a>
      );

    case 'generic':
    default:
      return (
        <a
          href={block.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
        >
          <div className="flex items-center gap-2 text-gray-600">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            <span className="text-sm">외부 링크</span>
          </div>
          <p className="mt-2 text-sm text-gray-500 truncate">{block.url}</p>
        </a>
      );
  }

  return null;
}
