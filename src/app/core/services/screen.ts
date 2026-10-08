import { Injectable, NgZone, computed, inject, signal } from '@angular/core';

export const MOBILE_BREAKPOINT = 768;
export const TABLET_BREAKPOINT = 1024;

@Injectable({ providedIn: 'root' })
export class ScreenService {
  private readonly ngZone = inject(NgZone);

  readonly width = signal<number>(typeof window !== 'undefined' ? window.innerWidth : 1200);
  readonly height = signal<number>(typeof window !== 'undefined' ? window.innerHeight : 800);
  readonly isTouchDevice = signal<boolean>(
    typeof window !== 'undefined' &&
      ('ontouchstart' in window || (navigator?.maxTouchPoints ?? 0) > 0)
  );

  readonly isMobile = computed(() => this.width() < MOBILE_BREAKPOINT);
  readonly isTablet = computed(
    () => this.width() >= MOBILE_BREAKPOINT && this.width() < TABLET_BREAKPOINT
  );
  readonly isDesktop = computed(() => this.width() >= TABLET_BREAKPOINT);
  readonly isCompact = computed(() => this.width() < TABLET_BREAKPOINT);

  constructor() {
    if (typeof window !== 'undefined') {
      this.ngZone.runOutsideAngular(() => {
        window.addEventListener('resize', this.onResize);
      });
    }
  }

  private onResize = (): void => {
    this.ngZone.run(() => {
      this.width.set(window.innerWidth);
      this.height.set(window.innerHeight);
    });
  };
}
