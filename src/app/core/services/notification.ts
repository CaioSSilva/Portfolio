import { inject, Injectable, signal } from '@angular/core';
import { Notification } from '../models/notification';
import { Sound } from './sound';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly sound = inject(Sound);

  readonly activeNotifications = signal<Notification[]>([]);
  readonly history = signal<Notification[]>([]);
  readonly isPanelOpen = signal(false);

  togglePanel() {
    this.isPanelOpen.update((open) => !open);
  }

  show(notif: Omit<Notification, 'id' | 'timestamp'>, duration = 8000) {
    const newNotif = this.createNotification(notif);

    this.pushToState(newNotif);
    this.sound.play('bell');

    this.scheduleDismissal(newNotif.id, duration);
  }

  private createNotification(notif: Omit<Notification, 'id' | 'timestamp'>): Notification {
    return {
      ...notif,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
  }

  private pushToState(notif: Notification) {
    this.activeNotifications.update((current) => [...current, notif]);
    this.history.update((current) => [notif, ...current]);
  }

  private scheduleDismissal(id: string, duration: number) {
    setTimeout(() => this.dismiss(id), duration);
  }

  dismiss(id: string) {
    this.activeNotifications.update((items) => items.filter((n) => n.id !== id));
  }

  clearHistory() {
    this.history.set([]);
  }
}
