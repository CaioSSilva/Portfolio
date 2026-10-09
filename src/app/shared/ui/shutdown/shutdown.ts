import { Component, DestroyRef, inject, output, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { LanguageService } from '../../../core/services/language';

@Component({
  selector: 'app-shutdown',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './shutdown.html',
})
export class Shutdown {
  private readonly destroyRef = inject(DestroyRef);
  readonly lang = inject(LanguageService);
  readonly shutdown = output<boolean>();

  cancelShutdown(): void {
    this.shutdown.emit(false);
  }

  restart(): void {
    window.location.reload();
  }

  onConfirmPowerOff(): void {
    window.close();
    timer(100)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        window.location.href = 'about:blank';
      });
  }
}
