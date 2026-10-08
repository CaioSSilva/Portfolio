import { TestBed } from '@angular/core/testing';
import { HermesActionService } from './hermes-action';
import { HermesActionType } from '../models/hermes-action';
import { HermesAppActionsService } from './hermes-app-actions';
import { HermesSystemActionsService } from './hermes-system-actions';
import { NotificationService } from './notification';
import { LanguageService } from './language';

describe('HermesActionService', () => {
  let service: HermesActionService;
  let appActionsSpy: { execute: ReturnType<typeof vi.fn> };
  let systemActionsSpy: { execute: ReturnType<typeof vi.fn> };
  let notificationSpy: { show: ReturnType<typeof vi.fn>; togglePanel: ReturnType<typeof vi.fn> };
  let languageSpy: {
    setLanguage: ReturnType<typeof vi.fn>;
    t: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    appActionsSpy = { execute: vi.fn() };
    systemActionsSpy = { execute: vi.fn() };
    notificationSpy = { show: vi.fn(), togglePanel: vi.fn() };
    languageSpy = {
      setLanguage: vi.fn(),
      t: vi.fn().mockReturnValue({
        errors: {
          systemError: 'Erro de sistema',
          actionExecutionFailed: 'Não foi possível executar a ação solicitada pelo Hermes.',
        },
      }),
    };

    TestBed.configureTestingModule({
      providers: [
        HermesActionService,
        { provide: HermesAppActionsService, useValue: appActionsSpy },
        { provide: HermesSystemActionsService, useValue: systemActionsSpy },
        { provide: NotificationService, useValue: notificationSpy },
        { provide: LanguageService, useValue: languageSpy },
      ],
    });

    service = TestBed.inject(HermesActionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('parseActions', () => {
    it('should extract action and return clean markdown', () => {
      const input =
        'Abri o terminal para você!\n<!--caios:action {"type": "open_app", "payload": {"app": "terminal"}} -->';
      const result = service.parseActions(input);

      expect(result.cleanText).toBe('Abri o terminal para você!');
      expect(result.actions).toEqual([{ type: 'open_app', payload: { app: 'terminal' } }]);
    });

    it('should handle text without any actions', () => {
      const input = 'Olá, tudo bem com você?';
      const result = service.parseActions(input);

      expect(result.cleanText).toBe('Olá, tudo bem com você?');
      expect(result.actions).toEqual([]);
    });

    it('should gracefully handle malformed JSON inside action comment', () => {
      const input = 'Texto normal <!--caios:action {invalid json} --> fim.';
      const result = service.parseActions(input);

      expect(result.cleanText).toBe('Texto normal  fim.');
      expect(result.actions).toEqual([]);
    });
  });

  describe('execute', () => {
    it('should delegate open_app to appActions', () => {
      service.execute({ type: 'open_app', payload: { app: 'terminal' } });
      expect(appActionsSpy.execute).toHaveBeenCalledWith({
        type: 'open_app',
        payload: { app: 'terminal' },
      });
    });

    it('should delegate close_app to appActions', () => {
      service.execute({ type: 'close_app', payload: { app: 'terminal' } });
      expect(appActionsSpy.execute).toHaveBeenCalledWith({
        type: 'close_app',
        payload: { app: 'terminal' },
      });
    });

    it('should delegate open_file to appActions', () => {
      service.execute({
        type: 'open_file',
        payload: { name: 'Resume.pdf', url: '/data/Resume.pdf' },
      });
      expect(appActionsSpy.execute).toHaveBeenCalledWith({
        type: 'open_file',
        payload: { name: 'Resume.pdf', url: '/data/Resume.pdf' },
      });
    });

    it('should delegate set_theme to systemActions', () => {
      service.execute({ type: 'set_theme', payload: { dark: true } });
      expect(systemActionsSpy.execute).toHaveBeenCalledWith({
        type: 'set_theme',
        payload: { dark: true },
      });
    });

    it('should delegate toggle_theme to systemActions', () => {
      service.execute({ type: 'toggle_theme' });
      expect(systemActionsSpy.execute).toHaveBeenCalledWith({ type: 'toggle_theme' });
    });

    it('should delegate play_sound to systemActions', () => {
      service.execute({ type: 'play_sound', payload: { sound: 'bell' } });
      expect(systemActionsSpy.execute).toHaveBeenCalledWith({
        type: 'play_sound',
        payload: { sound: 'bell' },
      });
    });

    it('should handle show_notification directly', () => {
      service.execute({
        type: 'show_notification',
        payload: { title: 'Test', message: 'Hello' },
      });
      expect(notificationSpy.show).toHaveBeenCalledWith({
        title: 'Test',
        message: 'Hello',
        icon: 'fas fa-info-circle',
      });
    });

    it('should handle toggle_notification_panel directly', () => {
      service.execute({ type: 'toggle_notification_panel' });
      expect(notificationSpy.togglePanel).toHaveBeenCalled();
    });

    it('should handle set_language directly', () => {
      service.execute({ type: 'set_language', payload: { lang: 'en' } });
      expect(languageSpy.setLanguage).toHaveBeenCalledWith('en');
    });

    it('should show error notification when an unknown action is executed', () => {
      service.execute({ type: 'invalid_action' as HermesActionType });

      expect(notificationSpy.show).toHaveBeenCalledWith({
        title: expect.any(String),
        message: expect.any(String),
        icon: 'fas fa-circle-exclamation',
      });
    });

    it('should show error notification when appActions throws', () => {
      appActionsSpy.execute.mockImplementation(() => {
        throw new Error('App not found');
      });

      service.execute({ type: 'open_app', payload: { app: 'nonexistent' } });

      expect(notificationSpy.show).toHaveBeenCalledWith({
        title: expect.any(String),
        message: expect.any(String),
        icon: 'fas fa-circle-exclamation',
      });
    });
  });
});
