import { Injectable, NgZone, inject, signal } from '@angular/core';
import { Process } from '../models/process';
import { ProcessManager } from './process-manager';

export const TOP_BAR_HEIGHT = 32;
const MIN_W = 320;
const MIN_H = 240;
const SNAP_EDGE = 15;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

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
  readonly snapGhost = signal<Rect | null>(null);

  private rect: Rect = { x: 0, y: 0, w: 1000, h: 700 };
  private normalRect: Rect = { x: 0, y: 0, w: 1000, h: 700 };

  private mouseOffset = { x: 0, y: 0 };
  private rafId: number | null = null;
  private lastSnapGhost: string | null = null;
  private bottomOverlap = false;

  init(element: HTMLElement, process: Process): void {
    this.windowEl = element;
    this.process = process;
    this.centerWindow();
    this.normalRect = { ...this.rect };
    this.applyStyles();
    requestAnimationFrame(() => this.isVisible.set(true));
  }

  startDrag(event: MouseEvent): void {
    if (event.button !== 0 || this.isResizing()) return;

    this.processManager.focus(this.process.id);
    const parent = this.windowEl.offsetParent as HTMLElement;
    if (!parent) return;

    this.prepareDragState(event);
    this.isDragging.set(true);

    this.ngZone.runOutsideAngular(() => {
      const onMove = (e: MouseEvent) => {
        if (this.rafId !== null) cancelAnimationFrame(this.rafId);
        this.rafId = requestAnimationFrame(() => {
          const parentRect = parent.getBoundingClientRect();
          this.rect.x = e.clientX - parentRect.left - this.mouseOffset.x;
          this.rect.y = Math.max(TOP_BAR_HEIGHT, e.clientY - parentRect.top - this.mouseOffset.y);
          this.updateTransform();
          this.updateSnapGhost(e.clientX, e.clientY);
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

  private updateSnapGhost(mouseX: number, mouseY: number): void {
    const ghost = this.calculateSnap(mouseX, mouseY);
    const ghostStr = JSON.stringify(ghost);

    if (ghostStr !== this.lastSnapGhost) {
      this.lastSnapGhost = ghostStr;
      this.ngZone.run(() => {
        this.snapGhost.set(ghost);
      });
    }
  }

  startResize(event: MouseEvent): void {
    if (this.isMaximized() || event.button !== 0) return;

    event.preventDefault();
    event.stopPropagation();
    this.isResizing.set(true);

    const startX = event.clientX;
    const startY = event.clientY;
    const startRect = { ...this.rect };

    this.ngZone.runOutsideAngular(() => {
      const onMove = (e: MouseEvent) => {
        if (this.rafId !== null) cancelAnimationFrame(this.rafId);
        this.rafId = requestAnimationFrame(() => {
          this.rect.w = Math.max(MIN_W, startRect.w + (e.clientX - startX));
          this.rect.h = Math.max(MIN_H, startRect.h + (e.clientY - startY));
          this.windowEl.style.width = `${this.rect.w}px`;
          this.windowEl.style.height = `${this.rect.h}px`;
          this.checkBottomOverlap();
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
          this.normalRect = { ...this.rect };
        });
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onStop);
    });
  }

  toggleMaximize(): void {
    if (this.isMaximized()) {
      this.rect = { ...this.normalRect };

      if (this.rect.h >= window.innerHeight - TOP_BAR_HEIGHT) {
        this.rect.w = 1000;
        this.rect.h = 700;
      }

      this.isMaximized.set(false);
      this.isSnapped.set(false);
    } else {
      if (!this.isSnapped()) {
        this.normalRect = { ...this.rect };
      }
      this.isMaximized.set(true);
      this.isSnapped.set(false);
    }
    this.applyStyles();
  }

  close(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.processManager.updateBottomOverlap(false);
    this.processManager.close(this.process.id);
  }

  minimize(): void {
    this.processManager.updateBottomOverlap(false);
    this.processManager.toggleMinimize(this.process.id);
  }

  focus(): void {
    this.processManager.focus(this.process.id);
  }

  private finalizeDrag(): void {
    this.ngZone.run(() => {
      this.isDragging.set(false);
      const ghost = this.snapGhost();
      if (!ghost && !this.isMaximized() && !this.isSnapped()) {
        this.normalRect = { ...this.rect };
      }
      this.applySnap();
    });
  }

  private applySnap(): void {
    const ghost = this.snapGhost();
    if (!ghost) {
      this.snapGhost.set(null);
      this.lastSnapGhost = null;
      return;
    }

    const isFullMax =
      ghost.x === 0 &&
      ghost.y === TOP_BAR_HEIGHT &&
      ghost.w === window.innerWidth &&
      ghost.h === window.innerHeight - TOP_BAR_HEIGHT;

    if (!this.isMaximized() && !this.isSnapped() && !isFullMax) {
      this.normalRect = { ...this.rect };
    }

    this.rect = { ...ghost };
    this.isSnapped.set(true);
    this.isMaximized.set(isFullMax);
    this.applyStyles();

    this.snapGhost.set(null);
    this.lastSnapGhost = null;
  }

  private calculateSnap(mouseX: number, mouseY: number): Rect | null {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const availableH = vh - TOP_BAR_HEIGHT;
    const halfW = vw / 2;
    const halfH = availableH / 2;
    const midY = TOP_BAR_HEIGHT + halfH;

    if (mouseY < SNAP_EDGE && mouseX > SNAP_EDGE && mouseX < vw - SNAP_EDGE) {
      return { x: 0, y: TOP_BAR_HEIGHT, w: vw, h: availableH };
    }

    if (mouseY < TOP_BAR_HEIGHT + SNAP_EDGE) {
      if (mouseX <= SNAP_EDGE) return { x: 0, y: TOP_BAR_HEIGHT, w: halfW, h: halfH };
      if (mouseX >= vw - SNAP_EDGE) return { x: halfW, y: TOP_BAR_HEIGHT, w: halfW, h: halfH };
    }

    if (mouseY > vh - SNAP_EDGE) {
      if (mouseX <= SNAP_EDGE) return { x: 0, y: midY, w: halfW, h: halfH };
      if (mouseX >= vw - SNAP_EDGE) return { x: halfW, y: midY, w: halfW, h: halfH };
      if (mouseX > SNAP_EDGE && mouseX < vw - SNAP_EDGE) return { x: 0, y: midY, w: vw, h: halfH };
    }

    if (mouseX < SNAP_EDGE) return { x: 0, y: TOP_BAR_HEIGHT, w: halfW, h: availableH };
    if (mouseX > vw - SNAP_EDGE) return { x: halfW, y: TOP_BAR_HEIGHT, w: halfW, h: availableH };

    return null;
  }

  private applyStyles(): void {
    if (this.isMaximized()) {
      this.windowEl.style.transform = `translate3d(0, ${TOP_BAR_HEIGHT}px, 0)`;
      this.windowEl.style.width = '100vw';
      this.windowEl.style.height = `calc(100vh - ${TOP_BAR_HEIGHT}px)`;
    } else {
      this.updateTransform();
      this.windowEl.style.width = `${this.rect.w}px`;
      this.windowEl.style.height = `${this.rect.h}px`;
    }
    this.checkBottomOverlap();
  }

  private updateTransform(): void {
    this.windowEl.style.transform = `translate3d(${this.rect.x}px, ${this.rect.y}px, 0)`;
  }

  private checkBottomOverlap(): void {
    const bottomEdge = this.rect.y + this.rect.h;
    const isOverBottom = this.isMaximized() || bottomEdge > window.innerHeight;

    if (this.bottomOverlap !== isOverBottom) {
      this.bottomOverlap = isOverBottom;
      this.ngZone.run(() => this.processManager.updateBottomOverlap(isOverBottom));
    }
  }

  private prepareDragState(event: MouseEvent): void {
    const rect = this.windowEl.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;

    if (this.isMaximized() || this.isSnapped()) {
      const ratio = offsetX / rect.width;
      this.rect = { ...this.normalRect };
      this.rect.x = event.clientX - this.rect.w * ratio;
      this.rect.y = Math.max(TOP_BAR_HEIGHT, event.clientY - offsetY);
      this.isMaximized.set(false);
      this.isSnapped.set(false);
      this.applyStyles();

      const newRect = this.windowEl.getBoundingClientRect();
      this.mouseOffset = {
        x: event.clientX - newRect.left,
        y: event.clientY - newRect.top,
      };
    } else {
      this.mouseOffset = { x: offsetX, y: offsetY };
    }
  }

  private centerWindow(): void {
    this.rect.x = (window.innerWidth - this.rect.w) / 2;
    this.rect.y = Math.max(TOP_BAR_HEIGHT, (window.innerHeight - this.rect.h) / 2);
  }
}
