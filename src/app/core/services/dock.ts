import { computed, inject, Injectable, signal } from '@angular/core';
import { ProcessManager } from './process-manager';
import { DockItem, AppDefinition } from '../models/dock';
import { Apps } from './apps';
import { ContextMenuService } from './context-menu';

@Injectable({ providedIn: 'root' })
export class DockService {
  private readonly processManager = inject(ProcessManager);
  private readonly appsService = inject(Apps);
  private readonly contextMenu = inject(ContextMenuService);

  readonly pinnedAppIds = signal<string[]>(['firefox', 'files', 'terminal']);

  readonly dockItems = computed(() => {
    const apps = this.appsService.myApps();
    const processes = this.processManager.processes();
    const activeId = this.processManager.activeProcessId();

    const itemsMap = this.initializePinnedItems(apps);
    this.mergeProcessesIntoItems(itemsMap, processes, activeId);

    return Array.from(itemsMap.values());
  });

  readonly forceShow = signal(false);

  private initializePinnedItems(apps: any): Map<string, DockItem> {
    const map = new Map<string, DockItem>();
    this.pinnedAppIds().forEach((id) => {
      if (apps[id]) map.set(id, this.createDockItem(apps[id], true));
    });
    return map;
  }

  private mergeProcessesIntoItems(
    map: Map<string, DockItem>,
    processes: any[],
    activeId: string | null,
  ) {
    processes.forEach((p) => {
      let item =
        map.get(p.appId) || this.createDockItem(this.appsService.myApps()[p.appId]!, false);

      item.isOpen = true;
      item.count++;
      item.pids.push(p.id);
      if (p.id === activeId) item.isActive = true;

      map.set(p.appId, item);
    });
  }

  handleAppClick(item: DockItem, event?: MouseEvent) {
    if (!item.isOpen) return this.appsService.openApp(item);

    const process = this.getProcessById(item.pids[item.pids.length - 1]);
    if (!process) return;

    const source = this.calculateClickSource(event);

    if (process.isMinimized) {
      this.restoreProcess(process, source);
    } else {
      this.focusOrMinimize(process, item);
    }
  }

  private focusOrMinimize(process: any, item: DockItem) {
    const isCurrentlyActive = process.id === this.processManager.activeProcessId();
    if (isCurrentlyActive && item.count === 1) {
      this.processManager.toggleMinimize(process.id);
    } else {
      this.processManager.focus(process.id);
    }
  }

  private restoreProcess(process: any, source: any) {
    if (process.data) process.data.source = source;
    this.processManager.toggleMinimize(process.id);
  }

  pinApp(id: string, index?: number) {
    this.pinnedAppIds.update((ids) => {
      const filtered = ids.filter((appId) => appId !== id);
      if (index === undefined) return [...filtered, id];

      const result = [...filtered];
      result.splice(index, 0, id);
      return result;
    });
  }

  unpinApp(id: string) {
    this.pinnedAppIds.update((ids) => ids.filter((i) => i !== id));
  }

  private calculateClickSource(event?: MouseEvent) {
    const target = (event?.target as HTMLElement)?.closest('button');
    if (!target) return { x: window.innerWidth / 2, y: window.innerHeight };

    const rect = target.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  private createDockItem(appDef: AppDefinition, pinned: boolean): DockItem {
    return { ...appDef, pinned, isOpen: false, isActive: false, count: 0, pids: [] };
  }

  private getProcessById(pid: string) {
    return this.processManager.processes().find((p) => p.id === pid);
  }

  closeActiveApp() {
    const id = this.contextMenu.activeAppId();
    if (id) this.processManager.closeAllInstancesById(id);
  }

  openActiveApp() {
    const appId = this.contextMenu.activeAppId();
    if (!appId) return;

    const app = this.appsService.myApps()[appId];
    if (app) this.appsService.openApp(app);
  }

  unPinActiveApp() {
    const appId = this.contextMenu.activeAppId();
    const canUnpin = this.pinnedAppIds().length > 1;

    if (appId && canUnpin) {
      this.unpinApp(appId);
      this.contextMenu.close();
    }
  }

  hasPinnedAppWithId(id: string) {
    return this.pinnedAppIds().find((i) => i === id);
  }
}
