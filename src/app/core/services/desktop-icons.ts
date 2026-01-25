import { inject, Injectable, signal } from '@angular/core';
import { pinnedDesktopItem } from '../models/desktop';
import { AppRegistry } from './app-registry';
import { AppLauncher } from './app-launcher';

@Injectable({
  providedIn: 'root',
})
export class DesktopIconsService {
  private readonly appRegistry = inject(AppRegistry);
  private readonly appLauncher = inject(AppLauncher);

  readonly onDesktopApps = signal<pinnedDesktopItem[]>([]);

  hasPinnedAppWithId(id: string) {
    return this.onDesktopApps().find((i) => i.id === id);
  }

  pinApp(id: string) {
    const app = this.appRegistry.getAppById(id);
    if (!app) return;

    this.onDesktopApps.update((apps) => [
      ...apps,
      {
        id: id,
        name: app.title,
        color: app.color,
        icon: app.icon,
        action: () => this.appLauncher.launch(app),
      },
    ]);
  }

  unpinApp(id: string) {
    this.onDesktopApps.update((apps) => apps.filter((app) => app.id !== id));
  }

  openApp(id: string) {
    const app = this.appRegistry.getAppById(id);
    if (app) this.appLauncher.launch(app);
  }
}
