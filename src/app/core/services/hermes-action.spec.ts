import { TestBed } from '@angular/core/testing';
import { HermesActionService } from './hermes-action';
import { HermesActionType } from '../models/hermes-action';
import { HermesAppActionsService } from './hermes-app-actions';
import { HermesSystemActionsService } from './hermes-system-actions';
import { HermesMediaActionsService } from './hermes-media-actions';
import { HermesInfoActionsService } from './hermes-info-actions';
import { LanguageService } from './language';

describe('HermesActionService', () => {
  let service: HermesActionService;
  let appActionsSpy: { execute: ReturnType<typeof vi.fn> };
  let systemActionsSpy: { execute: ReturnType<typeof vi.fn> };
  let mediaActionsSpy: { execute: ReturnType<typeof vi.fn> };
  let infoActionsSpy: {
    getSystemStatus: ReturnType<typeof vi.fn>;
    showError: ReturnType<typeof vi.fn>;
  };
  let languageSpy: {
    setLanguage: ReturnType<typeof vi.fn>;
    t: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    appActionsSpy = { execute: vi.fn() };
    systemActionsSpy = { execute: vi.fn() };
    mediaActionsSpy = { execute: vi.fn() };
    infoActionsSpy = {
      getSystemStatus: vi.fn(),
      showError: vi.fn(),
    };
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
        { provide: HermesMediaActionsService, useValue: mediaActionsSpy },
        { provide: HermesInfoActionsService, useValue: infoActionsSpy },
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

    it('should delegate terminal_exec to appActions', () => {
      service.execute({ type: 'terminal_exec', payload: { command: 'neofetch' } });
      expect(appActionsSpy.execute).toHaveBeenCalledWith({
        type: 'terminal_exec',
        payload: { command: 'neofetch' },
      });
    });

    it('should delegate files_search to appActions', () => {
      service.execute({ type: 'files_search', payload: { query: 'project' } });
      expect(appActionsSpy.execute).toHaveBeenCalledWith({
        type: 'files_search',
        payload: { query: 'project' },
      });
    });

    it('should delegate read_file_content to appActions', () => {
      service.execute({ type: 'read_file_content', payload: { path: '/data/notes.md' } });
      expect(appActionsSpy.execute).toHaveBeenCalledWith({
        type: 'read_file_content',
        payload: { path: '/data/notes.md' },
      });
    });

    it('should delegate music actions to mediaActions', () => {
      service.execute({ type: 'music_play_pause' });
      expect(mediaActionsSpy.execute).toHaveBeenCalledWith({ type: 'music_play_pause' });
    });

    it('should delegate music_get_current to mediaActions', () => {
      service.execute({ type: 'music_get_current' });
      expect(mediaActionsSpy.execute).toHaveBeenCalledWith({ type: 'music_get_current' });
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

    it('should delegate show_notification to systemActions', () => {
      service.execute({
        type: 'show_notification',
        payload: { title: 'Test', message: 'Hello' },
      });
      expect(systemActionsSpy.execute).toHaveBeenCalledWith({
        type: 'show_notification',
        payload: { title: 'Test', message: 'Hello' },
      });
    });

    it('should delegate clear_notifications to systemActions', () => {
      service.execute({ type: 'clear_notifications' });
      expect(systemActionsSpy.execute).toHaveBeenCalledWith({ type: 'clear_notifications' });
    });

    it('should delegate toggle_notification_panel to systemActions', () => {
      service.execute({ type: 'toggle_notification_panel' });
      expect(systemActionsSpy.execute).toHaveBeenCalledWith({
        type: 'toggle_notification_panel',
      });
    });

    it('should delegate get_system_status to infoActions', () => {
      service.execute({ type: 'get_system_status' });
      expect(infoActionsSpy.getSystemStatus).toHaveBeenCalled();
    });

    it('should handle set_language directly', () => {
      service.execute({ type: 'set_language', payload: { lang: 'en' } });
      expect(languageSpy.setLanguage).toHaveBeenCalledWith('en');
    });

    it('should call infoActions.showError when an unknown action is executed', () => {
      service.execute({ type: 'invalid_action' as HermesActionType });
      expect(infoActionsSpy.showError).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );
    });

    it('should call infoActions.showError when appActions throws', () => {
      appActionsSpy.execute.mockImplementation(() => {
        throw new Error('App not found');
      });

      service.execute({ type: 'open_app', payload: { app: 'nonexistent' } });

      expect(infoActionsSpy.showError).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );
    });
  });
});
