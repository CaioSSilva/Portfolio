import { Component, signal, computed, inject, effect, HostListener, ChangeDetectionStrategy, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { Base } from '../../core/models/base';
import { LanguageService } from '../../core/services/language';
import { Apps } from '../../core/services/apps';
import { FileSystem } from '../../core/services/file-system';
import { ScreenService } from '../../core/services/screen';
import { NotificationService } from '../../core/services/notification';
import { MarkdownPipe } from '../../core/pipes/markdown-pipe';
import { FileItem, DOC_EXTENSIONS } from '../../core/models/file';

@Component({
  selector: 'app-document-viewer',
  standalone: true,
  templateUrl: './document-viewer.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './document-viewer.scss',
  imports: [PdfViewerModule, CommonModule, MarkdownPipe],
})
export class DocumentViewer extends Base implements OnInit, OnDestroy {
  lang = inject(LanguageService);
  private appsService = inject(Apps);
  public fs = inject(FileSystem);
  private hostEl = inject(ElementRef<HTMLElement>);
  private screen = inject(ScreenService);
  private nots = inject(NotificationService);

  fileType = signal<'pdf' | 'text' | 'markdown' | 'unsupported'>('unsupported');
  fileName = signal('');
  textContent = signal('');
  zoom = signal(1.0);
  hasError = signal(false);
  isLoading = signal(true);
  availableDocs = signal<FileItem[]>([]);
  selectedFile = signal<FileItem | null>(null);
  isViewingDocument = signal(false);
  isNarrow = signal(false);
  isPinchZoomed = signal(false);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef<HTMLElement>;

  private resizeObserver: ResizeObserver | null = null;

  private touchStartX = 0;
  private touchStartY = 0;
  private touchStartTarget: EventTarget | null = null;
  private pinchStartDistance = 0;
  private pinchLastStepDistance = 0;
  private pinchLastStepTime = 0;

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

  ngOnInit(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver((entries) => {
        const w = entries[0]?.contentRect.width ?? 0;
        this.isNarrow.set(w > 0 && w < 500);
      });
      this.resizeObserver.observe(this.hostEl.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  constructor() {
    super();

    effect(() => {
      this.fs.ensureLoaded();
      if (this.isUpdatingFromNavigation) return;

      if (!this.fs.isLoaded()) return;

      const rawData = this.data();

      const url = !rawData
        ? null
        : typeof rawData === 'string'
          ? rawData
          : rawData.url ?? null;

      if (url) {
        this.loadLibraryForUrl(url);
      } else {
        this.loadAllDocs();
      }
    });
  }

  private loadAllDocs(): void {
    try {
      this.availableDocs.set(this.fs.getFilesByExtensions(['pdf', ...DOC_EXTENSIONS]));
    } catch {
      this.nots.show({ title: this.lang.t().errors.systemError, message: this.lang.t().errors.failedToLoadFiles, icon: 'fas fa-folder-open' });
      this.hasError.set(true);
    } finally {
      this.isLoading.set(false);
    }
  }

  private loadLibraryForUrl(url: string): void {
    try {
      const docs = this.fs.getSiblingsByUrl(url, ['pdf', ...DOC_EXTENSIONS]);
      this.availableDocs.set(docs);

      const matchingDoc = docs.find((doc) => doc.url === url);
      if (matchingDoc) {
        if (matchingDoc.id !== this.selectedFile()?.id) {
          this.selectedFile.set(matchingDoc);
          this.processFile(matchingDoc);
        }
        this.isViewingDocument.set(true);
      }
    } catch {
      this.nots.show({ title: this.lang.t().errors.systemError, message: this.lang.t().errors.failedToLoadDocument, icon: 'fas fa-file-circle-exclamation' });
      this.hasError.set(true);
    } finally {
      this.isLoading.set(false);
    }
  }

  private processFile(file: FileItem): void {
    try {
      this.resetState();
      this.fileName.set(file.name);

      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      if (ext === 'pdf') {
        this.fileType.set('pdf');
      } else if (ext === 'md' && file.url) {
        this.fileType.set('markdown');
        this.loadTextFile(file.url);
      } else if (file.url) {
        this.fileType.set('text');
        this.loadTextFile(file.url);
      } else {
        this.fileType.set('unsupported');
      }
    } catch {
      this.nots.show({ title: this.lang.t().errors.systemError, message: this.lang.t().errors.failedToProcessDocument, icon: 'fas fa-file-circle-exclamation' });
      this.hasError.set(true);
      this.isLoading.set(false);
    }
  }

  private resetState(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.textContent.set('');
  }

  private async loadTextFile(path: string): Promise<void> {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const text = await response.text();
      this.textContent.set(text);
      this.isLoading.set(false);
    } catch {
      this.nots.show({ title: this.lang.t().errors.systemError, message: this.lang.t().errors.failedToLoadDocument, icon: 'fas fa-file-circle-exclamation' });
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
    this.data.set(nextDoc.url ?? null);

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

  resetZoom() {
    this.zoom.set(1.0);
    this.isPinchZoomed.set(false);
  }

  private getPinchDistance(touches: TouchList): number {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  onTouchStart(event: TouchEvent) {
    if (!this.screen.isMobile()) return;
    if (event.touches.length === 2) {
      const d = this.getPinchDistance(event.touches);
      this.pinchStartDistance = d;
      this.pinchLastStepDistance = d;
      this.pinchLastStepTime = 0;
      return;
    }
    if (event.touches.length !== 1) return;
    const touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchStartTarget = touch.target;
  }

  onTouchMove(event: TouchEvent) {
    if (!this.screen.isMobile() || event.touches.length !== 2) return;
    event.preventDefault();
    const now = Date.now();
    if (now - this.pinchLastStepTime < 120) return;

    const distance = this.getPinchDistance(event.touches);
    const diff = distance - this.pinchLastStepDistance;

    if (Math.abs(diff) > 18) {
      this.changeZoom(diff > 0 ? 0.1 : -0.1);
      this.pinchLastStepDistance = distance;
      this.pinchLastStepTime = now;
      if (this.zoom() !== 1.0) this.isPinchZoomed.set(true);
    }
  }

  private isInsideHorizontalScrollable(target: EventTarget | null): boolean {
    let el = target as HTMLElement | null;
    while (el && el !== this.hostEl.nativeElement) {
      const style = window.getComputedStyle(el);
      const overflowX = style.overflowX;
      if ((overflowX === 'auto' || overflowX === 'scroll') && el.scrollWidth > el.clientWidth) {
        return true;
      }
      el = el.parentElement;
    }
    return false;
  }

  onTouchEnd(event: TouchEvent) {
    if (!this.screen.isMobile() || !this.isViewingDocument()) return;
    if (event.touches.length > 0 || this.zoom() > 1) return;
    if (this.isInsideHorizontalScrollable(this.touchStartTarget)) return;

    const touch = event.changedTouches[0];
    const dx = touch.clientX - this.touchStartX;
    const dy = touch.clientY - this.touchStartY;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0 && !this.isLastDoc()) {
        this.handleChangeDocument(1);
      } else if (dx > 0 && !this.isFirstDoc()) {
        this.handleChangeDocument(-1);
      }
    }
  }

  onMarkdownClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const anchor = target.closest('a');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href?.startsWith('#')) return;

    event.preventDefault();
    const rawId = href.slice(1);
    const container = this.scrollContainer?.nativeElement;
    if (!container) return;

    // Tenta match exato primeiro; se falhar, normaliza ambos e tenta de novo
    let el = container.querySelector(`[id="${rawId}"]`) as HTMLElement | null;
    if (!el) {
      const normalizedTarget = this.normalizeId(rawId);
      el = Array.from(container.querySelectorAll('[id]')).find(
        (e) => this.normalizeId((e as HTMLElement).id) === normalizedTarget
      ) as HTMLElement | null;
    }
    if (!el) return;

    const containerTop = container.getBoundingClientRect().top;
    const elTop = el.getBoundingClientRect().top;
    container.scrollBy({ top: elTop - containerTop - 16, behavior: 'smooth' });
  }

  private normalizeId(id: string): string {
    return id
      .toLowerCase()
      .replace(/[^\w\u00C0-\u024F-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  getFileIcon() {
    if (this.fileType() === 'pdf') return 'fas fa-file-pdf';
    if (this.fileType() === 'markdown') return 'fab fa-markdown';
    return 'fas fa-file-alt';
  }

  getIconColor() {
    if (this.fileType() === 'pdf') return '#ef4444';
    if (this.fileType() === 'markdown') return '#7c5cd8';
    return '#3b82f6';
  }

  goToFiles() {
    const filesApp = this.appsService.appsRegistry().files;
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
