import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { AppDefinition } from '../../core/models/dock';
import { Apps } from '../../core/services/apps';
import { LanguageService } from '../../core/services/language';
import { ContextMenu } from '../../shared/ui/context-menu/context-menu';
import { ContextMenuService } from '../../core/services/context-menu';

@Component({
  selector: 'app-apps-grid',
  imports: [ContextMenu],
  templateUrl: './apps-grid.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './apps-grid.scss',
})
export class AppsGrid {
  appsService = inject(Apps);
  contextMenu = inject(ContextMenuService);
  lang = inject(LanguageService);

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.appsService.searchQuery.set(input.value);
  }

  ondragStart(event: DragEvent, data: AppDefinition): void {
    event.dataTransfer?.setData('appId', data.id);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'link';
    }
  }
}
