import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  signal,
  effect,
  computed,
  untracked,
  viewChild,
  ElementRef,
} from '@angular/core';
import { ProcessManager } from './core/services/process-manager';
import { Settings } from './core/services/settings';
import { Sound } from './core/services/sound';
import { ScreenService } from './core/services/screen';
import { Apps } from './core/services/apps';
import { SystemTips } from './core/services/system-tips';
import { AppsGrid } from './layout/apps-grid/apps-grid';
import { Dock } from './layout/dock/dock';
import { WindowSwitcher } from './layout/window-switcher/window-switcher';
import { MobileNavBar } from './layout/mobile-nav-bar/mobile-nav-bar';
import { MobileOverview } from './layout/mobile-overview/mobile-overview';
import { Window } from './shared/ui/window/window';
import { TopBar } from './layout/top-bar/top-bar';
import { Boot } from './shared/ui/boot/boot';
import { Shutdown } from './shared/ui/shutdown/shutdown';
import { DesktopIcons } from './features/desktop-icons/desktop-icons';
import { ContextMenu } from './shared/ui/context-menu/context-menu';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [
    AppsGrid,
    Dock,
    WindowSwitcher,
    MobileNavBar,
    MobileOverview,
    Window,
    TopBar,
    Boot,
    Shutdown,
    DesktopIcons,
    ContextMenu,
  ],
})
export class App {
  private readonly sound = inject(Sound);
  private readonly tipsService = inject(SystemTips);
  private readonly apps = inject(Apps);
  readonly processManager = inject(ProcessManager);
  readonly settingsService = inject(Settings);
  readonly screen = inject(ScreenService);

  readonly systemReady = signal(false);
  readonly isShuttingDown = signal(false);

  readonly videoPlayer = viewChild<ElementRef<HTMLVideoElement>>('bgVideo');

  readonly isAnimated = computed(() => {
    const wp = this.settingsService.wallpaper();
    return wp && (wp.endsWith('.mp4') || wp.endsWith('.webm'));
  });

  constructor() {
    effect(() => {
      if (!this.systemReady()) return;

      if (this.settingsService.tipsEnabled()) {
        this.tipsService.startRandomTips();
      }

      const aboutApp = untracked(() => this.apps.appsRegistry().about);
      if (aboutApp) {
        setTimeout(() => this.apps.openApp(aboutApp), 1000);
      }
    });

    effect(() => {
      this.settingsService.wallpaper();
      const videoEl = this.videoPlayer()?.nativeElement;

      if (videoEl) {
        videoEl.load();
        videoEl.play().catch(() => {});
      }
    });
  }

  @HostListener('mousedown')
  onClick(): void {
    if (this.systemReady() && !this.screen.isMobile()) {
      this.sound.play('mouse_down');
    }
  }

  @HostListener('mouseup')
  onMouseUp(): void {
    if (this.systemReady() && !this.screen.isMobile()) {
      this.sound.play('mouse_up');
    }
  }
}
