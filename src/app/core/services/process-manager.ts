import { computed, inject, Injectable, signal, Type, untracked } from '@angular/core';
import { uuid } from '../utils/uuid';
import { AppBase, Base, ProcessData } from '../models/base';
import { AppDefinition } from '../models/dock';
import { Process } from '../models/process';
import { LanguageService } from './language';
import { FileSystem } from './file-system';
import { AUDIO_EXTENSIONS, FileItem } from '../models/file';
import { NotificationService } from './notification';
import { AppRegistry } from './app-registry';

@Injectable({ providedIn: 'root' })
export class ProcessManager {
  private readonly lang = inject(LanguageService);
  private readonly fileSystem = inject(FileSystem);
  private readonly notifications = inject(NotificationService);
  private readonly appRegistry = inject(AppRegistry);

  readonly processes = signal<Process[]>([]);
  private readonly topOverlapCounter = signal<number>(0);
  private readonly bottomOverlapCounter = signal<number>(0);
  private globalCascadeIndex = 0;

  readonly isTopBarHidden = computed(() => this.topOverlapCounter() > 0);
  readonly isDockHidden = computed(() => this.bottomOverlapCounter() > 0);
  readonly hasActiveProcesses = computed(() => this.processes().length > 0);

  readonly activeProcessId = computed(() => {
    let topId: string | null = null;
    let topZ = -1;
    for (const proc of this.processes()) {
      if (!proc.isMinimized && proc.zIndex > topZ) {
        topZ = proc.zIndex;
        topId = proc.id;
      }
    }
    return topId;
  });

  open(app: AppDefinition, data?: ProcessData): void {
    const existing = untracked(() => this.processes().find((proc) => proc.appId === app.id));
    if (existing) {
      if (data) {
        this.processes.update((current) =>
          current.map((proc) => (proc.id === existing.id ? { ...proc, data } : proc)),
        );
      }
      this.focus(existing.id);
      return;
    }
    if (app.loadComponent) {
      app.loadComponent().then((resolved) => {
        this.addProcess(app, resolved as AppBase['component'], data);
      });
    } else {
      this.addProcess(app, app.component, data);
    }
  }

  forceOpen(app: AppDefinition, data?: ProcessData): void {
    if (app.loadComponent) {
      app.loadComponent().then((resolved) => {
        this.addProcess(app, resolved as AppBase['component'], data);
      });
    } else {
      this.addProcess(app, app.component, data);
    }
  }

  private addProcess(app: AppBase, component: AppBase['component'], data?: ProcessData): void {
    const id = this.generateId();
    const current = untracked(() => this.processes());
    let maxZ = 100;
    for (const item of current) {
      if (item.zIndex > maxZ) maxZ = item.zIndex;
    }
    this.processes.update((list) => [
      ...list,
      {
        ...app,
        component,
        appId: app.id,
        id,
        isMaximized: false,
        isMinimized: false,
        zIndex: maxZ + 1,
        cascadeIndex: this.globalCascadeIndex++,
        data: data || { id },
      },
    ]);
  }

  openFile(node: FileItem): void {
    if (!node.url) return;

    const extension = this.fileSystem.getFileExtension(node.name);
    const handler = this.appRegistry.findHandlerForExtension(extension);

    if (handler) {
      this.handleAudioSingleton(extension, handler.id);
      this.open(handler, { url: node.url, title: node.name });
    } else {
      this.showNoHandlerError();
    }
  }

  private handleAudioSingleton(extension: string, musicAppId: string): void {
    if (!AUDIO_EXTENSIONS.includes(extension)) return;
    const existing = untracked(() => this.processes().find((proc) => proc.appId === musicAppId));
    if (existing) this.close(existing.id);
  }

  close(processId: string): void {
    this.processes.update((current) => current.filter((proc) => proc.id !== processId));
  }

  closeAllInstancesById(appId: string): void {
    this.processes.update((current) => current.filter((proc) => proc.appId !== appId));
  }

  focus(processId: string): void {
    this.processes.update((current) => {
      let maxZ = 0;
      let target: Process | undefined;
      for (const item of current) {
        if (item.zIndex > maxZ) maxZ = item.zIndex;
        if (item.id === processId) target = item;
      }
      if (target && target.zIndex === maxZ && !target.isMinimized) return current;

      return current.map((item) =>
        item.id === processId ? { ...item, zIndex: maxZ + 1, isMinimized: false } : item,
      );
    });
  }

  toggleMinimize(processId: string): void {
    this.processes.update((current) => {
      let maxZ = 0;
      for (const item of current) {
        if (item.zIndex > maxZ) maxZ = item.zIndex;
      }
      return current.map((proc) => {
        if (proc.id !== processId) return proc;
        const willMinimize = !proc.isMinimized;
        return {
          ...proc,
          isMinimized: willMinimize,
          zIndex: willMinimize ? proc.zIndex : maxZ + 1,
        };
      });
    });
  }

  minimizeAllVisible(): void {
    this.processes.update((current) =>
      current.map((proc) => (proc.isMinimized ? proc : { ...proc, isMinimized: true })),
    );
  }

  updateTopOverlap(isOverlapping: boolean): void {
    this.topOverlapCounter.update((count) => (isOverlapping ? count + 1 : Math.max(0, count - 1)));
  }

  updateBottomOverlap(isOverlapping: boolean): void {
    this.bottomOverlapCounter.update((count) =>
      isOverlapping ? count + 1 : Math.max(0, count - 1),
    );
  }

  private generateId(): string {
    return uuid();
  }

  private showNoHandlerError(): void {
    const errors = this.lang.t().errors;
    this.notifications.show({
      title: errors.systemError,
      message: errors.noFileHandler,
      icon: 'fas fa-circle-exclamation',
    });
  }

  hasActiveProcessesById(appId: string): boolean {
    return this.processes().some((proc) => proc.appId === appId);
  }

  isActiveComponent(component: Type<Base>): boolean {
    const activeId = this.activeProcessId();
    if (!activeId) return false;
    return this.processes().some((proc) => proc.id === activeId && proc.component === component);
  }
}
