// Main components
export { default as BlockEditor } from './BlockEditor';
export { default as BlockMenu } from './BlockMenu';
export { default as BlockViewer } from './viewer/BlockViewer';

// Block editors
export { default as TextBlockEditor } from './blocks/TextBlockEditor';
export { default as ImageGalleryEditor } from './blocks/ImageGalleryEditor';
export { default as LinkCardEditor } from './blocks/LinkCardEditor';
export { default as LinkEmbedEditor } from './blocks/LinkEmbedEditor';
export { default as DialogueEditor } from './blocks/DialogueEditor';
export { default as DividerEditor } from './blocks/DividerEditor';
export { default as CodeBlockEditor } from './blocks/CodeBlockEditor';
export { default as TableEditor } from './blocks/TableEditor';

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
  TableRow,
  TableBlock,
  BlockContent,
  Character,
  MarkdownShortcutConfig,
} from './types/blocks';

// Utilities
export { renderTextNodes } from './utils/renderTextNodes';

// Helper functions
export {
  createEmptyParagraphBlock,
  generateBlockId,
  textNodesToPlainText,
  generatePreviewFromBlocks,
  countBlocksCharacters,
} from './types/blocks';

// Importers
export {
  importFile,
  importMarkdown,
  importDocx,
  importNotebook,
  getFileType,
  getAcceptString,
} from './importers';

export type {
  ImportResult,
  FileImporter,
  SupportedFileType,
} from './importers';
