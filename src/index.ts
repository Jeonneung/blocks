// Main components
export { default as BlockEditor } from './BlockEditor';
export { default as BlockMenu } from './BlockMenu';

// Block editors
export { default as TextBlockEditor } from './blocks/TextBlockEditor';
export { default as ImageGalleryEditor } from './blocks/ImageGalleryEditor';
export { default as LinkCardEditor } from './blocks/LinkCardEditor';
export { default as LinkEmbedEditor } from './blocks/LinkEmbedEditor';
export { default as DialogueEditor } from './blocks/DialogueEditor';
export { default as DividerEditor } from './blocks/DividerEditor';
export { default as CodeBlockEditor } from './blocks/CodeBlockEditor';

// Context and services
export {
  EditorProvider,
  useEditorServices,
  useOptionalEditorServices,
  DefaultImage,
} from './context/EditorContext';

export type {
  EditorServices,
  ImageComponentProps,
} from './context/EditorContext';

// Types
export type {
  BlockType,
  TextNode,
  ImageData,
  OGData,
  DialogueLine,
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
  BlockContent,
  Character,
  MarkdownShortcutConfig,
} from './types/blocks';

// Helper functions
export {
  createEmptyParagraphBlock,
  generateBlockId,
  textNodesToPlainText,
  generatePreviewFromBlocks,
  countBlocksCharacters,
} from './types/blocks';
