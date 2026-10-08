import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { Notification } from '../models/notification';
import { Sound } from './sound';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly sound = inject(Sound);
  private readonly destroyRef = inject(DestroyRef);

  readonly activeNotifications = signal<Notification[]>([]);
  readonly history = signal<Notification[]>([]);
  readonly isPanelOpen = signal(false);

  private readonly dismissTimers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.dismissTimers.forEach(clearTimeout);
      this.dismissTimers.clear();
    });
  }

  togglePanel(): void {
    this.isPanelOpen.update((open) => !open);
  }

  openPanel(): void {
    this.isPanelOpen.set(true);
  }

  closePanel(): void {
    this.isPanelOpen.set(false);
  }

  show(notif: Omit<Notification, 'id' | 'timestamp'>): void {
    const newNotif = this.createNotification(notif);

    this.pushToState(newNotif);
    this.sound.play('bell');
  }

  private createNotification(notif: Omit<Notification, 'id' | 'timestamp'>): Notification {
    return {
      ...notif,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
  }

  private pushToState(notif: Notification): void {
    this.activeNotifications.update((current) => [...current, notif]);
    const timer = setTimeout(() => {
      this.dismissTimers.delete(notif.id);
      this.activeNotifications.update((items) => items.filter((notif2) => notif2.id !== notif.id));
      this.history.update((current) => [notif, ...current]);
    }, notif.duration || 6000);
    this.dismissTimers.set(notif.id, timer);
  }

  dismiss(id: string): void {
    const timer = this.dismissTimers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      this.dismissTimers.delete(id);
      this.history.update((current) => {
        const notif = this.activeNotifications().find((item) => item.id === id);
        return notif ? [notif, ...current] : current;
      });
    }
    this.activeNotifications.update((items) => items.filter((item) => item.id !== id));
  }

  clearHistory(): void {
    this.history.set([]);
  }
}
