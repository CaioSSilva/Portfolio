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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationCenter],
      providers: [
        NotificationService,
        LanguageService,
        AudioPlayer,
        { provide: Apps, useValue: { appsDefinition: signal([]), openApp: vi.fn() } },
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

  it('formatTimestamp retorna justNow para menos de 1 minuto atrás', () => {
    const now = new Date();
    const result = component.formatTimestamp(now);
    const t = component.lang.t().notifications.timmings;
    expect(result).toBe(t.justNow);
  });

  it('formatTimestamp retorna minutos para 1–59 minutos atrás', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(component.formatTimestamp(fiveMinutesAgo)).toContain('5');
  });

  it('formatTimestamp retorna singular para exatamente 1 minuto atrás', () => {
    const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000 - 100);
    expect(component.formatTimestamp(oneMinuteAgo)).toContain('1');
  });

  it('formatTimestamp retorna horas para 1–23 horas atrás', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 3600 * 1000);
    expect(component.formatTimestamp(twoHoursAgo)).toContain('2');
  });

  it('formatTimestamp retorna singular para exatamente 1 hora atrás', () => {
    const oneHourAgo = new Date(Date.now() - 1 * 3600 * 1000 - 100);
    expect(component.formatTimestamp(oneHourAgo)).toContain('1');
  });

  it('formatTimestamp retorna dias para 24h ou mais atrás', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400 * 1000);
    expect(component.formatTimestamp(twoDaysAgo)).toContain('2');
  });

  it('formatTimestamp retorna singular para exatamente 1 dia atrás', () => {
    const oneDayAgo = new Date(Date.now() - 1 * 86400 * 1000 - 100);
    expect(component.formatTimestamp(oneDayAgo)).toContain('1');
  });
});
