import {
  Component,
  signal,
  computed,
  inject,
  effect,
  HostListener,
  ChangeDetectionStrategy,
  DestroyRef,
  ElementRef,
  viewChild,
} from '@angular/core';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { Base } from '../../core/models/base';
import { LanguageService } from '../../core/services/language';
import { Apps } from '../../core/services/apps';
import { FileSystem } from '../../core/services/file-system';
import { ScreenService } from '../../core/services/screen';
import { ProcessManager } from '../../core/services/process-manager';
import { MarkdownPipe } from '../../core/pipes/markdown-pipe';
import { FileItem } from '../../core/models/file';
import { DocumentLoaderService } from '../../core/services/document-loader';
import { DocFileType } from '../../core/models/document';

@Component({
  selector: 'app-document-viewer',
  standalone: true,
  templateUrl: './document-viewer.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './document-viewer.scss',
  imports: [PdfViewerModule, MarkdownPipe],
})
export class DocumentViewer extends Base {
  private readonly appsService = inject(Apps);
  private readonly hostEl = inject(ElementRef<HTMLElement>);
  private readonly screen = inject(ScreenService);
  private readonly processManager = inject(ProcessManager);
  private readonly destroyRef = inject(DestroyRef);
  readonly lang = inject(LanguageService);
  readonly fileSystem = inject(FileSystem);
  readonly loader = inject(DocumentLoaderService);

  private readonly scrollContainer = viewChild<ElementRef<HTMLElement>>('scrollContainer');

  private resizeObserver: ResizeObserver | null = null;
  private touchStartX = 0;
  private touchStartY = 0;
  private touchStartTarget: EventTarget | null = null;
  private pinchStartDistance = 0;
  private pinchLastStepDistance = 0;
  private pinchLastStepTime = 0;
  private lastUrl: string | null | undefined = undefined;

  readonly fileType = signal<DocFileType>('unsupported');
  readonly fileName = signal('');
  readonly textContent = signal('');
  readonly zoom = signal(1.0);
  readonly availableDocs = signal<FileItem[]>([]);
  readonly selectedFile = signal<FileItem | null>(null);
  readonly isViewingDocument = signal(false);
  readonly isNarrow = signal(false);
  readonly isPinchZoomed = signal(false);

  readonly safePath = computed(() => {
    const selectedFile = this.selectedFile();
    const isViewing = this.isViewingDocument();

    if (selectedFile?.url && isViewing) {
      const sanitized = selectedFile.url.replace(/\\/g, '/');
      return encodeURI(sanitized).replace(/#/g, '%23');
    }
    return null;
  });

  private readonly currentDocIndex = computed(() => {
    const docs = this.availableDocs();
    const currentFile = this.selectedFile();
    if (!currentFile || docs.length === 0) return -1;
    return docs.findIndex((doc) => doc.id === currentFile.id);
  });

  readonly isFirstDoc = computed(() => this.currentDocIndex() <= 0);

  readonly isLastDoc = computed(() => {
    const docs = this.availableDocs();
    const index = this.currentDocIndex();
    if (docs.length === 0) return true;
    return index >= docs.length - 1;
  });

  constructor() {
    super();
    this.initResizeObserver();

    effect(() => {
      this.fileSystem.ensureLoaded();
      if (!this.fileSystem.isLoaded()) return;

      const rawData = this.data();
      const url = !rawData ? null : typeof rawData === 'string' ? rawData : (rawData.url ?? null);

      if (url !== this.lastUrl) {
        this.lastUrl = url;
        if (url) {
          this.loadLibraryForUrl(url);
        } else {
          this.loadAllDocs();
        }
      }
    });
  }

  private initResizeObserver(): void {
    if (typeof ResizeObserver === 'undefined') return;
    this.resizeObserver = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      this.isNarrow.set(width > 0 && width < 500);
    });
    this.resizeObserver.observe(this.hostEl.nativeElement);
    this.destroyRef.onDestroy(() => this.resizeObserver?.disconnect());
  }

  private loadAllDocs(): void {
    const docs = this.loader.loadAllDocs();
    this.availableDocs.set(docs);
  }

  private loadLibraryForUrl(url: string): void {
    const docs = this.loader.loadLibraryForUrl(url);
    this.availableDocs.set(docs);

    const matchingDoc = docs.find((doc) => doc.url === url);
    if (matchingDoc) {
      if (matchingDoc.id !== this.selectedFile()?.id) {
        this.selectedFile.set(matchingDoc);
        this.applyProcessedFile(matchingDoc);
      }
      this.isViewingDocument.set(true);
    }
  }

  private async applyProcessedFile(file: FileItem): Promise<void> {
    const result = await this.loader.processFile(file);
    this.fileType.set(result.fileType);
    this.fileName.set(result.fileName);
    this.textContent.set(result.textContent);
  }

  selectFile(file: FileItem): void {
    this.selectedFile.set(file);
  }

  handleChangeDocument(delta: number): void {
    const docs = this.availableDocs();
    const currentIndex = this.currentDocIndex();

    if (currentIndex === -1 || docs.length === 0) return;

    const newIndex = (currentIndex + delta + docs.length) % docs.length;
    const nextDoc = docs[newIndex];

    this.selectedFile.set(nextDoc);
    this.applyProcessedFile(nextDoc);
  }

  openSelectedDocument(): void {
    const file = this.selectedFile();
    if (file?.url) {
      this.applyProcessedFile(file);
      this.isViewingDocument.set(true);
    }
  }

  closeDocumentView(): void {
    this.isViewingDocument.set(false);
    this.data.set(null);
    this.zoom.set(1.0);
    this.loader.resetState();
    this.textContent.set('');
    this.fileType.set('unsupported');
  }

  onPdfLoadSuccess(): void {
    this.loader.isLoading.set(false);
    this.loader.hasError.set(false);
  }

  onPdfLoadError(): void {
    this.loader.hasError.set(true);
    this.loader.isLoading.set(false);
  }

  changeZoom(delta: number): void {
    this.zoom.update((zoom) => Math.min(Math.max(0.3, zoom + delta), 3.0));
  }

  resetZoom(): void {
    this.zoom.set(1.0);
    this.isPinchZoomed.set(false);
  }

  private getPinchDistance(touches: TouchList): number {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  onTouchStart(event: TouchEvent): void {
    if (!this.screen.isMobile()) return;
    if (event.touches.length === 2) {
      const pinchDistance = this.getPinchDistance(event.touches);
      this.pinchStartDistance = pinchDistance;
      this.pinchLastStepDistance = pinchDistance;
      this.pinchLastStepTime = 0;
      return;
    }
    if (event.touches.length !== 1) return;
    const touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchStartTarget = touch.target;
  }

  onTouchMove(event: TouchEvent): void {
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

  onTouchEnd(event: TouchEvent): void {
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

  onMarkdownClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const anchor = target.closest('a');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href?.startsWith('#')) return;

    event.preventDefault();
    this.scrollToAnchor(href.slice(1));
  }

  private scrollToAnchor(rawId: string): void {
    const container = this.scrollContainer()?.nativeElement;
    if (!container) return;

    let el = container.querySelector(`[id="${rawId}"]`) as HTMLElement | null;
    if (!el) {
      const normalizedTarget = this.normalizeId(rawId);
      el = Array.from(container.querySelectorAll('[id]')).find(
        (el) => this.normalizeId((el as HTMLElement).id) === normalizedTarget,
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

  getFileIcon(): string {
    if (this.fileType() === 'pdf') return 'fas fa-file-pdf';
    if (this.fileType() === 'markdown') return 'fab fa-markdown';
    return 'fas fa-file-alt';
  }

  getIconColor(): string {
    if (this.fileType() === 'pdf') return '#ef4444';
    if (this.fileType() === 'markdown') return '#7c5cd8';
    return '#3b82f6';
  }

  goToFiles(): void {
    const filesApp = this.appsService.appsRegistry().files;
    if (filesApp) this.appsService.openApp(filesApp);
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.selectedFile() || !this.isViewingDocument()) return;
    if (!this.processManager.isActiveComponent(DocumentViewer)) return;

    if (event.key === 'ArrowLeft' && !this.isFirstDoc()) {
      event.preventDefault();
      this.handleChangeDocument(-1);
    } else if (event.key === 'ArrowRight' && !this.isLastDoc()) {
      event.preventDefault();
      this.handleChangeDocument(1);
    }
  }
}
