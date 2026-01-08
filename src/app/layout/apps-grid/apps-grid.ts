import { Component, inject } from '@angular/core';
import { Apps } from '../../core/services/apps';
import { LanguageService } from '../../core/services/language';
import { ProcessManager } from '../../core/services/process-manager';

@Component({
  selector: 'app-apps-grid',
  imports: [],
  templateUrl: './apps-grid.html',
  styleUrl: './apps-grid.scss',
})
export class AppsGrid {
  appsService = inject(Apps);
  process = inject(ProcessManager);
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
