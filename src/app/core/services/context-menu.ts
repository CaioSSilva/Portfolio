import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ContextMenuService {
  readonly isOpen = signal(false);
  readonly position = signal({ x: 0, y: 0 });
  readonly activeAppId = signal<string | null>(null);
  readonly activeItem = signal<string | null>(null);
  readonly opensBelow = signal(false);

  lastOpenedAt = 0;
  touchInsideMenu = false;

  openApp(x: number, y: number, appId: string, opensBelow = false) {
    this.position.set({ x, y });
    this.activeAppId.set(appId);
    this.opensBelow.set(opensBelow);
    this.lastOpenedAt = Date.now();
    this.isOpen.set(true);
  }

  closeIfSettled() {
    if (this.touchInsideMenu) {
      this.touchInsideMenu = false;
      return;
    }
    if (Date.now() - this.lastOpenedAt > 400) {
      this.close();
    }
  }

  close() {
    this.isOpen.set(false);
    this.activeAppId.set(null);
  }
}
