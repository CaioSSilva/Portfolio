import { inject, Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import type { BrowserNavigation } from '../models/browser';

@Injectable({ providedIn: 'root' })
export class BrowserNavigationService {
  private readonly sanitizer = inject(DomSanitizer);

  prepareUrl(value: string): BrowserNavigation {
    const input = value.trim();
    if (/^[a-z][a-z\d+.-]*:\/\//i.test(input) && !/^https?:\/\//i.test(input)) {
      return { url: null, safeUrl: null, error: 'invalidUrl' };
    }
    const target = /^https?:\/\//i.test(input) ? input : `https://${input}`;
    try {
      const parsed = new URL(target);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return { url: null, safeUrl: null, error: 'invalidUrl' };
      }
      return {
        url: target,
        safeUrl: this.sanitizer.bypassSecurityTrustResourceUrl(target),
        error: null,
      };
    } catch {
      return { url: null, safeUrl: null, error: 'invalidUrl' };
    }
  }
}
