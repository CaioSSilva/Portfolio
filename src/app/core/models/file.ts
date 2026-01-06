export interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file' | 'drive';
  icon: string;
  color?: string;
  size?: number;
  modified?: string;
  children?: FileItem[];
  url?: string;
}

export const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'svg', 'webp', 'gif'];
export const AUDIO_EXTENSIONS = ['mp3', 'wav', 'ogg', 'm4a', 'flac'];
export const DOC_EXTENSIONS = [
  'txt',
  'log',
  'md',
  'json',
  'ts',
  'js',
  'css',
  'scss',
  'pdf',
  'text',
];
