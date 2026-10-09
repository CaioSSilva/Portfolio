import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Subscription, take, timer } from 'rxjs';
import { AppDefinition } from '../../core/models/dock';
import { Apps } from '../../core/services/apps';
import { LanguageService } from '../../core/services/language';
import { ContextMenuService } from '../../core/services/context-menu';
import { ScreenService } from '../../core/services/screen';

@Component({
  selector: 'app-apps-grid',
  imports: [],
  templateUrl: './apps-grid.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './apps-grid.scss',
})
export class AppsGrid {
  readonly appsService = inject(Apps);
  readonly contextMenu = inject(ContextMenuService);
  readonly lang = inject(LanguageService);
  readonly screen = inject(ScreenService);

  private touchStartX = 0;
  private touchStartY = 0;
  private touchStartTime = 0;
  private longPressTimer = Subscription.EMPTY;

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.appsService.searchQuery.set(input.value);
  }

  onDragStart(event: DragEvent, data: AppDefinition): void {
    event.dataTransfer?.setData('appId', data.id);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'link';
    }
  }

  onAppTouchStart(event: TouchEvent, app: AppDefinition): void {
    if (this.contextMenu.isOpen()) return;

    const touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchStartTime = Date.now();

    const btn = event.currentTarget as HTMLElement;
    this.longPressTimer = timer(500)
      .pipe(take(1))
      .subscribe(() => this.appsService.openContextMenuAt(btn, app.id));
  }

  onAppTouchEnd(event: TouchEvent, app: AppDefinition): void {
    this.longPressTimer.unsubscribe();

    if (!this.touchStartTime || this.contextMenu.isOpen()) return;

    const dx = Math.abs(event.changedTouches[0].clientX - this.touchStartX);
    const dy = Math.abs(event.changedTouches[0].clientY - this.touchStartY);
    const duration = Date.now() - this.touchStartTime;

    if (dx < 10 && dy < 10 && duration < 400) {
      event.stopPropagation();
      event.preventDefault();
      this.appsService.openApp(app);
    }
  }

  onAppTouchMove(event: TouchEvent): void {
    const dx = Math.abs(event.touches[0].clientX - this.touchStartX);
    const dy = Math.abs(event.touches[0].clientY - this.touchStartY);
    if (dx > 10 || dy > 10) {
      this.longPressTimer.unsubscribe();
    }
  }

  onBackdropClick(): void {
    if (this.contextMenu.isOpen()) {
      this.contextMenu.close();
      return;
    }
    this.appsService.closeGrid();
  }

  onAppClick(event: MouseEvent, app: AppDefinition): void {
    event.stopPropagation();
    this.appsService.openApp(app);
  }

  getAppLabel(appId: string, fallback: string): string {
    return (this.lang.t().apps as Record<string, string>)[appId] || fallback;
  }
}
