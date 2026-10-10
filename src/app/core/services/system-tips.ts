import { effect, inject, Injectable } from '@angular/core';
import { Subscription, take, timer } from 'rxjs';
import { NotificationService } from './notification';
import { LanguageService } from './language';
import { Settings } from './settings';
import { ScreenService } from './screen';

@Injectable({ providedIn: 'root' })
export class SystemTips {
  private readonly notifications = inject(NotificationService);
  private readonly settings = inject(Settings);
  private readonly lang = inject(LanguageService);
  private readonly screen = inject(ScreenService);

  private tipTimer = Subscription.EMPTY;
  private readonly shownDesktopIndexes: Set<number> = new Set();
  private readonly shownMobileIndexes: Set<number> = new Set();

  constructor() {
    effect(() => {
      this.lang.currentLang();
      this.shownDesktopIndexes.clear();
      this.shownMobileIndexes.clear();
    });
  }

  startRandomTips(): void {
    this.scheduleNextTip(15000, true);
  }

  stopTips(): void {
    this.tipTimer.unsubscribe();
  }

  private scheduleNextTip(delay: number, isFirst: boolean): void {
    this.stopTips();

    this.tipTimer = timer(delay)
      .pipe(take(1))
      .subscribe(() => this.processTipCycle(isFirst));
  }

  private processTipCycle(isFirst: boolean): void {
    if (!this.settings.tipsEnabled()) {
      this.stopTips();
      return;
    }
    this.showRandomTip();
    this.scheduleNextTip(this.calculateNextDelay(isFirst), false);
  }

  showRandomTip(): void {
    const translations = this.lang.t();
    const isMobile = this.screen.isMobile();
    const pool = isMobile ? translations.systemTips.mobile : translations.systemTips.desktop;
    const message = this.getNextTipMessage(pool, isMobile);

    if (!message) return;

    this.notifications.show({
      title: translations.systemTips.title,
      message,
      icon: 'fas fa-lightbulb',
    });
  }

  private getNextTipMessage(pool: Record<string, string>, isMobile: boolean): string | null {
    const values = Object.values(pool);
    if (values.length === 0) return null;

    const seen = isMobile ? this.shownMobileIndexes : this.shownDesktopIndexes;
    if (seen.size >= values.length) seen.clear();

    const unseenIndices: number[] = [];
    for (let i = 0; i < values.length; i++) {
      if (!seen.has(i)) unseenIndices.push(i);
    }

    const pick = unseenIndices[Math.floor(Math.random() * unseenIndices.length)];
    seen.add(pick);
    return values[pick];
  }

  private calculateNextDelay(isFirst: boolean): number {
    if (isFirst) return 1000 * 60 * 5;

    const minMinutes = 7;
    const maxMinutes = 10;
    const randomMinutes = Math.floor(Math.random() * (maxMinutes - minMinutes + 1) + minMinutes);

    return randomMinutes * 60 * 1000;
  }
}
