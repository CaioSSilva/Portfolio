import {
  Component,
  DestroyRef,
  inject,
  output,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DatePipe, registerLocaleData } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, timer } from 'rxjs';
import { ProcessManager } from '../../core/services/process-manager';
import { NotificationCenter } from '../notification-center/notification-center';
import { NotificationService } from '../../core/services/notification';
import { ScreenService } from '../../core/services/screen';
import localePtBr from '@angular/common/locales/pt';
import { LanguageService } from '../../core/services/language';
import { NowPlayingWidget } from '../now-playing-widget/now-playing-widget';
import { AgentModeService } from '../../core/services/agent-mode';
import { Settings } from '../../core/services/settings';

registerLocaleData(localePtBr, 'pt-BR');

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [DatePipe, NotificationCenter, NowPlayingWidget],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopBar {
  private readonly destroyRef = inject(DestroyRef);
  readonly processManager = inject(ProcessManager);
  readonly notificationService = inject(NotificationService);
  readonly screen = inject(ScreenService);
  readonly lang = inject(LanguageService);
  readonly agentMode = inject(AgentModeService);
  readonly settings = inject(Settings);

  readonly forceShow = signal(false);
  readonly now = signal(new Date());
  readonly pullOffset = signal(0);
  readonly isReturning = signal(false);
  private readonly isPulling = signal(false);

  readonly onShutdown = output<boolean>();

  private touchStartY = 0;
  private isSwiping = false;
  private readonly clock = this.initClock();

  onTouchStart(event: TouchEvent): void {
    if (this.screen.isMobile() && event.touches.length > 0) {
      this.touchStartY = event.touches[0].clientY;
      this.isSwiping = true;
      this.isPulling.set(true);
      this.isReturning.set(false);
    }
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.isSwiping || !this.screen.isMobile() || event.touches.length === 0) return;
    const currentY = event.touches[0].clientY;
    const deltaY = currentY - this.touchStartY;
    if (deltaY > 0) {
      const pull = Math.min(deltaY * 0.75, 220);
      this.pullOffset.set(pull);
    }
  }

  onTouchEnd(event: TouchEvent): void {
    if (!this.screen.isMobile() || !this.isSwiping) return;
    this.isSwiping = false;
    this.isPulling.set(false);
    this.isReturning.set(true);

    if (event.changedTouches.length > 0) {
      const touchEndY = event.changedTouches[0].clientY;
      const deltaY = touchEndY - this.touchStartY;
      if (deltaY > 30) {
        this.notificationService.openPanel();
      } else if (Math.abs(deltaY) < 5) {
        this.notificationService.togglePanel();
      }
    }
    this.pullOffset.set(0);
    timer(350)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.isReturning.set(false));
  }

  handlePowerOff(): void {
    this.onShutdown.emit(true);
  }

  private initClock(): void {
    if (typeof window === 'undefined') return;
    interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.now.set(new Date()));
  }
}
