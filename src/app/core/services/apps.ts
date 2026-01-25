import { Injectable, inject, signal, computed } from '@angular/core';
import { AppDefinition } from '../models/dock';
import { debounceTime, map } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ContextMenuService } from './context-menu';
import { AppRegistry } from './app-registry';
import { AppLauncher } from './app-launcher';

@Injectable({ providedIn: 'root' })
export class Apps {
  private readonly contextMenu = inject(ContextMenuService);
  private readonly appRegistry = inject(AppRegistry);
  private readonly appLauncher = inject(AppLauncher);

  readonly isAppsGridOpen = signal(false);
  readonly searchQuery = signal('');

  readonly appsRegistry = this.appRegistry.registry();
  readonly appsDefinition = this.appRegistry.definitions();

  private readonly debouncedSearch$ = toObservable(this.searchQuery).pipe(
    debounceTime(200),
    map((q) => q.toLowerCase().trim()),
  );

  readonly debouncedQuery = toSignal(this.debouncedSearch$, { initialValue: '' });

  readonly appSearchResult = computed(() => {
    const query = this.debouncedQuery();
    return this.appRegistry.searchApps(query);
  });

  toggleGrid() {
    this.contextMenu.close();
    this.isAppsGridOpen.update((v) => !v);
    if (!this.isAppsGridOpen()) this.resetSearch();
  }

  openApp(app: AppDefinition) {
    this.isAppsGridOpen.set(false);
    this.resetSearch();
    this.appLauncher.launch(app, app.data);
  }

  onRightClickApp(event: MouseEvent, appId: string) {
    event.preventDefault();
    event.stopPropagation();

    const menuWidth = 245;
    const menuHeight = 160;
    const x =
      event.clientX + menuWidth > window.innerWidth ? event.clientX - menuWidth : event.clientX;

    this.contextMenu.openApp(
      x,
      event.clientY < menuHeight ? event.clientY + menuHeight / 2 : event.clientY,
      appId,
    );
  }

  private resetSearch() {
    this.searchQuery.set('');
  }
}
