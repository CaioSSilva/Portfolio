import { Component, inject } from '@angular/core';
import { NotificationService } from '../../core/services/notification';
import { DatePipe, registerLocaleData } from '@angular/common';
import localePtBr from '@angular/common/locales/pt';
import { LanguageService } from '../../core/services/language';

registerLocaleData(localePtBr, 'pt-BR');

@Component({
  selector: 'app-notification-center',
  imports: [DatePipe],
  templateUrl: './notification-center.html',
  styleUrl: './notification-center.scss',
})
export class NotificationCenter {
  notifService = inject(NotificationService);
  lang = inject(LanguageService);

  now = new Date();

  formatTimestamp(timestamp: Date): string {
    const diff = new Date().getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    const t = this.lang.t().notifications.timmings;

    if (minutes < 1) return t.justNow;

    if (minutes < 60) {
      return `${minutes} ${minutes > 1 ? t.minutesAgo : t.minutesAgo.replace('s ', ' ')}`;
    }

    if (hours < 24) {
      return `${hours} ${hours > 1 ? t.hoursAgo : t.hoursAgo.replace('s ', ' ')}`;
    }

    return `${days} ${days > 1 ? t.daysAgo : t.daysAgo.replace('s ', ' ')}`;
  }
}
