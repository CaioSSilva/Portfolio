import { Component, inject } from '@angular/core';
import { DockService } from '../../../core/services/dock';
import { Apps } from '../../../core/services/apps';
import { LanguageService } from '../../../core/services/language';
import { ProcessManager } from '../../../core/services/process-manager';
import { ContextMenuService } from '../../../core/services/context-menu';
import { DesktopIconsService } from '../../../core/services/desktop-icons';

@Component({
  selector: 'app-context-menu',
  imports: [],
  templateUrl: './context-menu.html',
  styleUrl: './context-menu.scss',
})
export class ContextMenu {
  appsService = inject(Apps);
  dock = inject(DockService);
  desktop = inject(DesktopIconsService);
  process = inject(ProcessManager);
  contextMenu = inject(ContextMenuService);
  lang = inject(LanguageService);
}
