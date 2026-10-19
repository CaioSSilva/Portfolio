import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { TranslationSchema } from '../../core/language/i18n.types';
import { Base } from '../../core/models/base';
import { AppDefinition } from '../../core/models/dock';
import {
  APP_DISPLAY_ORDER,
  README_FILES,
  RESUME_FILES,
  RESUME_LABELS,
} from '../../core/models/about-project';
import { Apps } from '../../core/services/apps';
import { LanguageService } from '../../core/services/language';
import { FileSystem } from '../../core/services/file-system';
import { ProcessManager } from '../../core/services/process-manager';

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
  private readonly processManager = inject(ProcessManager);
  readonly fileSystem = inject(FileSystem);
  readonly lang = inject(LanguageService);

  readonly resumeName = computed(() => RESUME_LABELS[this.lang.currentLang()]);

  readonly readmeName = computed(() => README_FILES[this.lang.currentLang()].name);

  aboutApps(): AboutAppEntry[] {
    const installed = this.apps.appsRegistry();
    const aboutTexts = this.lang.t().aboutProj.apps;
    return this.buildDisplayOrder(installed, aboutTexts);
  }

  handleOpenApp(app: AppDefinition): void {
    this.apps.openApp(app);
  }

  openResume(): void {
    this.processManager.openFile(RESUME_FILES[this.lang.currentLang()]);
  }

  openReadme(): void {
    this.processManager.openFile(README_FILES[this.lang.currentLang()]);
  }

  private buildDisplayOrder(
    installed: ReturnType<typeof this.apps.appsRegistry>,
    aboutTexts: ReturnType<typeof this.lang.t>['aboutProj']['apps'],
  ): AboutAppEntry[] {
    return APP_DISPLAY_ORDER
      .map((item) => ({
        config: installed[item.id as keyof typeof installed],
        info: aboutTexts[item.textKey as keyof typeof aboutTexts],
      }))
      .filter(
        (
          app,
        ): app is { config: NonNullable<typeof app.config>; info: NonNullable<typeof app.info> } =>
          Boolean(app.config),
      );
  }
}
