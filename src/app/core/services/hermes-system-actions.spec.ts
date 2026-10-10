import { TestBed } from '@angular/core/testing';
import { HermesSystemActionsService } from './hermes-system-actions';
import { Theme } from './theme';
import { Settings } from './settings';
import { Sound } from './sound';
import { SystemTips } from './system-tips';
import { NotificationService } from './notification';

describe('HermesSystemActionsService', () => {
  let service: HermesSystemActionsService;
  let themeSpy: { setDark: ReturnType<typeof vi.fn>; toggle: ReturnType<typeof vi.fn> };
  let settingsSpy: {
    setWallpaper: ReturnType<typeof vi.fn>;
    setDockSize: ReturnType<typeof vi.fn>;
    setDesktopSize: ReturnType<typeof vi.fn>;
    toggleSystemSounds: ReturnType<typeof vi.fn>;
    toggleAutoHideDock: ReturnType<typeof vi.fn>;
    toggleSystemTips: ReturnType<typeof vi.fn>;
    toggleAgentMode: ReturnType<typeof vi.fn>;
    toggleAgentSpeakReplies: ReturnType<typeof vi.fn>;
  };
  let soundSpy: { play: ReturnType<typeof vi.fn> };
  let systemTipsSpy: { showRandomTip: ReturnType<typeof vi.fn> };
  let notificationSpy: {
    show: ReturnType<typeof vi.fn>;
    clearHistory: ReturnType<typeof vi.fn>;
    togglePanel: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    themeSpy = { setDark: vi.fn(), toggle: vi.fn() };
    settingsSpy = {
      setWallpaper: vi.fn(),
      setDockSize: vi.fn(),
      setDesktopSize: vi.fn(),
      toggleSystemSounds: vi.fn(),
      toggleAutoHideDock: vi.fn(),
      toggleSystemTips: vi.fn(),
      toggleAgentMode: vi.fn(),
      toggleAgentSpeakReplies: vi.fn(),
    };
    soundSpy = { play: vi.fn() };
    systemTipsSpy = { showRandomTip: vi.fn() };
    notificationSpy = { show: vi.fn(), clearHistory: vi.fn(), togglePanel: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        HermesSystemActionsService,
        { provide: Theme, useValue: themeSpy },
        { provide: Settings, useValue: settingsSpy },
        { provide: Sound, useValue: soundSpy },
        { provide: SystemTips, useValue: systemTipsSpy },
        { provide: NotificationService, useValue: notificationSpy },
      ],
    });

    service = TestBed.inject(HermesSystemActionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('theme actions', () => {
    it('set_theme sets dark mode', () => {
      service.execute({ type: 'set_theme', payload: { dark: true } });
      expect(themeSpy.setDark).toHaveBeenCalledWith(true);
    });

    it('set_theme throws when dark is not a boolean', () => {
      expect(() => service.execute({ type: 'set_theme', payload: { dark: 'yes' } })).toThrow(
        'Invalid theme value',
      );
    });

    it('toggle_theme toggles the theme', () => {
      service.execute({ type: 'toggle_theme' });
      expect(themeSpy.toggle).toHaveBeenCalled();
    });
  });

  describe('settings actions', () => {
    it('set_wallpaper sets the wallpaper path', () => {
      service.execute({ type: 'set_wallpaper', payload: { path: '/wallpapers/nebula.webp' } });
      expect(settingsSpy.setWallpaper).toHaveBeenCalledWith('/wallpapers/nebula.webp');
    });

    it('set_wallpaper throws when path is missing', () => {
      expect(() => service.execute({ type: 'set_wallpaper', payload: {} })).toThrow(
        'Missing wallpaper path',
      );
    });

    it('set_dock_size sets the dock size', () => {
      service.execute({ type: 'set_dock_size', payload: { size: 56 } });
      expect(settingsSpy.setDockSize).toHaveBeenCalledWith(56);
    });

    it('set_dock_size throws when size is not a number', () => {
      expect(() => service.execute({ type: 'set_dock_size', payload: { size: 'big' } })).toThrow(
        'Invalid dock size',
      );
    });

    it('set_desktop_size sets the desktop size', () => {
      service.execute({ type: 'set_desktop_size', payload: { size: 44 } });
      expect(settingsSpy.setDesktopSize).toHaveBeenCalledWith(44);
    });

    it('set_desktop_size throws when size is not a number', () => {
      expect(() => service.execute({ type: 'set_desktop_size', payload: { size: null } })).toThrow(
        'Invalid desktop size',
      );
    });

    it('toggle_sounds toggles system sounds', () => {
      service.execute({ type: 'toggle_sounds' });
      expect(settingsSpy.toggleSystemSounds).toHaveBeenCalled();
    });

    it('toggle_auto_hide_dock toggles auto-hide dock', () => {
      service.execute({ type: 'toggle_auto_hide_dock' });
      expect(settingsSpy.toggleAutoHideDock).toHaveBeenCalled();
    });

    it('toggle_tips toggles system tips', () => {
      service.execute({ type: 'toggle_tips' });
      expect(settingsSpy.toggleSystemTips).toHaveBeenCalled();
    });

    it('toggle_agent_mode toggles agent mode', () => {
      service.execute({ type: 'toggle_agent_mode' });
      expect(settingsSpy.toggleAgentMode).toHaveBeenCalled();
    });

    it('toggle_voice_feedback toggles agent speech', () => {
      service.execute({ type: 'toggle_voice_feedback' });
      expect(settingsSpy.toggleAgentSpeakReplies).toHaveBeenCalled();
    });

    it('show_system_tip shows a random tip', () => {
      service.execute({ type: 'show_system_tip' });
      expect(systemTipsSpy.showRandomTip).toHaveBeenCalled();
    });
  });

  describe('sound actions', () => {
    it('play_sound plays the named sound', () => {
      service.execute({ type: 'play_sound', payload: { sound: 'startup' } });
      expect(soundSpy.play).toHaveBeenCalledWith('startup');
    });

    it('play_sound throws when sound name is missing', () => {
      expect(() => service.execute({ type: 'play_sound', payload: {} })).toThrow(
        'Missing sound name',
      );
    });
  });

  describe('notification actions', () => {
    it('show_notification shows a notification with given title and message', () => {
      service.execute({
        type: 'show_notification',
        payload: { title: 'Hello', message: 'World' },
      });
      expect(notificationSpy.show).toHaveBeenCalledWith({
        title: 'Hello',
        message: 'World',
        icon: 'fas fa-info-circle',
      });
    });

    it('show_notification uses custom icon when provided', () => {
      service.execute({
        type: 'show_notification',
        payload: { title: 'Alert', message: 'Test', icon: 'fas fa-star' },
      });
      expect(notificationSpy.show).toHaveBeenCalledWith(
        expect.objectContaining({ icon: 'fas fa-star' }),
      );
    });

    it('show_notification throws when title or message is missing', () => {
      expect(() =>
        service.execute({ type: 'show_notification', payload: { title: 'Only title' } }),
      ).toThrow('Missing notification content');
    });

    it('clear_notifications clears notification history', () => {
      service.execute({ type: 'clear_notifications' });
      expect(notificationSpy.clearHistory).toHaveBeenCalled();
    });

    it('toggle_notification_panel toggles the panel', () => {
      service.execute({ type: 'toggle_notification_panel' });
      expect(notificationSpy.togglePanel).toHaveBeenCalled();
    });
  });
});
