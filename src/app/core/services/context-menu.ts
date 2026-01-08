import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ContextMenu {
  readonly isOpen = signal(false);
  readonly position = signal({ x: 0, y: 0 });
  readonly activeAppId = signal<string | null>(null);

  open(x: number, y: number = 0, appId: string) {
    this.position.set({ x, y });
    this.activeAppId.set(appId);
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
  }
}
