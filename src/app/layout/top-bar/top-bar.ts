import { Component, inject, OnInit, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { Theme } from '../../core/services/theme';
import { DatePipe, registerLocaleData } from '@angular/common';
import { ProcessManager } from '../../core/services/process-manager';
import { NotificationCenter } from '../notification-center/notification-center';
import { NotificationService } from '../../core/services/notification';
import { ScreenService } from '../../core/services/screen';
import localePtBr from '@angular/common/locales/pt';
import { LanguageService } from '../../core/services/language';
import { NowPlayingWidget } from '../now-playing-widget/now-playing-widget';

registerLocaleData(localePtBr, 'pt-BR');

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [DatePipe, NotificationCenter, NowPlayingWidget],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopBar implements OnInit {
  themeService = inject(Theme);
  languageService = inject(LanguageService);
  processManager = inject(ProcessManager);
  notfService = inject(NotificationService);
  screen = inject(ScreenService);
  lang = inject(LanguageService);
  onShutdown = output<boolean>();
  forceShow = signal(false);
  now = signal(new Date());
  pullOffset = signal(0);
  isPulling = signal(false);
  isReturning = signal(false);

  private touchStartY = 0;
  private isSwiping = false;

  onTouchStart(event: TouchEvent) {
    if (this.screen.isMobile() && event.touches.length > 0) {
      this.touchStartY = event.touches[0].clientY;
      this.isSwiping = true;
      this.isPulling.set(true);
      this.isReturning.set(false);
    }
  }

  onTouchMove(event: TouchEvent) {
    if (!this.isSwiping || !this.screen.isMobile() || event.touches.length === 0) return;
    const currentY = event.touches[0].clientY;
    const deltaY = currentY - this.touchStartY;
    if (deltaY > 0) {
      const pull = Math.min(deltaY * 0.75, 220);
      this.pullOffset.set(pull);
    }
  }

  onTouchEnd(event: TouchEvent) {
    if (!this.screen.isMobile() || !this.isSwiping) return;
    this.isSwiping = false;
    this.isPulling.set(false);
    this.isReturning.set(true);

    if (event.changedTouches.length > 0) {
      const touchEndY = event.changedTouches[0].clientY;
      const deltaY = touchEndY - this.touchStartY;
      if (deltaY > 30 || Math.abs(deltaY) < 10) {
        this.notfService.openPanel();
      }
    }
    this.pullOffset.set(0);
    setTimeout(() => this.isReturning.set(false), 350);
  }

  ngOnInit() {
    setInterval(() => {
      this.now.set(new Date());
    }, 1000);
  }

  handlePowerOff() {
    this.onShutdown.emit(true);
  }
}
