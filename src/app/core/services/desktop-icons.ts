import { inject, Injectable, signal } from '@angular/core';
import { pinnedDesktopItem } from '../models/desktop';
import { Apps } from './apps';
import { ContextMenuService } from './context-menu';

@Injectable({
  providedIn: 'root',
})
export class DesktopIconsService {
  onDesktopApps = signal<pinnedDesktopItem[]>([]);
  context = inject(ContextMenuService);
  apps = inject(Apps);

  hasPinnedAppWithId(id: string) {
    return this.onDesktopApps().find((i) => i.id === id);
  }

  pinApp(id: string) {
    this.onDesktopApps.update((apps) => [
      ...apps,
      {
        id: id,
        name: this.apps.myApps()[id]!.title,
        color: this.apps.myApps()[id]!.color,
        icon: this.apps.myApps()[id]!.icon,
        action: () => this.apps.openApp(this.apps.myApps()[id]!),
      },
    ]);
  }

  unPinActiveApp() {
    const remainingApps = this.onDesktopApps().filter((a) => a.id !== this.context.activeAppId());
    this.onDesktopApps.set(remainingApps);
  }
}
