import { Injectable, signal, computed } from '@angular/core';
import { Language, TRANSLATIONS } from '../language/i18n.types';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  readonly currentLang = signal<Language>(this.getInitialLanguage());
  readonly t = computed(() => TRANSLATIONS[this.currentLang()]);

  private getInitialLanguage(): Language {
    try {
      const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('lang') : null;
      if (saved === 'pt' || saved === 'en') return saved;

      if (typeof navigator !== 'undefined' && navigator.language) {
        const browserLang = navigator.language.split('-')[0];
        if (browserLang === 'pt' || browserLang === 'en') {
          return browserLang;
        }
      }
    } catch {}
    return 'pt';
  }

  setLanguage(lang: Language): void {
    this.currentLang.set(lang);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('lang', lang);
      }
    } catch {}
  }

  toggle(): void {
    this.setLanguage(this.currentLang() === 'pt' ? 'en' : 'pt');
  }
}
