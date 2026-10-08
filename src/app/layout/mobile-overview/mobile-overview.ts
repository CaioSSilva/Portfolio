import { Component, inject, computed, NgZone, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcessManager } from '../../core/services/process-manager';
import { MobileNavService } from '../../core/services/mobile-nav';
import { LanguageService } from '../../core/services/language';
import { Process } from '../../core/models/process';

@Component({
  selector: 'app-mobile-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mobile-overview.html',
  styleUrl: './mobile-overview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileOverview {
  readonly processManager = inject(ProcessManager);
  readonly nav = inject(MobileNavService);
  readonly lang = inject(LanguageService);
  private readonly ngZone = inject(NgZone);

  private backdropTouchStartX = 0;
  private backdropTouchStartY = 0;

  private touchStartX = 0;
  private touchStartY = 0;
  private touchStartTime = 0;
  private lastTapTime = 0;

  readonly swipeOffsets = signal<Record<string, number>>({});
  readonly dismissing = signal<Record<string, boolean>>({});

  readonly processes = computed(() => {
    return [...this.processManager.processes()].sort((a, b) => b.zIndex - a.zIndex);
  });

  onBackdropTouchStart(event: TouchEvent): void {
    this.backdropTouchStartX = event.touches[0].clientX;
    this.backdropTouchStartY = event.touches[0].clientY;
  }

  onBackdropTouchEnd(event: TouchEvent): void {
    const dx = Math.abs(event.changedTouches[0].clientX - this.backdropTouchStartX);
    const dy = Math.abs(event.changedTouches[0].clientY - this.backdropTouchStartY);
    if (dx < 10 && dy < 10) {
      event.stopPropagation();
      this.ngZone.run(() => this.nav.closeOverview());
    }
  }

  onBackdropClick(event: MouseEvent): void {
    this.ngZone.run(() => this.nav.closeOverview());
  }

  onCardTouchStart(event: TouchEvent, proc: Process): void {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
    this.touchStartTime = Date.now();
    this.setOffset(proc.id, 0);
  }

  onCardTouchMove(event: TouchEvent, proc: Process): void {
    const dy = event.touches[0].clientY - this.touchStartY;
    if (dy < 0) {
      event.stopPropagation();
      this.setOffset(proc.id, dy);
    }
  }

  onCardTouchEnd(event: TouchEvent, proc: Process): void {
    const dx = Math.abs(event.changedTouches[0].clientX - this.touchStartX);
    const dy = event.changedTouches[0].clientY - this.touchStartY;
    const duration = Date.now() - this.touchStartTime;

    const isSwipeUp = dy < -80 || (dy < -40 && duration < 300);

    if (isSwipeUp) {
      event.stopPropagation();
      this.ngZone.run(() => this.dismissCard(proc));
      return;
    }

    this.setOffset(proc.id, 0);

    if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && duration < 400) {
      this.lastTapTime = Date.now();
      event.stopPropagation();
      this.ngZone.run(() => {
        this.processManager.focus(proc.id);
        this.nav.closeOverview();
      });
    }
  }

  onCardClick(event: MouseEvent, proc: Process): void {
    if (Date.now() - this.lastTapTime < 600) {
      event.stopPropagation();
      return;
    }
    event.stopPropagation();
    this.processManager.focus(proc.id);
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

  closeProcess(proc: Process, event: Event): void {
    event.stopPropagation();
    this.processManager.close(proc.id);
  }

  closeAll(): void {
    const list = [...this.processes()];
    list.forEach((p) => this.processManager.close(p.id));
    this.nav.closeOverview();
  }

  private dismissCard(proc: Process): void {
    this.setOffset(proc.id, -600);
    this.dismissing.update((d) => ({ ...d, [proc.id]: true }));
    setTimeout(() => {
      this.ngZone.run(() => {
        this.processManager.close(proc.id);
        if (this.processManager.processes().length === 0) {
          this.nav.closeOverview();
        }
      });
    }, 280);
  }

  private setOffset(procId: string, value: number): void {
    this.swipeOffsets.update((o) => ({ ...o, [procId]: value }));
  }
}
