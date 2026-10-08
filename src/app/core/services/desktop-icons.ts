import { inject, Injectable, signal, computed, effect } from '@angular/core';
import { pinnedDesktopItem } from '../models/desktop';
import { AppRegistry } from './app-registry';
import { AppLauncher } from './app-launcher';

const STORAGE_KEY = 'desktopIcons';

@Injectable({
  providedIn: 'root',
})
export class DesktopIconsService {
  private readonly appRegistry = inject(AppRegistry);
  private readonly appLauncher = inject(AppLauncher);

  readonly pinnedAppIds = signal<string[]>(this.loadPinnedAppIds());

  readonly onDesktopApps = computed<pinnedDesktopItem[]>(() => {
    const apps = this.appRegistry.registry();
    return this.pinnedAppIds()
      .map((id) => {
        const app = apps[id];
        if (!app) return null;
        return {
          id: app.id,
          name: app.title,
          color: app.color,
          icon: app.icon,
          action: () => this.appLauncher.launch(app),
        };
      })
      .filter((item): item is pinnedDesktopItem => item !== null);
  });

  constructor() {
    effect(() => {
      this.savePinnedAppIds(this.pinnedAppIds());
    });
  }

  hasPinnedAppWithId(id: string): boolean {
    return this.pinnedAppIds().includes(id);
  }

  pinApp(id: string): void {
    if (this.hasPinnedAppWithId(id)) return;
    const app = this.appRegistry.getAppById(id);
    if (!app) return;

    this.pinnedAppIds.update((ids) => [...ids, id]);
  }

  unpinApp(id: string): void {
    this.pinnedAppIds.update((ids) => ids.filter((appId) => appId !== id));
  }

  openApp(id: string): void {
    const app = this.appRegistry.getAppById(id);
    if (app) this.appLauncher.launch(app);
  }

  private loadPinnedAppIds(): string[] {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      }
    } catch {}
    return [];
  }

  private savePinnedAppIds(ids: string[]): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
      }
    } catch {}
  }
}
