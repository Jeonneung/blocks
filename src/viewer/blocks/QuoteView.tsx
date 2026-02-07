import React from 'react';
import { QuoteBlock } from '../../types/blocks';
import { renderTextNodes } from '../../utils/renderTextNodes';

interface QuoteViewProps {
  block: QuoteBlock;
}

export default function QuoteView({ block }: QuoteViewProps) {
  return (
    <blockquote className="border-l-4 border-gray-300 pl-4 my-4 text-gray-600 italic">
      <p>{renderTextNodes(block.content)}</p>
      {block.citation && (
        <footer className="mt-2 text-sm text-gray-500 not-italic">
          — {block.citation}
        </footer>
      )}
    </blockquote>
  );
}
