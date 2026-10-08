import { Injectable, inject } from '@angular/core';
import { AppRegistry } from './app-registry';
import { ProcessManager } from './process-manager';
import {
  HermesAction,
  OpenAppPayload,
  CloseAppPayload,
  OpenFilePayload,
} from '../models/hermes-action';

@Injectable({ providedIn: 'root' })
export class HermesAppActionsService {
  private readonly appRegistry = inject(AppRegistry);
  private readonly processManager = inject(ProcessManager);

  execute(action: HermesAction): void {
    switch (action.type) {
      case 'open_app':
        this.openApp(action);
        break;
      case 'close_app':
        this.closeApp(action);
        break;
      case 'open_file':
        this.openFile(action);
        break;
    }
  }

  private openApp(action: HermesAction): void {
    const payload = action.payload as OpenAppPayload | undefined;
    if (!payload?.app) throw new Error('Missing app');
    const app = this.appRegistry.getAppById(payload.app);
    if (!app) throw new Error(`App not found: ${payload.app}`);
    this.processManager.open(app, app.data);
  }

  private closeApp(action: HermesAction): void {
    const payload = action.payload as CloseAppPayload | undefined;
    if (!payload?.app) throw new Error('Missing app');
    this.processManager.closeAllInstancesById(payload.app);
  }

  private openFile(action: HermesAction): void {
    const payload = action.payload as OpenFilePayload | undefined;
    if (!payload?.name || !payload?.url) throw new Error('Missing file info');
    this.processManager.openFile({
      id: payload.name,
      name: payload.name,
      type: 'file',
      icon: 'fas fa-file',
      url: payload.url as string,
    });
  }
}
