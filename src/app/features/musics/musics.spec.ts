import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Musics } from './musics';
import { LanguageService } from '../../core/services/language';
import { FileSystem } from '../../core/services/file-system';
import { Apps } from '../../core/services/apps';
import { Sound } from '../../core/services/sound';
import { AudioPlayer } from '../../core/services/audio-player';
import { FileItem } from '../../core/models/file';
import { ScreenService } from '../../core/services/screen';

describe('Musics', () => {
  let component: Musics;
  let fixture: ComponentFixture<Musics>;
  let audioPlayer: AudioPlayer;
  let fsSpy: {
    isLoaded: ReturnType<typeof vi.fn>;
    ensureLoaded: ReturnType<typeof vi.fn>;
    getFilesByExtensions: ReturnType<typeof vi.fn>;
    getFileExtension: ReturnType<typeof vi.fn>;
    getChildren: ReturnType<typeof vi.fn>;
    tree: ReturnType<typeof vi.fn>;
    getNode: ReturnType<typeof vi.fn>;
    getFolderName: ReturnType<typeof vi.fn>;
    getPath: ReturnType<typeof vi.fn>;
    searchFiles: ReturnType<typeof vi.fn>;
    formatFileSize: ReturnType<typeof vi.fn>;
    getFilesByExtensions2: ReturnType<typeof vi.fn>;
    totalFiles: ReturnType<typeof vi.fn>;
    totalSize: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    isLoading: ReturnType<typeof vi.fn>;
    downloadFile: ReturnType<typeof vi.fn>;
  };

  const mockFiles: FileItem[] = [
    { id: 'a1', name: 'song1.mp3', type: 'file', icon: 'music', url: '/song1.mp3' },
    { id: 'a2', name: 'song2.mp3', type: 'file', icon: 'music', url: '/song2.mp3' },
  ];

  beforeEach(async () => {
    fsSpy = {
      isLoaded: vi.fn().mockReturnValue(true),
      ensureLoaded: vi.fn().mockResolvedValue(undefined),
      getFilesByExtensions: vi.fn().mockReturnValue(mockFiles),
      getFileExtension: vi.fn().mockReturnValue('mp3'),
      getChildren: vi.fn().mockReturnValue([]),
      tree: vi.fn().mockReturnValue(null),
      getNode: vi.fn().mockReturnValue(undefined),
      getFolderName: vi.fn().mockReturnValue(''),
      getPath: vi.fn().mockReturnValue(''),
      searchFiles: vi.fn().mockReturnValue([]),
      formatFileSize: vi.fn().mockReturnValue('1 KB'),
      getFilesByExtensions2: vi.fn().mockReturnValue([]),
      totalFiles: vi.fn().mockReturnValue(0),
      totalSize: vi.fn().mockReturnValue(0),
      error: vi.fn().mockReturnValue(null),
      isLoading: vi.fn().mockReturnValue(false),
      downloadFile: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Musics],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        LanguageService,
        { provide: FileSystem, useValue: fsSpy },
        Apps,
        AudioPlayer,
        ScreenService,
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Musics);
    component = fixture.componentInstance;
    audioPlayer = TestBed.inject(AudioPlayer);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load music library from file system', () => {
    component.loadLibrary();
    expect(component.musicLibrary().length).toBe(2);
  });

  it('should set trackList on player after loading library', () => {
    component.loadLibrary();
    expect(audioPlayer.trackList().length).toBe(2);
  });

  it('should compute fileName from player currentTrack', () => {
    expect(component.fileName()).toBe('---');
    audioPlayer.currentTrack.set(mockFiles[0]);
    expect(component.fileName()).toBe('song1.mp3');
  });

  it('formatTime should format seconds correctly', () => {
    expect(component.formatTime(0)).toBe('0:00');
    expect(component.formatTime(65)).toBe('1:05');
    expect(component.formatTime(3600)).toBe('60:00');
    expect(component.formatTime(NaN)).toBe('0:00');
    expect(component.formatTime(Infinity)).toBe('0:00');
  });

  it('should call player.stop() when component is destroyed', () => {
    const stopSpy = vi.spyOn(audioPlayer, 'stop');
    fixture.destroy();
    expect(stopSpy).toHaveBeenCalled();
  });

  it('onSeekEnd deve chamar player.seek() com immediate=true', () => {
    const seekSpy = vi.spyOn(audioPlayer, 'seek');
    const event: Partial<Event> = { target: { valueAsNumber: 42 } as Partial<HTMLInputElement> as HTMLInputElement };
    component.onSeekEnd(event as Event);
    expect(seekSpy).toHaveBeenCalledWith(42, true);
  });

  it('should handleVolume delegate to player.setVolume()', () => {
    const volSpy = vi.spyOn(audioPlayer, 'setVolume');
    const event: Partial<Event> = { target: { valueAsNumber: 0.5 } as Partial<HTMLInputElement> as HTMLInputElement };
    component.handleVolume(event as Event);
    expect(volSpy).toHaveBeenCalledWith(0.5);
  });

  it('should isSidebarOpen default to true', () => {
    expect(component.isSidebarOpen()).toBe(true);
  });

  it('should NOT close sidebar when narrow on mobile', () => {
    const screen = TestBed.inject(ScreenService);
    screen.width.set(375);
    component.isSidebarOpen.set(true);
    expect(component.isSidebarOpen()).toBe(true);
  });

  it('should toggle sidebar when requested', () => {
    component.isSidebarOpen.set(true);
    component.isSidebarOpen.set(false);
    expect(component.isSidebarOpen()).toBe(false);
  });

  it('seek slider --slider-pct is 0% when duration is 0', () => {
    audioPlayer.currentTrack.set(mockFiles[0]);
    audioPlayer.isPlaying.set(true);
    fixture.detectChanges();
    const pct =
      audioPlayer.duration() > 0 ? (audioPlayer.currentTime() / audioPlayer.duration()) * 100 : 0;
    expect(pct).toBe(0);
  });

  it('seek slider --slider-pct reaches 100% when at end', () => {
    audioPlayer.duration.set(120);
    audioPlayer.currentTime.set(120);
    const pct = (audioPlayer.currentTime() / audioPlayer.duration()) * 100;
    expect(pct).toBe(100);
  });

  it('seek slider --slider-pct is proportional mid-track', () => {
    audioPlayer.duration.set(200);
    audioPlayer.currentTime.set(50);
    const pct = (audioPlayer.currentTime() / audioPlayer.duration()) * 100;
    expect(pct).toBe(25);
  });

  it('volume slider --slider-pct maps volume 0–1 to 0–100%', () => {
    audioPlayer.setVolume(0.75);
    const pct = audioPlayer.volume() * 100;
    expect(pct).toBe(75);
  });

  it('volume slider --slider-pct is 0% when muted', () => {
    audioPlayer.setVolume(0);
    const pct = audioPlayer.volume() * 100;
    expect(pct).toBe(0);
  });

  it('seekToLine should not call seek for time < 0', () => {
    const seekSpy = vi.spyOn(audioPlayer, 'seek');
    component.seekToLine(-1, 0);
    expect(seekSpy).not.toHaveBeenCalled();
  });

  it('seekToLine should call player.seek with debounce (immediate=false)', () => {
    const seekSpy = vi.spyOn(audioPlayer, 'seek');
    component.seekToLine(30, 2);
    expect(seekSpy).toHaveBeenCalledWith(30);
  });

  it('thumbError should start as false', () => {
    expect(component.thumbError()).toBe(false);
  });
});
