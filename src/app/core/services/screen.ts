import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';

export const MOBILE_BREAKPOINT = 768;
export const TABLET_BREAKPOINT = 1024;

const COARSE_POINTER_QUERY = '(pointer: coarse) and (hover: none)';

@Injectable({ providedIn: 'root' })
export class ScreenService {
  private readonly destroyRef = inject(DestroyRef);

  readonly width = signal<number>(typeof window !== 'undefined' ? window.innerWidth : 1200);
  readonly height = signal<number>(typeof window !== 'undefined' ? window.innerHeight : 800);
  readonly isMobile = computed(() => this.width() < MOBILE_BREAKPOINT);
  readonly isDesktop = computed(() => this.width() >= TABLET_BREAKPOINT);
  readonly hasCoarsePointer = signal<boolean>(
    typeof window !== 'undefined' ? window.matchMedia(COARSE_POINTER_QUERY).matches : false,
  );

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupResizeListener();
      this.setupPointerListener();
    }
  }

  private setupPointerListener(): void {
    const query = window.matchMedia(COARSE_POINTER_QUERY);
    const onChange = (event: MediaQueryListEvent): void => this.hasCoarsePointer.set(event.matches);
    query.addEventListener('change', onChange);
    this.destroyRef.onDestroy(() => query.removeEventListener('change', onChange));
  }

  private setupResizeListener(): void {
    window.addEventListener('resize', this.onResize);
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('resize', this.onResize);
    });
  }

  private onResize = (): void => {
    this.width.set(window.innerWidth);
    this.height.set(window.innerHeight);
  };
}
