import React from 'react';
import {
  Block,
  ParagraphBlock,
  HeadingBlock,
  ImageBlock,
  ImageGalleryBlock,
  LinkCardBlock,
  LinkEmbedBlock,
  DialogueBlock,
  DividerBlock,
  QuoteBlock,
  ListBlock,
  CodeBlock,
  TableBlock,
} from '../types/blocks';
import ParagraphView from './blocks/ParagraphView';
import HeadingView from './blocks/HeadingView';
import ImageView from './blocks/ImageView';
import ImageGalleryView from './blocks/ImageGalleryView';
import LinkCardView from './blocks/LinkCardView';
import LinkEmbedView from './blocks/LinkEmbedView';
import DialogueView from './blocks/DialogueView';
import DividerView from './blocks/DividerView';
import QuoteView from './blocks/QuoteView';
import ListView from './blocks/ListView';
import CodeView from './blocks/CodeView';
import TableView from './blocks/TableView';

interface BlockViewerProps {
  blocks: Block[];
  className?: string;
}

export default function BlockViewer({ blocks, className = '' }: BlockViewerProps) {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  return (
    <div className={`block-viewer space-y-4 ${className}`}>
      {blocks.map((block, index) => (
        <div key={block.id || index} className="block-item">
          {renderBlock(block, blocks, index)}
        </div>
      ))}
    </div>
  );
}

function renderBlock(block: Block, blocks: Block[], index: number): React.ReactNode {
  switch (block.type) {
    case 'paragraph':
      return <ParagraphView block={block as ParagraphBlock} />;

    case 'heading':
      return <HeadingView block={block as HeadingBlock} />;

    case 'image':
      return <ImageView block={block as ImageBlock} />;

    case 'image-gallery':
      return <ImageGalleryView block={block as ImageGalleryBlock} />;

    case 'link-card':
      return <LinkCardView block={block as LinkCardBlock} />;

    case 'link-embed':
      return <LinkEmbedView block={block as LinkEmbedBlock} />;

    case 'dialogue':
      return <DialogueView block={block as DialogueBlock} />;

    case 'divider':
      return <DividerView block={block as DividerBlock} />;

    case 'quote':
      return <QuoteView block={block as QuoteBlock} />;

    case 'list': {
      // 순서 목록 번호 계산 (BlockEditor와 동일한 로직)
      let listOrderIndex: number | undefined;
      const listBlock = block as ListBlock;
      if (listBlock.listType === 'ordered') {
        listOrderIndex = 1;
        for (let i = index - 1; i >= 0; i--) {
          if (blocks[i].type === 'list' && (blocks[i] as ListBlock).listType === 'ordered') {
            listOrderIndex++;
          } else {
            break;
          }
        }
      }
      return <ListView block={listBlock} listOrderIndex={listOrderIndex} />;
    }

    case 'code':
      return <CodeView block={block as CodeBlock} />;

    case 'table':
      return <TableView block={block as TableBlock} />;

    default:
      console.warn('Unknown block type:', (block as any).type);
      return null;
  }
}
