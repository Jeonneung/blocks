import { Block } from '../types/blocks';

export type { Block };

export interface ImportResult {
  blocks: Block[];
  errors?: string[];
}

export type FileImporter = (file: File) => Promise<ImportResult>;
