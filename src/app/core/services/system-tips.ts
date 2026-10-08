import { inject, Injectable } from '@angular/core';
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
  private shownIndexes: Set<number> = new Set();

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
    const pool = this.screen.isMobile() ? t.systemTips.mobile : t.systemTips.desktop;
    const message = this.getNextTipMessage(pool);

    if (!message) return;

    this.notifications.show({
      title: t.systemTips.title,
      message,
      icon: 'fas fa-lightbulb',
    });
  }

  private getNextTipMessage(pool: Record<string, string>): string | null {
    const values = Object.values(pool);
    if (values.length === 0) return null;

    if (this.shownIndexes.size >= values.length) {
      this.shownIndexes.clear();
    }

    const remaining = values
      .map((v, i) => ({ v, i }))
      .filter(({ i }) => !this.shownIndexes.has(i));

    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    this.shownIndexes.add(pick.i);

    return pick.v;
  }

  private calculateNextDelay(isFirst: boolean): number {
    if (isFirst) return 1000 * 60 * 5;

    const minMinutes = 7;
    const maxMinutes = 10;
    const randomMinutes = Math.floor(Math.random() * (maxMinutes - minMinutes + 1) + minMinutes);

    return randomMinutes * 60 * 1000;
  }
}
