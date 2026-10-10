import { Injectable, inject } from '@angular/core';
import { ProcessManager } from './process-manager';
import { SystemInfoService } from './system-info';
import { NotificationService } from './notification';
import { LanguageService } from './language';

@Injectable({ providedIn: 'root' })
export class HermesInfoActionsService {
  private readonly processManager = inject(ProcessManager);
  private readonly systemInfo = inject(SystemInfoService);
  private readonly notifications = inject(NotificationService);
  private readonly lang = inject(LanguageService);

  getSystemStatus(): void {
    const info = this.systemInfo.info;
    const count = this.processManager.processes().length;
    const isPt = this.lang.currentLang() === 'pt';
    const label = isPt ? 'Status do Sistema' : 'System Status';
    const processLabel = isPt ? 'Processos ativos' : 'Active processes';
    const message = [
      `${processLabel}: ${count}`,
      `OS: ${info.os}`,
      `CPU: ${info.cpu}`,
      `RAM: ${info.ram}`,
      `${info.resolution}`,
    ].join(' · ');
    this.notifications.show({
      title: label,
      message,
      icon: 'fas fa-microchip',
    });
  }

  showError(title: string, message: string): void {
    this.notifications.show({
      title,
      message,
      icon: 'fas fa-circle-exclamation',
    });
  }
}
