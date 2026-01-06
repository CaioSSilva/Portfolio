import { Component, inject, OnInit, signal } from '@angular/core';
import { DockService } from '../../core/services/dock';
import { CommonModule } from '@angular/common';
import { Apps } from '../../core/services/apps';
import { ProcessManager } from '../../core/services/process-manager';
import { Settings } from '../../core/services/settings';
import { LanguageService } from '../../core/services/language';

@Component({
  selector: 'app-dock',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dock.html',
  styleUrl: './dock.scss',
})
export class Dock implements OnInit {
  dock = inject(DockService);
  apps = inject(Apps);
  processManager = inject(ProcessManager);
  lang = inject(LanguageService);
  settings = inject(Settings);
  forceShow = signal(false);

  ngOnInit(): void {
    setTimeout(() => {
      this.apps.openApp(this.apps.myApps().about);
    }, 1000);
  }

  getAppLabel(appId: string, defaultTitle: string): string {
    const langData = this.lang.t();
    return langData.apps[appId as keyof typeof langData.apps] || defaultTitle;
  }
}
