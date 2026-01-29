import { Component, signal, computed, inject, effect, HostListener } from '@angular/core';
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
  public fs = inject(FileSystem);

  fileType = signal<'pdf' | 'text' | 'unknown'>('unknown');
  fileName = signal('');
  textContent = signal('');
  zoom = signal(1.0);
  hasError = signal(false);
  isLoading = signal(true);
  availableDocs = signal<FileItem[]>([]);
  selectedFile = signal<FileItem | null>(null);
  isViewingDocument = signal(false);

  private isUpdatingFromNavigation = false;

  safePath = computed(() => {
    const selectedFile = this.selectedFile();
    const isViewing = this.isViewingDocument();

    if (selectedFile?.url && isViewing) {
      const sanitized = selectedFile.url.replace(/\\/g, '/');
      return encodeURI(sanitized).replace(/#/g, '%23');
    }
    return null;
  });

  private currentDocIndex = computed(() => {
    const docs = this.availableDocs();
    const currentFile = this.selectedFile();
    if (!currentFile || docs.length === 0) return -1;
    return docs.findIndex((doc) => doc.id === currentFile.id);
  });

  isFirstDoc = computed(() => this.currentDocIndex() <= 0);

  isLastDoc = computed(() => {
    const docs = this.availableDocs();
    const index = this.currentDocIndex();
    if (docs.length === 0) return true;
    return index >= docs.length - 1;
  });

  constructor() {
    super();

    effect(() => {
      this.fs.ensureLoaded();
      if (this.fs.isLoaded()) {
        this.loadLibrary();
      }
    });

    effect(() => {
      if (this.isUpdatingFromNavigation) return;

      const rawData = this.data();
      const docs = this.availableDocs();

      if (!rawData || docs.length === 0) {
        this.isLoading.set(false);
        return;
      }

      const url = rawData?.url || rawData;

      if (url && typeof url === 'string') {
        const matchingDoc = docs.find((doc) => doc.url === url);

        if (matchingDoc) {
          if (matchingDoc.id !== this.selectedFile()?.id) {
            this.selectedFile.set(matchingDoc);
            this.processFile(matchingDoc);
          }
          this.isViewingDocument.set(true);
        }
      }

      this.isLoading.set(false);
    });
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

  private processFile(file: FileItem) {
    try {
      this.resetState();
      this.fileName.set(file.name);

      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      if (ext === 'pdf') {
        this.fileType.set('pdf');
      } else if (file.url) {
        this.fileType.set('text');
        this.loadTextFile(file.url);
      }
    } catch {
      this.hasError.set(true);
      this.isLoading.set(false);
    }
  }

  private resetState() {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.textContent.set('');
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

  handleChangeDocument(delta: number) {
    const docs = this.availableDocs();
    const currentIndex = this.currentDocIndex();

    if (currentIndex === -1 || docs.length === 0) return;

    const newIndex = (currentIndex + delta + docs.length) % docs.length;
    const nextDoc = docs[newIndex];

    this.isUpdatingFromNavigation = true;

    this.selectedFile.set(nextDoc);
    this.processFile(nextDoc);
    this.data.set(nextDoc.url);

    setTimeout(() => {
      this.isUpdatingFromNavigation = false;
    }, 0);
  }

  openSelectedDocument() {
    const file = this.selectedFile();
    if (file?.url) {
      this.processFile(file);
      this.isViewingDocument.set(true);
    }
  }

  closeDocumentView() {
    this.isViewingDocument.set(false);
    this.data.set(null);
    this.zoom.set(1.0);
    this.resetState();
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

  goToFiles() {
    const filesApp = this.appsService.appsRegistry.files;
    if (filesApp) this.appsService.openApp(filesApp);
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.selectedFile() || !this.isViewingDocument()) return;

    if (event.key === 'ArrowLeft' && !this.isFirstDoc()) {
      event.preventDefault();
      this.handleChangeDocument(-1);
    } else if (event.key === 'ArrowRight' && !this.isLastDoc()) {
      event.preventDefault();
      this.handleChangeDocument(1);
    }
  }
}
