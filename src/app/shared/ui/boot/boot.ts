import { Component, inject, OnInit, output, signal } from '@angular/core';
import { Sound } from '../../../core/services/sound';
import { LanguageService } from '../../../core/services/language';

@Component({
  selector: 'app-boot',
  standalone: true,
  templateUrl: './boot.html',
})
export class Boot implements OnInit {
  bootFinished = output<boolean>();
  translate = inject(LanguageService);
  sound = inject(Sound);

  isExiting = signal(false);
  progress = signal(0);
  waitingClick = signal(false);
  isMobile = signal(false);

  ngOnInit() {
    this.detectDevice();
  }

  private detectDevice() {
    const isSmallScreen = window.innerWidth < 1024;
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );

    if (isSmallScreen || isMobileUA) {
      this.isMobile.set(true);
    } else {
      this.simulateLoading();
    }
  }

  redirectToMobile() {
    window.location.href = 'https://portfolio-old-psi.vercel.app/';
  }

  private simulateLoading() {
    const interval = setInterval(() => {
      const next = this.progress() + Math.floor(Math.random() * 15) + 5;
      if (next >= 100) {
        this.progress.set(100);
        clearInterval(interval);
        this.waitingClick.set(true);
      } else {
        this.progress.set(next);
      }
    }, 400);
  }

  startSystem() {
    if (!this.waitingClick() || this.isExiting() || this.isMobile()) return;

    this.sound.play('startup');
    this.waitingClick.set(false);
    setTimeout(() => {
      this.isExiting.set(true);
      setTimeout(() => this.bootFinished.emit(true), 300);
    }, 1000);
  }
}
