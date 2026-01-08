import { Component, inject } from '@angular/core';
import { Apps } from '../../core/services/apps';
import { LanguageService } from '../../core/services/language';
import { ProcessManager } from '../../core/services/process-manager';
import { ContextMenu } from '../../core/services/context-menu';
import { DockService } from '../../core/services/dock';

@Component({
  selector: 'app-apps-grid',
  imports: [],
  templateUrl: './apps-grid.html',
  styleUrl: './apps-grid.scss',
})
export class AppsGrid {
  appsService = inject(Apps);
  dock = inject(DockService);
  process = inject(ProcessManager);
  contextMenu = inject(ContextMenu);
  lang = inject(LanguageService);

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.appsService.searchQuery.set(input.value);
  }

  ondragStart(event: DragEvent, data: any) {
    event.dataTransfer?.setData('appId', data.id);
    event.dataTransfer!.effectAllowed = 'link';
  }
}
