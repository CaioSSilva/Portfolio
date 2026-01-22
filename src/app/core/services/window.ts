import { Injectable, NgZone, inject, signal } from '@angular/core';
import { Process } from '../models/process';
import { ProcessManager } from './process-manager';

export const TOP_BAR_HEIGHT = 32;
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

  private rect = { x: 0, y: 0, w: 1000, h: 700 };
  private savedState = { x: 0, y: 0, w: 1000, h: 700 };
  private collisions = { bottom: false };
  private mouseOffset = { x: 0, y: 0 };
  private isInitializing = true;
  private rafId: number | null = null;
  private lastSnapGhost: string | null = null;

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
        if (this.rafId !== null) {
          cancelAnimationFrame(this.rafId);
        }
        this.rafId = requestAnimationFrame(() => {
          const parentRect = parent.getBoundingClientRect();
          this.rect.x = e.clientX - parentRect.left - this.mouseOffset.x;
          this.rect.y = e.clientY - parentRect.top - this.mouseOffset.y;

          this.rect.y = Math.max(TOP_BAR_HEIGHT, this.rect.y);

          this.updateTransform();
          this.fastInternalCheck(e.clientX, e.clientY);
          this.rafId = null;
        });
      };

      const onStop = () => {
        if (this.rafId !== null) {
          cancelAnimationFrame(this.rafId);
          this.rafId = null;
        }
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onStop);
        this.finalizeDrag();
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onStop);
    });
  }

  private finalizeDrag() {
    this.ngZone.run(() => {
      this.isDragging.set(false);
      this.applySnap();
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
        if (this.rafId !== null) {
          cancelAnimationFrame(this.rafId);
        }
        this.rafId = requestAnimationFrame(() => {
          this.rect.w = Math.max(MIN_W, startRect.w + (e.clientX - startX));
          this.rect.h = Math.max(MIN_H, startRect.h + (e.clientY - startY));
          this.windowEl.style.width = `${this.rect.w}px`;
          this.windowEl.style.height = `${this.rect.h}px`;
          this.fastInternalCheck(e.clientX, e.clientY);
          this.rafId = null;
        });
      };

      const onStop = () => {
        if (this.rafId !== null) {
          cancelAnimationFrame(this.rafId);
          this.rafId = null;
        }
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onStop);
        this.ngZone.run(() => {
          this.isResizing.set(false);
          this.applySnap();
        });
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onStop);
    });
  }

  private applySnap() {
    const ghost = this.snapGhost();
    if (ghost) {
      if (!this.isSnapped() && !this.isMaximized()) {
        this.savedState = { ...this.rect };
      }
      this.rect = { x: ghost.x, y: ghost.y, w: ghost.w, h: ghost.h };
      this.isSnapped.set(true);

      const isFullMax =
        ghost.x === 0 &&
        ghost.y === TOP_BAR_HEIGHT &&
        ghost.w === window.innerWidth &&
        ghost.h === window.innerHeight - TOP_BAR_HEIGHT;

      this.isMaximized.set(isFullMax);
      this.applyGeometry();
    }
    this.snapGhost.set(null);
    this.lastSnapGhost = null;
  }

  private calculateSnap(mouseX: number, mouseY: number) {
    const sw = window.innerWidth;
    const sh = window.innerHeight;
    const availableH = sh - TOP_BAR_HEIGHT;
    const midY = TOP_BAR_HEIGHT + availableH / 2;

    if (mouseY < SNAP_EDGE && mouseX > SNAP_EDGE && mouseX < sw - SNAP_EDGE) {
      return { x: 0, y: TOP_BAR_HEIGHT, w: sw, h: availableH };
    }

    if (mouseY < TOP_BAR_HEIGHT + SNAP_EDGE) {
      if (mouseX <= SNAP_EDGE) return { x: 0, y: TOP_BAR_HEIGHT, w: sw / 2, h: availableH / 2 };
      if (mouseX >= sw - SNAP_EDGE)
        return { x: sw / 2, y: TOP_BAR_HEIGHT, w: sw / 2, h: availableH / 2 };
    }

    if (mouseY > sh - SNAP_EDGE) {
      if (mouseX <= SNAP_EDGE) return { x: 0, y: midY, w: sw / 2, h: availableH / 2 };
      if (mouseX >= sw - SNAP_EDGE) return { x: sw / 2, y: midY, w: sw / 2, h: availableH / 2 };
      if (mouseX > SNAP_EDGE && mouseX < sw - SNAP_EDGE)
        return { x: 0, y: midY, w: sw, h: availableH / 2 };
    }

    if (mouseX < SNAP_EDGE) return { x: 0, y: TOP_BAR_HEIGHT, w: sw / 2, h: availableH };
    if (mouseX > sw - SNAP_EDGE) return { x: sw / 2, y: TOP_BAR_HEIGHT, w: sw / 2, h: availableH };

    return null;
  }

  private applyGeometry() {
    if (this.isMaximized()) {
      this.windowEl.style.transform = 'translate3d(0, 0, 0)';
      this.windowEl.style.width = '100vw';
      this.windowEl.style.height = '100vh';
      this.rect = {
        x: 0,
        y: TOP_BAR_HEIGHT,
        w: window.innerWidth,
        h: window.innerHeight - TOP_BAR_HEIGHT,
      };
    } else {
      this.windowEl.style.transform = `translate3d(${this.rect.x}px, ${this.rect.y}px, 0)`;
      this.windowEl.style.width = `${this.rect.w}px`;
      this.windowEl.style.height = `${this.rect.h}px`;
    }
    this.fastInternalCheck(0, 0);
  }

  private updateTransform() {
    this.windowEl.style.transform = `translate3d(${this.rect.x}px, ${this.rect.y}px, 0)`;
  }

  private fastInternalCheck(mouseX: number, mouseY: number) {
    if (!this.isInitializing && (mouseX > 0 || mouseY > 0)) {
      const ghost = this.calculateSnap(mouseX, mouseY);
      const ghostStr = JSON.stringify(ghost);
      if (ghostStr !== this.lastSnapGhost) {
        this.lastSnapGhost = ghostStr;
        this.ngZone.run(() => this.snapGhost.set(ghost));
      }
    }

    const bottomEdge = this.rect.y + this.rect.h;
    const viewportBottom = window.innerHeight;
    const isOverBottom = this.isMaximized() || bottomEdge > viewportBottom;

    if (this.collisions.bottom !== isOverBottom) {
      this.collisions.bottom = isOverBottom;
      this.ngZone.run(() => this.processManager.updateBottomOverlap(isOverBottom));
    }
  }

  private prepareDragState(event: MouseEvent) {
    if (this.isMaximized() || this.isSnapped()) {
      const ratio = (event.clientX - this.rect.x) / this.windowEl.offsetWidth;
      this.rect.w = this.savedState.w;
      this.rect.h = this.savedState.h;
      this.rect.x = event.clientX - this.rect.w * ratio;
      this.rect.y = Math.max(TOP_BAR_HEIGHT, event.clientY - this.mouseOffset.y);
      this.isMaximized.set(false);
      this.isSnapped.set(false);
      this.applyGeometry();
    }

    const rect = this.windowEl.getBoundingClientRect();
    this.mouseOffset = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  toggleMaximize() {
    if (this.isMaximized()) {
      this.rect = { ...this.savedState };
      this.isMaximized.set(false);
      this.isSnapped.set(false);
      this.applyGeometry();
    } else {
      this.savedState = { ...this.rect };
      this.isMaximized.set(true);
      this.isSnapped.set(false);
      this.applyGeometry();
    }
  }

  close() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
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

  private centerWindow() {
    this.rect.x = (window.innerWidth - this.rect.w) / 2;
    this.rect.y = (window.innerHeight - this.rect.h) / 2;

    if (this.rect.y < TOP_BAR_HEIGHT) {
      this.rect.y = TOP_BAR_HEIGHT;
    }
  }
}
