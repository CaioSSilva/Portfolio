import { DestroyRef, Injectable, inject, signal, effect, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { Process } from '../models/process';
import { Rect, WindowSnapLayout } from '../models/desktop';
import { ProcessManager } from './process-manager';
import { Settings } from './settings';
import { DockService } from './dock';
import { WindowSnapService } from './window-snap';
import {
  MOBILE_NAV_BAR_HEIGHT,
  TOP_BAR_HEIGHT,
  WINDOW_ANIMATION_DURATION_MS,
} from './window-constants';
export type { Rect };
export { TOP_BAR_HEIGHT };
export { MOBILE_NAV_BAR_HEIGHT };
export { WINDOW_ANIMATION_DURATION_MS };
const MIN_W = 320;
const MIN_H = 240;
const GENIE_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';
const GENIE_TRANSITION = [
  `transform ${WINDOW_ANIMATION_DURATION_MS}ms ${GENIE_EASING}`,
  `width ${WINDOW_ANIMATION_DURATION_MS}ms ${GENIE_EASING}`,
  `height ${WINDOW_ANIMATION_DURATION_MS}ms ${GENIE_EASING}`,
  `opacity ${WINDOW_ANIMATION_DURATION_MS}ms ${GENIE_EASING}`,
].join(', ');

@Injectable()
export class WindowService {
  private readonly processManager = inject(ProcessManager);
  private readonly settings = inject(Settings);
  private readonly dock = inject(DockService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly windowSnap = inject(WindowSnapService);
  readonly screen = this.windowSnap.screen;

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
  private snapRectBeforeMaximize: Rect | null = null;

  private mouseOffset = { x: 0, y: 0 };
  private rafId: number | null = null;
  private lastSnapGhost: Rect | null = null;
  private pendingSnapLayout: WindowSnapLayout | null = null;
  private snapLayout: WindowSnapLayout | null = null;
  private isBottomOverlapping = false;
  private wasMobile = false;
  private isRestoreAnimationPrepared = false;
  private unregisterSnapHandler: (() => void) | null = null;

  constructor() {
    effect(() => {
      const updated = this.processManager.processes().find((proc) => proc.id === this.process?.id);
      if (!updated) {
        this.setBottomOverlap(false);
        return;
      }
      const wasMinimized = this.process?.isMinimized ?? false;
      this.process = updated;

      if (updated.isMinimized) {
        this.setBottomOverlap(false);
      } else if (wasMinimized) {
        if (!this.screen.isMobile()) this.constrainAndPositionWindow();
        this.checkBottomOverlap();
      }

      if (this.screen.isMobile()) {
        if (wasMinimized && !updated.isMinimized && this.windowEl) {
          this.applyStyles();
          this.windowEl.style.opacity = '1';
        }
        return;
      }

      if (!this.windowEl || !this.settings.windowAnimationsEnabled()) return;

      if (wasMinimized && !updated.isMinimized) {
        this.startPreparedIconAnimation();
      } else if (!wasMinimized && updated.isMinimized && !this.isAnimatingMinimize()) {
        this.isAnimatingMinimize.set(true);
        this.animateToIcon();
        timer(WINDOW_ANIMATION_DURATION_MS)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.isAnimatingMinimize.set(false);
          });
      }
    });

    effect(() => {
      const isMobile = this.screen.isMobile();
      const viewportWidth = this.screen.width();
      const viewportHeight = this.screen.height();
      const process = this.processManager.processes().find((item) => item.id === this.process?.id);
      if (!this.windowEl || !process || process.isMinimized) return;
      if (this.isRestoreAnimationPrepared) return;

      const wasMobile = this.wasMobile;
      this.wasMobile = isMobile;
      const maximized = untracked(() => this.isMaximized());
      if (isMobile) {
        if (!maximized) {
          this.isMaximized.set(true);
          this.isSnapped.set(false);
          this.snapLayout = null;
          this.snapRectBeforeMaximize = null;
          this.applyStyles();
          this.checkBottomOverlap();
        }
      } else {
        if (wasMobile && maximized && !process.isMaximized) {
          this.isMaximized.set(false);
          this.isSnapped.set(false);
          this.snapLayout = null;
          this.snapRectBeforeMaximize = null;
          this.rect = { ...this.normalRect };
          this.constrainAndPositionWindow();
          this.applyStyles();
          this.checkBottomOverlap();
        } else if (
          this.snapLayout &&
          (untracked(() => this.isSnapped()) || (maximized && this.snapRectBeforeMaximize))
        ) {
          if (maximized && this.snapRectBeforeMaximize) {
            this.snapRectBeforeMaximize = this.windowSnap.getSnapRect(
              this.snapLayout,
              viewportWidth,
              viewportHeight,
            );
          } else {
            this.rect = this.windowSnap.getSnapRect(this.snapLayout, viewportWidth, viewportHeight);
          }
          this.constrainNormalRect(viewportWidth, viewportHeight);
          this.applyStyles();
          this.checkBottomOverlap();
        } else if (!maximized) {
          this.constrainAndPositionWindow(viewportWidth, viewportHeight);
          this.normalRect = { ...this.rect };
          this.applyStyles();
          this.checkBottomOverlap();
        } else {
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
    this.wasMobile = this.screen.isMobile();
    this.registerSnapHandler(process.id);
    if (this.initializeMobileWindow()) return;
    this.initializeDesktopWindow();
  }

  private registerSnapHandler(processId: string): void {
    this.unregisterSnapHandler?.();
    this.unregisterSnapHandler = this.processManager.registerWindowSnapHandler(
      processId,
      (layout) => this.snapToLayout(layout, false),
      () =>
        this.process.isMinimized || (!this.isMaximized() && !this.isSnapped()),
      () => this.prepareRestoreAnimation(),
    );
    this.destroyRef.onDestroy(() => this.unregisterSnapHandler?.());
  }

  private initializeMobileWindow(): boolean {
    if (this.screen.isMobile()) {
      this.isMaximized.set(true);
      this.normalRect = { ...this.rect };
      this.applyStyles();
      this.isVisible.set(true);
      return true;
    }
    return false;
  }

  private initializeDesktopWindow(): void {
    this.centerWindow();
    this.normalRect = { ...this.rect };
    this.checkBottomOverlap();
    if (this.settings.windowAnimationsEnabled()) this.animateFromIcon();
    else this.applyStyles();
    this.isVisible.set(true);
  }

  startDrag(event: PointerEvent | MouseEvent): void {
    this.assertInitialized();
    if (this.screen.isMobile() || event.button !== 0 || this.isResizing() || this.isDragging())
      return;

    this.processManager.focus(this.process.id);
    const parent = this.windowEl.offsetParent as HTMLElement;
    if (!parent) return;

    this.prepareDragState(event);
    this.isDragging.set(true);
    if (event.cancelable) event.preventDefault();
    if ('pointerId' in event) this.registerPointerDragListeners(parent, event.pointerId);
    else this.registerMouseDragListeners(parent);
  }

  private registerMouseDragListeners(parent: HTMLElement): void {
    const onMove = (e: MouseEvent) => this.onDragMove(e, parent);
    const onStop = (e: MouseEvent) => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onStop);
      this.onDragStop(e, parent);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onStop);
  }

  private registerPointerDragListeners(parent: HTMLElement, pointerId: number): void {
    const onMove = (e: PointerEvent) => {
      if (e.pointerId === pointerId) this.onDragMove(e, parent);
    };
    const onStop = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onStop);
      document.removeEventListener('pointercancel', onStop);
      this.onDragStop(e, parent);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onStop);
    document.addEventListener('pointercancel', onStop);
  }

  private onDragMove(e: MouseEvent | PointerEvent, parent: HTMLElement): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(() => {
      this.applyDragPosition(e.clientX, e.clientY, parent);
      this.rafId = null;
    });
  }

  private applyDragPosition(clientX: number, clientY: number, parent: HTMLElement): void {
    const parentRect = parent.getBoundingClientRect();
    this.rect.x = clientX - parentRect.left - this.mouseOffset.x;
    this.rect.y = Math.max(TOP_BAR_HEIGHT, clientY - parentRect.top - this.mouseOffset.y);
    this.updateSnapGhost(clientX, clientY);
    this.checkBottomOverlap();
    this.dock.forceShow.set(false);
    this.updateTransform();
  }

  private onDragStop(
    event: MouseEvent | PointerEvent,
    parent: HTMLElement,
  ): void {
    this.applyDragPosition(event.clientX, event.clientY, parent);
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.finalizeDrag();
  }

  private updateSnapGhost(mouseX: number, mouseY: number): void {
    const target = this.windowSnap.calculateSnap(
      mouseX,
      mouseY,
      this.screen.width(),
      this.screen.height(),
    );
    const ghost = target?.rect ?? null;
    this.pendingSnapLayout = target?.layout ?? null;
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

  startResize(event: PointerEvent | MouseEvent): void {
    this.assertInitialized();
    if (
      this.screen.isMobile() ||
      this.isMaximized() ||
      this.isSnapped() ||
      event.button !== 0
    )
      return;

    event.preventDefault();
    event.stopPropagation();
    this.isResizing.set(true);
    this.registerResizeListeners(event.clientX, event.clientY, { ...this.rect }, event);
  }

  private registerResizeListeners(
    startX: number,
    startY: number,
    startRect: Rect,
    event: PointerEvent | MouseEvent,
  ): void {
    if ('pointerId' in event)
      this.registerPointerResizeListeners(startX, startY, startRect, event.pointerId);
    else this.registerMouseResizeListeners(startX, startY, startRect);
  }

  private registerPointerResizeListeners(
    startX: number,
    startY: number,
    startRect: Rect,
    pointerId: number,
  ): void {
    const onMove = (event: PointerEvent) => {
      if (event.pointerId === pointerId) this.onResizeMove(event, startX, startY, startRect);
    };
    const onStop = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onStop);
      document.removeEventListener('pointercancel', onStop);
      this.onResizeStop(event, startX, startY, startRect);
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onStop);
    document.addEventListener('pointercancel', onStop);
  }

  private registerMouseResizeListeners(
    startX: number,
    startY: number,
    startRect: Rect,
  ): void {
    const onMove = (event: MouseEvent) => this.onResizeMove(event, startX, startY, startRect);
    const onStop = (event: MouseEvent) => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onStop);
      this.onResizeStop(event, startX, startY, startRect);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onStop);
  }

  private onResizeMove(
    e: MouseEvent | PointerEvent,
    startX: number,
    startY: number,
    startRect: Rect,
  ): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(() => {
      this.applyResizePosition(e.clientX, e.clientY, startX, startY, startRect);
      this.rafId = null;
    });
  }

  private applyResizePosition(
    clientX: number,
    clientY: number,
    startX: number,
    startY: number,
    startRect: Rect,
  ): void {
    const maxWidth = Math.max(1, window.innerWidth - this.rect.x);
    const maxHeight = Math.max(1, window.innerHeight - this.rect.y);
    this.rect.width = Math.min(Math.max(MIN_W, startRect.width + (clientX - startX)), maxWidth);
    this.rect.height = Math.min(Math.max(MIN_H, startRect.height + (clientY - startY)), maxHeight);
    this.windowEl.style.width = `${this.rect.width}px`;
    this.windowEl.style.height = `${this.rect.height}px`;
    this.checkBottomOverlap();
  }

  private onResizeStop(
    event: MouseEvent | PointerEvent,
    startX: number,
    startY: number,
    startRect: Rect,
  ): void {
    this.applyResizePosition(event.clientX, event.clientY, startX, startY, startRect);
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.isResizing.set(false);
    this.normalRect = { ...this.rect };
    this.checkBottomOverlap();
  }

  toggleMaximize(): void {
    this.assertInitialized();
    if (this.screen.isMobile()) return;
    if (this.isMaximized()) {
      this.unmaximize();
    } else {
      this.snapRectBeforeMaximize = this.isSnapped() ? { ...this.rect } : null;
      if (!this.isSnapped()) this.normalRect = { ...this.rect };
      this.isMaximized.set(true);
      this.isSnapped.set(false);
    }
    this.applyStyles();
    this.checkBottomOverlap();
  }

  private unmaximize(): void {
    const restoreSnap = this.snapRectBeforeMaximize;
    this.rect = {
      ...(restoreSnap && this.snapLayout
        ? this.windowSnap.getSnapRect(
            this.snapLayout,
            this.screen.width(),
            this.screen.height(),
          )
        : (restoreSnap ?? this.normalRect)),
    };
    this.snapRectBeforeMaximize = null;
    this.isMaximized.set(false);
    this.isSnapped.set(restoreSnap !== null);
    this.constrainAndPositionWindow();
    if (!restoreSnap) {
      this.normalRect = { ...this.rect };
      this.snapLayout = null;
    }
  }

  close(): void {
    if (this.isClosing()) return;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.setBottomOverlap(false);
    if (!this.settings.windowAnimationsEnabled() || this.screen.isMobile()) {
      this.processManager.close(this.process.id);
      return;
    }
    this.isClosing.set(true);
    this.animateToIcon();
    timer(WINDOW_ANIMATION_DURATION_MS)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.processManager.close(this.process.id));
  }

  minimize(): void {
    if (this.isAnimatingMinimize()) return;
    this.setBottomOverlap(false);
    this.processManager.toggleMinimize(this.process.id);
  }

  private resolveIconRect(): DOMRect | null {
    if (this.screen.isMobile()) {
      const btn = document.querySelector<HTMLElement>('[data-nav-overview]');
      return btn ? btn.getBoundingClientRect() : null;
    }
    const btn = document.querySelector<HTMLElement>(`[data-dock-id="${this.process.appId}"]`);
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
    this.setIconStartStyles(iconRect);
    requestAnimationFrame(() => requestAnimationFrame(() => this.completeIconAnimation()));
  }

  private prepareRestoreAnimation(): void {
    if (!this.windowEl || this.screen.isMobile() || !this.settings.windowAnimationsEnabled()) return;
    this.setIconStartStyles(this.resolveIconRect());
    this.isRestoreAnimationPrepared = true;
  }

  private startPreparedIconAnimation(): void {
    if (!this.isRestoreAnimationPrepared) {
      this.setIconStartStyles(this.resolveIconRect());
      this.isRestoreAnimationPrepared = true;
    }
    requestAnimationFrame(() => this.completeIconAnimation());
  }

  private setIconStartStyles(iconRect: DOMRect | null): void {
    const startX = iconRect ? iconRect.left + iconRect.width / 2 : window.innerWidth / 2;
    const startY = iconRect ? iconRect.top + iconRect.height / 2 : window.innerHeight;
    this.windowEl.style.transition = 'none';
    this.windowEl.style.transform = `translate3d(${startX}px, ${startY}px, 0)`;
    this.windowEl.style.width = '0px';
    this.windowEl.style.height = '0px';
    this.windowEl.style.opacity = '0';
  }

  private completeIconAnimation(): void {
    this.isRestoreAnimationPrepared = false;
    this.windowEl.style.transition = GENIE_TRANSITION;
    this.applyStyles();
    this.windowEl.style.opacity = '1';
    timer(WINDOW_ANIMATION_DURATION_MS)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.windowEl.style.transition = '';
        this.windowEl.style.opacity = '';
      });
  }

  focus(): void {
    this.processManager.focus(this.process.id);
  }

  handleWindowShortcut(event: KeyboardEvent): boolean {
    if (this.isShortcutBlocked(event)) {
      return false;
    }

    const action = this.windowSnap.resolveShortcut(
      event,
      this.settings.windowSnapMode(),
      this.isMaximized(),
      this.isSnapped(),
      this.snapLayout,
    );
    if (!action) return false;
    event.preventDefault();
    if (action.type === 'restore') this.restoreWindow();
    else this.snapToLayout(action.layout);
    return true;
  }

  private isShortcutBlocked(event: KeyboardEvent): boolean {
    const target = event.target;
    return (
      this.screen.isMobile() ||
      this.processManager.activeProcessId() !== this.process.id ||
      event.metaKey ||
      (target instanceof HTMLElement &&
        (target.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)))
    );
  }

  restoreWindow(): void {
    if (this.isMaximized()) {
      this.unmaximize();
    } else if (this.isSnapped()) {
      this.rect = { ...this.normalRect };
      this.isSnapped.set(false);
      this.snapLayout = null;
      this.constrainAndPositionWindow();
    }
    this.applyStyles();
    this.checkBottomOverlap();
  }

  snapToLayout(layout: WindowSnapLayout, coordinatePair = true): void {
    if (this.screen.isMobile()) return;
    if (!this.isMaximized() && !this.isSnapped()) this.normalRect = { ...this.rect };
    this.snapRectBeforeMaximize = null;
    this.snapLayout = layout;
    this.isSnapped.set(true);
    this.isMaximized.set(layout === 'maximize');
    this.rect = this.windowSnap.getSnapRect(layout, this.screen.width(), this.screen.height());
    this.applyStyles();
    this.checkBottomOverlap();

    if (coordinatePair) this.pairAdjacentWindow(layout);
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
      this.clearSnapPreview();
      return;
    }

    const layout = this.pendingSnapLayout;
    if (!layout) return;
    this.applySnapLayout(layout, ghost);
  }

  private clearSnapPreview(): void {
    this.pendingSnapLayout = null;
    this.snapGhost.set(null);
    this.lastSnapGhost = null;
  }

  private applySnapLayout(layout: WindowSnapLayout, rect: Rect): void {
    this.snapRectBeforeMaximize = null;
    const isMaximizing = layout === 'maximize';
    if (!this.isMaximized() && !this.isSnapped() && !isMaximizing)
      this.normalRect = { ...this.rect };

    this.rect = { ...rect };
    this.snapLayout = layout;
    this.isSnapped.set(true);
    this.isMaximized.set(isMaximizing);
    this.applyStyles();
    this.snapGhost.set(null);
    this.lastSnapGhost = null;
    this.pendingSnapLayout = null;
    this.checkBottomOverlap();
    this.pairAdjacentWindow(layout);
  }

  private pairAdjacentWindow(layout: WindowSnapLayout): void {
    if (!this.settings.snapPairingEnabled()) return;
    if (layout === 'left-half') {
      this.processManager.requestSnapPairing(this.process.id, 'right-half');
    } else if (layout === 'right-half') {
      this.processManager.requestSnapPairing(this.process.id, 'left-half');
    }
  }

  private constrainNormalRect(vw: number, vh: number): void {
    const snappedRect = this.rect;
    this.rect = { ...this.normalRect };
    this.constrainAndPositionWindow(vw, vh);
    this.normalRect = { ...this.rect };
    this.rect = snappedRect;
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
    const dockArea = document.querySelector<HTMLElement>('[data-dock-area]');
    const dockRect = dockArea?.getBoundingClientRect();
    const overlapsDockHorizontally =
      dockRect !== undefined &&
      this.rect.x < dockRect.right &&
      this.rect.x + this.rect.width > dockRect.left;
    const isOverBottom =
      this.isMaximized() ||
      (overlapsDockHorizontally && bottomEdge > window.innerHeight - (threshold + 32));

    this.setBottomOverlap(isOverBottom);
  }

  private setBottomOverlap(isOverlapping: boolean): void {
    if (this.isBottomOverlapping === isOverlapping) return;
    this.isBottomOverlapping = isOverlapping;
    this.processManager.updateBottomOverlap(isOverlapping);
  }

  private prepareDragState(event: MouseEvent | PointerEvent): void {
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
    this.constrainAndPositionWindow();
    this.normalRect = { ...this.rect };
    this.snapRectBeforeMaximize = null;
    this.snapLayout = null;
    this.rect.x = event.clientX - this.rect.width * ratio;
    this.rect.y = Math.max(TOP_BAR_HEIGHT, event.clientY - offsetY);
    this.isMaximized.set(false);
    this.isSnapped.set(false);
    this.applyStyles();
    const newRect = this.windowEl.getBoundingClientRect();
    this.mouseOffset = { x: event.clientX - newRect.left, y: event.clientY - newRect.top };
  }

  private constrainAndPositionWindow(
    vw = window.innerWidth,
    vh = window.innerHeight,
  ): void {
    this.clampRectToViewport(vw, vh);

    this.rect.x = Math.min(Math.max(0, this.rect.x), vw - this.rect.width);
    this.rect.y = Math.min(Math.max(TOP_BAR_HEIGHT, this.rect.y), vh - this.rect.height);
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
    this.rect.width = Math.min(this.rect.width, Math.max(1, vw));
    this.rect.height = Math.min(this.rect.height, Math.max(1, vh - TOP_BAR_HEIGHT));
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
