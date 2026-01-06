import { Component, inject } from '@angular/core';
import { Base } from '../../core/models/base';
import { Apps } from '../../core/services/apps';
import { LanguageService } from '../../core/services/language';

@Component({
  selector: 'app-about-me',
  standalone: true,
  imports: [],
  templateUrl: './about-me.html',
  styleUrl: './about-me.scss',
})
export class AboutMe extends Base {
  apps = inject(Apps);
  lang = inject(LanguageService);

  openFiles() {
    this.apps.openApp(this.apps.myApps().files);
  }

  openFirefox() {
    this.apps.openApp(this.apps.myApps().firefox);
  }

  openTerminal() {
    this.apps.openApp(this.apps.myApps().terminal);
  }

  openSettings() {
    this.apps.openApp(this.apps.myApps().settings);
  }

  openPhotos() {
    this.apps.openApp(this.apps.myApps().photos);
  }

  openMusic() {
    this.apps.openApp(this.apps.myApps().musics);
  }

  openDocs() {
    this.apps.openApp(this.apps.myApps().documents);
  }
}
