import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { Base } from '../../core/models/base';
import { AppDefinition } from '../../core/models/dock';
import { Apps } from '../../core/services/apps';
import { LanguageService } from '../../core/services/language';
import { FileSystem } from '../../core/services/file-system';

@Component({
  selector: 'app-about-project',
  standalone: true,
  imports: [],
  templateUrl: './about-project.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './about-project.scss',
})
export class AboutProject extends Base {
  apps = inject(Apps);
  lang = inject(LanguageService);
  fs = inject(FileSystem);

  resumeName = computed(() => {
    const lang = this.lang;
    return lang.currentLang() === 'en' ? 'Resume' : 'Currículo';
  });

  aboutApps() {
    const installed = this.apps.appsRegistry();
    const aboutTexts = this.lang.t().aboutProj.apps;

    const displayOrder: Array<{ id: keyof typeof installed; textKey: keyof typeof aboutTexts }> = [
      { id: 'files', textKey: 'files' },
      { id: 'photos', textKey: 'photos' },
      { id: 'musics', textKey: 'music' },
      { id: 'documents', textKey: 'docs' },
      { id: 'firefox', textKey: 'browser' },
      { id: 'systemMonitor', textKey: 'sysMonitor' },
      { id: 'terminal', textKey: 'terminal' },
      { id: 'settings', textKey: 'settings' },
      { id: 'hermes', textKey: 'hermes' },
    ];

    return displayOrder
      .map((item) => {
        const config = installed[item.id];
        const info = aboutTexts[item.textKey];
        return { config, info };
      })
      .filter((app): app is { config: NonNullable<typeof app.config>; info: NonNullable<typeof app.info> } => Boolean(app.config));
  }

  handleOpenApp(app: AppDefinition): void {
    this.apps.openApp(app);
  }

  downloadResume() {
    const path = `${window.document.baseURI}data/root/home/documents/${this.resumeName()}.pdf`;
    this.fs.downloadFile(path, `Caio Souza Silva - ${this.resumeName()}`);
  }
}
