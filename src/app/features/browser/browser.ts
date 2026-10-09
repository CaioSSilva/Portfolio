import {
  Component,
  DestroyRef,
  inject,
  effect,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Base } from '../../core/models/base';
import { LanguageService } from '../../core/services/language';

@Component({
  selector: 'app-browser',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './browser.html',
})
export class Browser extends Base {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroyRef = inject(DestroyRef);
  readonly lang = inject(LanguageService);
  readonly displayUrl = signal('');
  readonly safeUrl = signal<SafeResourceUrl | null>(null);

  readonly history = signal<string[]>([]);

  readonly isLoading = signal(false);
  readonly hasError = signal(false);

  constructor() {
    super();
    effect(() => {
      const raw = this.data();
      const url = typeof raw === 'string' ? raw : raw?.url;
      if (url) this.updateInternalState(url, true);
    });
  }

  navigateToUrl(): void {
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

  goBack(): void {
    if (this.history().length <= 1) return;

    this.history.update((entries) => {
      const newHistory = [...entries];
      newHistory.pop();
      const previousUrl = newHistory[newHistory.length - 1];
      this.updateInternalState(previousUrl, false);
      return newHistory;
    });
  }

  onLoad(): void {
    this.isLoading.set(false);
    this.hasError.set(false);
  }

  private updateInternalState(url: string, addToHistory: boolean): void {
    this.hasError.set(false);
    this.isLoading.set(true);
    this.displayUrl.set(url);
    this.safeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));

    if (addToHistory) {
      this.history.update((entries) => [...entries, url]);
    }

    timer(6000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.isLoading()) {
          this.isLoading.set(false);
          this.hasError.set(true);
        }
      });
  }
}
