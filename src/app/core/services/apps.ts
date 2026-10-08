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

  readonly appsRegistry = computed(() => this.appRegistry.registry());
  readonly appsDefinition = computed(() => this.appRegistry.definitions());

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

  closeGrid() {
    this.contextMenu.close();
    this.isAppsGridOpen.set(false);
    this.resetSearch();
  }

  openApp(app: AppDefinition) {
    this.appLauncher.launch(app, app.data);
    this.isAppsGridOpen.set(false);
    this.resetSearch();
  }

  onRightClickApp(event: MouseEvent, appId: string) {
    event.preventDefault();
    event.stopPropagation();
    this.openContextMenuAt(event.clientX, event.clientY, appId);
  }

  openContextMenuAt(clientX: number, clientY: number, appId: string) {
    const menuWidth = 245;
    const menuHeight = 180;
    const vw = window.innerWidth;

    const x = Math.min(Math.max(clientX, 0), vw - menuWidth);
    const opensBelow = clientY < menuHeight;

    this.contextMenu.openApp(x, clientY, appId, opensBelow);
  }

  private resetSearch() {
    this.searchQuery.set('');
  }
}
