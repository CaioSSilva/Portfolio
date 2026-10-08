import { TestBed } from '@angular/core/testing';
import { HermesActionService } from './hermes-action';
import { AppRegistry } from './app-registry';
import { ProcessManager } from './process-manager';
import { Theme } from './theme';
import { Settings } from './settings';
import { NotificationService } from './notification';
import { Sound } from './sound';
import { LanguageService } from './language';

describe('HermesActionService', () => {
  let service: HermesActionService;
  let appRegistrySpy: { getAppById: ReturnType<typeof vi.fn> };
  let processManagerSpy: {
    open: ReturnType<typeof vi.fn>;
    closeAllInstancesById: ReturnType<typeof vi.fn>;
    openFile: ReturnType<typeof vi.fn>;
  };
  let themeSpy: { setDark: ReturnType<typeof vi.fn>; toggle: ReturnType<typeof vi.fn> };
  let settingsSpy: {
    setWallpaper: ReturnType<typeof vi.fn>;
    setDockSize: ReturnType<typeof vi.fn>;
    setDesktopSize: ReturnType<typeof vi.fn>;
    toggleSystemSounds: ReturnType<typeof vi.fn>;
    toggleAutoHideDock: ReturnType<typeof vi.fn>;
    toggleSystemTips: ReturnType<typeof vi.fn>;
  };
  let notificationSpy: { show: ReturnType<typeof vi.fn>; togglePanel: ReturnType<typeof vi.fn> };
  let soundSpy: { play: ReturnType<typeof vi.fn> };
  let languageSpy: {
    setLanguage: ReturnType<typeof vi.fn>;
    t: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    appRegistrySpy = { getAppById: vi.fn() };
    processManagerSpy = {
      open: vi.fn(),
      closeAllInstancesById: vi.fn(),
      openFile: vi.fn(),
    };
    themeSpy = { setDark: vi.fn(), toggle: vi.fn() };
    settingsSpy = {
      setWallpaper: vi.fn(),
      setDockSize: vi.fn(),
      setDesktopSize: vi.fn(),
      toggleSystemSounds: vi.fn(),
      toggleAutoHideDock: vi.fn(),
      toggleSystemTips: vi.fn(),
    };
    notificationSpy = { show: vi.fn(), togglePanel: vi.fn() };
    soundSpy = { play: vi.fn() };
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
        { provide: AppRegistry, useValue: appRegistrySpy },
        { provide: ProcessManager, useValue: processManagerSpy },
        { provide: Theme, useValue: themeSpy },
        { provide: Settings, useValue: settingsSpy },
        { provide: NotificationService, useValue: notificationSpy },
        { provide: Sound, useValue: soundSpy },
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
      expect(result.actions).toEqual([
        { type: 'open_app', payload: { app: 'terminal' } },
      ]);
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
    it('should handle open_app action', () => {
      const mockApp = { id: 'terminal', title: 'Terminal', data: { id: '123' } };
      appRegistrySpy.getAppById.mockReturnValue(mockApp);

      service.execute({
        type: 'open_app',
        payload: { app: 'terminal' },
      });

      expect(appRegistrySpy.getAppById).toHaveBeenCalledWith('terminal');
      expect(processManagerSpy.open).toHaveBeenCalledWith(mockApp, mockApp.data);
    });

    it('should handle close_app action', () => {
      service.execute({
        type: 'close_app',
        payload: { app: 'terminal' },
      });

      expect(processManagerSpy.closeAllInstancesById).toHaveBeenCalledWith('terminal');
    });

    it('should handle open_file action', () => {
      service.execute({
        type: 'open_file',
        payload: { name: 'Resume.pdf', url: '/data/Resume.pdf' },
      });

      expect(processManagerSpy.openFile).toHaveBeenCalledWith({
        id: 'Resume.pdf',
        name: 'Resume.pdf',
        type: 'file',
        icon: 'fas fa-file',
        url: '/data/Resume.pdf',
      });
    });

    it('should handle set_theme action', () => {
      service.execute({
        type: 'set_theme',
        payload: { dark: true },
      });

      expect(themeSpy.setDark).toHaveBeenCalledWith(true);
    });

    it('should handle toggle_theme action', () => {
      service.execute({ type: 'toggle_theme' });
      expect(themeSpy.toggle).toHaveBeenCalled();
    });

    it('should handle set_wallpaper action', () => {
      service.execute({
        type: 'set_wallpaper',
        payload: { path: '/wallpapers/desktop/sunset.webp' },
      });

      expect(settingsSpy.setWallpaper).toHaveBeenCalledWith('/wallpapers/desktop/sunset.webp');
    });

    it('should handle set_dock_size and set_desktop_size', () => {
      service.execute({
        type: 'set_dock_size',
        payload: { size: 52 },
      });
      expect(settingsSpy.setDockSize).toHaveBeenCalledWith(52);

      service.execute({
        type: 'set_desktop_size',
        payload: { size: 44 },
      });
      expect(settingsSpy.setDesktopSize).toHaveBeenCalledWith(44);
    });

    it('should handle toggle_sounds and play_sound', () => {
      service.execute({ type: 'toggle_sounds' });
      expect(settingsSpy.toggleSystemSounds).toHaveBeenCalled();

      service.execute({
        type: 'play_sound',
        payload: { sound: 'bell' },
      });
      expect(soundSpy.play).toHaveBeenCalledWith('bell');
    });

    it('should handle show_notification and toggle_notification_panel', () => {
      service.execute({
        type: 'show_notification',
        payload: { title: 'Test', message: 'Hello' },
      });
      expect(notificationSpy.show).toHaveBeenCalledWith({
        title: 'Test',
        message: 'Hello',
        icon: 'fas fa-info-circle',
      });

      service.execute({ type: 'toggle_notification_panel' });
      expect(notificationSpy.togglePanel).toHaveBeenCalled();
    });

    it('should handle set_language, toggle_auto_hide_dock and toggle_tips', () => {
      service.execute({
        type: 'set_language',
        payload: { lang: 'en' },
      });
      expect(languageSpy.setLanguage).toHaveBeenCalledWith('en');

      service.execute({ type: 'toggle_auto_hide_dock' });
      expect(settingsSpy.toggleAutoHideDock).toHaveBeenCalled();

      service.execute({ type: 'toggle_tips' });
      expect(settingsSpy.toggleSystemTips).toHaveBeenCalled();
    });

    it('should show error notification when an unknown action is executed', () => {
      service.execute({
        type: 'invalid_action' as any,
      });

      expect(notificationSpy.show).toHaveBeenCalledWith({
        title: languageSpy.setLanguage ? expect.any(String) : expect.anything(),
        message: expect.any(String),
        icon: 'fas fa-circle-exclamation',
      });
    });

    it('should show error notification when open_app targets a nonexistent app', () => {
      appRegistrySpy.getAppById.mockReturnValue(undefined);

      service.execute({
        type: 'open_app',
        payload: { app: 'nonexistent' },
      });

      expect(notificationSpy.show).toHaveBeenCalledWith({
        title: expect.any(String),
        message: expect.any(String),
        icon: 'fas fa-circle-exclamation',
      });
    });
  });
});
