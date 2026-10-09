import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { signal } from '@angular/core';
import { AgentModeService } from './agent-mode';
import { Settings } from './settings';
import { SpeechRecognitionService, SPEECH_RECOGNITION_FACTORY } from './speech-recognition';
import { WakeWordService } from './wake-word';
import { SpeechSynthesisService } from './speech-synthesis';
import { HermesChatService } from './hermes-chat';

describe('AgentModeService', () => {
  let service: AgentModeService;
  let settingsMock: Partial<Settings>;
  let recognitionMock: Partial<SpeechRecognitionService>;
  let synthesisMock: Partial<SpeechSynthesisService>;
  let chatMock: Partial<HermesChatService>;

  beforeEach(() => {
    settingsMock = {
      agentModeEnabled: signal(false),
      agentSpeakReplies: signal(false),
      toggleAgentMode: vi.fn(),
      disableAgentMode: vi.fn(),
    };

    recognitionMock = {
      isSupported: signal(true),
      isListening: signal(false),
      start: vi.fn(),
      stop: vi.fn(),
    };

    synthesisMock = {
      isSpeaking: signal(false),
      speak: vi.fn(),
      cancel: vi.fn(),
    };

    chatMock = {
      messages: signal([]),
      isLoading: signal(false),
      send: vi.fn().mockResolvedValue(undefined),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: SPEECH_RECOGNITION_FACTORY, useValue: null },
        { provide: Settings, useValue: settingsMock },
        { provide: SpeechRecognitionService, useValue: recognitionMock },
        { provide: SpeechSynthesisService, useValue: synthesisMock },
        { provide: HermesChatService, useValue: chatMock },
        { provide: WakeWordService, useClass: WakeWordService },
      ],
    });
    service = TestBed.inject(AgentModeService);
  });

  it('state starts at off', () => {
    expect(service.state()).toBe('off');
  });

  it('toggleAgentMode delegates to settings', () => {
    service.toggleAgentMode();
    expect(settingsMock.toggleAgentMode).toHaveBeenCalled();
  });

  it('isSupported reflects recognition.isSupported', () => {
    expect(service.isSupported()).toBe(true);
  });
});
