import { TestBed } from '@angular/core/testing';
import { HermesMediaActionsService } from './hermes-media-actions';
import { AudioPlayer } from './audio-player';
import { FileSystem } from './file-system';
import { ProcessManager } from './process-manager';
import { NotificationService } from './notification';
import { LanguageService } from './language';
import { FileItem } from '../models/file';
import { signal } from '@angular/core';

describe('HermesMediaActionsService', () => {
  let service: HermesMediaActionsService;
  let audioPlayerSpy: {
    togglePlay: ReturnType<typeof vi.fn>;
    nextTrack: ReturnType<typeof vi.fn>;
    prevTrack: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
    setVolume: ReturnType<typeof vi.fn>;
    toggleMute: ReturnType<typeof vi.fn>;
    seek: ReturnType<typeof vi.fn>;
    currentTrack: ReturnType<typeof signal<FileItem | null>>;
  };
  let fileSystemSpy: {
    ensureLoaded: ReturnType<typeof vi.fn>;
    searchFiles: ReturnType<typeof vi.fn>;
    getFileExtension: ReturnType<typeof vi.fn>;
  };
  let processManagerSpy: { openFile: ReturnType<typeof vi.fn> };
  let notificationSpy: { show: ReturnType<typeof vi.fn> };
  let languageSpy: { currentLang: ReturnType<typeof vi.fn>; t: ReturnType<typeof vi.fn> };

  const mockTrack: FileItem = {
    id: 'song1',
    name: 'bohemian.mp3',
    type: 'file',
    icon: 'fas fa-music',
    url: '/data/music/bohemian.mp3',
  };

  beforeEach(() => {
    audioPlayerSpy = {
      togglePlay: vi.fn(),
      nextTrack: vi.fn(),
      prevTrack: vi.fn(),
      stop: vi.fn(),
      setVolume: vi.fn(),
      toggleMute: vi.fn(),
      seek: vi.fn(),
      currentTrack: signal<FileItem | null>(null),
    };
    fileSystemSpy = {
      ensureLoaded: vi.fn().mockResolvedValue(undefined),
      searchFiles: vi.fn().mockReturnValue([mockTrack]),
      getFileExtension: vi.fn().mockReturnValue('mp3'),
    };
    processManagerSpy = { openFile: vi.fn() };
    notificationSpy = { show: vi.fn() };
    languageSpy = {
      currentLang: vi.fn().mockReturnValue('en'),
      t: vi.fn().mockReturnValue({ audioPlayer: { title: 'Music' } }),
    };

    TestBed.configureTestingModule({
      providers: [
        HermesMediaActionsService,
        { provide: AudioPlayer, useValue: audioPlayerSpy },
        { provide: FileSystem, useValue: fileSystemSpy },
        { provide: ProcessManager, useValue: processManagerSpy },
        { provide: NotificationService, useValue: notificationSpy },
        { provide: LanguageService, useValue: languageSpy },
      ],
    });

    service = TestBed.inject(HermesMediaActionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('music_play_pause calls togglePlay', () => {
    service.execute({ type: 'music_play_pause' });
    expect(audioPlayerSpy.togglePlay).toHaveBeenCalled();
  });

  it('music_next calls nextTrack', () => {
    service.execute({ type: 'music_next' });
    expect(audioPlayerSpy.nextTrack).toHaveBeenCalled();
  });

  it('music_prev calls prevTrack', () => {
    service.execute({ type: 'music_prev' });
    expect(audioPlayerSpy.prevTrack).toHaveBeenCalled();
  });

  it('music_stop calls stop', () => {
    service.execute({ type: 'music_stop' });
    expect(audioPlayerSpy.stop).toHaveBeenCalled();
  });

  it('music_set_volume sets volume between 0 and 1', () => {
    service.execute({ type: 'music_set_volume', payload: { volume: 50 } });
    expect(audioPlayerSpy.setVolume).toHaveBeenCalledWith(0.5);
  });

  it('music_set_volume throws when volume is not a number', () => {
    expect(() => service.execute({ type: 'music_set_volume', payload: {} })).toThrow(
      'Invalid volume',
    );
  });

  it('music_toggle_mute calls toggleMute', () => {
    service.execute({ type: 'music_toggle_mute' });
    expect(audioPlayerSpy.toggleMute).toHaveBeenCalled();
  });

  it('music_seek calls seek with specified time', () => {
    service.execute({ type: 'music_seek', payload: { time: 45 } });
    expect(audioPlayerSpy.seek).toHaveBeenCalledWith(45);
  });

  it('music_seek throws when time is not a number', () => {
    expect(() => service.execute({ type: 'music_seek', payload: {} })).toThrow(
      'Invalid seek time',
    );
  });

  it('music_play_track searches and opens the track', async () => {
    service.execute({ type: 'music_play_track', payload: { query: 'bohemian' } });
    await vi.waitFor(() => expect(processManagerSpy.openFile).toHaveBeenCalledWith(mockTrack));
  });

  it('music_play_track throws when query is missing', () => {
    expect(() => service.execute({ type: 'music_play_track', payload: {} })).toThrow(
      'Missing music query',
    );
  });

  describe('music_get_current', () => {
    it('shows a notification with the current track name when playing', () => {
      audioPlayerSpy.currentTrack.set(mockTrack);
      service.execute({ type: 'music_get_current' });
      expect(notificationSpy.show).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'bohemian.mp3' }),
      );
    });

    it('shows a notification with no-track message when nothing is playing', () => {
      audioPlayerSpy.currentTrack.set(null);
      service.execute({ type: 'music_get_current' });
      expect(notificationSpy.show).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'No track is currently playing.' }),
      );
    });

    it('uses Portuguese message when lang is pt', () => {
      languageSpy.currentLang.mockReturnValue('pt');
      audioPlayerSpy.currentTrack.set(null);
      service.execute({ type: 'music_get_current' });
      expect(notificationSpy.show).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Nenhuma música tocando no momento.' }),
      );
    });
  });
});
