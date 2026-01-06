import { Injectable, signal, computed } from '@angular/core';
import { Language } from '../language/i18n.types';
import { TRANSLATIONS } from '../language/i18n.types';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  readonly currentLang = signal<Language>(this.getInitialLanguage());

  readonly t = computed(() => TRANSLATIONS[this.currentLang()]);

  private getInitialLanguage(): Language {
    const saved = localStorage.getItem('lang') as Language;
    if (saved) return saved;

    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'pt' || browserLang === 'en' ? (browserLang as Language) : 'pt';
  }

  setLanguage(lang: Language) {
    this.currentLang.set(lang);
    localStorage.setItem('lang', lang);
  }

  toggle() {
    this.setLanguage(this.currentLang() === 'pt' ? 'en' : 'pt');
  }
}
