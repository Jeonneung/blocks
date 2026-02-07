import React from 'react';
import { ParagraphBlock } from '../../types/blocks';
import { renderTextNodes } from '../../utils/renderTextNodes';

interface ParagraphViewProps {
  block: ParagraphBlock;
}

export default function ParagraphView({ block }: ParagraphViewProps) {
  const isEmpty = block.content.length === 0 ||
    (block.content.length === 1 && !block.content[0].text);

  if (isEmpty) {
    return <p className="h-6" />;
  }

  return (
    <p className="text-gray-800 leading-relaxed">
      {renderTextNodes(block.content)}
    </p>
  );
}
