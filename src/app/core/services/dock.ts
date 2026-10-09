import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { ProcessManager } from './process-manager';
import { DockItem, AppDefinition } from '../models/dock';
import { Process } from '../models/process';
import { ContextMenuService } from './context-menu';
import { AppRegistry } from './app-registry';
import { AppLauncher } from './app-launcher';
import { Apps } from './apps';

const DOCK_STORAGE_KEY = 'pinnedAppIds';
const DOCK_DEFAULTS = ['firefox', 'files', 'terminal'];

@Injectable({ providedIn: 'root' })
export class DockService {
  private readonly processManager = inject(ProcessManager);
  private readonly appRegistry = inject(AppRegistry);
  private readonly appLauncher = inject(AppLauncher);
  private readonly contextMenu = inject(ContextMenuService);
  private readonly appsService = inject(Apps);

  readonly pinnedAppIds = signal<string[]>(this.loadPinnedIds());
  readonly forceShow = signal<boolean>(false);

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(DOCK_STORAGE_KEY, JSON.stringify(this.pinnedAppIds()));
      } catch {}
    });
  }

  private loadPinnedIds(): string[] {
    try {
      const stored = localStorage.getItem(DOCK_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.every((value) => typeof value === 'string')) {
          return parsed;
        }
      }
    } catch {}
    return DOCK_DEFAULTS;
  }

  readonly dockItems = computed(() => {
    const apps = this.appRegistry.registry();
    const processes = this.processManager.processes();
    const activeId = this.processManager.activeProcessId();

    const itemsMap = this.initializePinnedItems(apps);
    this.mergeProcessesIntoItems(itemsMap, processes, activeId, apps);

    return Array.from(itemsMap.values());
  });

  private initializePinnedItems(
    apps: Record<string, AppDefinition | undefined>,
  ): Map<string, DockItem> {
    const map = new Map<string, DockItem>();
    this.pinnedAppIds().forEach((id) => {
      const app = apps[id];
      if (app) map.set(id, this.createDockItem(app, true));
    });
    return map;
  }

  private mergeProcessesIntoItems(
    map: Map<string, DockItem>,
    processes: Process[],
    activeId: string | null,
    apps: Record<string, AppDefinition | undefined>,
  ): void {
    processes.forEach((process) => {
      const appDef = apps[process.appId];
      if (!appDef) return;

      const item = map.get(process.appId) || this.createDockItem(appDef, false);

      item.isOpen = true;
      item.count++;
      item.pids.push(process.id);
      if (process.id === activeId) item.isActive = true;

      map.set(process.appId, item);
    });
  }

  handleAppClick(item: DockItem, event?: MouseEvent): void {
    this.appsService.closeGrid();
    if (!item.isOpen) {
      this.appLauncher.launch(item);
      return;
    }

    const source = this.calculateClickSource(event);
    if (item.pids.length > 1) {
      this.cycleInstances(item, source);
      return;
    }

    const process = this.getProcessById(item.pids[0]);
    if (!process) return;

    if (process.isMinimized) {
      this.restoreProcess(process, source);
    } else {
      this.focusOrMinimize(process, item);
    }
  }

  private cycleInstances(item: DockItem, source: { x: number; y: number }): void {
    const activeId = this.processManager.activeProcessId();
    const currentIndex = item.pids.indexOf(activeId ?? '');
    const nextIndex = (currentIndex + 1) % item.pids.length;
    const next = this.getProcessById(item.pids[nextIndex]);
    if (!next) return;

    if (next.isMinimized) {
      this.restoreProcess(next, source);
    } else {
      this.processManager.focus(next.id);
    }
  }

  private focusOrMinimize(process: Process, item: DockItem): void {
    const isCurrentlyActive = process.id === this.processManager.activeProcessId();
    if (isCurrentlyActive && item.count === 1) {
      this.processManager.toggleMinimize(process.id);
    } else {
      this.processManager.focus(process.id);
    }
  }

  private restoreProcess(process: Process, source: { x: number; y: number }): void {
    if (process.data) {
      process.data = { ...process.data, source };
    }
    this.processManager.toggleMinimize(process.id);
  }

  pinApp(id: string, index?: number): void {
    this.pinnedAppIds.update((ids) => {
      const filtered = ids.filter((appId) => appId !== id);
      if (index === undefined) return [...filtered, id];

      const result = [...filtered];
      result.splice(index, 0, id);
      return result;
    });
  }

  unpinApp(id: string): void {
    this.pinnedAppIds.update((ids) => ids.filter((appId) => appId !== id));
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

  private getProcessById(pid: string): Process | undefined {
    return this.processManager.processes().find((proc) => proc.id === pid);
  }

  closeActiveApp(): void {
    const id = this.contextMenu.activeAppId();
    if (id) this.processManager.closeAllInstancesById(id);
    this.contextMenu.close();
  }

  openActiveApp(): void {
    const appId = this.contextMenu.activeAppId();
    if (!appId) return;

    const app = this.appRegistry.getAppById(appId);
    if (!app) return;

    if (this.processManager.hasActiveProcessesById(appId)) {
      this.appsService.closeGrid();
      this.processManager.forceOpen(app, app.data);
      this.contextMenu.close();
    } else {
      this.appsService.openApp(app);
    }
  }

  focusActiveApp(): void {
    const appId = this.contextMenu.activeAppId();
    if (!appId) return;

    const processes = this.processManager.processes();
    const process = processes.find((proc) => proc.appId === appId);
    if (!process) return;

    this.contextMenu.close();
    this.appsService.closeGrid();
    if (process.isMinimized) this.processManager.toggleMinimize(process.id);
    this.processManager.focus(process.id);
  }

  unPinActiveApp(): void {
    const appId = this.contextMenu.activeAppId();
    const canUnpin = this.pinnedAppIds().length > 1;

    if (appId && canUnpin) {
      this.unpinApp(appId);
      this.contextMenu.close();
    }
  }

  hasPinnedAppWithId(id: string): boolean {
    return this.pinnedAppIds().includes(id);
  }
}
