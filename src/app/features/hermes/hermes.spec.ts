import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Hermes } from './hermes';
import { Gemini, GENAI_FACTORY, GenAIFactory } from '../../core/services/gemini';
import { LanguageService } from '../../core/services/language';
import { NotificationService } from '../../core/services/notification';
import { HermesActionService } from '../../core/services/hermes-action';
import { Settings } from '../../core/services/settings';
import { Sound } from '../../core/services/sound';

describe('Hermes', () => {
  let component: Hermes;
  let fixture: ComponentFixture<Hermes>;
  let geminiSpy: {
    generateResponse: ReturnType<typeof vi.fn>;
    generateResponseStream: ReturnType<typeof vi.fn>;
    listModels: ReturnType<typeof vi.fn>;
  };
  let notificationSpy: { show: ReturnType<typeof vi.fn> };
  let actionServiceSpy: {
    parseActions: ReturnType<typeof vi.fn>;
    execute: ReturnType<typeof vi.fn>;
  };

  const makeFactory = (): GenAIFactory => (_apiKey: string) => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: { text: () => 'Mocked response' },
      }),
      generateContentStream: vi.fn().mockResolvedValue({
        stream: (async function* () {
          yield { text: () => 'Mocked stream' };
        })(),
      }),
    }),
  });

  let settingsSpy: { geminiModel: ReturnType<typeof vi.fn>; setGeminiModel: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    geminiSpy = {
      generateResponse: vi.fn().mockResolvedValue('Mock AI response'),
      generateResponseStream: vi.fn().mockImplementation(
        async (_p: string, _h: string, _f: unknown, onChunk: (t: string) => void) => {
          onChunk('Mock AI response');
          return 'Mock AI response';
        }
      ),
      listModels: vi.fn().mockResolvedValue([
        { name: 'gemini-2.0-flash-lite', displayName: 'Gemini 2.0 Flash Lite', description: 'Fast model' },
        { name: 'gemini-1.5-pro', displayName: 'Gemini 1.5 Pro', description: 'Pro model' },
      ]),
    };
    settingsSpy = {
      geminiModel: vi.fn().mockReturnValue('gemini-2.0-flash-lite'),
      setGeminiModel: vi.fn(),
    };
    notificationSpy = { show: vi.fn() };
    actionServiceSpy = {
      parseActions: vi.fn().mockReturnValue({
        cleanText: 'Mock AI response',
        actions: [],
      }),
      execute: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Hermes],
      providers: [
        LanguageService,
        { provide: Gemini, useValue: geminiSpy },
        { provide: GENAI_FACTORY, useValue: makeFactory() },
        { provide: NotificationService, useValue: notificationSpy },
        { provide: HermesActionService, useValue: actionServiceSpy },
        { provide: Settings, useValue: settingsSpy },
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Hermes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have empty messages on creation', () => {
    expect(component.messages()).toEqual([]);
    expect(component.isLoading()).toBe(false);
    expect(component.userInput()).toBe('');
  });

  it('should isButtonDisabled be true when input is empty', () => {
    component.userInput.set('');
    expect(component.isButtonDisabled()).toBe(true);
  });

  it('should isButtonDisabled be false when input has text', () => {
    component.userInput.set('Hello');
    expect(component.isButtonDisabled()).toBe(false);
  });

  it('should isButtonDisabled be true while loading', () => {
    component.userInput.set('Hello');
    component.isLoading.set(true);
    expect(component.isButtonDisabled()).toBe(true);
  });

  it('should isButtonDisabled be false when file is attached even with empty text', () => {
    component.userInput.set('');
    component.selectedFile.set({ mimeType: 'image/png', b64: 'abc' });
    expect(component.isButtonDisabled()).toBe(false);
  });

  it('should handleSendMessage add user message and call gemini generateResponseStream', async () => {
    component.userInput.set('Hello Hermes');
    await component.handleSendMessage();
    expect(component.messages().some((m) => m.role === 'user' && m.text === 'Hello Hermes')).toBe(true);
    expect(geminiSpy.generateResponseStream).toHaveBeenCalled();
    expect(component.messages().some((m) => m.role === 'model')).toBe(true);
  });

  it('should execute actions parsed from response', async () => {
    actionServiceSpy.parseActions.mockReturnValue({
      cleanText: 'Aberto!',
      actions: [{ type: 'open_app', payload: { app: 'terminal' } }],
    });

    component.userInput.set('Abra o terminal');
    await component.handleSendMessage();

    expect(actionServiceSpy.execute).toHaveBeenCalledWith({
      type: 'open_app',
      payload: { app: 'terminal' },
    });
  });

  it('should handleSendMessage clear input after sending', async () => {
    component.userInput.set('test');
    await component.handleSendMessage();
    expect(component.userInput()).toBe('');
  });

  it('should handleSendMessage do nothing when button is disabled', async () => {
    component.userInput.set('');
    await component.handleSendMessage();
    expect(geminiSpy.generateResponseStream).not.toHaveBeenCalled();
  });

  it('should show notification when gemini throws an error', async () => {
    geminiSpy.generateResponseStream.mockRejectedValue(new Error('API down'));
    component.userInput.set('Hello');
    await component.handleSendMessage();
    expect(notificationSpy.show).toHaveBeenCalled();
  });

  it('should clearAttachment reset selectedFile and previewUrl', () => {
    component.selectedFile.set({ mimeType: 'image/png', b64: 'abc' });
    component.previewUrl.set('data:image/png;base64,abc');
    component.clearAttachment();
    expect(component.selectedFile()).toBeNull();
    expect(component.previewUrl()).toBeNull();
  });

  it('should include history in generateResponseStream call for subsequent messages limited by MAX_HISTORY', async () => {
    component.messages.set([{ role: 'user', text: 'First message' }]);
    component.userInput.set('Follow up');
    await component.handleSendMessage();
    const callArgs = geminiSpy.generateResponseStream.mock.calls[0];
    expect(callArgs[1]).toContain('First message');
  });

  describe('model picker', () => {
    it('should start with modelPickerOpen false', () => {
      expect(component.modelPickerOpen()).toBe(false);
    });

    it('should toggleModelPicker open the picker and load models', async () => {
      await component.toggleModelPicker();
      expect(component.modelPickerOpen()).toBe(true);
      expect(geminiSpy.listModels).toHaveBeenCalledTimes(1);
      expect(component.geminiModels().length).toBe(2);
    });

    it('should toggleModelPicker close the picker when already open', async () => {
      await component.toggleModelPicker();
      expect(component.modelPickerOpen()).toBe(true);
      await component.toggleModelPicker();
      expect(component.modelPickerOpen()).toBe(false);
    });

    it('should not call listModels again if models already loaded', async () => {
      await component.toggleModelPicker();
      await component.toggleModelPicker(); // close
      await component.toggleModelPicker(); // reopen
      expect(geminiSpy.listModels).toHaveBeenCalledTimes(1);
    });

    it('should set modelsError when listModels throws', async () => {
      geminiSpy.listModels.mockRejectedValue(new Error('API error'));
      await component.loadModels();
      expect(component.modelsError()).toBe(true);
      expect(component.modelsLoading()).toBe(false);
    });

    it('should reset modelsError on retry via loadModels', async () => {
      geminiSpy.listModels.mockRejectedValueOnce(new Error('fail'));
      await component.loadModels();
      expect(component.modelsError()).toBe(true);

      geminiSpy.listModels.mockResolvedValue([
        { name: 'gemini-2.0-flash-lite', displayName: 'Gemini 2.0 Flash Lite', description: '' },
      ]);
      await component.loadModels();
      expect(component.modelsError()).toBe(false);
      expect(component.geminiModels().length).toBe(1);
    });
  });
});
