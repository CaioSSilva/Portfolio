import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { SpeechRecognitionService, SPEECH_RECOGNITION_FACTORY } from './speech-recognition';
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
        {
          provide: SPEECH_RECOGNITION_FACTORY,
          useValue: () => mockRecognition,
        },
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
      providers: [{ provide: SPEECH_RECOGNITION_FACTORY, useValue: null }],
    });
    const svc = TestBed.inject(SpeechRecognitionService);
    expect(svc.isSupported()).toBe(false);
  });
});
