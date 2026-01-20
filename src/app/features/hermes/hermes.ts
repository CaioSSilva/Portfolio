import { Component, inject } from '@angular/core';
import { LanguageService } from '../../core/services/language';
import { Base } from '../../core/models/base';
import { NotificationService } from '../../core/services/notification';

@Component({
  selector: 'app-hermes',
  imports: [],
  templateUrl: './hermes.html',
  styleUrl: './hermes.scss',
})
export class Hermes extends Base {
  lang = inject(LanguageService);
  not = inject(NotificationService);

  showNotWorking() {
    this.not.show({
      title: this.lang.t().errors.systemError,
      message: this.lang.t().errors.seviceUnavailable,
      icon: 'fas fa-circle-exclamation',
    });
  }
}
