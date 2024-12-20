import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: false
})
export class AppComponent {
  title = 'Caio Souza Silva - Portfolio';

  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang('en');
    this.translate.use(<string>this.translate.getBrowserLang());
  }

  changeLang(lang: string) {
    this.translate.use(lang);
  }
}
