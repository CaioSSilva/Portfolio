import {
  Component,
  DestroyRef,
  inject,
  output,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Sound } from '../../../core/services/sound';
import { LanguageService } from '../../../core/services/language';
import { APP_VERSION } from '../../../core/version';

@Component({
  selector: 'app-boot',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './boot.html',
})
export class Boot {
  private readonly sound = inject(Sound);
  private readonly destroyRef = inject(DestroyRef);
  readonly lang = inject(LanguageService);

  readonly isExiting = signal(false);
  readonly progress = signal(0);
  readonly waitingClick = signal(false);

  readonly bootFinished = output<boolean>();

  readonly version = APP_VERSION;

  constructor() {
    this.simulateLoading();
  }

  private simulateLoading(): void {
    const interval = setInterval(() => {
      const next = this.progress() + Math.floor(Math.random() * 15) + 5;
      if (next >= 100) {
        this.progress.set(100);
        clearInterval(interval);
        this.waitingClick.set(true);
      } else {
        this.progress.set(next);
      }
    }, 300);
    this.destroyRef.onDestroy(() => clearInterval(interval));
  }

  startSystem(): void {
    if (!this.waitingClick() || this.isExiting()) return;

    this.sound.play('startup');
    this.waitingClick.set(false);
    setTimeout(() => {
      this.isExiting.set(true);
      setTimeout(() => this.bootFinished.emit(true), 300);
    }, 1000);
  }
}
