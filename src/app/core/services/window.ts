import { DestroyRef, Injectable, inject, signal, effect, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { Process } from '../models/process';
import { Rect } from '../models/desktop';
import { ProcessManager } from './process-manager';
import { Settings } from './settings';
import { DockService } from './dock';
import { ScreenService } from './screen';
export type { Rect };
export const TOP_BAR_HEIGHT = 32;
export const MOBILE_NAV_BAR_HEIGHT = 48;
const MIN_W = 320;
const MIN_H = 240;
const SNAP_EDGE = 32;

const ANIM_DURATION_MS = 180;
const GENIE_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';
const GENIE_TRANSITION = `transform ${ANIM_DURATION_MS}ms ${GENIE_EASING}, width ${ANIM_DURATION_MS}ms ${GENIE_EASING}, height ${ANIM_DURATION_MS}ms ${GENIE_EASING}, opacity ${ANIM_DURATION_MS}ms ${GENIE_EASING}`;

@Injectable()
export class WindowService {
  private readonly processManager = inject(ProcessManager);
  private readonly settings = inject(Settings);
  private readonly dock = inject(DockService);
  private readonly destroyRef = inject(DestroyRef);
  readonly screen = inject(ScreenService);

  private windowEl!: HTMLElement;
  private process!: Process;

  readonly isMaximized = signal<boolean>(false);
  readonly isSnapped = signal<boolean>(false);
  readonly isDragging = signal<boolean>(false);
  readonly isResizing = signal<boolean>(false);
  readonly isVisible = signal<boolean>(false);
  readonly isClosing = signal<boolean>(false);
  readonly isAnimatingMinimize = signal<boolean>(false);
  readonly snapGhost = signal<Rect | null>(null);

  private rect: Rect = { x: 0, y: 0, width: 1000, height: 700 };
  private normalRect: Rect = { x: 0, y: 0, width: 1000, height: 700 };

  private mouseOffset = { x: 0, y: 0 };
  private rafId: number | null = null;
  private lastSnapGhost: Rect | null = null;
  private isBottomOverlapping = false;

  constructor() {
    effect(() => {
      const updated = this.processManager.processes().find((proc) => proc.id === this.process?.id);
      if (!updated) return;
      const wasMinimized = this.process?.isMinimized ?? false;
      this.process = updated;

      if (this.screen.isMobile()) {
        if (wasMinimized && !updated.isMinimized && this.windowEl) {
          this.applyStyles();
          this.windowEl.style.opacity = '1';
        }
        return;
      }

      if (!this.windowEl || !this.settings.windowAnimationsEnabled()) return;

      if (wasMinimized && !updated.isMinimized) {
        this.animateFromIcon();
      } else if (!wasMinimized && updated.isMinimized && !this.isAnimatingMinimize()) {
        this.isAnimatingMinimize.set(true);
        this.animateToIcon();
        timer(ANIM_DURATION_MS)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.isAnimatingMinimize.set(false);
          });
      }
    });

    effect(() => {
      const isMobile = this.screen.isMobile();
      if (!this.windowEl) return;

      const maximized = untracked(() => this.isMaximized());
      if (isMobile) {
        if (!maximized) {
          this.isMaximized.set(true);
          this.isSnapped.set(false);
          this.applyStyles();
          this.checkBottomOverlap();
        }
      } else {
        if (maximized && !this.process?.isMaximized) {
          this.isMaximized.set(false);
          this.rect = { ...this.normalRect };
          this.constrainAndPositionWindow();
          this.applyStyles();
          this.checkBottomOverlap();
        } else if (!maximized) {
          this.constrainAndPositionWindow();
          this.applyStyles();
          this.checkBottomOverlap();
        }
      }
    });
  }

  private assertInitialized(): void {
    if (!this.windowEl)
      throw new Error('WindowService.init() must be called before using this service.');
  }

  init(element: HTMLElement, process: Process): void {
    this.windowEl = element;
    this.process = process;

    if (this.screen.isMobile()) {
      this.isMaximized.set(true);
      this.normalRect = { ...this.rect };
      this.applyStyles();
      this.isVisible.set(true);
      return;
    }

    this.centerWindow();
    this.normalRect = { ...this.rect };

    if (!this.settings.windowAnimationsEnabled()) {
      this.applyStyles();
      this.isVisible.set(true);
      return;
    }

    this.isVisible.set(true);
    this.animateFromIcon();
  }

  startDrag(event: MouseEvent): void {
    this.assertInitialized();
    if (this.screen.isMobile() || event.button !== 0 || this.isResizing() || this.isDragging()) return;

    this.processManager.focus(this.process.id);
    const parent = this.windowEl.offsetParent as HTMLElement;
    if (!parent) return;

    this.prepareDragState(event);
    this.isDragging.set(true);
    this.registerDragListeners(parent);
  }

  private registerDragListeners(parent: HTMLElement): void {
    const onMove = (e: MouseEvent) => this.onDragMove(e, parent);
    const onStop = () => this.onDragStop(onMove, onStop);

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onStop);
  }

  private onDragMove(e: MouseEvent, parent: HTMLElement): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(() => {
      const parentRect = parent.getBoundingClientRect();
      this.rect.x = e.clientX - parentRect.left - this.mouseOffset.x;
      this.rect.y = Math.max(TOP_BAR_HEIGHT, e.clientY - parentRect.top - this.mouseOffset.y);
      this.updateSnapGhost(e.clientX, e.clientY);
      this.checkBottomOverlap();
      this.dock.forceShow.set(false);
      this.updateTransform();
      this.rafId = null;
    });
  }

  private onDragStop(onMove: (e: MouseEvent) => void, onStop: () => void): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onStop);
    this.finalizeDrag();
  }

  private updateSnapGhost(mouseX: number, mouseY: number): void {
    const ghost = this.calculateSnap(mouseX, mouseY);
    if (!this.snapGhostChanged(ghost)) return;
    this.lastSnapGhost = ghost;
    this.snapGhost.set(ghost);
  }

  private snapGhostChanged(ghost: Rect | null): boolean {
    const prev = this.lastSnapGhost;
    if (prev === null && ghost === null) return false;
    if (prev === null || ghost === null) return true;
    return (
      prev.x !== ghost.x ||
      prev.y !== ghost.y ||
      prev.width !== ghost.width ||
      prev.height !== ghost.height
    );
  }

  startResize(event: MouseEvent): void {
    this.assertInitialized();
    if (this.screen.isMobile() || this.isMaximized() || event.button !== 0) return;

    event.preventDefault();
    event.stopPropagation();
    this.isResizing.set(true);
    this.registerResizeListeners(event.clientX, event.clientY, { ...this.rect });
  }

  private registerResizeListeners(startX: number, startY: number, startRect: Rect): void {
    const onMove = (e: MouseEvent) => this.onResizeMove(e, startX, startY, startRect);
    const onStop = () => this.onResizeStop(onMove, onStop);

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onStop);
  }

  private onResizeMove(e: MouseEvent, startX: number, startY: number, startRect: Rect): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(() => {
      this.rect.width = Math.max(MIN_W, startRect.width + (e.clientX - startX));
      this.rect.height = Math.max(MIN_H, startRect.height + (e.clientY - startY));
      this.windowEl.style.width = `${this.rect.width}px`;
      this.windowEl.style.height = `${this.rect.height}px`;
      this.rafId = null;
    });
  }

  private onResizeStop(onMove: (e: MouseEvent) => void, onStop: () => void): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onStop);
    this.isResizing.set(false);
    this.normalRect = { ...this.rect };
  }

  toggleMaximize(): void {
    this.assertInitialized();
    if (this.screen.isMobile()) return;
    if (this.isMaximized()) {
      this.unmaximize();
    } else {
      if (!this.isSnapped()) this.normalRect = { ...this.rect };
      this.isMaximized.set(true);
      this.isSnapped.set(false);
    }
    this.applyStyles();
    this.checkBottomOverlap();
  }

  private unmaximize(): void {
    this.rect = { ...this.normalRect };
    if (this.rect.height >= window.innerHeight - TOP_BAR_HEIGHT) {
      this.rect.width = 1000;
      this.rect.height = 700;
    }
    this.isMaximized.set(false);
    this.isSnapped.set(false);
  }

  close(): void {
    if (this.isClosing()) return;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.isBottomOverlapping) {
      this.processManager.updateBottomOverlap(false);
    }
    if (!this.settings.windowAnimationsEnabled() || this.screen.isMobile()) {
      this.processManager.close(this.process.id);
      return;
    }
    this.isClosing.set(true);
    this.animateToIcon();
    timer(ANIM_DURATION_MS)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.processManager.close(this.process.id));
  }

  minimize(): void {
    if (this.isAnimatingMinimize()) return;
    if (this.isBottomOverlapping) {
      this.processManager.updateBottomOverlap(false);
    }
    this.processManager.toggleMinimize(this.process.id);
  }

  private resolveIconRect(): DOMRect | null {
    if (this.screen.isMobile()) {
      const btn = document.querySelector<HTMLElement>('[data-nav-overview]');
      return btn ? btn.getBoundingClientRect() : null;
    }
    const btn = document.querySelector<HTMLElement>(
      `[data-dock-id="${this.process.appId}"]`,
    );
    return btn ? btn.getBoundingClientRect() : null;
  }

  private animateToIcon(): void {
    const iconRect = this.resolveIconRect();
    const targetX = iconRect ? iconRect.left + iconRect.width / 2 : window.innerWidth / 2;
    const targetY = iconRect ? iconRect.top + iconRect.height / 2 : window.innerHeight;
    this.windowEl.style.transition = GENIE_TRANSITION;
    this.windowEl.style.transformOrigin = 'center center';
    this.windowEl.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
    this.windowEl.style.width = '0px';
    this.windowEl.style.height = '0px';
    this.windowEl.style.opacity = '0';
  }

  private animateFromIcon(): void {
    const iconRect = this.resolveIconRect();
    const startX = iconRect ? iconRect.left + iconRect.width / 2 : window.innerWidth / 2;
    const startY = iconRect ? iconRect.top + iconRect.height / 2 : window.innerHeight;
    this.windowEl.style.transition = 'none';
    this.windowEl.style.transform = `translate3d(${startX}px, ${startY}px, 0)`;
    this.windowEl.style.width = '0px';
    this.windowEl.style.height = '0px';
    this.windowEl.style.opacity = '0';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.windowEl.style.transition = GENIE_TRANSITION;
        this.applyStyles();
        this.windowEl.style.opacity = '1';
        timer(ANIM_DURATION_MS)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.windowEl.style.transition = '';
            this.windowEl.style.opacity = '';
          });
      });
    });
  }

  focus(): void {
    this.processManager.focus(this.process.id);
  }

  private finalizeDrag(): void {
    this.isDragging.set(false);
    const ghost = this.snapGhost();
    if (!ghost && !this.isMaximized() && !this.isSnapped()) {
      this.normalRect = { ...this.rect };
    }
    this.applySnap();
  }

  private applySnap(): void {
    const ghost = this.snapGhost();
    if (!ghost) {
      this.snapGhost.set(null);
      this.lastSnapGhost = null;
      return;
    }

    const isFullMax = this.isFullMaximizeSnap(ghost);
    if (!this.isMaximized() && !this.isSnapped() && !isFullMax) this.normalRect = { ...this.rect };

    this.rect = { ...ghost };
    this.isSnapped.set(true);
    this.isMaximized.set(isFullMax);
    this.applyStyles();
    this.snapGhost.set(null);
    this.lastSnapGhost = null;
    this.checkBottomOverlap();
  }

  private isFullMaximizeSnap(ghost: Rect): boolean {
    return (
      ghost.x === 0 &&
      ghost.y === TOP_BAR_HEIGHT &&
      ghost.width === window.innerWidth &&
      ghost.height === window.innerHeight - TOP_BAR_HEIGHT
    );
  }

  private calculateSnap(mouseX: number, mouseY: number): Rect | null {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const availableH = vh - TOP_BAR_HEIGHT;
    const halfWidth = vw / 2;
    const halfHeight = availableH / 2;
    const midY = TOP_BAR_HEIGHT + halfHeight;

    if (mouseY < TOP_BAR_HEIGHT + SNAP_EDGE && mouseX > SNAP_EDGE && mouseX < vw - SNAP_EDGE) {
      return { x: 0, y: TOP_BAR_HEIGHT, width: vw, height: availableH };
    }

    if (mouseY < TOP_BAR_HEIGHT + SNAP_EDGE) {
      if (mouseX <= SNAP_EDGE)
        return { x: 0, y: TOP_BAR_HEIGHT, width: halfWidth, height: halfHeight };
      if (mouseX >= vw - SNAP_EDGE)
        return { x: halfWidth, y: TOP_BAR_HEIGHT, width: halfWidth, height: halfHeight };
    }

    if (mouseY > vh - SNAP_EDGE) {
      if (mouseX <= SNAP_EDGE) return { x: 0, y: midY, width: halfWidth, height: halfHeight };
      if (mouseX >= vw - SNAP_EDGE)
        return { x: halfWidth, y: midY, width: halfWidth, height: halfHeight };
      if (mouseX > SNAP_EDGE && mouseX < vw - SNAP_EDGE)
        return { x: 0, y: midY, width: vw, height: halfHeight };
    }

    if (mouseX < SNAP_EDGE)
      return { x: 0, y: TOP_BAR_HEIGHT, width: halfWidth, height: availableH };
    if (mouseX > vw - SNAP_EDGE)
      return { x: halfWidth, y: TOP_BAR_HEIGHT, width: halfWidth, height: availableH };

    return null;
  }

  private applyStyles(): void {
    if (this.screen.isMobile()) {
      this.windowEl.style.transform = `translate3d(0, ${TOP_BAR_HEIGHT}px, 0)`;
      this.windowEl.style.width = '100vw';
      this.windowEl.style.height = `calc(100dvh - ${TOP_BAR_HEIGHT + MOBILE_NAV_BAR_HEIGHT}px)`;
    } else if (this.isMaximized()) {
      this.windowEl.style.transform = `translate3d(0, ${TOP_BAR_HEIGHT}px, 0)`;
      this.windowEl.style.width = '100vw';
      this.windowEl.style.height = `calc(100dvh - ${TOP_BAR_HEIGHT}px)`;
    } else {
      this.updateTransform();
      this.windowEl.style.width = `${this.rect.width}px`;
      this.windowEl.style.height = `${this.rect.height}px`;
    }
  }

  private updateTransform(): void {
    this.windowEl.style.transform = `translate3d(${this.rect.x}px, ${this.rect.y}px, 0)`;
  }

  private checkBottomOverlap(): void {
    const bottomEdge = this.rect.y + this.rect.height;
    const threshold = this.settings.dockSize();
    const isOverBottom = this.isMaximized() || bottomEdge > window.innerHeight - (threshold + 32);

    if (this.isBottomOverlapping !== isOverBottom) {
      this.isBottomOverlapping = isOverBottom;
      this.processManager.updateBottomOverlap(isOverBottom);
    }
  }

  private prepareDragState(event: MouseEvent): void {
    const rect = this.windowEl.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    if (this.isMaximized() || this.isSnapped()) {
      this.exitMaximizedForDrag(event, rect, offsetX, offsetY);
    } else {
      this.mouseOffset = { x: offsetX, y: offsetY };
    }
  }

  private exitMaximizedForDrag(
    event: MouseEvent,
    rect: DOMRect,
    offsetX: number,
    offsetY: number,
  ): void {
    const ratio = offsetX / rect.width;
    this.rect = { ...this.normalRect };
    this.rect.x = event.clientX - this.rect.width * ratio;
    this.rect.y = Math.max(TOP_BAR_HEIGHT, event.clientY - offsetY);
    this.isMaximized.set(false);
    this.isSnapped.set(false);
    this.applyStyles();
    const newRect = this.windowEl.getBoundingClientRect();
    this.mouseOffset = { x: event.clientX - newRect.left, y: event.clientY - newRect.top };
  }

  private constrainAndPositionWindow(): void {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    this.clampRectToViewport(vw, vh);

    const maxX = Math.max(0, vw - this.rect.width);
    const maxY = Math.max(TOP_BAR_HEIGHT, vh - this.rect.height);

    if (
      this.rect.x < 0 ||
      this.rect.x > maxX ||
      this.rect.y < TOP_BAR_HEIGHT ||
      this.rect.y > maxY
    ) {
      this.centerWindow();
    }
  }

  private centerWindow(): void {
    const cascadeStep = 28;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    this.clampRectToViewport(vw, vh);
    if (this.processManager.processes().length <= 1) {
      this.centerRectInViewport(vw, vh);
      return;
    }
    this.cascadeRect(vw, vh, cascadeStep);
  }

  private clampRectToViewport(vw: number, vh: number): void {
    this.rect.width = Math.min(this.rect.width, Math.max(MIN_W, vw - 40));
    this.rect.height = Math.min(this.rect.height, Math.max(MIN_H, vh - TOP_BAR_HEIGHT - 60));
  }

  private centerRectInViewport(vw: number, vh: number): void {
    this.rect.x = Math.round((vw - this.rect.width) / 2);
    this.rect.y = Math.max(TOP_BAR_HEIGHT, Math.round((vh - this.rect.height) / 2));
  }

  private cascadeRect(vw: number, vh: number, cascadeStep: number): void {
    const cascadeIndex = this.process?.cascadeIndex ?? 0;
    const maxOffsetX = Math.max(0, vw - this.rect.width - cascadeStep);
    const maxOffsetY = Math.max(0, vh - this.rect.height - cascadeStep);
    const maxSteps = Math.max(
      1,
      Math.floor(Math.min(maxOffsetX, maxOffsetY - TOP_BAR_HEIGHT) / cascadeStep),
    );
    const step = (cascadeIndex % maxSteps) * cascadeStep;
    this.rect.x = Math.max(0, (vw - this.rect.width) / 2 - (maxSteps * cascadeStep) / 2 + step);
    this.rect.y = Math.max(
      TOP_BAR_HEIGHT,
      (vh - this.rect.height) / 2 - (maxSteps * cascadeStep) / 2 + step,
    );
  }
}
