import { Component, inject, NgZone, signal, ChangeDetectionStrategy } from '@angular/core';
import { DockService } from '../../core/services/dock';
import { Apps } from '../../core/services/apps';
import { ProcessManager } from '../../core/services/process-manager';
import { Settings } from '../../core/services/settings';
import { LanguageService } from '../../core/services/language';
import { ContextMenuService } from '../../core/services/context-menu';
import { DockItem } from '../../core/models/dock';

@Component({
  selector: 'app-dock',
  standalone: true,
  imports: [],
  templateUrl: './dock.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './dock.scss',
})
export class Dock {
  private readonly contextMenu = inject(ContextMenuService);
  private readonly ngZone = inject(NgZone);
  readonly dock = inject(DockService);
  readonly apps = inject(Apps);
  readonly processManager = inject(ProcessManager);
  readonly lang = inject(LanguageService);
  readonly settings = inject(Settings);

  readonly itemNewPinPos = signal<number | null>(null);

  private touchStartX = 0;
  private touchStartY = 0;
  private longPressTimer: ReturnType<typeof setTimeout> | null = null;

  getAppLabel(appId: string, defaultTitle: string): string {
    const langData = this.lang.t();
    return langData.apps[appId as keyof typeof langData.apps] || defaultTitle;
  }

  onItemTouchStart(event: TouchEvent, appId: string): void {
    if (this.contextMenu.isOpen()) return;

    const touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;

    const btn = event.currentTarget as HTMLElement;
    this.longPressTimer = setTimeout(() => {
      this.ngZone.run(() => this.apps.openContextMenuAt(btn, appId));
    }, 500);
  }

  onItemTouchMove(event: TouchEvent): void {
    const dx = Math.abs(event.touches[0].clientX - this.touchStartX);
    const dy = Math.abs(event.touches[0].clientY - this.touchStartY);
    if ((dx > 10 || dy > 10) && this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  onItemTouchEnd(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  onItemClick(item: DockItem, event: MouseEvent): void {
    if (this.contextMenu.isOpen()) {
      this.contextMenu.close();
      return;
    }
    this.dock.handleAppClick(item, event);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'link';
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

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const appId = event.dataTransfer?.getData('appId');
    const position = this.itemNewPinPos();

    if (appId && position !== null) {
      this.dock.pinApp(appId, position);
    }

    this.itemNewPinPos.set(null);
  }
}
