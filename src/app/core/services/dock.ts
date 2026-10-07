import { computed, inject, Injectable, signal } from '@angular/core';
import { ProcessManager } from './process-manager';
import { DockItem, AppDefinition } from '../models/dock';
import { ContextMenuService } from './context-menu';
import { AppRegistry } from './app-registry';
import { AppLauncher } from './app-launcher';

@Injectable({ providedIn: 'root' })
export class DockService {
  private readonly processManager = inject(ProcessManager);
  private readonly appRegistry = inject(AppRegistry);
  private readonly appLauncher = inject(AppLauncher);
  private readonly contextMenu = inject(ContextMenuService);

  public readonly pinnedAppIds = signal<string[]>(['firefox', 'files', 'terminal']);
  public readonly forceShow = signal<boolean>(false);

  public readonly dockItems = computed(() => {
    const apps = this.appRegistry.registry();
    const processes = this.processManager.processes();
    const activeId = this.processManager.activeProcessId();

    const itemsMap = this.initializePinnedItems(apps);
    this.mergeProcessesIntoItems(itemsMap, processes, activeId);

    return Array.from(itemsMap.values());
  });

  private initializePinnedItems(apps: Record<string, AppDefinition | undefined>): Map<string, DockItem> {
    const map = new Map<string, DockItem>();
    this.pinnedAppIds().forEach((id) => {
      const app = apps[id];
      if (app) map.set(id, this.createDockItem(app, true));
    });
    return map;
  }

  private mergeProcessesIntoItems(
    map: Map<string, DockItem>,
    processes: any[],
    activeId: string | null
  ): void {
    processes.forEach((p) => {
      const appDef = this.appRegistry.getAppById(p.appId);
      if (!appDef) return;

      const item = map.get(p.appId) || this.createDockItem(appDef, false);

      item.isOpen = true;
      item.count++;
      item.pids.push(p.id);
      if (p.id === activeId) item.isActive = true;

      map.set(p.appId, item);
    });
  }

  public handleAppClick(item: DockItem, event?: MouseEvent): void {
    if (!item.isOpen) {
      this.appLauncher.launch(item);
      return;
    }

    const process = this.getProcessById(item.pids[item.pids.length - 1]);
    if (!process) return;

    const source = this.calculateClickSource(event);

    if (process.isMinimized) {
      this.restoreProcess(process, source);
    } else {
      this.focusOrMinimize(process, item);
    }
  }

  private focusOrMinimize(process: any, item: DockItem): void {
    const isCurrentlyActive = process.id === this.processManager.activeProcessId();
    if (isCurrentlyActive && item.count === 1) {
      this.processManager.toggleMinimize(process.id);
    } else {
      this.processManager.focus(process.id);
    }
  }

  private restoreProcess(process: any, source: { x: number; y: number }): void {
    if (process.data) process.data.source = source;
    this.processManager.toggleMinimize(process.id);
  }

  public pinApp(id: string, index?: number): void {
    this.pinnedAppIds.update((ids) => {
      const filtered = ids.filter((appId) => appId !== id);
      if (index === undefined) return [...filtered, id];

      const result = [...filtered];
      result.splice(index, 0, id);
      return result;
    });
  }

  public unpinApp(id: string): void {
    this.pinnedAppIds.update((ids) => ids.filter((i) => i !== id));
  }

  private calculateClickSource(event?: MouseEvent): { x: number; y: number } {
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

  public closeActiveApp(): void {
    const id = this.contextMenu.activeAppId();
    if (id) this.processManager.closeAllInstancesById(id);
  }

  public openActiveApp(): void {
    const appId = this.contextMenu.activeAppId();
    if (!appId) return;

    const app = this.appRegistry.getAppById(appId);
    if (app) this.appLauncher.launch(app);
  }

  public unPinActiveApp(): void {
    const appId = this.contextMenu.activeAppId();
    const canUnpin = this.pinnedAppIds().length > 1;

    if (appId && canUnpin) {
      this.unpinApp(appId);
      this.contextMenu.close();
    }
  }

  public hasPinnedAppWithId(id: string): boolean {
    return this.pinnedAppIds().includes(id);
  }
}