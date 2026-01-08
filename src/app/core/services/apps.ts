import { Injectable, inject, signal, computed } from '@angular/core';
import { getInstalledApps } from '../models/apps';
import { AppDefinition } from '../models/dock';
import { LanguageService } from './language';
import { ProcessManager } from './process-manager';
import { debounceTime, map } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ContextMenu } from './context-menu';

@Injectable({ providedIn: 'root' })
export class Apps {
  private readonly processManager = inject(ProcessManager);
  private readonly lang = inject(LanguageService);
  private readonly contextMenu = inject(ContextMenu);

  readonly isAppsGridOpen = signal(false);
  readonly searchQuery = signal('');

  readonly myApps = computed(() => getInstalledApps(this.lang));

  readonly allApps = computed(() =>
    Object.values(this.myApps()).filter((app): app is AppDefinition => !!app?.id),
  );

  private readonly debouncedSearch$ = toObservable(this.searchQuery).pipe(
    debounceTime(200),
    map((q) => q.toLowerCase().trim()),
  );

  readonly debouncedQuery = toSignal(this.debouncedSearch$, { initialValue: '' });

  readonly appSearchResult = computed(() => {
    const query = this.debouncedQuery();
    const apps = this.allApps();

    return query ? this.filterApps(apps, query) : apps;
  });

  private filterApps(apps: AppDefinition[], query: string): AppDefinition[] {
    return apps.filter(
      (app) => app.title.toLowerCase().includes(query) || app.id.toLowerCase().includes(query),
    );
  }

  toggleGrid() {
    this.isAppsGridOpen.update((v) => !v);
    if (!this.isAppsGridOpen()) this.resetSearch();
  }

  openApp(app: AppDefinition) {
    this.isAppsGridOpen.set(false);
    this.resetSearch();
    this.processManager.open(app, app.data);
  }

  onRightClick(event: MouseEvent, appId: string) {
    event.preventDefault();
    event.stopPropagation();

    const menuWidth = 180;
    const x =
      event.clientX + menuWidth > window.innerWidth ? event.clientX - menuWidth : event.clientX;

    this.contextMenu.open(x, event.clientY, appId);
  }

  private resetSearch() {
    this.searchQuery.set('');
  }
}
