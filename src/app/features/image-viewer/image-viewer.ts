import { Component, signal, HostListener, inject, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Base } from '../../core/models/base';
import { Apps } from '../../core/services/apps';
import { LanguageService } from '../../core/services/language';
import { FileSystem } from '../../core/services/file-system';
import { FileItem, IMAGE_EXTENSIONS } from '../../core/models/file';

@Component({
  selector: 'app-image-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-viewer.html',
})
export class ImageViewer extends Base {
  lang = inject(LanguageService);
  apps = inject(Apps);
  private fs = inject(FileSystem);

  readonly availableImages = signal<FileItem[]>([]);
  readonly selectedFile = signal<FileItem | null>(null);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);

  readonly zoom = signal(1);
  readonly rotation = signal(0);
  readonly position = signal({ x: 0, y: 0 });
  readonly isDragging = signal(false);

  private startPan = { x: 0, y: 0 };

  safeUrl = computed(() => {
    const rawData = this.data();
    const url = rawData?.url || rawData;
    if (url && typeof url === 'string') {
      return encodeURI(url).replace(/#/g, '%23');
    }
    return null;
  });

  constructor() {
    super();

    effect(() => {
      const url = this.safeUrl();
      const isFsReady = this.fs.isLoaded();

      this.isLoading.set(true);
      this.hasError.set(false);

      if (!url) {
        if (isFsReady) {
          this.loadGallery();
        } else {
          this.fs.ensureLoaded();
        }
      }
    });
  }

  private loadGallery() {
    try {
      const images = this.fs.getFilesByExtensions(IMAGE_EXTENSIONS);
      this.availableImages.set(images);
    } catch {
      this.hasError.set(true);
    } finally {
      this.isLoading.set(false);
    }
  }

  selectFile(file: FileItem) {
    this.selectedFile.set(file);
  }

  openSelectedImage() {
    const file = this.selectedFile();
    if (file?.url) {
      this.data.set(file.url);
    }
  }

  goToFiles() {
    const filesApp = this.apps.myApps().files;
    if (filesApp) this.apps.openApp(filesApp);
  }

  handleZoomIn() {
    this.updateZoom(0.2);
  }

  handleZoomOut() {
    this.updateZoom(-0.2);
  }

  private updateZoom(delta: number) {
    this.zoom.update((v) => {
      const next = Math.min(Math.max(v + delta, 0.5), 5);
      if (next <= 1) this.resetPosition();
      return next;
    });
  }

  handleRotate() {
    this.rotation.update((v) => (v + 90) % 360);
  }

  reset() {
    this.zoom.set(1);
    this.rotation.set(0);
    this.resetPosition();
  }

  private resetPosition() {
    this.position.set({ x: 0, y: 0 });
  }

  onMouseDown(event: MouseEvent) {
    if (this.zoom() <= 1) return;
    event.preventDefault();
    this.isDragging.set(true);
    this.startPan = {
      x: event.clientX - this.position().x,
      y: event.clientY - this.position().y,
    };
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isDragging()) return;
    this.position.set({
      x: event.clientX - this.startPan.x,
      y: event.clientY - this.startPan.y,
    });
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.isDragging.set(false);
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    if (!this.safeUrl()) return;
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    this.updateZoom(delta);
  }
}
