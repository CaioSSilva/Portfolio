import { Injectable, inject, computed } from '@angular/core';
import { getInstalledApps } from '../models/apps';
import { AppDefinition } from '../models/dock';
import { LanguageService } from './language';

@Injectable({ providedIn: 'root' })
export class AppRegistry {
  private readonly lang = inject(LanguageService);

  readonly registry = computed(() => getInstalledApps(this.lang));

  readonly definitions = computed(() =>
    Object.values(this.registry()).filter((app): app is AppDefinition => !!app?.id),
  );

  getAppById(id: string): AppDefinition | undefined {
    return this.registry()[id];
  }

  findHandlerForExtension(extension: string): AppDefinition | undefined {
    return Object.values(this.registry()).find((app) => app?.handle?.includes(extension));
  }

  searchApps(query: string): AppDefinition[] {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return this.definitions();

    return this.definitions().filter(
      (app) =>
        app.title.toLowerCase().includes(normalized) || app.id.toLowerCase().includes(normalized),
    );
  }
}
