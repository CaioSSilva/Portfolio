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
    map((query) => query.toLowerCase().trim()),
  );

  readonly debouncedQuery = toSignal(this.debouncedSearch$, { initialValue: '' });

  readonly appSearchResult = computed(() => {
    const query = this.debouncedQuery();
    return this.appRegistry.searchApps(query);
  });

  toggleGrid(): void {
    this.contextMenu.close();
    this.isAppsGridOpen.update((open) => !open);
    if (!this.isAppsGridOpen()) this.resetSearch();
  }

  closeGrid(): void {
    this.contextMenu.close();
    this.isAppsGridOpen.set(false);
    this.resetSearch();
  }

  openApp(app: AppDefinition): void {
    this.appLauncher.launch(app, app.data);
    this.isAppsGridOpen.set(false);
    this.resetSearch();
  }

  onRightClickApp(event: MouseEvent, appId: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.openContextMenuAt(event.currentTarget as HTMLElement, appId);
  }

  openContextMenuAt(anchor: HTMLElement, appId: string): void {
    const menuWidth = 260;
    const menuHeight = 160;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const rect = anchor.getBoundingClientRect();
    const anchorCenterX = rect.left + rect.width / 2;
    const anchorCenterY = rect.top + rect.height / 2;

    const menuX = Math.min(Math.max(anchorCenterX - menuWidth / 2, 8), vw - menuWidth - 8);
    const opensBelow = anchorCenterY < menuHeight + 8;
    const menuY = opensBelow
      ? Math.min(anchorCenterY + rect.height / 2 + 8, vh - menuHeight - 8)
      : Math.max(anchorCenterY - rect.height / 2 - 8, menuHeight + 8);

    this.contextMenu.openApp(menuX, menuY, appId, opensBelow);
  }

  private resetSearch(): void {
    this.searchQuery.set('');
  }
}
