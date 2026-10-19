import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ContextMenuService {
  readonly isOpen = signal(false);
  readonly position = signal({ x: 0, y: 0 });
  readonly activeAppId = signal<string | null>(null);
  readonly activeItem = signal<string | null>(null);

  openApp(x: number, y: number, appId: string): void {
    this.position.set({ x, y });
    this.activeAppId.set(appId);
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
    this.activeAppId.set(null);
  }
}
