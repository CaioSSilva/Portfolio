import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MobileNavService } from '../../core/services/mobile-nav';
import { ProcessManager } from '../../core/services/process-manager';
import { LanguageService } from '../../core/services/language';

@Component({
  selector: 'app-mobile-nav-bar',
  standalone: true,
  imports: [],
  templateUrl: './mobile-nav-bar.html',
  styleUrl: './mobile-nav-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileNavBar {
  readonly nav = inject(MobileNavService);
  readonly processManager = inject(ProcessManager);
  readonly lang = inject(LanguageService);

  tap(action: () => void): void {
    action();
  }
}
