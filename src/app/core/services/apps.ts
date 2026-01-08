import { Injectable, inject, signal, computed } from '@angular/core';
import { AppRegistry, getInstalledApps } from '../models/apps';
import { AppDefinition } from '../models/dock';
import { LanguageService } from './language';
import { ProcessManager } from './process-manager';
import { debounceTime } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ContextMenu } from './context-menu';

@Injectable({ providedIn: 'root' })
export class Apps {
  private processManager = inject(ProcessManager);
  private lang = inject(LanguageService);
  private contextMenu = inject(ContextMenu);
  isAppsGridOpen = signal<boolean>(false);
  searchQuery = signal<string>('');

  readonly myApps = computed<AppRegistry>(() => getInstalledApps(this.lang));

  readonly allApps = computed<AppDefinition[]>(() => {
    const apps = this.myApps();
    return Object.values(apps).filter((val): val is AppDefinition => !!val?.id);
  });

  readonly debouncedSearch = toSignal(toObservable(this.searchQuery).pipe(debounceTime(200)));

  readonly appSearchResult = computed(() => {
    const query = this.debouncedSearch()?.toLowerCase().trim() || '';
    const all = this.allApps();

    if (!query) return all;

    return all.filter(
      (app) => app.title.toLowerCase().includes(query) || app.id.toLowerCase().includes(query),
    );
  });

  toggleGrid() {
    this.isAppsGridOpen.update((v) => !v);
    if (!this.isAppsGridOpen()) this.searchQuery.set('');
  }

  openApp(app: AppDefinition) {
    this.isAppsGridOpen.set(false);
    this.searchQuery.set('');
    const appData = (app as any).data;
    this.processManager.open(app, appData);
  }

  closeApp(instanceId: string | undefined) {
    if (instanceId) this.processManager.close(instanceId);
  }

  onRightClick(event: MouseEvent, appId: string) {
    event.preventDefault();
    event.stopPropagation();

    const menuWidth = 180;
    let posX = event.clientX;
    let posY = event.clientY;

    if (posX + menuWidth > window.innerWidth) {
      posX -= menuWidth;
    }
    this.contextMenu.open(posX, posY, appId);
  }
}
