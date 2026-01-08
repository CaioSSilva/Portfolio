import { computed, inject, Injectable, signal } from '@angular/core';
import { AppBase } from '../models/base';
import { Process } from '../models/process';
import { getInstalledApps } from '../models/apps';
import { LanguageService } from './language';
import { FileSystem } from './file-system';
import { AUDIO_EXTENSIONS, FileItem } from '../models/file';
import { NotificationService } from './notification';

@Injectable({
  providedIn: 'root',
})
export class ProcessManager {
  readonly processes = signal<Process[]>([]);
  private readonly lang = inject(LanguageService);
  private readonly fs = inject(FileSystem);
  private nots = inject(NotificationService);
  private topOverlapCounter = signal(0);
  private bottomOverlapCounter = signal(0);

  readonly isTopBarHidden = computed(() => this.topOverlapCounter() > 0);
  readonly isDockHidden = computed(() => this.bottomOverlapCounter() > 0);

  readonly activeProcessId = computed(() => {
    const active = this.processes()
      .filter((p) => !p.isMinimized)
      .sort((a, b) => b.zIndex - a.zIndex)[0];
    return active ? active.id : null;
  });

  readonly hasActiveProcesses = computed(() => this.processes().length > 0);

  hasActiveProcessesById = (id: string): boolean => {
    return this.processes().some((p) => p.appId === id);
  };

  closeAllInstancesById = (id: string) => {
    this.processes.update((current) => current.filter((p) => p.appId !== id));
  };

  private globalZIndex = 100;

  updateTopOverlap(isOverlapping: boolean) {
    this.topOverlapCounter.update((v) => (isOverlapping ? v + 1 : Math.max(0, v - 1)));
  }

  updateBottomOverlap(isOverlapping: boolean) {
    this.bottomOverlapCounter.update((v) => (isOverlapping ? v + 1 : Math.max(0, v - 1)));
  }

  openFile(node: FileItem) {
    if (!node.url) return;

    const extension = this.fs.getFileExtension(node.name);
    const registry = getInstalledApps(this.lang);
    const handler = Object.values(registry).find((app) => app?.handle?.includes(extension));

    if (handler) {
      const hasMusicsOpened = this.processes().find((p) => p.appId === registry.musics.id);
      const nodeIsAudio = AUDIO_EXTENSIONS.some((ext) => node.name.includes(ext));
      if (hasMusicsOpened && nodeIsAudio) {
        this.close(hasMusicsOpened.id);
      }

      this.open(handler, {
        url: node.url,
        title: node.name,
      });
    } else {
      this.nots.show({
        title: this.lang.t().errors.systemError,
        message: this.lang.t().errors.noFileHandler,
        icon: 'fas circle-exclamation',
      });
    }
  }

  open(app: AppBase, data?: any) {
    const id = crypto.randomUUID();
    const newProcess: Process = {
      ...app,
      appId: app.id,
      id: id,
      isMaximized: false,
      isMinimized: false,
      zIndex: this.incrementZIndex(),
      data: data || {
        id: id,
      },
    };

    this.processes.update((current) => [...current, newProcess]);
  }

  private incrementZIndex(): number {
    return ++this.globalZIndex;
  }

  close(processId: string) {
    this.processes.update((current) => current.filter((p) => p.id !== processId));
  }

  toggleMinimize(processId: string) {
    this.processes.update((current) =>
      current.map((p) => {
        if (p.id === processId) {
          const newZIndex = !p.isMinimized ? p.zIndex : this.incrementZIndex();
          return { ...p, isMinimized: !p.isMinimized, zIndex: newZIndex };
        }
        return p;
      })
    );
  }

  focus(processId: string) {
    this.processes.update((current) => {
      const process = current.find((p) => p.id === processId);

      if (process && process.zIndex === this.globalZIndex && !process.isMinimized) {
        return current;
      }

      return current.map((p) =>
        p.id === processId ? { ...p, zIndex: this.incrementZIndex(), isMinimized: false } : p
      );
    });
  }
}
