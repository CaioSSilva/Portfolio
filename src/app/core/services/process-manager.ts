import { computed, inject, Injectable, signal } from '@angular/core';
import { AppBase } from '../models/base';
import { Process } from '../models/process';
import { getInstalledApps } from '../models/apps';
import { LanguageService } from './language';
import { FileSystem } from './file-system';
import { AUDIO_EXTENSIONS, FileItem } from '../models/file';
import { NotificationService } from './notification';

@Injectable({ providedIn: 'root' })
export class ProcessManager {
  private readonly lang = inject(LanguageService);
  private readonly fs = inject(FileSystem);
  private readonly nots = inject(NotificationService);

  readonly processes = signal<Process[]>([]);

  private readonly topOverlapCounter = signal(0);
  private readonly bottomOverlapCounter = signal(0);
  private globalZIndex = 100;

  readonly isTopBarHidden = computed(() => this.topOverlapCounter() > 0);
  readonly isDockHidden = computed(() => this.bottomOverlapCounter() > 0);
  readonly hasActiveProcesses = computed(() => this.processes().length > 0);

  readonly activeProcessId = computed(() => {
    const visible = this.processes()
      .filter((p) => !p.isMinimized)
      .sort((a, b) => b.zIndex - a.zIndex);
    return visible[0]?.id || null;
  });

  open(app: AppBase, data?: any) {
    const id = crypto.randomUUID();
    const newProcess: Process = {
      ...app,
      appId: app.id,
      id,
      isMaximized: false,
      isMinimized: false,
      zIndex: this.getNextZIndex(),
      data: data || { id },
    };

    this.processes.update((current) => [...current, newProcess]);
  }

  openFile(node: FileItem) {
    if (!node.url) return;

    const handler = this.findHandlerForFile(node.name);

    if (handler) {
      this.handleAudioSingleton(node.name);
      this.open(handler, { url: node.url, title: node.name });
    } else {
      this.showNoHandlerError();
    }
  }

  private findHandlerForFile(fileName: string) {
    const extension = this.fs.getFileExtension(fileName);
    const registry = getInstalledApps(this.lang);
    return Object.values(registry).find((app) => app?.handle?.includes(extension));
  }

  private handleAudioSingleton(fileName: string) {
    const isAudio = AUDIO_EXTENSIONS.some((ext) => fileName.includes(ext));
    if (!isAudio) return;

    const musicApp = getInstalledApps(this.lang).musics;
    const existing = this.processes().find((p) => p.appId === musicApp.id);
    if (existing) this.close(existing.id);
  }

  close(processId: string) {
    this.processes.update((current) => current.filter((p) => p.id !== processId));
  }

  closeAllInstancesById(appId: string) {
    this.processes.update((current) => current.filter((p) => p.appId !== appId));
  }

  focus(processId: string) {
    this.processes.update((current) => {
      const p = current.find((item) => item.id === processId);
      if (p && p.zIndex === this.globalZIndex && !p.isMinimized) return current;

      return current.map((item) =>
        item.id === processId ? { ...item, zIndex: this.getNextZIndex(), isMinimized: false } : item
      );
    });
  }

  toggleMinimize(processId: string) {
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

  updateTopOverlap(isOverlapping: boolean) {
    this.topOverlapCounter.update((v) => (isOverlapping ? v + 1 : Math.max(0, v - 1)));
  }

  updateBottomOverlap(isOverlapping: boolean) {
    this.bottomOverlapCounter.update((v) => (isOverlapping ? v + 1 : Math.max(0, v - 1)));
  }

  private getNextZIndex(): number {
    return ++this.globalZIndex;
  }

  private showNoHandlerError() {
    this.nots.show({
      title: this.lang.t().errors.systemError,
      message: this.lang.t().errors.noFileHandler,
      icon: 'fas circle-exclamation',
    });
  }

  hasActiveProcessesById = (appId: string): boolean => {
    return this.processes().some((p) => p.appId === appId);
  };
}
