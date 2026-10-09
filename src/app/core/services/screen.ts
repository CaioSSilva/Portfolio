import { DestroyRef, Injectable, NgZone, computed, inject, signal } from '@angular/core';

export const MOBILE_BREAKPOINT = 768;
export const TABLET_BREAKPOINT = 1024;

@Injectable({ providedIn: 'root' })
export class ScreenService {
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  readonly width = signal<number>(typeof window !== 'undefined' ? window.innerWidth : 1200);
  readonly height = signal<number>(typeof window !== 'undefined' ? window.innerHeight : 800);
  readonly isMobile = computed(() => this.width() < MOBILE_BREAKPOINT);
  readonly isDesktop = computed(() => this.width() >= TABLET_BREAKPOINT);

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupResizeListener();
    }
  }

  private setupResizeListener(): void {
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('resize', this.onResize);
    });
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('resize', this.onResize);
    });
  }

  private onResize = (): void => {
    this.width.set(window.innerWidth);
    this.height.set(window.innerHeight);
  };
}
