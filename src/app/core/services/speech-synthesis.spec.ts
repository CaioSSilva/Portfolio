import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { SpeechSynthesisService } from './speech-synthesis';

describe('SpeechSynthesisService', () => {
  let service: SpeechSynthesisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpeechSynthesisService);
  });

  it('isSupported returns false when speechSynthesis is undefined', () => {
    const original = Object.getOwnPropertyDescriptor(window, 'speechSynthesis');
    Object.defineProperty(window, 'speechSynthesis', { value: undefined, configurable: true });
    expect(service.isSupported()).toBe(false);
    if (original) {
      Object.defineProperty(window, 'speechSynthesis', original);
    }
  });

  it('speak calls onEnd immediately when text is empty after stripping markdown', () => {
    let called = false;
    const mockSynth = { cancel: vi.fn(), speak: vi.fn() };
    Object.defineProperty(window, 'speechSynthesis', { value: mockSynth, configurable: true });
    service.speak('   ', () => {
      called = true;
    });
    expect(called).toBe(true);
  });

  it('cancel does not throw when speechSynthesis is undefined', () => {
    Object.defineProperty(window, 'speechSynthesis', { value: undefined, configurable: true });
    expect(() => service.cancel()).not.toThrow();
  });

  it('isSpeaking starts as false', () => {
    expect(service.isSpeaking()).toBe(false);
  });

  it('speak strips code blocks before sending to synthesis', () => {
    const mockSynth = {
      cancel: vi.fn(),
      speak: vi.fn(),
    };
    Object.defineProperty(window, 'speechSynthesis', { value: mockSynth, configurable: true });
    service.speak('```js\nconsole.log("hi")\n```', () => {});
    const spokenUtterance = (mockSynth.speak as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as
      | SpeechSynthesisUtterance
      | undefined;
    if (spokenUtterance) {
      expect(spokenUtterance.text).not.toContain('```');
    }
  });
});
