import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { CONTEXT_MENU_OPEN_ANIMATION } from '../../../core/models/context-menu';
import { DockService } from '../../../core/services/dock';
import { LanguageService } from '../../../core/services/language';
import { ProcessManager } from '../../../core/services/process-manager';
import { ContextMenuService } from '../../../core/services/context-menu';
import { DesktopIconsService } from '../../../core/services/desktop-icons';
import { ScreenService } from '../../../core/services/screen';
import { Apps } from '../../../core/services/apps';

@Component({
  selector: 'app-context-menu',
  imports: [],
  templateUrl: './context-menu.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './context-menu.scss',
})
export class ContextMenu {
  private readonly apps = inject(Apps);
  readonly dock = inject(DockService);
  readonly desktop = inject(DesktopIconsService);
  readonly processManager = inject(ProcessManager);
  readonly contextMenu = inject(ContextMenuService);
  readonly lang = inject(LanguageService);
  readonly screen = inject(ScreenService);
  readonly menuPosition = signal({ x: 0, y: 0 });
  readonly menuTransformOrigin = signal('0px 0px');
  readonly hasPositionedMenu = signal(false);

  private readonly menuElement = viewChild<ElementRef<HTMLElement>>('menuElement');
  private activeAppIdForAnimation: string | null = null;
  private menuAnimation: Animation | null = null;

  constructor() {
    afterRenderEffect(() => this.updateMenuPosition());
  }

  private updateMenuPosition(): void {
    const menu = this.menuElement()?.nativeElement;
    const pointer = this.contextMenu.position();
    if (!this.contextMenu.isOpen()) {
      this.hasPositionedMenu.set(false);
      this.activeAppIdForAnimation = null;
      this.menuAnimation?.cancel();
      this.menuAnimation = null;
      return;
    }
    const appId = this.contextMenu.activeAppId();
    if (!menu || !appId) return;

    const width = menu.offsetWidth;
    const height = menu.offsetHeight;
    const position = this.calculateMenuPosition(pointer.x, pointer.y, width, height);
    this.menuPosition.set(position);
    this.menuTransformOrigin.set(`${pointer.x - position.x}px ${pointer.y - position.y}px`);
    this.hasPositionedMenu.set(true);
    if (this.activeAppIdForAnimation !== appId) {
      this.animateMenu(menu);
      this.activeAppIdForAnimation = appId;
    }
  }

  private animateMenu(menu: HTMLElement): void {
    this.menuAnimation?.cancel();
    this.menuAnimation = menu.animate(
      CONTEXT_MENU_OPEN_ANIMATION.keyframes,
      CONTEXT_MENU_OPEN_ANIMATION.options,
    );
  }

  private calculateMenuPosition(
    pointerX: number,
    pointerY: number,
    width: number,
    height: number,
  ): { x: number; y: number } {
    const margin = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const x =
      pointerX + width <= viewportWidth - margin ? pointerX : pointerX - width;
    const y =
      pointerY + height <= viewportHeight - margin ? pointerY : pointerY - height;

    return {
      x: Math.max(margin, Math.min(x, viewportWidth - width - margin)),
      y: Math.max(margin, Math.min(y, viewportHeight - height - margin)),
    };
  }
}
