import { Component, inject, effect, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Base } from '../../core/models/base';
import { LanguageService } from '../../core/services/language';

@Component({
  selector: 'app-browser',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './browser.html',
})
export class Browser extends Base {
  private sanitizer = inject(DomSanitizer);
  lang = inject(LanguageService);
  displayUrl = signal('');
  safeUrl = signal<SafeResourceUrl | null>(null);

  history = signal<string[]>([]);

  isLoading = signal(false);
  hasError = signal(false);

  constructor() {
    super();
    effect(() => {
      const url = this.data()?.url;
      if (url) this.updateInternalState(url, true);
    });
  }

  navigateToUrl() {
    let target = this.displayUrl().trim();
    if (!target) {
      this.safeUrl.set(null);
      this.hasError.set(false);
      this.isLoading.set(false);
      return;
    }
    if (!target.startsWith('http')) target = `https://${target}`;
    this.updateInternalState(target, true);
  }

  goBack() {
    if (this.history().length <= 1) return;

    this.history.update((h) => {
      const newHistory = [...h];
      newHistory.pop();
      const previousUrl = newHistory[newHistory.length - 1];
      this.updateInternalState(previousUrl, false);
      return newHistory;
    });
  }

  onLoad() {
    this.isLoading.set(false);
    this.hasError.set(false);
  }

  private updateInternalState(url: string, addToHistory: boolean) {
    this.hasError.set(false);
    this.isLoading.set(true);
    this.displayUrl.set(url);
    this.safeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));

    if (addToHistory) {
      this.history.update((h) => [...h, url]);
    }

    setTimeout(() => {
      if (this.isLoading()) {
        this.isLoading.set(false);
        this.hasError.set(true);
      }
    }, 6000);
  }
}
