import { TestBed } from '@angular/core/testing';
import { HermesSystemActionsService } from './hermes-system-actions';
import { Theme } from './theme';
import { Settings } from './settings';
import { Sound } from './sound';

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
  };
  let soundSpy: { play: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    themeSpy = { setDark: vi.fn(), toggle: vi.fn() };
    settingsSpy = {
      setWallpaper: vi.fn(),
      setDockSize: vi.fn(),
      setDesktopSize: vi.fn(),
      toggleSystemSounds: vi.fn(),
      toggleAutoHideDock: vi.fn(),
      toggleSystemTips: vi.fn(),
    };
    soundSpy = { play: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        HermesSystemActionsService,
        { provide: Theme, useValue: themeSpy },
        { provide: Settings, useValue: settingsSpy },
        { provide: Sound, useValue: soundSpy },
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
});
