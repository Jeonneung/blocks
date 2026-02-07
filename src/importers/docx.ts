import mammoth from 'mammoth';
import { Block, ImportResult } from './types';
import { generateBlockId, TextNode } from '../types/blocks';

function parseHtmlToBlocks(html: string): Block[] {
  const blocks: Block[] = [];

  // Create a temporary DOM parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  function parseInlineNodes(element: Element | ChildNode): TextNode[] {
    const result: TextNode[] = [];

    for (const node of Array.from(element.childNodes)) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        if (text) {
          result.push({ text });
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        const tagName = el.tagName.toLowerCase();
        const childNodes = parseInlineNodes(el);

        switch (tagName) {
          case 'strong':
          case 'b':
            for (const n of childNodes) {
              result.push({ ...n, bold: true });
            }
            break;
          case 'em':
          case 'i':
            for (const n of childNodes) {
              result.push({ ...n, italic: true });
            }
            break;
          case 'u':
            for (const n of childNodes) {
              result.push({ ...n, underline: true });
            }
            break;
          case 's':
          case 'del':
          case 'strike':
            for (const n of childNodes) {
              result.push({ ...n, strikethrough: true });
            }
            break;
          case 'a': {
            const href = el.getAttribute('href') || '';
            for (const n of childNodes) {
              result.push({ ...n, link: href });
            }
            break;
          }
          default:
            result.push(...childNodes);
        }
      }
    }

    return result;
  }

  function processElement(element: Element): void {
    const tagName = element.tagName.toLowerCase();

    switch (tagName) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6': {
        const level = Math.min(parseInt(tagName[1]), 3) as 1 | 2 | 3;
        const content = parseInlineNodes(element);
        if (content.length > 0) {
          blocks.push({
            id: generateBlockId(),
            type: 'heading',
            level,
            content,
          });
        }
        break;
      }

      case 'p': {
        // Check for images
        const img = element.querySelector('img');
        if (img) {
          const src = img.getAttribute('src') || '';
          const alt = img.getAttribute('alt') || '';
          blocks.push({
            id: generateBlockId(),
            type: 'image',
            image: { url: src, alt },
            alignment: 'center',
          });
        } else {
          const content = parseInlineNodes(element);
          if (content.length > 0) {
            blocks.push({
              id: generateBlockId(),
              type: 'paragraph',
              content,
            });
          }
        }
        break;
      }

      case 'ul':
      case 'ol': {
        const listType = tagName === 'ol' ? 'ordered' : 'unordered';
        const items = element.querySelectorAll(':scope > li');
        for (const item of Array.from(items)) {
          const content = parseInlineNodes(item);
          if (content.length > 0) {
            blocks.push({
              id: generateBlockId(),
              type: 'list',
              listType,
              content,
            });
          }
        }
        break;
      }

      case 'blockquote': {
        const content: TextNode[] = [];
        for (const child of Array.from(element.children)) {
          content.push(...parseInlineNodes(child));
        }
        if (content.length > 0) {
          blocks.push({
            id: generateBlockId(),
            type: 'quote',
            content,
          });
        }
        break;
      }

      case 'hr':
        blocks.push({
          id: generateBlockId(),
          type: 'divider',
          variant: 'line',
          alignment: 'center',
        });
        break;

      case 'img': {
        const src = element.getAttribute('src') || '';
        const alt = element.getAttribute('alt') || '';
        blocks.push({
          id: generateBlockId(),
          type: 'image',
          image: { url: src, alt },
          alignment: 'center',
        });
        break;
      }

      case 'table': {
        // Convert tables to simple paragraphs
        const rows = element.querySelectorAll('tr');
        for (const row of Array.from(rows)) {
          const cells = row.querySelectorAll('td, th');
          const content: TextNode[] = [];
          for (const cell of Array.from(cells)) {
            if (content.length > 0) {
              content.push({ text: ' | ' });
            }
            content.push(...parseInlineNodes(cell));
          }
          if (content.length > 0) {
            blocks.push({
              id: generateBlockId(),
              type: 'paragraph',
              content,
            });
          }
        }
        break;
      }

      default:
        // Process children for container elements
        for (const child of Array.from(element.children)) {
          processElement(child);
        }
    }
  }

  // Process body children
  for (const child of Array.from(doc.body.children)) {
    processElement(child);
  }

  return blocks;
}

export async function importDocx(file: File): Promise<ImportResult> {
  const errors: string[] = [];

  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });

    if (result.messages.length > 0) {
      for (const msg of result.messages) {
        if (msg.type === 'warning' || msg.type === 'error') {
          errors.push(msg.message);
        }
      }
    }

    const blocks = parseHtmlToBlocks(result.value);

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
      errors: [`Failed to parse docx: ${error}`],
    };
  }
}
