import { AboutProject } from '../../features/about-project/about-project';
import { Browser } from '../../features/browser/browser';
import { DocumentViewer } from '../../features/document-viewer/document-viewer';
import { Files } from '../../features/files/files';
import { ImageViewer } from '../../features/image-viewer/image-viewer';
import { Musics } from '../../features/musics/musics';
import { SettingsComponent } from '../../features/settings/settings';
import { Terminal } from '../../features/terminal/terminal';
import { LanguageService } from '../services/language';
import { AppDefinition } from './dock';
import { AUDIO_EXTENSIONS, DOC_EXTENSIONS, IMAGE_EXTENSIONS } from './file';

export interface AppRegistry {
  files: AppDefinition;
  firefox: AppDefinition;
  terminal: AppDefinition;
  settings: AppDefinition;
  about: AppDefinition;
  photos: AppDefinition;
  documents: AppDefinition;
  musics: AppDefinition;
  [key: string]: AppDefinition | undefined;
}

export const getInstalledApps = (lang: LanguageService): AppRegistry => {
  return {
    files: {
      id: 'files',
      title: lang.t().apps.files,
      icon: 'fas fa-folder',
      color: '#3584e4',
      component: Files,
    },
    firefox: {
      id: 'firefox',
      title: lang.t().apps.firefox,
      icon: 'fab fa-firefox-browser',
      color: '#ff7139',
      component: Browser,
    },
    terminal: {
      id: 'terminal',
      title: lang.t().apps.terminal,
      icon: 'fas fa-terminal',
      color: '#77767b',
      component: Terminal,
    },
    settings: {
      id: 'settings',
      title: lang.t().apps.settings,
      icon: 'fas fa-cog',
      color: '#FE6F5E',
      component: SettingsComponent,
    },
    about: {
      id: 'about',
      title: lang.t().apps.about,
      icon: 'fas fa-user',
      color: '#6f42c1',
      component: AboutProject,
    },
    photos: {
      id: 'photos',
      title: lang.t().apps.photos,
      icon: 'fas fa-image',
      color: '#4a90e2',
      component: ImageViewer,
      handle: IMAGE_EXTENSIONS,
    },
    documents: {
      id: 'documents',
      title: lang.t().apps.documents,
      icon: 'fas fa-file',
      color: '#e01b24',
      component: DocumentViewer,
      handle: DOC_EXTENSIONS,
    },
    musics: {
      id: 'musics',
      title: lang.t().apps.musics,
      icon: 'fas fa-music',
      color: '#0077b6',
      component: Musics,
      handle: AUDIO_EXTENSIONS,
    },
  };
};
