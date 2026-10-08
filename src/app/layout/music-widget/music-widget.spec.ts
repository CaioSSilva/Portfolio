import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MusicWidget } from './music-widget';
import { AudioPlayer } from '../../features/musics/player/audio-player';
import { LanguageService } from '../../core/services/language';
import { Apps } from '../../core/services/apps';
import { NotificationService } from '../../core/services/notification';
import { Sound } from '../../core/services/sound';
import { signal } from '@angular/core';
import { FileItem } from '../../core/models/file';

const mockTrack = (): FileItem => ({
  id: 't1',
  name: 'Track 1',
  type: 'file',
  icon: 'fas fa-music',
  url: '/audio/track1.mp3',
});

describe('MusicWidget', () => {
  let component: MusicWidget;
  let fixture: ComponentFixture<MusicWidget>;
  let audioPlayer: AudioPlayer;
  let notifService: NotificationService;
  let appsService: { appsDefinition: ReturnType<typeof signal>; openApp: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    appsService = {
      appsDefinition: signal([{ id: 'musics', name: 'Musics' }]),
      openApp: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [MusicWidget],
      providers: [
        AudioPlayer,
        LanguageService,
        NotificationService,
        { provide: Apps, useValue: appsService },
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
      ],
    }).compileComponents();

    audioPlayer = TestBed.inject(AudioPlayer);
    notifService = TestBed.inject(NotificationService);
    fixture = TestBed.createComponent(MusicWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('não renderiza nada quando não há música', () => {
    audioPlayer.currentTrack.set(null);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.bg-gnome-surface\\/60')).toBeNull();
  });

  it('renderiza o card quando há música', () => {
    audioPlayer.currentTrack.set(mockTrack());
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.bg-gnome-surface\\/60')).not.toBeNull();
  });

  it('exibe o nome da música atual', () => {
    audioPlayer.currentTrack.set(mockTrack());
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Track 1');
  });

  it('openPlayer chama openApp e fecha o painel', () => {
    notifService.openPanel();
    component.openPlayer();
    expect(appsService.openApp).toHaveBeenCalledWith({ id: 'musics', name: 'Musics' });
    expect(notifService.isPanelOpen()).toBe(false);
  });

  it('openPlayer não faz nada quando musics não está na lista', () => {
    appsService.appsDefinition.set([]);
    component.openPlayer();
    expect(appsService.openApp).not.toHaveBeenCalled();
  });

  it('formatTime retorna 0:00 para NaN', () => {
    expect(component.formatTime(NaN)).toBe('0:00');
  });

  it('formatTime retorna 0:00 para Infinity', () => {
    expect(component.formatTime(Infinity)).toBe('0:00');
  });

  it('formatTime formata segundos corretamente', () => {
    expect(component.formatTime(65)).toBe('1:05');
    expect(component.formatTime(9)).toBe('0:09');
  });

  it('onSeekStart ativa isSeeking e atualiza seekPreview', () => {
    const event = { target: { valueAsNumber: 30 } } as unknown as Event;
    component.onSeekStart(event);
    expect(component.isSeeking()).toBe(true);
    expect(component.seekPreview()).toBe(30);
  });

  it('onSeekEnd desativa isSeeking e chama player.seek', () => {
    const seekSpy = vi.spyOn(audioPlayer, 'seek');
    const event = { target: { valueAsNumber: 45 } } as unknown as Event;
    component.onSeekStart(event);
    component.onSeekEnd(event);
    expect(component.isSeeking()).toBe(false);
    expect(seekSpy).toHaveBeenCalledWith(45);
  });

  it('displayTime usa seekPreview durante o drag', () => {
    audioPlayer.currentTime.set(10);
    const event = { target: { valueAsNumber: 50 } } as unknown as Event;
    component.onSeekStart(event);
    expect(component.displayTime()).toBe(50);
  });

  it('displayTime usa currentTime quando não está arrastando', () => {
    audioPlayer.currentTime.set(20);
    expect(component.displayTime()).toBe(20);
  });
});
