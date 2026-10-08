import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { ScreenService } from './screen';

@Injectable({ providedIn: 'root' })
export class Settings {
  private readonly screen = inject(ScreenService);

  readonly dockSize = signal<number>(this.load('dockSize', 48));
  readonly desktopSize = signal<number>(this.load('desktopSize', 40));
  readonly systemMuted = signal<boolean>(this.load('soundMuted', false));
  readonly autoHideDock = signal<boolean>(this.load('autoHideDock', true));
  readonly tipsEnabled = signal<boolean>(this.load('tipsEnabled', true));
  readonly geminiModel = signal<string>(this.load('geminiModel', 'gemini-2.0-flash-lite'));

  private readonly desktopWallpaper = signal<string>(
    this.load('wallpaper', '/wallpapers/desktop/default.webp')
  );
  private readonly mobileWallpaper = signal<string>(
    this.load('mobileWallpaper', '/wallpapers/mobile/default.webp')
  );

  readonly wallpaper = computed(() =>
    this.screen.isMobile() ? this.mobileWallpaper() : this.desktopWallpaper()
  );

  constructor() {
    effect(() => {
      this.save('dockSize', this.dockSize());
      this.save('desktopSize', this.desktopSize());
      this.save('wallpaper', this.desktopWallpaper());
      this.save('mobileWallpaper', this.mobileWallpaper());
      this.save('autoHideDock', this.autoHideDock());
      this.save('soundMuted', this.systemMuted());
      this.save('tipsEnabled', this.tipsEnabled());
      this.save('geminiModel', this.geminiModel());
    });
  }

  setWallpaper(path: string) {
    if (this.screen.isMobile()) {
      this.mobileWallpaper.set(path);
    } else {
      this.desktopWallpaper.set(path);
    }
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

  setGeminiModel(model: string) {
    this.geminiModel.set(model);
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

  private save(key: string, value: string | number | boolean) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value.toString());
    }
  }
}
