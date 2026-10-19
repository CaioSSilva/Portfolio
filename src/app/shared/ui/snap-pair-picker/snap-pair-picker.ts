import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
} from '@angular/core';
import { ProcessManager } from '../../../core/services/process-manager';
import { LanguageService } from '../../../core/services/language';

@Component({
  selector: 'app-snap-pair-picker',
  standalone: true,
  templateUrl: './snap-pair-picker.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class SnapPairPicker {
  readonly processManager = inject(ProcessManager);
  readonly lang = inject(LanguageService);

  @HostListener('window:keydown.escape')
  dismissOnEscape(): void {
    if (this.processManager.snapPairRequest()) {
      this.processManager.dismissSnapPairing();
    }
  }
}
