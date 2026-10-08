if (typeof window !== 'undefined' && window.HTMLMediaElement) {
  window.HTMLMediaElement.prototype.pause = () => {};
  window.HTMLMediaElement.prototype.play = async () => {};
  window.HTMLMediaElement.prototype.load = () => {};
}

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
}
