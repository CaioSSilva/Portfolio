import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  inject,
  signal,
  effect,
  computed,
  untracked,
  viewChild,
  ElementRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly sound = inject(Sound);
  private readonly tipsService = inject(SystemTips);
  readonly apps = inject(Apps);
  readonly processManager = inject(ProcessManager);
  readonly settingsService = inject(Settings);
  readonly screen = inject(ScreenService);

  readonly systemReady = signal(false);
  readonly isShuttingDown = signal(false);
  readonly isAnimated = computed(() => {
    const wallpaper = this.settingsService.wallpaper();
    return Boolean(wallpaper && (wallpaper.endsWith('.mp4') || wallpaper.endsWith('.webm')));
  });

  private readonly videoPlayer = viewChild<ElementRef<HTMLVideoElement>>('bgVideo');

  constructor() {
    effect(() => this.handleSystemReady());
    effect(() => this.handleWallpaperVideo());
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

  private handleSystemReady(): void {
    if (!this.systemReady()) return;
    if (this.settingsService.tipsEnabled()) {
      this.tipsService.startRandomTips();
    }
    const aboutApp = untracked(() => this.apps.appsRegistry().about);
    if (aboutApp) {
      timer(1000)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.apps.openApp(aboutApp));
    }
  }

  private handleWallpaperVideo(): void {
    this.settingsService.wallpaper();
    const videoEl = this.videoPlayer()?.nativeElement;
    if (videoEl) {
      videoEl.load();
      videoEl.play().catch(() => {});
    }
  }
}
