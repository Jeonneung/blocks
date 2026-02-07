import { ImportResult } from './types';
import { importMarkdown } from './markdown';
import { importDocx } from './docx';
import { importNotebook } from './notebook';

export type { ImportResult, FileImporter } from './types';
export { importMarkdown } from './markdown';
export { importDocx } from './docx';
export { importNotebook } from './notebook';

export type SupportedFileType = 'md' | 'docx' | 'ipynb';

export const SUPPORTED_EXTENSIONS: Record<SupportedFileType, string[]> = {
  md: ['.md', '.markdown'],
  docx: ['.docx'],
  ipynb: ['.ipynb'],
};

export const SUPPORTED_MIME_TYPES: Record<SupportedFileType, string[]> = {
  md: ['text/markdown', 'text/plain'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ipynb: ['application/json'],
};

export function getFileType(file: File): SupportedFileType | null {
  const fileName = file.name.toLowerCase();

  for (const [type, extensions] of Object.entries(SUPPORTED_EXTENSIONS)) {
    for (const ext of extensions) {
      if (fileName.endsWith(ext)) {
        return type as SupportedFileType;
      }
    }
  }

  return null;
}

export async function importFile(file: File): Promise<ImportResult> {
  const fileType = getFileType(file);

  if (!fileType) {
    return {
      blocks: [],
      errors: [`Unsupported file type: ${file.name}. Supported types: .md, .docx, .ipynb`],
    };
  }

  switch (fileType) {
    case 'md':
      return importMarkdown(file);
    case 'docx':
      return importDocx(file);
    case 'ipynb':
      return importNotebook(file);
    default:
      return {
        blocks: [],
        errors: [`Unknown file type: ${fileType}`],
      };
  }
}

export function getAcceptString(): string {
  const extensions = Object.values(SUPPORTED_EXTENSIONS).flat();
  const mimeTypes = Object.values(SUPPORTED_MIME_TYPES).flat();
  return [...extensions, ...mimeTypes].join(',');
}
