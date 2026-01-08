import { Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
import { DockService } from '../../core/services/dock';
import { CommonModule } from '@angular/common';
import { Apps } from '../../core/services/apps';
import { ProcessManager } from '../../core/services/process-manager';
import { Settings } from '../../core/services/settings';
import { LanguageService } from '../../core/services/language';
import { ContextMenu } from '../../core/services/context-menu';
import { AppDefinition } from '../../core/models/dock';

@Component({
  selector: 'app-dock',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dock.html',
  styleUrl: './dock.scss',
})
export class Dock implements OnInit {
  dock = inject(DockService);
  apps = inject(Apps);
  contextMenu = inject(ContextMenu);
  processManager = inject(ProcessManager);
  lang = inject(LanguageService);
  settings = inject(Settings);
  forceShow = signal(false);

  itemNewPinPos = signal<number | null>(null);

  ngOnInit(): void {
    setTimeout(() => {
      this.apps.openApp(this.apps.myApps().about);
    }, 1000);
  }

  activeAppId = computed(() => this.contextMenu.activeAppId() as keyof AppDefinition);

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

  onRightClick(event: MouseEvent, appId: string) {
    event.preventDefault();
    event.stopPropagation();

    const menuWidth = 180;
    let posX = event.clientX;
    let posY = event.clientY;

    if (posX + menuWidth > window.innerWidth) {
      posX -= menuWidth;
    }

    this.contextMenu.open(posX, posY, appId);
  }

  @HostListener('document:click')
  @HostListener('document:contextmenu')
  onWindowClick() {
    this.contextMenu.close();
  }

  unPinActiveApp() {
    const appId = this.contextMenu.activeAppId();
    const canUnpin = this.dock.dockItems().length > 1;
    if (appId && canUnpin) {
      this.dock.unpinApp(appId);
      this.contextMenu.close();
    }
  }

  openActiveApp() {
    this.apps.openApp(this.apps.myApps()[this.activeAppId()]!);
  }

  closeActiveApp() {
    this.processManager.closeAllInstancesById(this.activeAppId());
  }
}
