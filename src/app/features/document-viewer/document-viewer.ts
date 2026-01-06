import { Component, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { Base } from '../../core/models/base';
import { LanguageService } from '../../core/services/language';
import { Apps } from '../../core/services/apps';
import { FileSystem } from '../../core/services/file-system';
import { FileItem, DOC_EXTENSIONS } from '../../core/models/file';

@Component({
  selector: 'app-document-viewer',
  standalone: true,
  imports: [PdfViewerModule, CommonModule],
  templateUrl: './document-viewer.html',
  styleUrl: './document-viewer.scss',
})
export class DocumentViewer extends Base {
  lang = inject(LanguageService);
  private appsService = inject(Apps);
  private fs = inject(FileSystem);

  fileType = signal<'pdf' | 'text' | 'unknown'>('unknown');
  fileName = signal('');
  textContent = signal('');
  zoom = signal(1.0);
  hasError = signal(false);
  isLoading = signal(true);

  availableDocs = signal<FileItem[]>([]);
  selectedFile = signal<FileItem | null>(null);

  safePath = computed(() => {
    const rawData = this.data();
    const path = rawData?.url || rawData;
    if (path && typeof path === 'string') {
      const sanitized = path.replace(/\\/g, '/');
      return encodeURI(sanitized).replace(/#/g, '%23');
    }
    return null;
  });

  constructor() {
    super();

    effect(() => {
      const path = this.safePath();
      const isFsReady = this.fs.isLoaded();

      this.resetState();

      if (!path) {
        isFsReady ? this.loadLibrary() : this.fs.ensureLoaded();
        return;
      }

      this.processFile(path);
    });
  }

  private resetState() {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.textContent.set('');
  }

  private loadLibrary() {
    try {
      const docs = this.fs.getFilesByExtensions(['pdf', ...DOC_EXTENSIONS]);
      this.availableDocs.set(docs);
    } catch {
      this.hasError.set(true);
    } finally {
      this.isLoading.set(false);
    }
  }

  private processFile(path: string) {
    try {
      const decodedPath = decodeURIComponent(path);
      const baseName = decodedPath.split('/').pop() || 'Document';
      this.fileName.set(baseName);

      const ext = baseName.split('.').pop()?.toLowerCase() || '';

      if (ext === 'pdf') {
        this.fileType.set('pdf');
      } else {
        this.fileType.set('text');
        this.loadTextFile(path);
      }
    } catch {
      this.hasError.set(true);
      this.isLoading.set(false);
    }
  }

  private async loadTextFile(path: string) {
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error();
      const text = await response.text();
      this.textContent.set(text);
      this.isLoading.set(false);
    } catch {
      this.hasError.set(true);
      this.isLoading.set(false);
    }
  }

  selectFile(file: FileItem) {
    this.selectedFile.set(file);
  }

  openSelectedDocument() {
    const file = this.selectedFile();
    if (file?.url) {
      this.data.set(file.url);
    }
  }

  onPdfLoadSuccess() {
    this.isLoading.set(false);
    this.hasError.set(false);
  }

  onPdfLoadError() {
    this.hasError.set(true);
    this.isLoading.set(false);
  }

  changeZoom(v: number) {
    this.zoom.update((z) => Math.min(Math.max(0.3, z + v), 3.0));
  }

  getFileIcon() {
    return this.fileType() === 'pdf' ? 'fas fa-file-pdf' : 'fas fa-file-alt';
  }

  getIconColor() {
    return this.fileType() === 'pdf' ? '#ef4444' : '#3b82f6';
  }

  downloadFile() {
    const path = this.safePath();
    if (!path) return;
    const a = document.createElement('a');
    a.href = path;
    a.download = this.fileName();
    a.click();
  }

  goToFiles() {
    const filesApp = this.appsService.myApps().files;
    if (filesApp) this.appsService.openApp(filesApp);
  }
}
