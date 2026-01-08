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

  toggle() {
    this.isDarkMode.update((dark) => !dark);
  }

  setDark(value: boolean) {
    this.isDarkMode.set(value);
  }

  private applyTheme(isDark: boolean) {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  private getInitialTheme(): boolean {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private listenToSystemChanges() {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
      if (!localStorage.getItem('theme')) {
        this.isDarkMode.set(event.matches);
      }
    });
  }
}
