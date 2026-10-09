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

  readonly swipeOffsets = signal<Record<string, number>>({});
  readonly processes = computed(() =>
    [...this.processManager.processes()].sort((firstProc, secondProc) => secondProc.zIndex - firstProc.zIndex),
  );

  private readonly dismissing = signal<Record<string, boolean>>({});
  private backdropTouchStartX = 0;
  private backdropTouchStartY = 0;
  private touchStartX = 0;
  private touchStartY = 0;
  private touchStartTime = 0;
  private lastTapTime = 0;

  onBackdropTouchStart(event: TouchEvent): void {
    this.backdropTouchStartX = event.touches[0].clientX;
    this.backdropTouchStartY = event.touches[0].clientY;
  }

  onBackdropTouchEnd(event: TouchEvent): void {
    const diffX = Math.abs(event.changedTouches[0].clientX - this.backdropTouchStartX);
    const diffY = Math.abs(event.changedTouches[0].clientY - this.backdropTouchStartY);
    if (diffX < 10 && diffY < 10) {
      event.stopPropagation();
      this.nav.closeOverview();
    }
  }

  onBackdropClick(): void {
    this.nav.closeOverview();
  }

  onCardTouchStart(event: TouchEvent, process: Process): void {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
    this.touchStartTime = Date.now();
    this.setOffset(process.id, 0);
  }

  onCardTouchMove(event: TouchEvent, process: Process): void {
    const diffY = event.touches[0].clientY - this.touchStartY;
    if (diffY < 0) {
      event.stopPropagation();
      this.setOffset(process.id, diffY);
    }
  }

  onCardTouchEnd(event: TouchEvent, process: Process): void {
    const diffX = Math.abs(event.changedTouches[0].clientX - this.touchStartX);
    const diffY = event.changedTouches[0].clientY - this.touchStartY;
    const duration = Date.now() - this.touchStartTime;
    if (diffY < -80 || (diffY < -40 && duration < 300)) {
      event.stopPropagation();
      this.dismissCard(process);
      return;
    }
    this.setOffset(process.id, 0);
    if (Math.abs(diffX) < 10 && Math.abs(diffY) < 10 && duration < 400) {
      this.lastTapTime = Date.now();
      event.stopPropagation();
      this.processManager.focus(process.id);
      this.nav.closeOverview();
    }
  }

  onCardClick(event: MouseEvent, process: Process): void {
    if (Date.now() - this.lastTapTime < 600) {
      event.stopPropagation();
      return;
    }
    event.stopPropagation();
    this.processManager.focus(process.id);
    this.nav.closeOverview();
  }

  getCardTransform(procId: string): string {
    const offset = this.swipeOffsets()[procId] ?? 0;
    return offset !== 0 ? `translateY(${offset}px)` : '';
  }

  getCardOpacity(procId: string): number {
    const offset = this.swipeOffsets()[procId] ?? 0;
    return offset < 0 ? Math.max(0, 1 + offset / 120) : 1;
  }

  isDismissing(procId: string): boolean {
    return this.dismissing()[procId] ?? false;
  }

  closeProcess(process: Process, event: Event): void {
    event.stopPropagation();
    this.processManager.close(process.id);
  }

  closeAll(): void {
    const list = [...this.processes()];
    list.forEach((process) => this.processManager.close(process.id));
    this.nav.closeOverview();
  }

  getAppLabel(appId: string, fallback: string): string {
    return (this.lang.t().apps as Record<string, string>)[appId] || fallback;
  }

  private dismissCard(process: Process): void {
    this.setOffset(process.id, -600);
    this.dismissing.update((map) => ({ ...map, [process.id]: true }));
    timer(280)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.processManager.close(process.id);
        if (this.processManager.processes().length === 0) {
          this.nav.closeOverview();
        }
      });
  }

  private setOffset(procId: string, value: number): void {
    this.swipeOffsets.update((map) => ({ ...map, [procId]: value }));
  }
}
