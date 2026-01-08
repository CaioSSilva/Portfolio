import { computed, inject, Injectable, signal } from '@angular/core';
import { ProcessManager } from './process-manager';
import { DockItem, AppDefinition } from '../models/dock';
import { Apps } from './apps';

@Injectable({ providedIn: 'root' })
export class DockService {
  private processManager = inject(ProcessManager);
  private appsService = inject(Apps);

  private pinnedAppIds = signal<string[]>(['firefox', 'files', 'terminal']);

  readonly dockItems = computed<DockItem[]>(() => {
    const apps = this.appsService.myApps();
    const processes = this.processManager.processes();
    const activeId = this.processManager.activeProcessId();
    const pinnedIds = this.pinnedAppIds();

    const itemsMap = new Map<string, DockItem>();

    pinnedIds.forEach((id) => {
      const appDef = apps[id];
      if (appDef) {
        itemsMap.set(id, this.createDockItem(appDef, true));
      }
    });

    processes.forEach((p) => {
      let item = itemsMap.get(p.appId);

      if (!item) {
        const appDef = apps[p.appId];
        if (appDef) {
          item = this.createDockItem(appDef, false);
          itemsMap.set(p.appId, item);
        }
      }

      if (item) {
        item.isOpen = true;
        item.count++;
        item.pids.push(p.id);
        if (p.id === activeId) {
          item.isActive = true;
        }
      }
    });

    return Array.from(itemsMap.values());
  });

  public handleAppClick(item: DockItem, event?: MouseEvent): void {
    const source = this.getClickSource(event);

    if (!item.isOpen) {
      this.appsService.openApp(item);
      return;
    }

    const process = this.getLastProcess(item);
    if (!process) return;

    if (process.isMinimized) {
      this.restoreWindow(process, source);
      return;
    }

    this.handleActiveWindowClick(process, item);
  }

  public getDockState() {
    const items = this.dockItems();
    return {
      pinnedCount: this.pinnedAppIds().length,
      runningCount: items.filter((i) => i.isOpen && !i.pinned).length,
      totalItems: items.length,
      isAnyActive: items.some((i) => i.isActive),
    };
  }

  pinApp(id: string, index?: number): void {
    this.pinnedAppIds.update((ids) => {
      let newIds = [...ids];
      const existingIndex = newIds.indexOf(id);
      if (existingIndex !== -1) {
        newIds.splice(existingIndex, 1);
      }
      if (index === undefined || index === null) {
        newIds.push(id);
        return newIds;
      }
      newIds.splice(index, 0, id);

      return newIds;
    });
  }

  unpinApp(id: string): void {
    this.pinnedAppIds.update((ids) => ids.filter((i) => i !== id));
  }

  reorderPinnedApps(newOrder: string[]): void {
    const apps = this.appsService.myApps();
    const validIds = newOrder.filter((id) => !!apps[id]);
    this.pinnedAppIds.set(validIds);
  }

  private createDockItem(appDef: AppDefinition, pinned: boolean): DockItem {
    return {
      ...appDef,
      pinned,
      isOpen: false,
      isActive: false,
      count: 0,
      pids: [],
    };
  }

  private handleActiveWindowClick(process: any, item: DockItem): void {
    const isActive = process.id === this.processManager.activeProcessId();
    if (isActive && item.count === 1) {
      this.processManager.toggleMinimize(process.id);
    } else {
      this.processManager.focus(process.id);
    }
  }

  private restoreWindow(process: any, source: { x: number; y: number }): void {
    if (process.data) process.data.source = source;
    this.processManager.toggleMinimize(process.id);
  }

  private getLastProcess(item: DockItem) {
    if (item.pids.length === 0) return undefined;
    const lastPid = item.pids[item.pids.length - 1];
    return this.processManager.processes().find((p) => p.id === lastPid);
  }

  private getClickSource(event?: MouseEvent): { x: number; y: number } {
    if (!event?.target) {
      return { x: window.innerWidth / 2, y: window.innerHeight };
    }

    const target = (event.target as HTMLElement).closest('button');
    if (target) {
      const rect = target.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }

    return { x: window.innerWidth / 2, y: window.innerHeight };
  }
}
