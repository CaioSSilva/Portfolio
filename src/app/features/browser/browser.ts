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
import type { SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Base } from '../../core/models/base';
import type { BrowserError } from '../../core/models/browser';
import { BrowserNavigationService } from '../../core/services/browser-navigation';
import { LanguageService } from '../../core/services/language';

@Component({
  selector: 'app-browser',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './browser.html',
})
export class Browser extends Base {
  private readonly destroyRef = inject(DestroyRef);
  private readonly browserNavigation = inject(BrowserNavigationService);
  readonly lang = inject(LanguageService);
  readonly displayUrl = signal('');
  readonly navigatedUrl = signal('');
  readonly safeUrl = signal<SafeResourceUrl | null>(null);

  readonly history = signal<string[]>([]);

  readonly isLoading = signal(false);
  readonly hasError = signal(false);
  readonly errorType = signal<BrowserError | null>(null);
  private navigationId = 0;

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
      this.clearNavigation();
      return;
    }
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
    this.navigationId += 1;
    this.isLoading.set(false);
    this.hasError.set(false);
    this.errorType.set(null);
  }

  onError(): void {
    this.navigationId += 1;
    this.isLoading.set(false);
    this.hasError.set(true);
    this.errorType.set('loadFailed');
  }

  reportLoadFailure(): void {
    this.onError();
  }

  private updateInternalState(url: string, addToHistory: boolean): void {
    const navigationId = ++this.navigationId;
    const navigation = this.browserNavigation.prepareUrl(url);
    if (navigation.error) {
      this.handleNavigationError(url, navigation.error);
      return;
    }

    this.setNavigationState(navigation.url, navigation.safeUrl, addToHistory);
    this.watchNavigationTimeout(navigationId);
  }

  private handleNavigationError(url: string, error: BrowserError): void {
    this.displayUrl.set(url);
    this.navigatedUrl.set('');
    this.safeUrl.set(null);
    this.isLoading.set(false);
    this.hasError.set(true);
    this.errorType.set(error);
  }

  private clearNavigation(): void {
    this.navigationId += 1;
    this.navigatedUrl.set('');
    this.safeUrl.set(null);
    this.hasError.set(false);
    this.errorType.set(null);
    this.isLoading.set(false);
  }

  private setNavigationState(
    url: string,
    safeUrl: SafeResourceUrl,
    addToHistory: boolean,
  ): void {
    this.hasError.set(false);
    this.errorType.set(null);
    this.isLoading.set(true);
    this.displayUrl.set(url);
    this.navigatedUrl.set(url);
    this.safeUrl.set(safeUrl);
    if (addToHistory) this.history.update((entries) => [...entries, url]);
  }

  private watchNavigationTimeout(navigationId: number): void {
    timer(6000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.handleNavigationTimeout(navigationId));
  }

  private handleNavigationTimeout(navigationId: number): void {
    if (navigationId !== this.navigationId || !this.isLoading()) return;
    this.isLoading.set(false);
    this.hasError.set(true);
    this.errorType.set('loadTimeout');
  }
}
