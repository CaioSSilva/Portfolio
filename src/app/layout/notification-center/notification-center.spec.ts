import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationCenter } from './notification-center';
import { NotificationService } from '../../core/services/notification';
import { LanguageService } from '../../core/services/language';
import { Sound } from '../../core/services/sound';

describe('NotificationCenter', () => {
  let component: NotificationCenter;
  let fixture: ComponentFixture<NotificationCenter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationCenter],
      providers: [
        NotificationService,
        LanguageService,
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
});
