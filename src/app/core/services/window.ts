import { Injectable, NgZone, inject, signal } from '@angular/core';
import { Process } from '../models/process';
import { ProcessManager } from './process-manager';

const TOP_BAR_HEIGHT = 32;
const DOCK_HEIGHT = 90;
const MIN_W = 320;
const MIN_H = 240;
const SNAP_EDGE = 15;

@Injectable()
export class WindowService {
  private readonly processManager = inject(ProcessManager);
  private readonly ngZone = inject(NgZone);

  private windowEl!: HTMLElement;
  private process!: Process;

  readonly isMaximized = signal(false);
  readonly isSnapped = signal(false);
  readonly isDragging = signal(false);
  readonly isResizing = signal(false);
  readonly isVisible = signal(false);
  readonly snapGhost = signal<{ x: number; y: number; w: number; h: number } | null>(null);

  private rect = { x: 0, y: 0, w: 900, h: 600 };
  private savedState = { x: 0, y: 0, w: 900, h: 600 };
  private collisions = { bottom: false };
  private mouseOffset = { x: 0, y: 0 };
  private isInitializing = true;

  init(element: HTMLElement, process: Process) {
    this.windowEl = element;
    this.process = process;
    this.centerWindow();
    this.applyGeometry();
    this.isInitializing = false;
    requestAnimationFrame(() => this.isVisible.set(true));
  }

  startDrag(event: MouseEvent) {
    if (event.button !== 0 || this.isResizing()) return;

    this.processManager.focus(this.process.id);
    const parent = this.windowEl.offsetParent as HTMLElement;
    if (!parent) return;

    this.prepareDragState(event);
    this.isDragging.set(true);

    this.ngZone.runOutsideAngular(() => {
      const onMove = (e: MouseEvent) => {
        const parentRect = parent.getBoundingClientRect();
        this.rect.x = e.clientX - parentRect.left - this.mouseOffset.x;
        this.rect.y = e.clientY - parentRect.top - this.mouseOffset.y;

        this.updateTransform();
        this.fastInternalCheck(e.clientX, e.clientY);
      };

      const onStop = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onStop);
        this.finalizeDrag();
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onStop);
    });
  }

  startResize(event: MouseEvent) {
    if (this.isMaximized() || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();

    this.isResizing.set(true);
    const startX = event.clientX;
    const startY = event.clientY;
    const startRect = { ...this.rect };

    this.ngZone.runOutsideAngular(() => {
      const onMove = (e: MouseEvent) => {
        this.rect.w = Math.max(MIN_W, startRect.w + (e.clientX - startX));
        this.rect.h = Math.max(MIN_H, startRect.h + (e.clientY - startY));

        this.windowEl.style.width = `${this.rect.w}px`;
        this.windowEl.style.height = `${this.rect.h}px`;
        this.fastInternalCheck(e.clientX, e.clientY);
      };

      const onStop = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onStop);
        this.ngZone.run(() => this.isResizing.set(false));
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onStop);
    });
  }

  private fastInternalCheck(mouseX: number, mouseY: number) {
    if (!this.isInitializing && (mouseX > 0 || mouseY > 0)) {
      const ghost = this.calculateSnap(mouseX, mouseY);
      if (JSON.stringify(ghost) !== JSON.stringify(this.snapGhost())) {
        this.ngZone.run(() => this.snapGhost.set(ghost));
      }
    }

    const bottomMargin = this.collisions.bottom ? 15 : 0;
    const isOverBottom =
      this.isMaximized() ||
      this.rect.y + this.rect.h > window.innerHeight - DOCK_HEIGHT - bottomMargin;

    if (this.collisions.bottom !== isOverBottom) {
      this.collisions.bottom = isOverBottom;
      this.ngZone.run(() => this.processManager.updateBottomOverlap(isOverBottom));
    }
  }

  private calculateSnap(mouseX: number, mouseY: number) {
    const sw = window.innerWidth;
    const sh = window.innerHeight;
    const availableH = sh - TOP_BAR_HEIGHT;

    if (mouseY < TOP_BAR_HEIGHT + SNAP_EDGE && mouseX > SNAP_EDGE && mouseX < sw - SNAP_EDGE) {
      return { x: 0, y: TOP_BAR_HEIGHT, w: sw, h: availableH };
    }

    if (mouseY < TOP_BAR_HEIGHT + SNAP_EDGE) {
      if (mouseX <= SNAP_EDGE) return { x: 0, y: TOP_BAR_HEIGHT, w: sw / 2, h: availableH / 2 };
      if (mouseX >= sw - SNAP_EDGE)
        return { x: sw / 2, y: TOP_BAR_HEIGHT, w: sw / 2, h: availableH / 2 };
    }

    if (mouseY > sh - SNAP_EDGE) {
      if (mouseX <= SNAP_EDGE)
        return { x: 0, y: TOP_BAR_HEIGHT + availableH / 2, w: sw / 2, h: availableH / 2 };
      if (mouseX >= sw - SNAP_EDGE)
        return { x: sw / 2, y: TOP_BAR_HEIGHT + availableH / 2, w: sw / 2, h: availableH / 2 };
    }

    if (mouseX < SNAP_EDGE) return { x: 0, y: TOP_BAR_HEIGHT, w: sw / 2, h: availableH };
    if (mouseX > sw - SNAP_EDGE) return { x: sw / 2, y: TOP_BAR_HEIGHT, w: sw / 2, h: availableH };

    return null;
  }

  toggleMaximize() {
    if (this.isMaximized()) {
      this.rect = { ...this.savedState };
      this.isMaximized.set(false);
    } else {
      this.savedState = { ...this.rect };
      this.isMaximized.set(true);
    }
    this.isSnapped.set(false);
    this.applyGeometry();
  }

  private updateTransform() {
    this.windowEl.style.transform = `translate3d(${this.rect.x}px, ${this.rect.y}px, 0)`;
  }

  private applyGeometry() {
    if (this.isMaximized()) {
      this.windowEl.style.transform = `translate3d(0, ${TOP_BAR_HEIGHT}px, 0)`;
      this.windowEl.style.width = '100vw';
      this.windowEl.style.height = `calc(100vh - ${TOP_BAR_HEIGHT}px)`;
      this.rect.x = 0;
      this.rect.y = TOP_BAR_HEIGHT;
      this.rect.w = window.innerWidth;
      this.rect.h = window.innerHeight - TOP_BAR_HEIGHT;
    } else {
      this.updateTransform();
      this.windowEl.style.width = `${this.rect.w}px`;
      this.windowEl.style.height = `${this.rect.h}px`;
    }
    this.fastInternalCheck(0, 0);
  }

  private prepareDragState(event: MouseEvent) {
    if (this.isMaximized() || this.isSnapped()) {
      const ratio = (event.clientX - this.rect.x) / this.windowEl.offsetWidth;
      this.rect.w = this.savedState.w;
      this.rect.h = this.savedState.h;
      this.rect.x = event.clientX - this.rect.w * ratio;
      this.isMaximized.set(false);
      this.isSnapped.set(false);
      this.applyGeometry();
    }
    const rect = this.windowEl.getBoundingClientRect();
    this.mouseOffset = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  private finalizeDrag() {
    this.ngZone.run(() => {
      this.isDragging.set(false);
      const ghost = this.snapGhost();
      if (ghost) {
        if (!this.isSnapped() && !this.isMaximized()) {
          this.savedState = { ...this.rect };
        }
        this.rect = { ...ghost };
        this.isSnapped.set(true);
        this.isMaximized.set(
          ghost.w === window.innerWidth && ghost.h === window.innerHeight - TOP_BAR_HEIGHT,
        );
        this.applyGeometry();
      }
      this.snapGhost.set(null);
    });
  }

  recalculateBounds() {
    if (this.isMaximized() || this.isDragging() || this.isResizing()) return;
    const sw = window.innerWidth;
    const sh = window.innerHeight;
    this.rect.x = Math.max(0, Math.min(this.rect.x, sw - this.rect.w));
    this.rect.y = Math.max(TOP_BAR_HEIGHT, Math.min(this.rect.y, sh - this.rect.h));
    this.applyGeometry();
  }

  private centerWindow() {
    this.rect.x = (window.innerWidth - this.rect.w) / 2;
    this.rect.y = (window.innerHeight - this.rect.h) / 2;
  }

  close() {
    this.processManager.updateBottomOverlap(false);
    this.processManager.close(this.process.id);
  }

  minimize() {
    this.processManager.updateBottomOverlap(false);
    this.processManager.toggleMinimize(this.process.id);
  }

  focus() {
    this.processManager.focus(this.process.id);
  }
}
