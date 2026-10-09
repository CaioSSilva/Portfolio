import { Injectable, inject } from '@angular/core';
import { ScreenService } from './screen';
import { SystemInfo } from '../models/setting';

export type { SystemInfo };

@Injectable({ providedIn: 'root' })
export class SystemInfoService {
  private readonly screen = inject(ScreenService);

  readonly info: SystemInfo = {
    os: 'Cai_OS 2.0.1 (Gnome-like Web Desktop)',
    kernel: 'Linux 6.8.0-generic (WebAssembly Runtime)',
    arch: typeof navigator !== 'undefined' ? navigator.platform : 'x86_64',
    cpu:
      typeof navigator !== 'undefined' && navigator.hardwareConcurrency
        ? navigator.hardwareConcurrency
        : '—',
    ram:
      typeof navigator !== 'undefined' && 'deviceMemory' in navigator
        ? `${(navigator as Navigator & { deviceMemory?: number }).deviceMemory} GB`
        : '—',
    resolution:
      typeof window !== 'undefined' && window.screen
        ? `${window.screen.width} × ${window.screen.height}`
        : '—',
    language: typeof navigator !== 'undefined' ? navigator.language : 'pt-BR',
    browser:
      typeof navigator !== 'undefined'
        ? navigator.userAgent.split(' ').pop() || 'Modern Browser'
        : '—',
  };
}
