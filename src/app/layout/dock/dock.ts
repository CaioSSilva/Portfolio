import { Component, inject, OnInit, signal } from '@angular/core';
import { DockService } from '../../core/services/dock';
import { CommonModule } from '@angular/common';
import { Apps } from '../../core/services/apps';
import { ProcessManager } from '../../core/services/process-manager';
import { Settings } from '../../core/services/settings';
import { LanguageService } from '../../core/services/language';
import { ContextMenuService } from '../../core/services/context-menu';
import { ContextMenu } from '../../shared/ui/context-menu/context-menu';

@Component({
  selector: 'app-dock',
  standalone: true,
  imports: [CommonModule, ContextMenu],
  templateUrl: './dock.html',
  styleUrl: './dock.scss',
})
export class Dock implements OnInit {
  dock = inject(DockService);
  apps = inject(Apps);
  contextMenu = inject(ContextMenuService);
  processManager = inject(ProcessManager);
  lang = inject(LanguageService);
  settings = inject(Settings);

  itemNewPinPos = signal<number | null>(null);

  ngOnInit(): void {
    setTimeout(() => {
      this.apps.openApp(this.apps.appsRegistry.about);
    }, 1000);
  }

  getAppLabel(appId: string, defaultTitle: string): string {
    const langData = this.lang.t();
    return langData.apps[appId as keyof typeof langData.apps] || defaultTitle;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'link';

    const container = event.currentTarget as HTMLElement;

    const dockItems = container.querySelectorAll('.dock-item');

    let targetPos = dockItems.length;

    for (let i = 0; i < dockItems.length; i++) {
      const rect = dockItems[i].getBoundingClientRect();
      const itemCenter = rect.left + rect.width / 2;

      if (event.clientX < itemCenter) {
        targetPos = i;
        break;
      }
    }

    this.itemNewPinPos.set(targetPos);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const appId = event.dataTransfer?.getData('appId');
    const position = this.itemNewPinPos();

    if (appId && position !== null) {
      this.dock.pinApp(appId, position);
    }

    this.itemNewPinPos.set(null);
  }
}
