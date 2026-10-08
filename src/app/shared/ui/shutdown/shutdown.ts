import { Component, inject, output, ChangeDetectionStrategy } from '@angular/core';
import { LanguageService } from '../../../core/services/language';
import { App } from '../../../app';

@Component({
  selector: 'app-shutdown',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './shutdown.html',
})
export class Shutdown {
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
    setTimeout(() => {
      window.location.href = 'about:blank';
    }, 100);
  }
}
