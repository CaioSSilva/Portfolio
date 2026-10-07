import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Hermes } from './hermes';
import { Gemini, GENAI_FACTORY, GenAIFactory } from '../../core/services/gemini';
import { LanguageService } from '../../core/services/language';
import { NotificationService } from '../../core/services/notification';
import { Sound } from '../../core/services/sound';

describe('Hermes', () => {
  let component: Hermes;
  let fixture: ComponentFixture<Hermes>;
  let geminiSpy: { generateResponse: ReturnType<typeof vi.fn> };
  let notificationSpy: { show: ReturnType<typeof vi.fn> };

  const makeFactory = (): GenAIFactory => (_apiKey: string) => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: { text: () => 'Mocked response' },
      }),
    }),
  });

  beforeEach(async () => {
    geminiSpy = { generateResponse: vi.fn().mockResolvedValue('Mock AI response') };
    notificationSpy = { show: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Hermes],
      providers: [
        LanguageService,
        { provide: Gemini, useValue: geminiSpy },
        { provide: GENAI_FACTORY, useValue: makeFactory() },
        { provide: NotificationService, useValue: notificationSpy },
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

  it('should handleSendMessage add user message and call gemini', async () => {
    component.userInput.set('Hello Hermes');
    await component.handleSendMessage();
    expect(component.messages().some(m => m.role === 'user' && m.text === 'Hello Hermes')).toBe(true);
    expect(geminiSpy.generateResponse).toHaveBeenCalled();
    expect(component.messages().some(m => m.role === 'model')).toBe(true);
  });

  it('should handleSendMessage clear input after sending', async () => {
    component.userInput.set('test');
    await component.handleSendMessage();
    expect(component.userInput()).toBe('');
  });

  it('should handleSendMessage do nothing when button is disabled', async () => {
    component.userInput.set('');
    await component.handleSendMessage();
    expect(geminiSpy.generateResponse).not.toHaveBeenCalled();
  });

  it('should show notification when gemini throws an error', async () => {
    geminiSpy.generateResponse.mockRejectedValue(new Error('API down'));
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

  it('should include history in generateResponse call for subsequent messages', async () => {
    component.messages.set([{ role: 'user', text: 'First message' }]);
    component.userInput.set('Follow up');
    await component.handleSendMessage();
    const callArgs = geminiSpy.generateResponse.mock.calls[0];
    expect(callArgs[1]).toContain('First message');
  });
});
