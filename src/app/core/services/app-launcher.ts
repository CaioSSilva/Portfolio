import { Injectable, inject } from '@angular/core';
import { AppDefinition } from '../models/dock';
import { ProcessManager } from './process-manager';
import { ContextMenuService } from './context-menu';

@Injectable({ providedIn: 'root' })
export class AppLauncher {
  private readonly processManager = inject(ProcessManager);
  private readonly contextMenu = inject(ContextMenuService);

  public launch(app: AppDefinition, data?: unknown): void {
    this.contextMenu.close();
    this.processManager.open(app, data);
  }

  public launchAndCloseContext(app: AppDefinition): void {
    this.launch(app, app.data);
  }
}