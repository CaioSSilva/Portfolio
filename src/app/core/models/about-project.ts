import { FileItem } from './file';

export const RESUME_LABELS = {
  en: 'Resume',
  pt: 'Currículo',
} as const;

export const RESUME_FILES: Readonly<Record<'en' | 'pt', FileItem>> = {
  en: {
    id: 'Curr2',
    name: 'Resume.pdf',
    type: 'file',
    icon: 'fas fa-file-pdf',
    url: '/data/root/home/documents/Resume.pdf',
  },
  pt: {
    id: 'Curr1',
    name: 'Currículo.pdf',
    type: 'file',
    icon: 'fas fa-file-pdf',
    url: '/data/root/home/documents/Currículo.pdf',
  },
};

export const README_FILES: Readonly<Record<'en' | 'pt', FileItem>> = {
  en: {
    id: 'readme-en',
    name: 'README.md',
    type: 'file',
    icon: 'fas fa-file-alt',
    url: '/data/root/home/documents/README.md',
  },
  pt: {
    id: 'readme-pt-br',
    name: 'README.pt-BR.md',
    type: 'file',
    icon: 'fas fa-file-alt',
    url: '/data/root/home/documents/README.pt-BR.md',
  },
};

export const APP_DISPLAY_ORDER: ReadonlyArray<{ id: string; textKey: string }> = [
  { id: 'files', textKey: 'files' },
  { id: 'photos', textKey: 'photos' },
  { id: 'musics', textKey: 'music' },
  { id: 'documents', textKey: 'docs' },
  { id: 'firefox', textKey: 'browser' },
  { id: 'systemMonitor', textKey: 'sysMonitor' },
  { id: 'terminal', textKey: 'terminal' },
  { id: 'settings', textKey: 'settings' },
  { id: 'hermes', textKey: 'hermes' },
];
