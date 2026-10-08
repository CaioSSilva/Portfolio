import { computed, inject, Injectable, NgZone, signal, Type } from '@angular/core';
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
  private readonly ngZone = inject(NgZone);

  readonly processes = signal<Process[]>([]);
  private readonly topOverlapCounter = signal<number>(0);
  private readonly bottomOverlapCounter = signal<number>(0);
  private globalCascadeIndex = 0;

  readonly isTopBarHidden = computed(() => this.topOverlapCounter() > 0);
  readonly isDockHidden = computed(() => this.bottomOverlapCounter() > 0);
  readonly hasActiveProcesses = computed(() => this.processes().length > 0);

  readonly activeProcessId = computed(() => {
    const visible = this.processes()
      .filter((proc) => !proc.isMinimized)
      .sort((a, b) => b.zIndex - a.zIndex);
    return visible[0]?.id || null;
  });

  open(app: AppBase, data?: ProcessData): void {
    this.ngZone.run(() => {
      const existing = this.processes().find((proc) => proc.appId === app.id);
      if (existing) {
        if (data) {
          this.processes.update((current) =>
            current.map((proc) => (proc.id === existing.id ? { ...proc, data } : proc)),
          );
        }
        this.focus(existing.id);
        return;
      }
      this.spawn(app, data);
    });
  }

  forceOpen(app: AppBase, data?: ProcessData): void {
    this.ngZone.run(() => this.spawn(app, data));
  }

  private async spawn(
    app: AppBase & { loadComponent?: () => Promise<AppBase['component']> },
    data?: ProcessData,
  ): Promise<void> {
    const component = app.loadComponent
      ? ((await app.loadComponent()) as AppBase['component'])
      : app.component;
    const id = this.generateId();
    this.ngZone.run(() => {
      const maxZ = this.processes().reduce((max, item) => Math.max(max, item.zIndex), 100);
      const newProcess: Process = {
        ...app,
        component,
        appId: app.id,
        id,
        isMaximized: false,
        isMinimized: false,
        zIndex: maxZ + 1,
        cascadeIndex: this.globalCascadeIndex++,
        data: data || { id },
      };
      this.processes.update((current) => [...current, newProcess]);
    });
  }

  openFile(node: FileItem): void {
    if (!node.url) return;

    const handler = this.findHandlerForFile(node.name);

    if (handler) {
      this.handleAudioSingleton(node.name, handler.id);
      this.open(handler, { url: node.url, title: node.name });
    } else {
      this.showNoHandlerError();
    }
  }

  private findHandlerForFile(fileName: string): AppDefinition | undefined {
    const extension = this.fileSystem.getFileExtension(fileName);
    return this.appRegistry.findHandlerForExtension(extension);
  }

  private handleAudioSingleton(fileName: string, musicAppId: string): void {
    const ext = this.fileSystem.getFileExtension(fileName);
    const isAudio = AUDIO_EXTENSIONS.includes(ext);
    if (!isAudio) return;

    const existing = this.processes().find((proc) => proc.appId === musicAppId);
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
      const target = current.find((item) => item.id === processId);
      const maxZ = current.reduce((max, item) => Math.max(max, item.zIndex), 0);
      if (target && target.zIndex === maxZ && !target.isMinimized) return current;

      return current.map((item) =>
        item.id === processId ? { ...item, zIndex: maxZ + 1, isMinimized: false } : item,
      );
    });
  }

  toggleMinimize(processId: string): void {
    this.processes.update((current) => {
      const maxZ = current.reduce((max, item) => Math.max(max, item.zIndex), 0);
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

  updateTopOverlap(isOverlapping: boolean): void {
    this.topOverlapCounter.update((count) => (isOverlapping ? count + 1 : Math.max(0, count - 1)));
  }

  updateBottomOverlap(isOverlapping: boolean): void {
    this.bottomOverlapCounter.update((count) =>
      isOverlapping ? count + 1 : Math.max(0, count - 1),
    );
  }

  private generateId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
      const nibble = (Math.random() * 16) | 0;
      return (char === 'x' ? nibble : (nibble & 0x3) | 0x8).toString(16);
    });
  }

  private showNoHandlerError(): void {
    this.notifications.show({
      title: this.lang.t().errors.systemError,
      message: this.lang.t().errors.noFileHandler,
      icon: 'fas fa-circle-exclamation',
    });
  }

  hasActiveProcessesById(appId: string): boolean {
    return this.processes().some((proc) => proc.appId === appId);
  }

  isActiveComponent(component: Type<Base>): boolean {
    const activeId = this.activeProcessId();
    if (!activeId) return false;
    const active = this.processes().find((proc) => proc.id === activeId);
    return active?.component === component;
  }
}
