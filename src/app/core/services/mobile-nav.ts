import { Injectable, signal, inject } from '@angular/core';
import { ProcessManager } from './process-manager';
import { Apps } from './apps';

@Injectable({ providedIn: 'root' })
export class MobileNavService {
  private readonly processManager = inject(ProcessManager);
  private readonly apps = inject(Apps);

  readonly isOverviewOpen = signal<boolean>(false);

  toggleOverview(): void {
    this.apps.isAppsGridOpen.set(false);
    this.isOverviewOpen.update((v) => !v);
  }

  openOverview(): void {
    this.apps.isAppsGridOpen.set(false);
    this.isOverviewOpen.set(true);
  }

  closeOverview(): void {
    this.isOverviewOpen.set(false);
  }

  goHome(): void {
    this.isOverviewOpen.set(false);
    this.apps.isAppsGridOpen.set(false);
    const processes = this.processManager.processes();
    processes.forEach((p) => {
      if (!p.isMinimized) {
        this.processManager.toggleMinimize(p.id);
      }
    });
  }

  openAppAndCloseDrawer(app: any): void {
    this.isOverviewOpen.set(false);
    this.apps.openApp(app);
  }

  toggleAppDrawer(): void {
    this.isOverviewOpen.set(false);
    this.apps.toggleGrid();
  }
}
