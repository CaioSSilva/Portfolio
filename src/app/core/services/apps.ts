import { Injectable, inject, signal, computed } from '@angular/core';
import { AppDefinition } from '../models/dock';
import { debounceTime, map, Subscription, take, timer } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ContextMenuOrigin, ContextMenuService } from './context-menu';
import { AppRegistry } from './app-registry';
import { AppLauncher } from './app-launcher';

@Injectable({ providedIn: 'root' })
export class Apps {
  private readonly contextMenu = inject(ContextMenuService);
  private readonly appRegistry = inject(AppRegistry);
  private readonly appLauncher = inject(AppLauncher);

  readonly isAppsGridOpen = signal(false);
  readonly searchQuery = signal('');

  private touchLongPressTimer = Subscription.EMPTY;
  private touchAppId: string | null = null;
  private touchStartX = 0;
  private touchStartY = 0;
  private didSwitchAppOnTouch = false;
  private touchContextMenuOrigin: ContextMenuOrigin = 'other';

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

  onRightClickApp(event: MouseEvent, appId: string, origin: ContextMenuOrigin = 'other'): void {
    event.preventDefault();
    event.stopPropagation();
    this.openContextMenuAt(event.clientX, event.clientY, appId, origin);
  }

  onContextMenuBackdrop(event: MouseEvent): void {
    event.preventDefault();
    const appElement = this.getAppElementAtPosition(event.clientX, event.clientY);
    const appId = appElement?.dataset['contextMenuAppId'];
    if (appId) {
      this.openContextMenuAt(
        event.clientX,
        event.clientY,
        appId,
        appElement.hasAttribute('data-dock-id') ? 'dock' : 'other',
      );
    }
  }

  getAppIdAtPosition(x: number, y: number): string | null {
    return this.getAppElementAtPosition(x, y)?.dataset['contextMenuAppId'] ?? null;
  }

  private getAppElementAtPosition(x: number, y: number): HTMLElement | null {
    return (
      document
      .elementsFromPoint(x, y)
      .map((element) => element.closest<HTMLElement>('[data-context-menu-app-id]'))
      .find((element) => element !== null) ?? null
    );
  }

  onContextMenuBackdropTouchStart(event: TouchEvent): void {
    event.stopPropagation();
    event.preventDefault();
    const touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    const appElement = this.getAppElementAtPosition(touch.clientX, touch.clientY);
    this.touchAppId = appElement?.dataset['contextMenuAppId'] ?? null;
    this.touchContextMenuOrigin = appElement?.hasAttribute('data-dock-id') ? 'dock' : 'other';
    this.didSwitchAppOnTouch = false;

    if (!this.touchAppId) {
      this.contextMenu.close();
      return;
    }

    this.touchLongPressTimer = timer(500)
      .pipe(take(1))
      .subscribe(() => this.openTouchedAppContextMenu());
  }

  onContextMenuBackdropTouchMove(event: TouchEvent): void {
    const touch = event.touches[0];
    if (
      Math.abs(touch.clientX - this.touchStartX) > 10 ||
      Math.abs(touch.clientY - this.touchStartY) > 10
    ) {
      this.cancelBackdropTouch();
    }
  }

  onContextMenuBackdropTouchEnd(): void {
    this.touchLongPressTimer.unsubscribe();
    if (!this.didSwitchAppOnTouch) this.contextMenu.close();
    this.touchAppId = null;
  }

  openContextMenuAt(
    x: number,
    y: number,
    appId: string,
    origin: ContextMenuOrigin = 'other',
  ): void {
    this.contextMenu.openApp(x, y, appId, origin);
  }

  private openTouchedAppContextMenu(): void {
    if (!this.touchAppId) return;
    this.didSwitchAppOnTouch = true;
    this.openContextMenuAt(
      this.touchStartX,
      this.touchStartY,
      this.touchAppId,
      this.touchContextMenuOrigin,
    );
  }

  private cancelBackdropTouch(): void {
    this.touchLongPressTimer.unsubscribe();
    this.touchAppId = null;
  }

  private resetSearch(): void {
    this.searchQuery.set('');
  }
}
