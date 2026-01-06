import { inject, Injectable } from '@angular/core';
import { NotificationService } from './notification';
import { LanguageService } from './language';
import { Settings } from './settings';

@Injectable({
  providedIn: 'root',
})
export class SystemTips {
  private notifications = inject(NotificationService);
  readonly settings = inject(Settings);
  private lang = inject(LanguageService);
  private timeoutId?: any;

  startRandomTips() {
    this.scheduleNextTip(1000 * 15, true);
  }

  private scheduleNextTip(delay: number, isFirst: boolean) {
    if (this.timeoutId) clearTimeout(this.timeoutId);

    this.timeoutId = setTimeout(() => {
      this.showRandomTip();

      const nextDelay = isFirst
        ? 1000 * 60 * 5
        : Math.floor(Math.random() * (10 - 7 + 1) + 7) * 60 * 1000;

      this.scheduleNextTip(nextDelay, false);
    }, delay);
  }

  private showRandomTip() {
    const t = this.lang.t();
    const descriptions = t.systemTips.descriptions;
    const keys = Object.keys(descriptions);

    if (keys.length === 0) return;

    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const message = (descriptions as any)[randomKey];

    this.settings.tipsEnabled() &&
      this.notifications.show({
        title: t.systemTips.title,
        message: message,
        icon: 'fas fa-lightbulb',
      });
  }

  stopTips() {
    if (this.timeoutId) clearTimeout(this.timeoutId);
  }
}
