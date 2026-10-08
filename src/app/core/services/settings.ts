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
  readonly geminiModel = signal<string>(
    this.migrateModel(this.load('geminiModel', 'gemini-flash-lite-latest')),
  );

  private readonly desktopWallpaper = signal<string>(
    this.load('wallpaper', '/wallpapers/desktop/default.webp'),
  );
  private readonly mobileWallpaper = signal<string>(
    this.load('mobileWallpaper', '/wallpapers/mobile/default.webp'),
  );

  readonly wallpaper = computed(() =>
    this.screen.isMobile() ? this.mobileWallpaper() : this.desktopWallpaper(),
  );

  constructor() {
    effect(() => this.save('dockSize', this.dockSize()));
    effect(() => this.save('desktopSize', this.desktopSize()));
    effect(() => this.save('wallpaper', this.desktopWallpaper()));
    effect(() => this.save('mobileWallpaper', this.mobileWallpaper()));
    effect(() => this.save('autoHideDock', this.autoHideDock()));
    effect(() => this.save('soundMuted', this.systemMuted()));
    effect(() => this.save('tipsEnabled', this.tipsEnabled()));
    effect(() => this.save('geminiModel', this.geminiModel()));
  }

  setWallpaper(path: string): void {
    if (this.screen.isMobile()) {
      this.mobileWallpaper.set(path);
    } else {
      this.desktopWallpaper.set(path);
    }
  }

  setDockSize(size: number): void {
    this.dockSize.set(size);
  }

  setDesktopSize(size: number): void {
    this.desktopSize.set(size);
  }

  toggleAutoHideDock(): void {
    this.autoHideDock.update((value) => !value);
  }

  setGeminiModel(model: string): void {
    this.geminiModel.set(model);
  }

  toggleSystemTips(): void {
    this.tipsEnabled.update((value) => !value);
  }

  toggleSystemSounds(): void {
    this.systemMuted.update((value) => !value);
  }

  private migrateModel(model: string): string {
    const deprecated: Record<string, string> = {
      'gemini-2.5-flash': 'gemini-flash-lite-latest',
      'gemini-2.0-flash-lite': 'gemini-flash-lite-latest',
      'gemini-2.0-flash-lite-latest': 'gemini-flash-lite-latest',
      'gemini-2.0-flash': 'gemini-flash-lite-latest',
    };
    return deprecated[model] ?? model;
  }

  private load<T>(key: string, defaultValue: T): T {
    try {
      const value = localStorage.getItem(key);
      if (value === null) return defaultValue;

      if (typeof defaultValue === 'boolean') return (value === 'true') as T;
      if (typeof defaultValue === 'number') return Number(value) as T;
      return value as T;
    } catch {
      return defaultValue;
    }
  }

  private save(key: string, value: string | number | boolean): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value.toString());
    }
  }
}
