import { Component, ElementRef, OnDestroy, inject, signal, computed, ChangeDetectionStrategy, NgZone } from '@angular/core';
import { Theme } from '../../core/services/theme';
import { SettingSection } from '../../core/models/setting';
import { Settings } from '../../core/services/settings';
import { Base } from '../../core/models/base';
import { LanguageService } from '../../core/services/language';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './settings.scss',
})
export class SettingsComponent extends Base implements OnDestroy {
  theme = inject(Theme);
  settings = inject(Settings);
  lang = inject(LanguageService);
  private ngZone = inject(NgZone);
  private hostEl = inject(ElementRef<HTMLElement>);

  readonly isNarrow = signal(false);
  private resizeObserver: ResizeObserver | null = null;

  activeSection = signal<SettingSection>('appearance');

  constructor() {
    super();
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver((entries) => {
        const w = entries[0]?.contentRect.width ?? 0;
        this.ngZone.run(() => this.isNarrow.set(w > 0 && w < 680));
      });
      this.resizeObserver.observe(this.hostEl.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  menuItems = computed(() => {
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

  wallpapers = [
    '/wallpapers/desktop/default.webp',
    '/wallpapers/desktop/nebula.webp',
    '/wallpapers/desktop/sunset.webp',
  ];

  wallpapersAnimated = [
    '/videos/wallpapers/desktop/landscape.mp4',
    '/videos/wallpapers/desktop/superman.mp4',
    '/videos/wallpapers/desktop/su-future.mp4',
    '/videos/wallpapers/desktop/tokyo.mp4',
  ];

  wallpapersMobile = [
    '/wallpapers/mobile/default.webp',
    '/wallpapers/mobile/nebula.webp',
    '/wallpapers/mobile/sunset.webp',
  ];

  systemInfo = {
    os: 'Cai_OS 2.0.1 (Gnome-like Web Desktop)',
    kernel: 'Linux 6.8.0-generic (WebAssembly Runtime)',
    arch: typeof navigator !== 'undefined' ? navigator.platform : 'x86_64',
    cpu: typeof navigator !== 'undefined' && navigator.hardwareConcurrency ? navigator.hardwareConcurrency : '—',
    ram: typeof navigator !== 'undefined' && 'deviceMemory' in navigator ? `${(navigator as Navigator & { deviceMemory?: number }).deviceMemory} GB` : '—',
    resolution: typeof window !== 'undefined' && window.screen ? `${window.screen.width} × ${window.screen.height}` : '—',
    language: typeof navigator !== 'undefined' ? navigator.language : 'pt-BR',
    browser: typeof navigator !== 'undefined' ? navigator.userAgent.split(' ').pop() || 'Modern Browser' : '—',
  };

  setSection(section: SettingSection) {
    this.activeSection.set(section);
  }

  setWallpaper(wp: string) {
    this.settings.setWallpaper(wp);
  }

  setThemeMode(dark: boolean) {
    this.theme.setDark(dark);
  }

  setLanguage(lang: 'pt' | 'en') {
    this.lang.setLanguage(lang);
  }
}
