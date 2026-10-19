import {
  Component,
  DestroyRef,
  inject,
  computed,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { ProcessManager } from '../../core/services/process-manager';
import { MobileNavService } from '../../core/services/mobile-nav';
import { LanguageService } from '../../core/services/language';
import { Settings } from '../../core/services/settings';
import { Process } from '../../core/models/process';

@Component({
  selector: 'app-mobile-overview',
  standalone: true,
  imports: [],
  templateUrl: './mobile-overview.html',
  styleUrl: './mobile-overview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileOverview {
  private readonly destroyRef = inject(DestroyRef);
  private readonly processManager = inject(ProcessManager);
  readonly nav = inject(MobileNavService);
  readonly lang = inject(LanguageService);
  readonly settings = inject(Settings);

  readonly swipeOffsets = signal<Record<string, number>>({});
  readonly dismissing = signal<Record<string, boolean>>({});
  readonly isClosing = signal<boolean>(false);
  readonly focusingId = signal<string | null>(null);
  readonly processes = computed(() =>
    [...this.processManager.processes()].sort((firstProc, secondProc) => secondProc.zIndex - firstProc.zIndex),
  );

  private backdropTouchStartX = 0;
  private backdropTouchStartY = 0;
  private touchStartX = 0;
  private touchStartY = 0;
  private touchStartTime = 0;
  private isSwipingVertical = false;
  private lastTapTime = 0;

  onBackdropTouchStart(event: TouchEvent): void {
    this.backdropTouchStartX = event.touches[0].clientX;
    this.backdropTouchStartY = event.touches[0].clientY;
  }

  onBackdropTouchEnd(event: TouchEvent): void {
    const diffX = Math.abs(event.changedTouches[0].clientX - this.backdropTouchStartX);
    const diffY = Math.abs(event.changedTouches[0].clientY - this.backdropTouchStartY);
    if (diffX < 15 && diffY < 15) {
      event.stopPropagation();
      this.closeWithTransition();
    }
  }

  onBackdropClick(event?: MouseEvent): void {
    event?.stopPropagation();
    this.closeWithTransition();
  }

  onCardTouchStart(event: TouchEvent, process: Process): void {
    if (this.isClosing()) return;
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
    this.touchStartTime = Date.now();
    this.isSwipingVertical = false;
    this.setOffset(process.id, 0);
  }

  onCardTouchMove(event: TouchEvent, process: Process): void {
    if (this.isClosing() || this.isDismissing(process.id)) return;
    const diffX = event.touches[0].clientX - this.touchStartX;
    const diffY = event.touches[0].clientY - this.touchStartY;

    if (!this.isSwipingVertical) {
      if (diffY < -8 && Math.abs(diffY) > Math.abs(diffX) * 1.2) {
        this.isSwipingVertical = true;
      }
    }

    if (this.isSwipingVertical && diffY < 0) {
      event.stopPropagation();
      this.setOffset(process.id, diffY);
    }
  }

  onCardTouchEnd(event: TouchEvent, process: Process): void {
    if (this.isClosing()) return;
    const diffX = Math.abs(event.changedTouches[0].clientX - this.touchStartX);
    const diffY = event.changedTouches[0].clientY - this.touchStartY;
    const duration = Date.now() - this.touchStartTime;

    if (this.isSwipingVertical && (diffY < -80 || (diffY < -40 && duration < 300))) {
      event.stopPropagation();
      this.dismissCard(process);
      this.isSwipingVertical = false;
      return;
    }

    this.isSwipingVertical = false;
    this.setOffset(process.id, 0);

    if (diffX < 16 && Math.abs(diffY) < 16 && duration < 500) {
      this.lastTapTime = Date.now();
      event.stopPropagation();
      this.focusProcessAndClose(process.id);
    }
  }

  onCardClick(event: MouseEvent, process: Process): void {
    event.stopPropagation();
    if (this.isClosing() || this.isDismissing(process.id)) return;
    if (Date.now() - this.lastTapTime < 250) {
      return;
    }
    this.focusProcessAndClose(process.id);
  }

  getCardTransform(processId: string): string {
    if (this.focusingId() === processId && this.settings.windowAnimationsEnabled()) {
      return 'translate3d(0, 0, 0) scale(1.06)';
    }
    const offset = this.swipeOffsets()[processId] ?? 0;
    return offset !== 0 ? `translate3d(0, ${offset}px, 0)` : 'translate3d(0, 0, 0)';
  }

  getCardOpacity(processId: string): number {
    if (this.isClosing() && this.settings.windowAnimationsEnabled()) {
      if (this.focusingId() === processId) return 1;
      return 0;
    }
    const offset = this.swipeOffsets()[processId] ?? 0;
    return offset < 0 ? Math.max(0, 1 + offset / 120) : 1;
  }

  isDismissing(processId: string): boolean {
    return this.dismissing()[processId] ?? false;
  }

  closeProcess(process: Process, event: Event): void {
    event.stopPropagation();
    this.processManager.close(process.id);
  }

  closeAll(): void {
    const list = [...this.processes()];
    list.forEach((process) => this.processManager.close(process.id));
    this.closeWithTransition();
  }

  getAppLabel(appId: string, fallback: string): string {
    return (this.lang.t().apps as Record<string, string>)[appId] || fallback;
  }

  private focusProcessAndClose(processId: string): void {
    if (this.isClosing()) return;

    if (!this.settings.windowAnimationsEnabled()) {
      this.processManager.focus(processId);
      this.nav.closeOverview();
      return;
    }

    this.focusingId.set(processId);
    this.isClosing.set(true);

    timer(100)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.processManager.focus(processId);
        this.nav.closeOverview();
        this.isClosing.set(false);
        this.focusingId.set(null);
      });
  }

  private closeWithTransition(): void {
    if (this.isClosing()) return;

    if (!this.settings.windowAnimationsEnabled()) {
      this.nav.closeOverview();
      return;
    }

    this.isClosing.set(true);
    timer(100)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.nav.closeOverview();
        this.isClosing.set(false);
        this.focusingId.set(null);
      });
  }

  private dismissCard(process: Process): void {
    if (!this.settings.windowAnimationsEnabled()) {
      this.processManager.close(process.id);
      if (this.processManager.processes().length === 0) {
        this.nav.closeOverview();
      }
      return;
    }

    this.setOffset(process.id, -600);
    this.dismissing.update((map) => ({ ...map, [process.id]: true }));
    timer(150)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.processManager.close(process.id);
        if (this.processManager.processes().length === 0) {
          this.nav.closeOverview();
        }
      });
  }

  private setOffset(processId: string, value: number): void {
    this.swipeOffsets.update((map) => ({ ...map, [processId]: value }));
  }
}
