import { inject, Injectable, signal } from '@angular/core';
import { Notification } from '../models/notification';
import { Sound } from './sound';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  readonly sound = inject(Sound);
  readonly activeNotifications = signal<Notification[]>([]);
  readonly history = signal<Notification[]>([]);
  readonly isPanelOpen = signal(false);

  togglePanel() {
    this.isPanelOpen.update((v) => !v);
  }

  show(notif: Omit<Notification, 'id' | 'timestamp'>, duration: number = 8000) {
    const id = crypto.randomUUID();
    const newNotif: Notification = {
      ...notif,
      id,
      timestamp: new Date(),
    };

    this.activeNotifications.update((n) => [...n, newNotif]);
    this.history.update((h) => [newNotif, ...h]);

    this.sound.play('bell');

    setTimeout(() => this.dismiss(id), duration);
  }

  dismiss(id: string) {
    this.activeNotifications.update((n) => n.filter((item) => item.id !== id));
  }

  clearHistory() {
    this.history.set([]);
  }
}
