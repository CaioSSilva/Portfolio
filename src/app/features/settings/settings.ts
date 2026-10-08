import {
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  NgZone,
} from '@angular/core';
import { Theme } from '../../core/services/theme';
import { SettingSection } from '../../core/models/setting';
import { Settings } from '../../core/services/settings';
import { Base } from '../../core/models/base';
import { LanguageService } from '../../core/services/language';
import { ScreenService } from '../../core/services/screen';
import { SystemInfoService } from '../../core/services/system-info';
import { APP_VERSION } from '../../core/version';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [],
  templateUrl: './settings.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './settings.scss',
})
export class SettingsComponent extends Base {
  private readonly ngZone = inject(NgZone);
  private readonly hostEl = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly systemInfoService = inject(SystemInfoService);
  readonly theme = inject(Theme);
  readonly settings = inject(Settings);
  readonly lang = inject(LanguageService);
  readonly screen = inject(ScreenService);

  readonly version = APP_VERSION;

  readonly isNarrow = signal(false);
  readonly activeSection = signal<SettingSection>('appearance');

  readonly menuItems = computed(() => {
    const items = [
      {
        id: 'appearance' as SettingSection,
        icon: 'fas fa-palette',
        label: this.lang.t().settings.appearance.title,
      },
      {
        id: 'desktop' as SettingSection,
        icon: 'fas fa-desktop',
        label: this.lang.t().settings.desktop.title,
      },
      {
        id: 'sound' as SettingSection,
        icon: 'fas fa-volume-up',
        label: this.lang.t().settings.sound.title,
      },
      {
        id: 'language' as SettingSection,
        icon: 'fas fa-language',
        label: this.lang.t().settings.language.title,
      },
      {
        id: 'system' as SettingSection,
        icon: 'fas fa-wrench',
        label: this.lang.t().settings.system.title,
      },
    ];
    return items;
  });

  readonly wallpapers = [
    '/wallpapers/desktop/default.webp',
    '/wallpapers/desktop/nebula.webp',
    '/wallpapers/desktop/sunset.webp',
  ];

  readonly wallpapersAnimated = [
    '/videos/wallpapers/desktop/landscape.mp4',
    '/videos/wallpapers/desktop/superman.mp4',
    '/videos/wallpapers/desktop/su-future.mp4',
    '/videos/wallpapers/desktop/tokyo.mp4',
  ];

  readonly wallpapersMobile = [
    '/wallpapers/mobile/default.webp',
    '/wallpapers/mobile/nebula.webp',
    '/wallpapers/mobile/sunset.webp',
  ];

  readonly systemInfo = this.systemInfoService.info;

  constructor() {
    super();
    this.initResizeObserver();
  }

  private initResizeObserver(): void {
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      this.ngZone.run(() => this.isNarrow.set(width > 0 && width < 680));
    });
    observer.observe(this.hostEl.nativeElement);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  setSection(section: SettingSection): void {
    this.activeSection.set(section);
  }

  setWallpaper(wp: string): void {
    this.settings.setWallpaper(wp);
  }

  setThemeMode(dark: boolean): void {
    this.theme.setDark(dark);
  }

  setLanguage(lang: 'pt' | 'en'): void {
    this.lang.setLanguage(lang);
  }
}
