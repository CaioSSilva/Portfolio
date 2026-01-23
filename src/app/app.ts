import { Component, HostListener, inject, signal, effect } from '@angular/core';
import { NotificationService } from './core/services/notification';
import { ProcessManager } from './core/services/process-manager';
import { Settings } from './core/services/settings';
import { Sound } from './core/services/sound';
import { AppsGrid } from './layout/apps-grid/apps-grid';
import { Dock } from './layout/dock/dock';
import { WindowSwitcher } from './layout/window-switcher/window-switcher';
import { Window } from './shared/ui/window/window';
import { TopBar } from './layout/top-bar/top-bar';
import { Boot } from './shared/ui/boot/boot';
import { Shutdown } from './shared/ui/shutdown/shutdown';
import { LanguageService } from './core/services/language';
import { SystemTips } from './core/services/system-tips';
import { DesktopIcons } from './features/desktop-icons/desktop-icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [AppsGrid, Dock, WindowSwitcher, Window, TopBar, Boot, Shutdown, DesktopIcons],
})
export class App {
  processManager = inject(ProcessManager);
  settingsService = inject(Settings);
  sound = inject(Sound);
  lang = inject(LanguageService);
  notifications = inject(NotificationService);
  tipsService = inject(SystemTips);

  systemReady = signal(false);
  shutingDown = signal(false);

  constructor() {
    effect(() => {
      if (this.systemReady()) {
        this.settingsService.tipsEnabled() && this.tipsService.startRandomTips();
      }
    });
  }

  @HostListener('mousedown')
  onClick() {
    if (this.systemReady()) {
      this.sound.play('mouse_down');
    }
  }

  @HostListener('mouseup')
  onMouseUp() {
    if (this.systemReady()) {
      this.sound.play('mouse_up');
    }
  }
}
