import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationCenter } from './notification-center';
import { NotificationService } from '../../core/services/notification';
import { LanguageService } from '../../core/services/language';
import { Sound } from '../../core/services/sound';
import { AudioPlayer } from '../../features/musics/player/audio-player';
import { Apps } from '../../core/services/apps';
import { signal } from '@angular/core';

describe('NotificationCenter', () => {
  let component: NotificationCenter;
  let fixture: ComponentFixture<NotificationCenter>;
  let appsService: { appsDefinition: ReturnType<typeof signal>; openApp: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    appsService = {
      appsDefinition: signal([{ id: 'musics', name: 'Musics' }]),
      openApp: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [NotificationCenter],
      providers: [
        NotificationService,
        LanguageService,
        AudioPlayer,
        { provide: Apps, useValue: appsService },
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationCenter);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('formatTimestamp returns justNow for timestamps less than 1 minute ago', () => {
    const now = new Date();
    const result = component.formatTimestamp(now);
    const t = component.lang.t().notifications.timmings;
    expect(result).toBe(t.justNow);
  });

  it('formatTimestamp returns minutes for timestamps between 1-59 minutes ago', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const result = component.formatTimestamp(fiveMinutesAgo);
    expect(result).toContain('5');
  });

  it('formatTimestamp returns single minute form for exactly 1 minute ago', () => {
    const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000 - 100);
    const result = component.formatTimestamp(oneMinuteAgo);
    expect(result).toContain('1');
  });

  it('formatTimestamp returns hours for timestamps between 1-23 hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 3600 * 1000);
    const result = component.formatTimestamp(twoHoursAgo);
    expect(result).toContain('2');
  });

  it('formatTimestamp returns single hour form for exactly 1 hour ago', () => {
    const oneHourAgo = new Date(Date.now() - 1 * 3600 * 1000 - 100);
    const result = component.formatTimestamp(oneHourAgo);
    expect(result).toContain('1');
  });

  it('formatTimestamp returns days for timestamps >= 24 hours ago', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400 * 1000);
    const result = component.formatTimestamp(twoDaysAgo);
    expect(result).toContain('2');
  });

  it('formatTimestamp returns single day form for exactly 1 day ago', () => {
    const oneDayAgo = new Date(Date.now() - 1 * 86400 * 1000 - 100);
    const result = component.formatTimestamp(oneDayAgo);
    expect(result).toContain('1');
  });

  it('formatTime returns 0:00 for NaN', () => {
    expect(component.formatTime(NaN)).toBe('0:00');
  });

  it('formatTime returns 0:00 for Infinity', () => {
    expect(component.formatTime(Infinity)).toBe('0:00');
  });

  it('formatTime formats seconds correctly', () => {
    expect(component.formatTime(65)).toBe('1:05');
  });

  it('formatTime zero-pads seconds below 10', () => {
    expect(component.formatTime(9)).toBe('0:09');
  });

  it('openPlayer calls apps.openApp and closes the panel', () => {
    const notifService = TestBed.inject(NotificationService);
    notifService.openPanel();
    component.openPlayer();
    expect(appsService.openApp).toHaveBeenCalledWith({ id: 'musics', name: 'Musics' });
    expect(notifService.isPanelOpen()).toBe(false);
  });

  it('openPlayer does nothing when musics app is not found', () => {
    appsService.appsDefinition.set([]);
    component.openPlayer();
    expect(appsService.openApp).not.toHaveBeenCalled();
  });
});
