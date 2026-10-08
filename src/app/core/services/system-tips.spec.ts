import { TestBed } from '@angular/core/testing';
import { SystemTips } from './system-tips';
import { NotificationService } from './notification';
import { Settings } from './settings';
import { LanguageService } from './language';
import { Sound } from './sound';
import { ScreenService } from './screen';

describe('SystemTips', () => {
  let service: SystemTips;
  let notificationSpy: { show: ReturnType<typeof vi.fn> };
  let settings: Settings;
  let screenService: ScreenService;

  function setup(isMobile = false) {
    notificationSpy = { show: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        SystemTips,
        { provide: NotificationService, useValue: notificationSpy },
        Settings,
        LanguageService,
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
        ScreenService,
      ],
    });

    service = TestBed.inject(SystemTips);
    settings = TestBed.inject(Settings);
    screenService = TestBed.inject(ScreenService);

    screenService.width.set(isMobile ? 375 : 1280);
  }

  afterEach(() => {
    service.stopTips();
    vi.useRealTimers();
  });

  describe('lifecycle', () => {
    beforeEach(() => setup());

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should start and stop without crashing', () => {
      expect(() => {
        service.startRandomTips();
        service.stopTips();
      }).not.toThrow();
    });

    it('should not throw when stopTips is called without a running timer', () => {
      expect(() => service.stopTips()).not.toThrow();
    });

    it('should allow calling stopTips twice safely', () => {
      service.startRandomTips();
      service.stopTips();
      expect(() => service.stopTips()).not.toThrow();
    });
  });

  describe('tip display', () => {
    beforeEach(() => setup());

    it('should NOT show notification when tipsEnabled is false', () => {
      vi.useFakeTimers();
      settings.tipsEnabled.set(false);

      service.startRandomTips();
      vi.advanceTimersByTime(15001);

      expect(notificationSpy.show).not.toHaveBeenCalled();
    });

    it('should show notification when tipsEnabled is true', () => {
      vi.useFakeTimers();
      settings.tipsEnabled.set(true);

      service.startRandomTips();
      vi.advanceTimersByTime(15001);

      expect(notificationSpy.show).toHaveBeenCalledTimes(1);
    });

    it('should reschedule and show a second tip after the follow-up delay', () => {
      vi.useFakeTimers();
      settings.tipsEnabled.set(true);

      service.startRandomTips();
      vi.advanceTimersByTime(15001);
      vi.advanceTimersByTime(5 * 60 * 1000);

      expect(notificationSpy.show).toHaveBeenCalledTimes(2);
    });

    it('should pass title and message to notification', () => {
      vi.useFakeTimers();
      settings.tipsEnabled.set(true);

      service.startRandomTips();
      vi.advanceTimersByTime(15001);

      const call = notificationSpy.show.mock.calls[0][0];
      expect(call.title).toBeTruthy();
      expect(call.message).toBeTruthy();
      expect(call.icon).toBe('fas fa-lightbulb');
    });
  });

  describe('platform-aware tip pool', () => {
    it('should show desktop tips when on desktop', () => {
      setup(false);
      vi.useFakeTimers();
      settings.tipsEnabled.set(true);

      service.startRandomTips();
      vi.advanceTimersByTime(15001);

      const lang = TestBed.inject(LanguageService);
      const desktopValues = Object.values(lang.t().systemTips.desktop);
      const message = notificationSpy.show.mock.calls[0][0].message;

      expect(desktopValues).toContain(message);
    });

    it('should show mobile tips when on mobile', () => {
      setup(true);
      vi.useFakeTimers();
      settings.tipsEnabled.set(true);

      service.startRandomTips();
      vi.advanceTimersByTime(15001);

      const lang = TestBed.inject(LanguageService);
      const mobileValues = Object.values(lang.t().systemTips.mobile);
      const message = notificationSpy.show.mock.calls[0][0].message;

      expect(mobileValues).toContain(message);
    });
  });
});
