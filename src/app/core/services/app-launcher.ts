import { Injectable, inject } from '@angular/core';
import { AppDefinition } from '../models/dock';
import { ProcessManager } from './process-manager';
import { ContextMenuService } from './context-menu';

@Injectable({ providedIn: 'root' })
export class AppLauncher {
  private readonly processManager = inject(ProcessManager);
  private readonly contextMenu = inject(ContextMenuService);

  launch(app: AppDefinition, data?: any) {
    this.contextMenu.close();
    this.processManager.open(app, data);
  }

  launchAndCloseContext(app: AppDefinition) {
    this.launch(app, app.data);
  }
}
