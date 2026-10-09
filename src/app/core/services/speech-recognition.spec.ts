import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import {
  SpeechRecognitionService,
  SPEECH_RECOGNITION_FACTORY,
  SPEECH_RECOGNITION_UNSUPPORTED_REASON,
} from './speech-recognition';
import { SpeechRecognitionLike, SpeechRecognitionEventLike } from '../models/agent-mode';

function buildMockRecognition(): SpeechRecognitionLike {
  return {
    continuous: false,
    interimResults: false,
    lang: '',
    maxAlternatives: 1,
    onresult: null,
    onerror: null,
    onend: null,
    onstart: null,
    start: vi.fn(),
    stop: vi.fn(),
    abort: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn().mockReturnValue(false),
  };
}

describe('SpeechRecognitionService', () => {
  let service: SpeechRecognitionService;
  let mockRecognition: SpeechRecognitionLike;

  beforeEach(() => {
    mockRecognition = buildMockRecognition();
    TestBed.configureTestingModule({
      providers: [
        { provide: SPEECH_RECOGNITION_FACTORY, useValue: () => mockRecognition },
        { provide: SPEECH_RECOGNITION_UNSUPPORTED_REASON, useValue: null },
      ],
    });
    service = TestBed.inject(SpeechRecognitionService);
  });

  it('isSupported is true when factory is provided', () => {
    expect(service.isSupported()).toBe(true);
  });

  it('isListening starts as false', () => {
    expect(service.isListening()).toBe(false);
  });

  it('start calls recognition.start', () => {
    service.start(() => {}, () => {});
    expect(mockRecognition.start).toHaveBeenCalled();
  });

  it('stop calls recognition.abort', () => {
    service.start(() => {}, () => {});
    service.stop();
    expect(mockRecognition.abort).toHaveBeenCalled();
  });

  it('onstart handler sets isListening to true', () => {
    service.start(() => {}, () => {});
    mockRecognition.onstart?.();
    expect(service.isListening()).toBe(true);
  });

  it('handleResult fires onTranscript callback with transcript text', () => {
    const transcripts: string[] = [];
    service.start((text) => transcripts.push(text), () => {});
    const alt = { transcript: 'hello hermes', confidence: 0.9 };
    const resultItem = { isFinal: true, length: 1, item: () => alt, 0: alt };
    const resultList = { length: 1, item: () => resultItem, 0: resultItem };
    const baseEvent = new Event('result');
    Object.assign(baseEvent, { resultIndex: 0, results: resultList });
    mockRecognition.onresult?.(baseEvent as SpeechRecognitionEventLike);
    expect(transcripts).toContain('hello hermes');
  });

  it('isSupported is false when factory returns null', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: SPEECH_RECOGNITION_FACTORY, useValue: null },
        { provide: SPEECH_RECOGNITION_UNSUPPORTED_REASON, useValue: 'browser' },
      ],
    });
    const svc = TestBed.inject(SpeechRecognitionService);
    expect(svc.isSupported()).toBe(false);
    expect(svc.unsupportedReason()).toBe('browser');
  });

  it('unsupportedReason is null when supported', () => {
    expect(service.unsupportedReason()).toBe(null);
  });

  it('unsupportedReason is mobile when provided as mobile', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: SPEECH_RECOGNITION_FACTORY, useValue: null },
        { provide: SPEECH_RECOGNITION_UNSUPPORTED_REASON, useValue: 'mobile' },
      ],
    });
    const svc = TestBed.inject(SpeechRecognitionService);
    expect(svc.isSupported()).toBe(false);
    expect(svc.isSecureContext()).toBe(true);
    expect(svc.unsupportedReason()).toBe('mobile');
  });

  it('isSecureContext is false when reason is insecure-context', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: SPEECH_RECOGNITION_FACTORY, useValue: null },
        { provide: SPEECH_RECOGNITION_UNSUPPORTED_REASON, useValue: 'insecure-context' },
      ],
    });
    const svc = TestBed.inject(SpeechRecognitionService);
    expect(svc.isSecureContext()).toBe(false);
    expect(svc.unsupportedReason()).toBe('insecure-context');
  });
});

describe('SpeechRecognitionService — mobile detection via token factory', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, 'matchMedia', { value: originalMatchMedia, writable: true });
  });

  function mockMatchMedia(coarse: boolean, fine: boolean): void {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches:
          (query === '(pointer: coarse)' && coarse) ||
          (query === '(pointer: fine)' && fine),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    });
  }

  function resolveReason(): string | null {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    return TestBed.inject(SPEECH_RECOGNITION_UNSUPPORTED_REASON);
  }

  it('desktop with mouse only (fine, no coarse) — not mobile', () => {
    mockMatchMedia(false, true);
    expect(resolveReason()).not.toBe('mobile');
  });

  it('desktop touchscreen with mouse (coarse + fine) — not mobile', () => {
    mockMatchMedia(true, true);
    expect(resolveReason()).not.toBe('mobile');
  });

  it('touch-only device (coarse, no fine, no UA) — mobile', () => {
    mockMatchMedia(true, false);
    expect(resolveReason()).toBe('mobile');
  });

  it('Android UA — mobile regardless of pointer media', () => {
    mockMatchMedia(false, true);
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120',
    );
    expect(resolveReason()).toBe('mobile');
  });
});
