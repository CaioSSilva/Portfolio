import { Injectable, Injector, inject } from '@angular/core';
import { AppRegistry } from './app-registry';
import { ProcessManager } from './process-manager';
import { FileSystem } from './file-system';
import {
  HermesAction,
  OpenAppPayload,
  CloseAppPayload,
  OpenFilePayload,
  MediaSearchPayload,
  FocusAppPayload,
  BrowserOpenUrlPayload,
  BrowserSearchPayload,
  TerminalExecPayload,
  FilesSearchPayload,
  ReadFileContentPayload,
} from '../models/hermes-action';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { HermesChatService } from './hermes-chat';
import { IMAGE_EXTENSIONS, DOC_EXTENSIONS, FileItem } from '../models/file';

@Injectable({ providedIn: 'root' })
export class HermesAppActionsService {
  private readonly appRegistry = inject(AppRegistry);
  private readonly processManager = inject(ProcessManager);
  private readonly fileSystem = inject(FileSystem);
  private readonly http = inject(HttpClient);
  private readonly injector = inject(Injector);

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
      case 'terminal_exec':
        this.terminalExec(action);
        break;
      case 'files_search':
        this.filesSearch(action);
        break;
      case 'read_file_content':
        this.readFileContent(action);
        break;
      default:
        this.dispatchWindowOrBrowserAction(action);
    }
  }

  private dispatchWindowOrBrowserAction(action: HermesAction): void {
    switch (action.type) {
      case 'minimize_all':
        this.processManager.minimizeAllVisible();
        break;
      case 'close_all_apps':
        this.closeAllApps();
        break;
      case 'focus_app':
        this.focusApp(action);
        break;
      case 'browser_open_url':
        this.browserOpenUrl(action);
        break;
      case 'browser_search':
        this.browserSearch(action);
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
    return results.find((fileItem) => exts.has(this.fileSystem.getFileExtension(fileItem.name)));
  }

  private closeAllApps(): void {
    const list = [...this.processManager.processes()];
    list.forEach((proc) => this.processManager.close(proc.id));
  }

  private focusApp(action: HermesAction): void {
    const payload = action.payload as FocusAppPayload | undefined;
    if (!payload?.app) throw new Error('Missing app');
    const target = this.processManager.processes().find((proc) => proc.appId === payload.app);
    if (!target) throw new Error(`App not running: ${payload.app}`);
    this.processManager.focus(target.id);
  }

  private browserOpenUrl(action: HermesAction): void {
    const payload = action.payload as BrowserOpenUrlPayload | undefined;
    if (!payload?.url) throw new Error('Missing url');
    const app = this.appRegistry.getAppById('firefox');
    if (!app) throw new Error('Firefox not found');
    this.processManager.open(app, { url: payload.url });
  }

  private browserSearch(action: HermesAction): void {
    const payload = action.payload as BrowserSearchPayload | undefined;
    if (!payload?.query) throw new Error('Missing search query');
    const app = this.appRegistry.getAppById('firefox');
    if (!app) throw new Error('Firefox not found');
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(payload.query)}`;
    this.processManager.open(app, { url: searchUrl });
  }

  private terminalExec(action: HermesAction): void {
    const payload = action.payload as TerminalExecPayload | undefined;
    if (!payload?.command) throw new Error('Missing command');
    const app = this.appRegistry.getAppById('terminal');
    if (!app) throw new Error('Terminal not found');
    this.processManager.open(app, { command: payload.command });
  }

  private filesSearch(action: HermesAction): void {
    const payload = action.payload as FilesSearchPayload | undefined;
    if (!payload?.query) throw new Error('Missing search query');
    const app = this.appRegistry.getAppById('files');
    if (!app) throw new Error('Files not found');
    this.processManager.open(app, { searchQuery: payload.query });
  }

  private readFileContent(action: HermesAction): void {
    const payload = action.payload as ReadFileContentPayload | undefined;
    if (!payload?.path) throw new Error('Missing file path');
    this.fileSystem.ensureLoaded().then(() =>
      lastValueFrom(this.http.get(payload.path, { responseType: 'text' })).then((content) => {
        const chat = this.injector.get(HermesChatService);
        chat.injectSystemMessage(payload.path, content);
      }),
    );
  }
}
