import { inject, Injectable } from '@angular/core';
import { NotificationService } from './notification';
import { LanguageService } from './language';
import { Settings } from './settings';

@Injectable({ providedIn: 'root' })
export class SystemTips {
  private readonly notifications = inject(NotificationService);
  private readonly settings = inject(Settings);
  private readonly lang = inject(LanguageService);

  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  startRandomTips() {
    this.scheduleNextTip(15000, true);
  }

  stopTips() {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private scheduleNextTip(delay: number, isFirst: boolean) {
    this.stopTips();

    this.timeoutId = setTimeout(() => {
      this.processTipCycle();
      this.scheduleNextTip(this.calculateNextDelay(isFirst), false);
    }, delay);
  }

  private processTipCycle() {
    if (this.settings.tipsEnabled()) {
      this.showRandomTip();
    }
  }

  private showRandomTip() {
    const t = this.lang.t();
    const message = this.getRandomTipMessage(t.systemTips.descriptions);

    if (!message) return;

    this.notifications.show({
      title: t.systemTips.title,
      message: message,
      icon: 'fas fa-lightbulb',
    });
  }

  private getRandomTipMessage(descriptions: Record<string, string>): string | null {
    const values = Object.values(descriptions);
    if (values.length === 0) return null;

    return values[Math.floor(Math.random() * values.length)] ?? null;
  }

  private calculateNextDelay(isFirst: boolean): number {
    if (isFirst) return 1000 * 60 * 5;

    const minMinutes = 7;
    const maxMinutes = 10;
    const randomMinutes = Math.floor(Math.random() * (maxMinutes - minMinutes + 1) + minMinutes);

    return randomMinutes * 60 * 1000;
  }
}
