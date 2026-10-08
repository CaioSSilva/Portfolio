import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NowPlayingWidget } from './now-playing-widget';
import { AudioPlayer } from '../../core/services/audio-player';
import { LanguageService } from '../../core/services/language';
import { Apps } from '../../core/services/apps';
import { signal } from '@angular/core';
import { FileItem } from '../../core/models/file';
import { Sound } from '../../core/services/sound';

const mockTrack = (name = 'Track 1'): FileItem => ({
  id: 't1',
  name,
  type: 'file',
  icon: 'fas fa-music',
  url: '/audio/track1.mp3',
});

describe('NowPlayingWidget', () => {
  let component: NowPlayingWidget;
  let fixture: ComponentFixture<NowPlayingWidget>;
  let audioPlayer: AudioPlayer;
  let appsService: { appsDefinition: ReturnType<typeof signal>; openApp: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    appsService = {
      appsDefinition: signal([{ id: 'musics', name: 'Musics' }]),
      openApp: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [NowPlayingWidget],
      providers: [
        AudioPlayer,
        LanguageService,
        { provide: Apps, useValue: appsService },
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
      ],
    }).compileComponents();

    audioPlayer = TestBed.inject(AudioPlayer);
    fixture = TestBed.createComponent(NowPlayingWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders nothing when no track is playing', () => {
    audioPlayer.currentTrack.set(null);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn).toBeNull();
  });

  it('renders the widget button when a track is set', () => {
    audioPlayer.currentTrack.set(mockTrack());
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn).not.toBeNull();
  });

  it('displays the current track name', () => {
    audioPlayer.currentTrack.set(mockTrack('My Song'));
    fixture.detectChanges();
    const spans: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('button span');
    const textSpan = Array.from(spans).find((s) => s.textContent?.trim() === 'My Song');
    expect(textSpan).not.toBeUndefined();
  });

  it('disc icon has widget-disc-paused class when not playing', () => {
    audioPlayer.currentTrack.set(mockTrack());
    audioPlayer.discSpinState.set('paused');
    fixture.detectChanges();
    const disc = fixture.nativeElement.querySelector('i.fa-compact-disc');
    expect(disc.classList).toContain('widget-disc-paused');
  });

  it('disc icon has widget-disc-playing class when playing', () => {
    audioPlayer.currentTrack.set(mockTrack());
    audioPlayer.discSpinState.set('playing');
    fixture.detectChanges();
    const disc = fixture.nativeElement.querySelector('i.fa-compact-disc');
    expect(disc.classList).toContain('widget-disc-playing');
  });

  it('openPlayer calls apps.openApp with the musics app', () => {
    component.openPlayer();
    expect(appsService.openApp).toHaveBeenCalledWith({ id: 'musics', name: 'Musics' });
  });

  it('openPlayer does nothing when musics app is not found', () => {
    appsService.appsDefinition.set([]);
    component.openPlayer();
    expect(appsService.openApp).not.toHaveBeenCalled();
  });

  it('clicking the widget button calls openPlayer', () => {
    audioPlayer.currentTrack.set(mockTrack());
    fixture.detectChanges();
    const openPlayerSpy = vi.spyOn(component, 'openPlayer');
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    btn.click();
    expect(openPlayerSpy).toHaveBeenCalled();
  });
});
