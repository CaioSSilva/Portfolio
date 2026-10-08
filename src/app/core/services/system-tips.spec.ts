import { TestBed } from '@angular/core/testing';
import { SystemTips } from './system-tips';
import { NotificationService } from './notification';
import { Settings } from './settings';
import { LanguageService } from './language';
import { Sound } from './sound';

describe('SystemTips', () => {
  let service: SystemTips;
  let notificationSpy: { show: ReturnType<typeof vi.fn> };
  let settings: Settings;

  beforeEach(() => {
    notificationSpy = { show: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        SystemTips,
        { provide: NotificationService, useValue: notificationSpy },
        Settings,
        LanguageService,
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
      ],
    });
    service = TestBed.inject(SystemTips);
    settings = TestBed.inject(Settings);
  });

  afterEach(() => {
    service.stopTips();
    vi.useRealTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start and stop random tips without crashing', () => {
    expect(() => {
      service.startRandomTips();
      service.stopTips();
    }).not.toThrow();
  });

  it('should stop tips and clear the timeout', () => {
    service.startRandomTips();
    service.stopTips();
    expect(() => service.stopTips()).not.toThrow();
  });

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

  it('should reschedule after first tip fires', () => {
    vi.useFakeTimers();
    settings.tipsEnabled.set(true);

    service.startRandomTips();
    vi.advanceTimersByTime(15001);
    vi.advanceTimersByTime(5 * 60 * 1000);

    expect(notificationSpy.show).toHaveBeenCalledTimes(2);
  });
});
