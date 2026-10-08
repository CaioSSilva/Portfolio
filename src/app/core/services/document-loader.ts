import { Injectable, inject, signal } from '@angular/core';
import { FileSystem } from './file-system';
import { NotificationService } from './notification';
import { LanguageService } from './language';
import { FileItem, DOC_EXTENSIONS } from '../models/file';
import { LoadedDoc } from '../models/document';

@Injectable({ providedIn: 'root' })
export class DocumentLoaderService {
  private readonly fileSystem = inject(FileSystem);
  private readonly notifications = inject(NotificationService);
  private readonly lang = inject(LanguageService);

  readonly isLoading = signal(true);
  readonly hasError = signal(false);

  loadAllDocs(): FileItem[] {
    try {
      return this.fileSystem.getFilesByExtensions(['pdf', ...DOC_EXTENSIONS]);
    } catch {
      this.showLoadError(this.lang.t().errors.failedToLoadFiles, 'fas fa-folder-open');
      this.hasError.set(true);
      return [];
    } finally {
      this.isLoading.set(false);
    }
  }

  loadLibraryForUrl(url: string): FileItem[] {
    try {
      return this.fileSystem.getSiblingsByUrl(url, ['pdf', ...DOC_EXTENSIONS]);
    } catch {
      this.showLoadError(
        this.lang.t().errors.failedToLoadDocument,
        'fas fa-file-circle-exclamation',
      );
      this.hasError.set(true);
      return [];
    } finally {
      this.isLoading.set(false);
    }
  }

  async processFile(file: FileItem): Promise<LoadedDoc> {
    this.isLoading.set(true);
    this.hasError.set(false);
    try {
      return await this.resolveFileContent(file);
    } catch {
      return this.handleProcessError(file);
    }
  }

  private async resolveFileContent(file: FileItem): Promise<LoadedDoc> {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (ext === 'pdf') return { fileType: 'pdf', fileName: file.name, textContent: '' };
    if (ext === 'md' && file.url) {
      const text = await this.fetchText(file.url);
      return { fileType: 'markdown', fileName: file.name, textContent: text };
    }
    if (file.url) {
      const text = await this.fetchText(file.url);
      return { fileType: 'text', fileName: file.name, textContent: text };
    }
    return { fileType: 'unsupported', fileName: file.name, textContent: '' };
  }

  private handleProcessError(file: FileItem): LoadedDoc {
    this.showLoadError(
      this.lang.t().errors.failedToProcessDocument,
      'fas fa-file-circle-exclamation',
    );
    this.hasError.set(true);
    this.isLoading.set(false);
    return { fileType: 'unsupported', fileName: file.name, textContent: '' };
  }

  private async fetchText(path: string): Promise<string> {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const text = await response.text();
    this.isLoading.set(false);
    return text;
  }

  private showLoadError(message: string, icon: string): void {
    this.notifications.show({
      title: this.lang.t().errors.systemError,
      message,
      icon,
    });
  }

  resetState(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
  }
}
