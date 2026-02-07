import React from 'react';
import { HeadingBlock } from '../../types/blocks';
import { renderTextNodes } from '../../utils/renderTextNodes';

interface HeadingViewProps {
  block: HeadingBlock;
}

export default function HeadingView({ block }: HeadingViewProps) {
  const content = renderTextNodes(block.content);

  switch (block.level) {
    case 1:
      return (
        <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4">
          {content}
        </h1>
      );
    case 2:
      return (
        <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">
          {content}
        </h2>
      );
    case 3:
      return (
        <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">
          {content}
        </h3>
      );
    default:
      return (
        <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">
          {content}
        </h2>
      );
  }
}
