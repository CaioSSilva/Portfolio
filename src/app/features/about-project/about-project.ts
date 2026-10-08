import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { Base } from '../../core/models/base';
import { AppDefinition } from '../../core/models/dock';
import { Apps } from '../../core/services/apps';
import { LanguageService } from '../../core/services/language';
import { FileSystem } from '../../core/services/file-system';
import { TranslationSchema } from '../../core/language/i18n.types';

type AboutAppEntry = {
  config: AppDefinition;
  info: TranslationSchema['aboutProj']['apps']['files'];
};

@Component({
  selector: 'app-about-project',
  standalone: true,
  imports: [],
  templateUrl: './about-project.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './about-project.scss',
})
export class AboutProject extends Base {
  private readonly apps = inject(Apps);
  private readonly fileSystem = inject(FileSystem);
  readonly lang = inject(LanguageService);

  readonly resumeName = computed(() => {
    const lang = this.lang;
    return lang.currentLang() === 'en' ? 'Resume' : 'Currículo';
  });

  aboutApps(): AboutAppEntry[] {
    const installed = this.apps.appsRegistry();
    const aboutTexts = this.lang.t().aboutProj.apps;
    return this.buildDisplayOrder(installed, aboutTexts);
  }

  private buildDisplayOrder(
    installed: ReturnType<typeof this.apps.appsRegistry>,
    aboutTexts: ReturnType<typeof this.lang.t>['aboutProj']['apps'],
  ): AboutAppEntry[] {
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
      .map((item) => ({ config: installed[item.id], info: aboutTexts[item.textKey] }))
      .filter(
        (
          app,
        ): app is { config: NonNullable<typeof app.config>; info: NonNullable<typeof app.info> } =>
          Boolean(app.config),
      );
  }

  handleOpenApp(app: AppDefinition): void {
    this.apps.openApp(app);
  }

  downloadResume(): void {
    const path = `${window.document.baseURI}data/root/home/documents/${this.resumeName()}.pdf`;
    this.fileSystem.downloadFile(path, `Caio Souza Silva - ${this.resumeName()}.pdf`);
  }
}
