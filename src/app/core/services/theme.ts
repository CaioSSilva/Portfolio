import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Theme {
  public readonly isDarkMode = signal<boolean>(this.getInitialTheme());

  constructor() {
    effect(() => {
      this.applyTheme(this.isDarkMode());
    });
    this.listenToSystemChanges();
  }

  public toggle(): void {
    this.isDarkMode.update((dark) => !dark);
  }

  public setDark(value: boolean): void {
    this.isDarkMode.set(value);
  }

  private applyTheme(isDark: boolean): void {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  private getInitialTheme(): boolean {
    try {
      const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null;
      if (saved) return saved === 'dark';
      if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    } catch (error) {
      console.warn('[Theme] Could not read theme preference:', error);
    }
    return false;
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
}