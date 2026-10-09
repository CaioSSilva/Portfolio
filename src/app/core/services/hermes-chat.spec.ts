import { TestBed } from '@angular/core/testing';
import { HermesChatService } from './hermes-chat';
import { Gemini } from './gemini';
import { HermesActionService } from './hermes-action';
import { NotificationService } from './notification';
import { LanguageService } from './language';
import { Message } from '../models/hermes';
import { ParseActionResult } from '../models/hermes-action';

describe('HermesChatService', () => {
  let service: HermesChatService;
  let geminiSpy: Pick<Gemini, 'generateResponseStream'>;
  let actionServiceSpy: Pick<HermesActionService, 'parseActions' | 'execute'>;
  let notificationsSpy: Pick<NotificationService, 'show'>;
  let langService: LanguageService;

  const makeParseResult = (
    cleanText: string,
    actions: ParseActionResult['actions'] = [],
  ): ParseActionResult => ({
    cleanText,
    actions,
  });

  beforeEach(() => {
    geminiSpy = {
      generateResponseStream: vi.fn().mockResolvedValue('Response text'),
    };
    actionServiceSpy = {
      parseActions: vi
        .fn()
        .mockImplementation((text: string): ParseActionResult => makeParseResult(text)),
      execute: vi.fn(),
    };
    notificationsSpy = { show: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        HermesChatService,
        LanguageService,
        { provide: Gemini, useValue: geminiSpy },
        { provide: HermesActionService, useValue: actionServiceSpy },
        { provide: NotificationService, useValue: notificationsSpy },
      ],
    });

    service = TestBed.inject(HermesChatService);
    langService = TestBed.inject(LanguageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('messages should start empty', () => {
      expect(service.messages()).toEqual([]);
    });

    it('isLoading should start false', () => {
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('clearMessages()', () => {
    it('should clear all messages', () => {
      service.messages.set([{ role: 'user', text: 'hello' }]);
      service.clearMessages();
      expect(service.messages()).toEqual([]);
    });
  });

  describe('send()', () => {
    it('should append user message before calling gemini', async () => {
      (geminiSpy.generateResponseStream as ReturnType<typeof vi.fn>).mockResolvedValue('reply');

      await service.send('Hello', null, null);

      const msgs = service.messages();
      const userMsg = msgs.find((m) => m.role === 'user');
      expect(userMsg).toBeDefined();
      expect(userMsg?.text).toBe('Hello');
    });

    it('should append model message after gemini resolves', async () => {
      (actionServiceSpy.parseActions as ReturnType<typeof vi.fn>).mockReturnValue(
        makeParseResult('Reply from Hermes'),
      );
      (geminiSpy.generateResponseStream as ReturnType<typeof vi.fn>).mockResolvedValue(
        'Reply from Hermes',
      );

      await service.send('Hi', null, null);

      const msgs = service.messages();
      const modelMsg = msgs.find((m) => m.role === 'model');
      expect(modelMsg?.text).toBe('Reply from Hermes');
    });

    it('should set image on user message when previewUrl is provided', async () => {
      await service.send('Describe this', null, 'data:image/png;base64,abc');

      const userMsg = service.messages().find((m) => m.role === 'user');
      expect(userMsg?.image).toBe('data:image/png;base64,abc');
    });

    it('should set isLoading to false after send resolves', async () => {
      await service.send('Test', null, null);
      expect(service.isLoading()).toBe(false);
    });

    it('should execute parsed actions from gemini response', async () => {
      const mockAction = { type: 'toggle_theme' as const, payload: undefined };
      (actionServiceSpy.parseActions as ReturnType<typeof vi.fn>).mockReturnValue(
        makeParseResult('toggle', [mockAction]),
      );
      (geminiSpy.generateResponseStream as ReturnType<typeof vi.fn>).mockResolvedValue('toggle');

      await service.send('Change theme', null, null);

      expect(actionServiceSpy.execute).toHaveBeenCalledWith(mockAction);
    });

    it('should pass fileData to gemini when provided', async () => {
      const fileData = { mimeType: 'image/png', b64: 'base64data' };
      await service.send('Describe', fileData, null);

      expect(geminiSpy.generateResponseStream).toHaveBeenCalledWith(
        'Describe',
        expect.any(String),
        fileData,
        expect.any(Function),
      );
    });

    describe('error handling', () => {
      it('should remove model placeholder on error and show notification', async () => {
        (geminiSpy.generateResponseStream as ReturnType<typeof vi.fn>).mockRejectedValue(
          new Error('Network error'),
        );

        await service.send('Fail', null, null);

        const modelMessages = service.messages().filter((m) => m.role === 'model');
        expect(modelMessages).toHaveLength(0);
        expect(notificationsSpy.show).toHaveBeenCalledTimes(1);
      });

      it('should show model-unavailable notification on 404 error', async () => {
        (geminiSpy.generateResponseStream as ReturnType<typeof vi.fn>).mockRejectedValue(
          new Error('404 NOT_FOUND: model unavailable'),
        );

        await service.send('Fail', null, null);

        expect(notificationsSpy.show).toHaveBeenCalledWith(
          expect.objectContaining({ icon: 'fas fa-robot' }),
        );
      });

      it('should show model-unavailable notification on 429 RESOURCE_EXHAUSTED error', async () => {
        (geminiSpy.generateResponseStream as ReturnType<typeof vi.fn>).mockRejectedValue(
          new Error('429 RESOURCE_EXHAUSTED'),
        );

        await service.send('Fail', null, null);

        expect(notificationsSpy.show).toHaveBeenCalledWith(
          expect.objectContaining({ icon: 'fas fa-robot' }),
        );
      });

      it('should show service-unavailable notification on generic error', async () => {
        (geminiSpy.generateResponseStream as ReturnType<typeof vi.fn>).mockRejectedValue(
          new Error('Network timeout'),
        );

        await service.send('Fail', null, null);

        expect(notificationsSpy.show).toHaveBeenCalledWith(
          expect.objectContaining({ icon: 'fas fa-circle-exclamation' }),
        );
      });

      it('should set isLoading to false even on error', async () => {
        (geminiSpy.generateResponseStream as ReturnType<typeof vi.fn>).mockRejectedValue(
          new Error('fail'),
        );

        await service.send('Fail', null, null);

        expect(service.isLoading()).toBe(false);
      });
    });

    describe('history building', () => {
      it('should pass history string to gemini based on previous messages', async () => {
        service.messages.set([
          { role: 'user', text: 'First question' },
          { role: 'model', text: 'First answer' },
        ]);

        await service.send('Second question', null, null);

        const [, historyArg] = (geminiSpy.generateResponseStream as ReturnType<typeof vi.fn>).mock
          .calls[0] as [string, string, ...string[]];
        expect(historyArg).toContain('First question');
        expect(historyArg).toContain('First answer');
      });

      it('should pass empty history string when no previous messages', async () => {
        await service.send('Hello', null, null);

        const [, historyArg] = (geminiSpy.generateResponseStream as ReturnType<typeof vi.fn>).mock
          .calls[0] as [string, string, ...string[]];
        expect(historyArg).toBe('');
      });
    });
  });

  describe('notifyAgentReply()', () => {
    it('shows a notification with the reply text', () => {
      service.notifyAgentReply('Hello from Hermes');
      expect(notificationsSpy.show).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Hello from Hermes', icon: 'fas fa-robot' }),
      );
    });

    it('truncates text longer than 120 characters', () => {
      const long = 'a'.repeat(130);
      service.notifyAgentReply(long);
      const call = (notificationsSpy.show as ReturnType<typeof vi.fn>).mock
        .calls[0][0] as { message: string };
      expect(call.message.length).toBeLessThanOrEqual(122);
      expect(call.message.endsWith('…')).toBe(true);
    });

    it('does not truncate text of exactly 120 characters', () => {
      const exact = 'b'.repeat(120);
      service.notifyAgentReply(exact);
      const call = (notificationsSpy.show as ReturnType<typeof vi.fn>).mock
        .calls[0][0] as { message: string };
      expect(call.message).toBe(exact);
    });
  });
});
