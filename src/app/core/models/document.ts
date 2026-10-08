export type DocFileType = 'pdf' | 'text' | 'markdown' | 'unsupported';

export interface LoadedDoc {
  fileType: DocFileType;
  fileName: string;
  textContent: string;
}
