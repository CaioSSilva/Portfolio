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
    this.openContextMenuAt(event.currentTarget as HTMLElement, appId);
  }

  openContextMenuAt(anchor: HTMLElement, appId: string) {
    const menuWidth = 260;
    const menuHeight = 160;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const rect = anchor.getBoundingClientRect();
    const anchorCenterX = rect.left + rect.width / 2;
    const anchorCenterY = rect.top + rect.height / 2;

    const x = Math.min(Math.max(anchorCenterX - menuWidth / 2, 8), vw - menuWidth - 8);
    const opensBelow = anchorCenterY < menuHeight + 8;
    const y = opensBelow
      ? Math.min(anchorCenterY + rect.height / 2 + 8, vh - menuHeight - 8)
      : Math.max(anchorCenterY - rect.height / 2 - 8, menuHeight + 8);

    this.contextMenu.openApp(x, y, appId, opensBelow);
  }

  private resetSearch() {
    this.searchQuery.set('');
  }
}
