import { Component, inject, signal, computed } from '@angular/core';
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
  styleUrl: './settings.scss',
})
export class SettingsComponent extends Base {
  theme = inject(Theme);
  settings = inject(Settings);
  lang = inject(LanguageService);
  activeSection = signal<SettingSection>('appearance');

  menuItems = computed(() => [
    {
      id: 'appearance' as SettingSection,
      icon: 'fas fa-palette',
      label: this.lang.t().settings.title,
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
  ]);

  wallpapers = [
    '/wallpapers/default.webp',
    '/wallpapers/waves.webp',
    '/wallpapers/nebula.webp',
    '/wallpapers/sunset.webp',
  ];

  setSection(section: SettingSection) {
    this.activeSection.set(section);
  }

  readonly systemInfo = {
    cpu: navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency}` : '—',
    ram: (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : '—',
    resolution: `${window.screen.width} × ${window.screen.height}`,
  };
}
