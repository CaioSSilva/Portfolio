import { Injectable, NgZone, inject, signal } from '@angular/core';
import { Process } from '../models/process';
import { ProcessManager } from './process-manager';

const TOP_BAR_HEIGHT = 32;
const DOCK_HEIGHT = 90;
const DEFAULT_W = 900;
const DEFAULT_H = 600;
const MIN_W = 300;
const MIN_H = 200;
const SNAP_MARGIN = 10;

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

@Injectable()
export class WindowService {
  private processManager = inject(ProcessManager);
  private ngZone = inject(NgZone);

  private windowEl: HTMLElement | null = null;
  private process!: Process;
  private isOverTop = false;
  private isOverBottom = false;

  readonly isMaximized = signal(false);
  readonly isSnapped = signal(false);
  readonly isDragging = signal(false);
  readonly isResizing = signal(false);
  readonly isVisible = signal(false);
  readonly transformOrigin = signal('center center');
  readonly snapGhost = signal<Rect | null>(null);

  private rect = { x: 0, y: 0, w: DEFAULT_W, h: DEFAULT_H };
  private savedState = { x: 0, y: 0, w: DEFAULT_W, h: DEFAULT_H };
  private mouseOffset = { x: 0, y: 0 };

  private get currentTopOffset(): number {
    return this.processManager.isTopBarHidden() ? 0 : TOP_BAR_HEIGHT;
  }

  init(element: HTMLElement, process: Process) {
    this.windowEl = element;
    this.process = process;
    this.centerWindow();
    this.calculateTransformOrigin();
    this.applyGeometry();
    setTimeout(() => this.isVisible.set(true), 50);
  }

  close() {
    this.updateCollisions(false, false);
    this.processManager.close(this.process.id);
  }

  minimize() {
    this.calculateTransformOrigin();
    this.processManager.toggleMinimize(this.process.id);
    this.updateCollisions(false, false);
  }

  focus() {
    this.processManager.focus(this.process.id);
  }

  recalculateBounds() {
    if (this.isMaximized() || this.process.isMinimized) return;
    this.constrainToBounds();
    this.applyGeometry();
  }

  toggleMaximize() {
    if (!this.windowEl) return;

    if (!this.isMaximized()) {
      this.savedState = { ...this.rect };
      this.isMaximized.set(true);
      this.isSnapped.set(false);
      this.clearInlineStyles();
    } else {
      this.rect = { ...this.savedState };
      this.isMaximized.set(false);
      this.isSnapped.set(false);
      setTimeout(() => {
        this.constrainToBounds();
        this.applyGeometry();
      }, 0);
    }
    this.checkCollisions();
  }

  private centerWindow() {
    if (!this.windowEl) return;
    const parent = this.windowEl.offsetParent as HTMLElement;
    const parentW = parent ? parent.clientWidth : window.innerWidth;
    const parentH = parent ? parent.clientHeight : window.innerHeight;
    this.rect.x = (parentW - this.rect.w) / 2;
    this.rect.y = (parentH - this.rect.h) / 2;
    this.constrainToBounds();
  }

  private constrainToBounds() {
    if (this.isMaximized() || this.process.isMinimized || !this.windowEl) return;
    const parent = this.windowEl.offsetParent as HTMLElement;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    const globalX = Math.max(0, Math.min(parentRect.left + this.rect.x, screenW - this.rect.w));
    const globalY = Math.max(
      this.currentTopOffset,
      Math.min(parentRect.top + this.rect.y, screenH - this.rect.h),
    );

    this.rect.x = globalX - parentRect.left;
    this.rect.y = globalY - parentRect.top;
  }

  private applyGeometry() {
    if (!this.windowEl) return;
    this.windowEl.style.transform = `translate3d(${this.rect.x}px, ${this.rect.y}px, 0)`;
    this.windowEl.style.width = `${this.rect.w}px`;
    this.windowEl.style.height = `${this.rect.h}px`;
    this.checkCollisions();
  }

  private clearInlineStyles() {
    if (!this.windowEl) return;
    this.windowEl.style.transform = '';
    this.windowEl.style.width = '';
    this.windowEl.style.height = '';
  }

  private calculateTransformOrigin() {
    const source = this.process.data?.source;
    if (!source) return;
    this.transformOrigin.set(`${source.x - this.rect.x}px ${source.y - this.rect.y}px`);
  }

  private checkCollisions() {
    const ghost = this.snapGhost();

    const isAtTop =
      this.isMaximized() ||
      (ghost && ghost.y <= TOP_BAR_HEIGHT) ||
      (!this.process.isMinimized && this.rect.y < TOP_BAR_HEIGHT + 5);

    const isAtBottom =
      this.isMaximized() ||
      (ghost && ghost.y + ghost.h >= window.innerHeight - 10) ||
      (!this.process.isMinimized && this.rect.y + this.rect.h > window.innerHeight - DOCK_HEIGHT);

    this.updateCollisions(!!isAtTop, !!isAtBottom);
  }

  private updateCollisions(top: boolean, bottom: boolean) {
    if (this.isOverTop !== top) {
      this.isOverTop = top;
      this.ngZone.run(() => this.processManager.updateTopOverlap(top));
    }
    if (this.isOverBottom !== bottom) {
      this.isOverBottom = bottom;
      this.ngZone.run(() => this.processManager.updateBottomOverlap(bottom));
    }
  }

  private checkSnap(mouseX: number, mouseY: number): Rect | null {
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const topLimit = this.currentTopOffset;

    const hTotal = screenH - topLimit;
    const hHalf = hTotal / 2;
    const wHalf = screenW / 2;
    const activeMargin = SNAP_MARGIN;

    if (mouseY < activeMargin + topLimit) {
      if (mouseX < activeMargin) return { x: 0, y: topLimit, w: wHalf, h: hHalf };
      if (mouseX > screenW - activeMargin) return { x: wHalf, y: topLimit, w: wHalf, h: hHalf };
      return { x: 0, y: topLimit, w: screenW, h: hTotal };
    }

    if (mouseY > screenH - activeMargin) {
      if (mouseX < activeMargin) return { x: 0, y: topLimit + hHalf, w: wHalf, h: hHalf };
      if (mouseX > screenW - activeMargin)
        return { x: wHalf, y: topLimit + hHalf, w: wHalf, h: hHalf };
    }

    if (mouseX < activeMargin) return { x: 0, y: topLimit, w: wHalf, h: hTotal };
    if (mouseX > screenW - activeMargin) return { x: wHalf, y: topLimit, w: wHalf, h: hTotal };

    return null;
  }

  startDrag(event: MouseEvent) {
    if (event.button !== 0 || !this.windowEl) return;
    event.preventDefault();
    this.focus();
    this.isDragging.set(true);

    const el = this.windowEl;
    const parent = el.offsetParent as HTMLElement;
    if (!parent) return;

    this.handleInitialDragState(event, parent);
    el.style.transition = 'none';

    this.ngZone.runOutsideAngular(() => {
      const onMove = (e: MouseEvent) => {
        const parentRect = parent.getBoundingClientRect();
        this.rect.x = e.clientX - this.mouseOffset.x - parentRect.left;
        this.rect.y = e.clientY - this.mouseOffset.y - parentRect.top;

        el.style.transform = `translate3d(${this.rect.x}px, ${this.rect.y}px, 0)`;

        requestAnimationFrame(() => {
          const snapRect = this.checkSnap(e.clientX, e.clientY);
          this.ngZone.run(() => {
            if (this.snapGhost() !== snapRect) {
              this.snapGhost.set(snapRect);
            }
            this.checkCollisions();
          });
        });
      };

      const onStop = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onStop);
        el.style.transition = '';
        this.finalizeDrag(parent);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onStop);
    });
  }

  private handleInitialDragState(event: MouseEvent, parent: HTMLElement) {
    const el = this.windowEl!;
    if (this.isMaximized() || this.isSnapped()) {
      const parentRect = parent.getBoundingClientRect();
      const mouseRatioX = (event.clientX - parentRect.left - this.rect.x) / el.offsetWidth;

      this.rect.w = this.savedState.w;
      this.rect.h = this.savedState.h;
      this.rect.x = event.clientX - parentRect.left - this.rect.w * mouseRatioX;
      this.rect.y = event.clientY - parentRect.top - TOP_BAR_HEIGHT / 2;

      this.isMaximized.set(false);
      this.isSnapped.set(false);
      this.applyGeometry();
    }

    const rect = el.getBoundingClientRect();
    this.mouseOffset = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  private finalizeDrag(parent: HTMLElement) {
    this.ngZone.run(() => {
      this.isDragging.set(false);
      const ghost = this.snapGhost();
      if (ghost) {
        if (!this.isSnapped() && !this.isMaximized()) this.savedState = { ...this.rect };

        if (
          ghost.w === window.innerWidth &&
          ghost.h === window.innerHeight - this.currentTopOffset
        ) {
          this.toggleMaximize();
        } else {
          const parentRect = parent.getBoundingClientRect();
          this.rect = { ...ghost, x: ghost.x - parentRect.left, y: ghost.y - parentRect.top };
          this.isSnapped.set(true);
          this.applyGeometry();
        }
      } else {
        this.isSnapped.set(false);
        this.checkCollisions();
      }
      this.snapGhost.set(null);
    });
  }

  startResize(event: MouseEvent) {
    if (this.isMaximized() || event.button !== 0 || !this.windowEl) return;
    event.preventDefault();
    event.stopPropagation();
    this.isResizing.set(true);

    const startX = event.clientX,
      startY = event.clientY,
      startRect = { ...this.rect };
    const el = this.windowEl;
    const parentRect = (el.offsetParent as HTMLElement)?.getBoundingClientRect() || {
      left: 0,
      top: 0,
    };
    el.style.transition = 'none';

    this.ngZone.runOutsideAngular(() => {
      const onMove = (e: MouseEvent) => {
        let newW = startRect.w + (e.clientX - startX);
        let newH = startRect.h + (e.clientY - startY);

        const maxAvailableW = window.innerWidth - (parentRect.left + this.rect.x);
        const maxAvailableH = window.innerHeight - (parentRect.top + this.rect.y);

        this.rect.w = Math.max(MIN_W, Math.min(newW, maxAvailableW));
        this.rect.h = Math.max(MIN_H, Math.min(newH, maxAvailableH));

        el.style.width = `${this.rect.w}px`;
        el.style.height = `${this.rect.h}px`;

        this.checkCollisions();
      };

      const onStop = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onStop);
        el.style.transition = '';
        this.ngZone.run(() => this.isResizing.set(false));
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onStop);
    });
  }
}
