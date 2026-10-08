import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { DockService } from '../../../core/services/dock';
import { Apps } from '../../../core/services/apps';
import { LanguageService } from '../../../core/services/language';
import { ProcessManager } from '../../../core/services/process-manager';
import { ContextMenuService } from '../../../core/services/context-menu';
import { DesktopIconsService } from '../../../core/services/desktop-icons';
import { ScreenService } from '../../../core/services/screen';
@Component({
  selector: 'app-context-menu',
  imports: [],
  templateUrl: './context-menu.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './context-menu.scss',
})
export class ContextMenu {
  readonly appsService = inject(Apps);
  readonly dock = inject(DockService);
  readonly desktop = inject(DesktopIconsService);
  readonly processManager = inject(ProcessManager);
  readonly contextMenu = inject(ContextMenuService);
  readonly lang = inject(LanguageService);
  readonly screen = inject(ScreenService);
}
