import { effect, inject, Injectable } from '@angular/core';
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

  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private shownDesktopIndexes: Set<number> = new Set();
  private shownMobileIndexes: Set<number> = new Set();

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
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private scheduleNextTip(delay: number, isFirst: boolean): void {
    this.stopTips();

    this.timeoutId = setTimeout(() => {
      this.processTipCycle(isFirst);
    }, delay);
  }

  private processTipCycle(isFirst: boolean): void {
    if (!this.settings.tipsEnabled()) {
      this.stopTips();
      return;
    }
    this.showRandomTip();
    this.scheduleNextTip(this.calculateNextDelay(isFirst), false);
  }

  private showRandomTip(): void {
    const translations = this.lang.t();
    const pool = this.screen.isMobile()
      ? translations.systemTips.mobile
      : translations.systemTips.desktop;
    const message = this.getNextTipMessage(pool);

    if (!message) return;

    this.notifications.show({
      title: translations.systemTips.title,
      message,
      icon: 'fas fa-lightbulb',
    });
  }

  private getNextTipMessage(pool: Record<string, string>): string | null {
    const values = Object.values(pool);
    if (values.length === 0) return null;

    const seen = this.screen.isMobile() ? this.shownMobileIndexes : this.shownDesktopIndexes;

    if (seen.size >= values.length) {
      seen.clear();
    }

    const remaining = values
      .map((value, index) => ({ value, index }))
      .filter(({ index }) => !seen.has(index));

    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    seen.add(pick.index);

    return pick.value;
  }

  private calculateNextDelay(isFirst: boolean): number {
    if (isFirst) return 1000 * 60 * 5;

    const minMinutes = 7;
    const maxMinutes = 10;
    const randomMinutes = Math.floor(Math.random() * (maxMinutes - minMinutes + 1) + minMinutes);

    return randomMinutes * 60 * 1000;
  }
}
