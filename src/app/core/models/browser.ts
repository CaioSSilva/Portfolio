import { SafeResourceUrl } from '@angular/platform-browser';

export type BrowserError = 'invalidUrl' | 'loadTimeout' | 'loadFailed';

export type BrowserNavigation =
  | { url: string; safeUrl: SafeResourceUrl; error: null }
  | { url: null; safeUrl: null; error: BrowserError };
