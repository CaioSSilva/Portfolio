import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Theme {
  readonly isDarkMode = signal<boolean>(this.getInitialTheme());

  constructor() {
    effect(() => {
      this.applyTheme(this.isDarkMode());
    });
    this.listenToSystemChanges();
  }

  toggle(): void {
    this.isDarkMode.update((dark) => !dark);
  }

  setDark(value: boolean): void {
    this.isDarkMode.set(value);
  }

  private applyTheme(isDark: boolean): void {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  private listenToSystemChanges(): void {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', (event) => {
          if (typeof localStorage !== 'undefined' && !localStorage.getItem('theme')) {
            this.isDarkMode.set(event.matches);
          }
        });
      }
    }
  }

  private getInitialTheme(): boolean {
    try {
      const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null;
      if (saved) return saved === 'dark';
      if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    } catch {}
    return false;
  }
}
