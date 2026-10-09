import {
  Component,
  DestroyRef,
  inject,
  output,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, switchMap, takeWhile, tap, timer } from 'rxjs';
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
    interval(300)
      .pipe(
        takeWhile(() => !this.waitingClick()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        const next = this.progress() + Math.floor(Math.random() * 15) + 5;
        if (next >= 100) {
          this.progress.set(100);
          this.waitingClick.set(true);
        } else {
          this.progress.set(next);
        }
      });
  }

  startSystem(): void {
    if (!this.waitingClick() || this.isExiting()) return;

    this.sound.play('startup');
    this.waitingClick.set(false);
    timer(1000)
      .pipe(
        tap(() => this.isExiting.set(true)),
        switchMap(() => timer(300)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.bootFinished.emit(true));
  }
}
