import { computed, inject, Injectable, signal } from '@angular/core';
import { AppBase, ProcessData } from '../models/base';
import { Process } from '../models/process';
import { LanguageService } from './language';
import { FileSystem } from './file-system';
import { AUDIO_EXTENSIONS, FileItem } from '../models/file';
import { NotificationService } from './notification';
import { AppRegistry } from './app-registry';

@Injectable({ providedIn: 'root' })
export class ProcessManager {
  private readonly lang = inject(LanguageService);
  private readonly fs = inject(FileSystem);
  private readonly nots = inject(NotificationService);
  private readonly appRegistry = inject(AppRegistry);

  public readonly processes = signal<Process[]>([]);
  private readonly topOverlapCounter = signal<number>(0);
  private readonly bottomOverlapCounter = signal<number>(0);
  private globalZIndex = 100;
  private globalCascadeIndex = 0;

  public readonly isTopBarHidden = computed(() => this.topOverlapCounter() > 0);
  public readonly isDockHidden = computed(() => this.bottomOverlapCounter() > 0);
  public readonly hasActiveProcesses = computed(() => this.processes().length > 0);

  public readonly activeProcessId = computed(() => {
    const visible = this.processes()
      .filter((p) => !p.isMinimized)
      .sort((a, b) => b.zIndex - a.zIndex);
    return visible[0]?.id || null;
  });

  public open(app: AppBase, data?: ProcessData): void {
    const id = crypto.randomUUID();
    const newProcess: Process = {
      ...app,
      appId: app.id,
      id,
      isMaximized: false,
      isMinimized: false,
      zIndex: this.getNextZIndex(),
      cascadeIndex: this.globalCascadeIndex++,
      data: data || { id },
    };

    this.processes.update((current) => [...current, newProcess]);
  }

  public openFile(node: FileItem): void {
    if (!node.url) return;

    const handler = this.findHandlerForFile(node.name);

    if (handler) {
      this.handleAudioSingleton(node.name, handler.id);
      this.open(handler, { url: node.url, title: node.name });
    } else {
      this.showNoHandlerError();
    }
  }

  private findHandlerForFile(fileName: string) {
    const extension = this.fs.getFileExtension(fileName);
    return this.appRegistry.findHandlerForExtension(extension);
  }

  private handleAudioSingleton(fileName: string, musicAppId: string): void {
    const isAudio = AUDIO_EXTENSIONS.some((ext) => fileName.includes(ext));
    if (!isAudio) return;

    const existing = this.processes().find((p) => p.appId === musicAppId);
    if (existing) this.close(existing.id);
  }

  public close(processId: string): void {
    this.processes.update((current) => current.filter((p) => p.id !== processId));
  }

  public closeAllInstancesById(appId: string): void {
    this.processes.update((current) => current.filter((p) => p.appId !== appId));
  }

  public focus(processId: string): void {
    this.processes.update((current) => {
      const p = current.find((item) => item.id === processId);
      if (p && p.zIndex === this.globalZIndex && !p.isMinimized) return current;

      return current.map((item) =>
        item.id === processId
          ? { ...item, zIndex: this.getNextZIndex(), isMinimized: false }
          : item
      );
    });
  }

  public toggleMinimize(processId: string): void {
    this.processes.update((current) =>
      current.map((p) => {
        if (p.id !== processId) return p;
        const willMinimize = !p.isMinimized;
        return {
          ...p,
          isMinimized: willMinimize,
          zIndex: willMinimize ? p.zIndex : this.getNextZIndex(),
        };
      })
    );
  }

  public updateTopOverlap(isOverlapping: boolean): void {
    this.topOverlapCounter.update((v) => (isOverlapping ? v + 1 : Math.max(0, v - 1)));
  }

  public updateBottomOverlap(isOverlapping: boolean): void {
    this.bottomOverlapCounter.update((v) => (isOverlapping ? v + 1 : Math.max(0, v - 1)));
  }

  private getNextZIndex(): number {
    return ++this.globalZIndex;
  }

  private showNoHandlerError(): void {
    this.nots.show({
      title: this.lang.t().errors.systemError,
      message: this.lang.t().errors.noFileHandler,
      icon: 'fas fa-circle-exclamation',
    });
  }

  public hasActiveProcessesById(appId: string): boolean {
    return this.processes().some((p) => p.appId === appId);
  }
}