import React from 'react';
import { ListBlock } from '../../types/blocks';
import { renderTextNodes } from '../../utils/renderTextNodes';

interface ListViewProps {
  block: ListBlock;
  listOrderIndex?: number;
}

export default function ListView({ block, listOrderIndex }: ListViewProps) {
  return (
    <div className="flex items-start gap-2 text-gray-800">
      <span className="flex-shrink-0 select-none text-gray-500">
        {block.listType === 'ordered' ? `${listOrderIndex ?? 1}.` : '•'}
      </span>
      <span>{renderTextNodes(block.content)}</span>
    </div>
  );
}
