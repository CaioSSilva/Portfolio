import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Settings {
  readonly dockSize = signal<number>(Number(localStorage.getItem('dockSize')) || 48);
  readonly wallpaper = signal<string>(
    localStorage.getItem('wallpaper') || '/wallpapers/default.webp'
  );
  readonly systemMuted = signal<boolean>(localStorage.getItem('soundMuted') === 'true');
  readonly autoHideDock = signal<boolean>(localStorage.getItem('autoHideDock') !== 'false');
  readonly tipsEnabled = signal<boolean>(localStorage.getItem('tipsEnabled') !== 'false');

  constructor() {
    effect(() => {
      localStorage.setItem('wallpaper', this.wallpaper());
      localStorage.setItem('autoHideDock', this.autoHideDock().toString());
      localStorage.setItem('soundMuted', this.systemMuted().toString());
      localStorage.setItem('tipsEnabled', this.tipsEnabled().toString());
    });
  }

  setWallpaper(path: string) {
    this.wallpaper.set(path);
  }

  toggleAutoHideDock() {
    this.autoHideDock.update((v) => !v);
  }

  toggleSystemTips() {
    this.tipsEnabled.update((t) => !t);
  }

  setDockSize(size: number) {
    this.dockSize.set(size);
    localStorage.setItem('dockSize', size.toString());
  }

  toggleSystemSounds() {
    this.systemMuted.update((v) => !v);
  }
}
