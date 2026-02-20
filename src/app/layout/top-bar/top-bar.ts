import { Component, inject, OnInit, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { Theme } from '../../core/services/theme';
import { DatePipe, registerLocaleData } from '@angular/common';
import { ProcessManager } from '../../core/services/process-manager';
import { NotificationCenter } from '../notification-center/notification-center';
import { NotificationService } from '../../core/services/notification';
import localePtBr from '@angular/common/locales/pt';
import { LanguageService } from '../../core/services/language';

registerLocaleData(localePtBr, 'pt-BR');

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [DatePipe, NotificationCenter],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopBar implements OnInit {
  themeService = inject(Theme);
  languageService = inject(LanguageService);
  processManager = inject(ProcessManager);
  notfService = inject(NotificationService);
  onShutdown = output<boolean>();
  forceShow = signal(false);
  now = signal(new Date());

  ngOnInit() {
    setInterval(() => {
      this.now.set(new Date());
    }, 1000);
  }

  handlePowerOff() {
    this.onShutdown.emit(true);
  }
}
