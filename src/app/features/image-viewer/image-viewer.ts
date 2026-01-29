import {
  Component,
  signal,
  HostListener,
  inject,
  effect,
  computed,
  viewChild,
  ElementRef,
} from '@angular/core';
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
  readonly isViewingImage = signal(false);

  readonly zoom = signal(1);
  readonly rotation = signal(0);
  readonly position = signal({ x: 0, y: 0 });
  readonly isDragging = signal(false);

  selImage = viewChild<ElementRef<HTMLImageElement>>('selImage');

  private startPan = { x: 0, y: 0 };
  private isUpdatingFromNavigation = false;

  safeUrl = computed(() => {
    const selectedFile = this.selectedFile();
    const isViewing = this.isViewingImage();

    if (selectedFile?.url && isViewing) {
      return encodeURI(selectedFile.url).replace(/#/g, '%23');
    }
    return null;
  });

  private currentImageIndex = computed(() => {
    const images = this.availableImages();
    const currentFile = this.selectedFile();
    if (!currentFile || images.length === 0) return -1;
    return images.findIndex((img) => img.id === currentFile.id);
  });

  isFirstImage = computed(() => this.currentImageIndex() <= 0);

  isLastImage = computed(() => {
    const images = this.availableImages();
    const index = this.currentImageIndex();
    if (images.length === 0) return true;
    return index >= images.length - 1;
  });

  constructor() {
    super();

    effect(() => {
      this.fs.ensureLoaded();
      if (this.fs.isLoaded()) {
        this.loadGallery();
      }
    });

    effect(() => {
      if (this.isUpdatingFromNavigation) return;

      const rawData = this.data();
      const images = this.availableImages();

      if (!rawData || images.length === 0) {
        this.isLoading.set(false);
        return;
      }

      const url = rawData?.url || rawData;

      if (url && typeof url === 'string') {
        const matchingImage = images.find((img) => img.url === url);

        if (matchingImage) {
          if (matchingImage.id !== this.selectedFile()?.id) {
            this.selectedFile.set(matchingImage);
          }
          this.isViewingImage.set(true);
        }
      }

      this.isLoading.set(false);
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

  handleChangeImage(delta: number) {
    const images = this.availableImages();
    const currentIndex = this.currentImageIndex();

    if (currentIndex === -1 || images.length === 0) return;

    const newIndex = (currentIndex + delta + images.length) % images.length;
    const nextFile = images[newIndex];

    this.isUpdatingFromNavigation = true;

    this.selectedFile.set(nextFile);
    this.data.set(nextFile.url);

    setTimeout(() => {
      this.isUpdatingFromNavigation = false;
    }, 0);
  }

  openSelectedImage() {
    const file = this.selectedFile();
    if (file?.url) {
      this.isViewingImage.set(true);
    }
  }

  closeImageView() {
    this.isViewingImage.set(false);
    this.data.set(null);
    this.reset();
  }

  goToFiles() {
    const filesApp = this.apps.appsRegistry.files;
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
      if (next <= 1) this.position.set({ x: 0, y: 0 });
      return next;
    });
  }

  handleRotate() {
    this.rotation.update((v) => (v + 90) % 360);
  }

  reset() {
    this.zoom.set(1);
    this.rotation.set(0);
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
    if (!this.selectedFile() || !this.isViewingImage()) return;
    event.preventDefault();
    this.updateZoom(event.deltaY > 0 ? -0.1 : 0.1);
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.selectedFile() || !this.isViewingImage()) return;

    if (event.key === 'ArrowLeft' && !this.isFirstImage()) {
      event.preventDefault();
      this.handleChangeImage(-1);
    } else if (event.key === 'ArrowRight' && !this.isLastImage()) {
      event.preventDefault();
      this.handleChangeImage(1);
    }
  }
}
