import { Block, ImportResult } from './types';
import { generateBlockId, TextNode } from '../types/blocks';

interface NotebookCell {
  cell_type: 'code' | 'markdown' | 'raw';
  source: string | string[];
  outputs?: NotebookOutput[];
}

interface NotebookOutput {
  output_type: string;
  text?: string | string[];
  data?: {
    'text/plain'?: string | string[];
    'text/html'?: string | string[];
    'image/png'?: string;
    'image/jpeg'?: string;
  };
}

interface NotebookMetadata {
  kernelspec?: {
    language?: string;
    name?: string;
  };
  language_info?: {
    name?: string;
  };
}

interface Notebook {
  cells: NotebookCell[];
  metadata?: NotebookMetadata;
}

function getSourceText(source: string | string[]): string {
  if (Array.isArray(source)) {
    return source.join('');
  }
  return source;
}

function getNotebookLanguage(metadata?: NotebookMetadata): string | undefined {
  return metadata?.kernelspec?.language
    || metadata?.language_info?.name
    || undefined;
}

function parseMarkdownCell(source: string): Block[] {
  const blocks: Block[] = [];
  const lines = source.split('\n');

  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join('\n').trim();
      if (text) {
        blocks.push({
          id: generateBlockId(),
          type: 'paragraph',
          content: [{ text }],
        });
      }
      currentParagraph = [];
    }
  };

  for (const line of lines) {
    // Heading
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      const level = Math.min(headingMatch[1].length, 3) as 1 | 2 | 3;
      blocks.push({
        id: generateBlockId(),
        type: 'heading',
        level,
        content: [{ text: headingMatch[2] }],
      });
      continue;
    }

    // Horizontal rule
    if (/^[-*_]{3,}$/.test(line.trim())) {
      flushParagraph();
      blocks.push({
        id: generateBlockId(),
        type: 'divider',
        variant: 'line',
        alignment: 'center',
      });
      continue;
    }

    // Image
    const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      flushParagraph();
      blocks.push({
        id: generateBlockId(),
        type: 'image',
        image: {
          url: imageMatch[2],
          alt: imageMatch[1] || undefined,
        },
        alignment: 'center',
      });
      continue;
    }

    // Quote
    if (line.startsWith('> ')) {
      flushParagraph();
      blocks.push({
        id: generateBlockId(),
        type: 'quote',
        content: [{ text: line.slice(2) }],
      });
      continue;
    }

    // List item
    const listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.+)$/);
    if (listMatch) {
      flushParagraph();
      const isOrdered = /^\d+\./.test(listMatch[2]);
      blocks.push({
        id: generateBlockId(),
        type: 'list',
        listType: isOrdered ? 'ordered' : 'unordered',
        content: [{ text: listMatch[3] }],
      });
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      flushParagraph();
      continue;
    }

    // Regular text
    currentParagraph.push(line);
  }

  flushParagraph();

  return blocks;
}

function parseCodeCell(source: string, language: string | undefined, outputs?: NotebookOutput[]): Block[] {
  const blocks: Block[] = [];

  // Add code as a CodeBlock
  if (source.trim()) {
    blocks.push({
      id: generateBlockId(),
      type: 'code',
      code: source,
      language,
    });
  }

  // Process outputs
  if (outputs) {
    for (const output of outputs) {
      // Handle images in output
      if (output.data) {
        const imageData = output.data['image/png'] || output.data['image/jpeg'];
        if (imageData) {
          const mimeType = output.data['image/png'] ? 'image/png' : 'image/jpeg';
          blocks.push({
            id: generateBlockId(),
            type: 'image',
            image: {
              url: `data:${mimeType};base64,${imageData}`,
              alt: 'Output image',
            },
            alignment: 'center',
          });
          continue;
        }

        // Handle text output
        const textOutput = output.data['text/plain'];
        if (textOutput) {
          const text = Array.isArray(textOutput) ? textOutput.join('') : textOutput;
          if (text.trim()) {
            blocks.push({
              id: generateBlockId(),
              type: 'code',
              code: text,
              language: 'plaintext',
            });
          }
        }
      }

      // Handle stream output
      if (output.text) {
        const text = Array.isArray(output.text) ? output.text.join('') : output.text;
        if (text.trim()) {
          blocks.push({
            id: generateBlockId(),
            type: 'code',
            code: text,
            language: 'plaintext',
          });
        }
      }
    }
  }

  return blocks;
}

export async function importNotebook(file: File): Promise<ImportResult> {
  const errors: string[] = [];

  try {
    const text = await file.text();
    const notebook: Notebook = JSON.parse(text);

    if (!notebook.cells || !Array.isArray(notebook.cells)) {
      return {
        blocks: [{
          id: generateBlockId(),
          type: 'paragraph',
          content: [{ text: '' }],
        }],
        errors: ['Invalid notebook format: no cells found'],
      };
    }

    const language = getNotebookLanguage(notebook.metadata);
    const blocks: Block[] = [];

    for (const cell of notebook.cells) {
      const source = getSourceText(cell.source);

      switch (cell.cell_type) {
        case 'markdown':
          blocks.push(...parseMarkdownCell(source));
          break;
        case 'code':
          blocks.push(...parseCodeCell(source, language, cell.outputs));
          break;
        case 'raw':
          if (source.trim()) {
            blocks.push({
              id: generateBlockId(),
              type: 'paragraph',
              content: [{ text: source }],
            });
          }
          break;
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
      errors: [`Failed to parse notebook: ${error}`],
    };
  }
}
