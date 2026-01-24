import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Settings {
  readonly dockSize = signal<number>(this.load('dockSize', 48));
  readonly desktopSize = signal<number>(this.load('desktopSize', 40));
  readonly wallpaper = signal<string>(this.load('wallpaper', '/wallpapers/default.webp'));
  readonly systemMuted = signal<boolean>(this.load('soundMuted', false));
  readonly autoHideDock = signal<boolean>(this.load('autoHideDock', true));
  readonly tipsEnabled = signal<boolean>(this.load('tipsEnabled', true));

  constructor() {
    effect(() => {
      this.save('dockSize', this.dockSize());
      this.save('desktopSize', this.desktopSize());
      this.save('wallpaper', this.wallpaper());
      this.save('autoHideDock', this.autoHideDock());
      this.save('soundMuted', this.systemMuted());
      this.save('tipsEnabled', this.tipsEnabled());
    });
  }

  setWallpaper(path: string) {
    this.wallpaper.set(path);
  }

  setDockSize(size: number) {
    this.dockSize.set(size);
  }

  setDesktopSize(size: number) {
    this.desktopSize.set(size);
  }

  toggleAutoHideDock() {
    this.autoHideDock.update((v) => !v);
  }

  toggleSystemTips() {
    this.tipsEnabled.update((v) => !v);
  }

  toggleSystemSounds() {
    this.systemMuted.update((v) => !v);
  }

  private load<T>(key: string, defaultValue: T): T {
    const value = localStorage.getItem(key);
    if (value === null) return defaultValue;

    if (typeof defaultValue === 'boolean') return (value === 'true') as T;
    if (typeof defaultValue === 'number') return Number(value) as T;
    return value as T;
  }

  private save(key: string, value: any) {
    localStorage.setItem(key, value.toString());
  }
}
