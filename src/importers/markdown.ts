import { unified } from 'unified';
import remarkParse from 'remark-parse';
import type { Root, Content, PhrasingContent } from 'mdast';
import { Block, ImportResult } from './types';
import { generateBlockId, TextNode } from '../types/blocks';

function parseInlineContent(children: PhrasingContent[]): TextNode[] {
  const result: TextNode[] = [];

  for (const child of children) {
    switch (child.type) {
      case 'text':
        result.push({ text: child.value });
        break;
      case 'strong':
        for (const node of parseInlineContent(child.children)) {
          result.push({ ...node, bold: true });
        }
        break;
      case 'emphasis':
        for (const node of parseInlineContent(child.children)) {
          result.push({ ...node, italic: true });
        }
        break;
      case 'delete':
        for (const node of parseInlineContent(child.children)) {
          result.push({ ...node, strikethrough: true });
        }
        break;
      case 'link':
        for (const node of parseInlineContent(child.children)) {
          result.push({ ...node, link: child.url });
        }
        break;
      case 'inlineCode':
        result.push({ text: child.value });
        break;
      default:
        if ('value' in child && typeof child.value === 'string') {
          result.push({ text: child.value });
        }
    }
  }

  return result.length > 0 ? result : [{ text: '' }];
}

function parseNode(node: Content): Block | Block[] | null {
  switch (node.type) {
    case 'heading': {
      const level = Math.min(node.depth, 3) as 1 | 2 | 3;
      return {
        id: generateBlockId(),
        type: 'heading',
        level,
        content: parseInlineContent(node.children),
      };
    }

    case 'paragraph': {
      // Check if paragraph contains only an image
      if (node.children.length === 1 && node.children[0].type === 'image') {
        const img = node.children[0];
        return {
          id: generateBlockId(),
          type: 'image',
          image: {
            url: img.url,
            alt: img.alt || undefined,
            caption: img.title || undefined,
          },
          alignment: 'center',
        };
      }

      return {
        id: generateBlockId(),
        type: 'paragraph',
        content: parseInlineContent(node.children),
      };
    }

    case 'blockquote': {
      const content: TextNode[] = [];
      for (const child of node.children) {
        if (child.type === 'paragraph') {
          content.push(...parseInlineContent(child.children));
        }
      }
      return {
        id: generateBlockId(),
        type: 'quote',
        content: content.length > 0 ? content : [{ text: '' }],
      };
    }

    case 'list': {
      const items: TextNode[][] = [];
      for (const item of node.children) {
        if (item.type === 'listItem') {
          for (const child of item.children) {
            if (child.type === 'paragraph') {
              items.push(parseInlineContent(child.children));
            }
          }
        }
      }
      // Create separate list blocks for each item since ListBlock has single content
      return items.map((content) => ({
        id: generateBlockId(),
        type: 'list' as const,
        listType: node.ordered ? 'ordered' as const : 'unordered' as const,
        content,
      }));
    }

    case 'thematicBreak':
      return {
        id: generateBlockId(),
        type: 'divider',
        variant: 'line',
        alignment: 'center',
      };

    case 'image':
      return {
        id: generateBlockId(),
        type: 'image',
        image: {
          url: node.url,
          alt: node.alt || undefined,
          caption: node.title || undefined,
        },
        alignment: 'center',
      };

    case 'code':
      return {
        id: generateBlockId(),
        type: 'code',
        code: node.value,
        language: node.lang || undefined,
      };

    default:
      return null;
  }
}

export async function importMarkdown(file: File): Promise<ImportResult> {
  const text = await file.text();
  const errors: string[] = [];

  try {
    const processor = unified().use(remarkParse);
    const tree = processor.parse(text) as Root;

    const blocks: Block[] = [];

    for (const node of tree.children) {
      const result = parseNode(node);
      if (result) {
        if (Array.isArray(result)) {
          blocks.push(...result);
        } else {
          blocks.push(result);
        }
      }
    }

    // Ensure at least one empty paragraph if no blocks
    if (blocks.length === 0) {
      blocks.push({
        id: generateBlockId(),
        type: 'paragraph',
        content: [{ text: '' }],
      });
    }

    return { blocks, errors: errors.length > 0 ? errors : undefined };
  } catch (error) {
    return {
      blocks: [{
        id: generateBlockId(),
        type: 'paragraph',
        content: [{ text: '' }],
      }],
      errors: [`Failed to parse markdown: ${error}`],
    };
  }
}
