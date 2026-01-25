import { Component, inject } from '@angular/core';
import { Base } from '../../core/models/base';
import { Apps } from '../../core/services/apps';
import { LanguageService } from '../../core/services/language';
import { FileSystem } from '../../core/services/file-system';

@Component({
  selector: 'app-about-project',
  standalone: true,
  imports: [],
  templateUrl: './about-project.html',
  styleUrl: './about-project.scss',
})
export class AboutProject extends Base {
  apps = inject(Apps);
  lang = inject(LanguageService);
  fs = inject(FileSystem);

  aboutApps() {
    const installed = this.apps.appsRegistry;
    const aboutTexts = this.lang.t().aboutProj.apps;

    const displayOrder = [
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
      .map((item) => ({
        config: (installed as any)[item.id],
        info: (aboutTexts as any)[item.textKey],
      }))
      .filter((app) => app.config);
  }

  handleOpenApp(app: any) {
    this.apps.openApp(app);
  }

  downloadDocs() {}
}
