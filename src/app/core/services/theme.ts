import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Theme {
  readonly isDarkMode = signal<boolean>(this.getInitialTheme());

  constructor() {
    effect(() => {
      const isDark = this.isDarkMode();
      const html = document.documentElement;

      if (isDark) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }

      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    this.listenToSystemChanges();
  }

  toggle() {
    this.isDarkMode.update((current) => !current);
  }

  setDark(value: boolean) {
    this.isDarkMode.set(value);
  }

  private getInitialTheme(): boolean {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private listenToSystemChanges() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (event) => {
      if (!localStorage.getItem('theme')) {
        this.isDarkMode.set(event.matches);
      }
    });
  }
}
