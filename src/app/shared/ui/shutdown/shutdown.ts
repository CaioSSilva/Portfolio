import { Component, inject, output } from '@angular/core';
import { LanguageService } from '../../../core/services/language';
import { App } from '../../../app';

@Component({
  selector: 'app-shutdown',
  standalone: true,
  templateUrl: './shutdown.html',
})
export class Shutdown {
  lang = inject(LanguageService);
  shutdown = output<boolean>();

  cancelShutdown() {
    this.shutdown.emit(false);
  }

  restart() {
    window.location.reload();
  }

  onConfirmPowerOff() {
    window.close();
    setTimeout(() => {
      window.location.href = 'about:blank';
    }, 100);
  }
}
