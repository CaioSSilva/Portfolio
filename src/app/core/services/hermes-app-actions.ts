import { Injectable, inject } from '@angular/core';
import { AppRegistry } from './app-registry';
import { ProcessManager } from './process-manager';
import { FileSystem } from './file-system';
import {
  HermesAction,
  OpenAppPayload,
  CloseAppPayload,
  OpenFilePayload,
  MediaSearchPayload,
} from '../models/hermes-action';
import { IMAGE_EXTENSIONS, DOC_EXTENSIONS, FileItem } from '../models/file';

@Injectable({ providedIn: 'root' })
export class HermesAppActionsService {
  private readonly appRegistry = inject(AppRegistry);
  private readonly processManager = inject(ProcessManager);
  private readonly fileSystem = inject(FileSystem);

  execute(action: HermesAction): void {
    switch (action.type) {
      case 'open_app':
        this.openApp(action);
        break;
      case 'close_app':
        this.closeApp(action);
        break;
      case 'open_file':
        this.openFile(action);
        break;
      case 'photos_open_photo':
        this.openMediaByQuery(action, IMAGE_EXTENSIONS);
        break;
      case 'docs_open_document':
        this.openMediaByQuery(action, DOC_EXTENSIONS);
        break;
    }
  }

  private openApp(action: HermesAction): void {
    const payload = action.payload as OpenAppPayload | undefined;
    if (!payload?.app) throw new Error('Missing app');
    const app = this.appRegistry.getAppById(payload.app);
    if (!app) throw new Error(`App not found: ${payload.app}`);
    this.processManager.open(app, app.data);
  }

  private closeApp(action: HermesAction): void {
    const payload = action.payload as CloseAppPayload | undefined;
    if (!payload?.app) throw new Error('Missing app');
    this.processManager.closeAllInstancesById(payload.app);
  }

  private openFile(action: HermesAction): void {
    const payload = action.payload as OpenFilePayload | undefined;
    if (!payload?.name || !payload?.url) throw new Error('Missing file info');
    this.processManager.openFile({
      id: payload.name,
      name: payload.name,
      type: 'file',
      icon: 'fas fa-file',
      url: payload.url as string,
    });
  }

  private openMediaByQuery(action: HermesAction, extensions: string[]): void {
    const payload = action.payload as MediaSearchPayload | undefined;
    if (!payload?.query) throw new Error('Missing search query');
    this.fileSystem.ensureLoaded().then(() => {
      const file = this.findByQuery(payload.query, extensions);
      if (!file) throw new Error(`No file found for: ${payload.query}`);
      this.processManager.openFile(file);
    });
  }

  private findByQuery(query: string, extensions: string[]): FileItem | undefined {
    const exts = new Set(extensions);
    const results = this.fileSystem.searchFiles(query);
    return results.find((f) => exts.has(this.fileSystem.getFileExtension(f.name)));
  }
}
