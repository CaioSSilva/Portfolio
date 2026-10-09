import { Component, DestroyRef, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { NotificationService } from '../../core/services/notification';
import { DatePipe, registerLocaleData } from '@angular/common';
import localePtBr from '@angular/common/locales/pt';
import { LanguageService } from '../../core/services/language';
import { ScreenService } from '../../core/services/screen';
import { MusicWidget } from '../music-widget/music-widget';

registerLocaleData(localePtBr, 'pt-BR');

@Component({
  selector: 'app-notification-center',
  imports: [DatePipe, MusicWidget],
  templateUrl: './notification-center.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './notification-center.scss',
})
export class NotificationCenter {
  private readonly destroyRef = inject(DestroyRef);
  readonly notifications = inject(NotificationService);
  readonly lang = inject(LanguageService);
  readonly screen = inject(ScreenService);

  readonly now = signal(new Date());

  constructor() {
    this.initClock();
  }

  private initClock(): void {
    interval(60_000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.now.set(new Date()));
  }

  formatTimestamp(timestamp: Date): string {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    const timings = this.lang.t().notifications.timings;

    if (minutes < 1) return timings.justNow;

    if (minutes < 60) {
      return `${minutes} ${minutes === 1 ? timings.minuteAgo : timings.minutesAgo}`;
    }

    if (hours < 24) {
      return `${hours} ${hours === 1 ? timings.hourAgo : timings.hoursAgo}`;
    }

    return `${days} ${days === 1 ? timings.dayAgo : timings.daysAgo}`;
  }
}
