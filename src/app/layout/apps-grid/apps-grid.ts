import { Component, inject } from '@angular/core';
import { Apps } from '../../core/services/apps';
import { LanguageService } from '../../core/services/language';
import { ContextMenu } from '../../shared/ui/context-menu/context-menu';
import { ContextMenuService } from '../../core/services/context-menu';
@Component({
  selector: 'app-apps-grid',
  imports: [ContextMenu],
  templateUrl: './apps-grid.html',
  styleUrl: './apps-grid.scss',
})
export class AppsGrid {
  appsService = inject(Apps);
  contextMenu = inject(ContextMenuService);
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
