// Polyfills/Mocks for node/jsdom test runner
// HTMLMediaElement methods mock for jsdom test environment
if (typeof window !== 'undefined' && window.HTMLMediaElement) {
  window.HTMLMediaElement.prototype.pause = () => {};
  window.HTMLMediaElement.prototype.play = async () => {};
  window.HTMLMediaElement.prototype.load = () => {};
}

// pdfjs-dist / ng2-pdf-viewer verbosity polyfill
import * as PDFJS from 'pdfjs-dist';

try {
  if (PDFJS && typeof PDFJS === 'object') {
    Object.defineProperty(PDFJS, 'verbosity', {
      value: 0,
      writable: true,
      configurable: true,
    });
  }
} catch {
  // Ignore in case PDFJS is sealed
}
