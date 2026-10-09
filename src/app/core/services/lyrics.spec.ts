import { TestBed } from '@angular/core/testing';
import { LyricsService } from './lyrics';
import { AudioPlayer } from './audio-player';
import { FileItem } from '../models/file';
import { LrclibResponse } from '../models/music';

const mockTrack = (url: string, name = 'Song - Artist.mp3'): FileItem => ({
  id: '1',
  name,
  type: 'file',
  icon: 'fas fa-music',
  url,
});

const SYNCED = '[00:01.00] Hello\n[00:03.00] World';
const PLAIN = 'Hello\nWorld\n\nFoo';

const setupFetch = (body: LrclibResponse[] | null, ok = true) => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok,
    json: () => Promise.resolve(body),
  } as Response);
};

const flush = async () => {
  TestBed.flushEffects();
  await vi.advanceTimersByTimeAsync(0);
  await vi.advanceTimersByTimeAsync(0);
};

describe('LyricsService', () => {
  let service: LyricsService;
  let player: AudioPlayer;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    player = TestBed.inject(AudioPlayer);
    service = TestBed.inject(LyricsService);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with empty/false defaults', () => {
    expect(service.lines()).toEqual([]);
    expect(service.hasLyrics()).toBe(false);
    expect(service.isLoading()).toBe(false);
    expect(service.isPlainOnly()).toBe(false);
    expect(service.activeLine()).toBe(-1);
  });

  it('should parse synced lyrics and set hasLyrics=true', async () => {
    setupFetch([{ syncedLyrics: SYNCED, plainLyrics: PLAIN }]);
    TestBed.runInInjectionContext(() => {
      player.currentTrack.set(mockTrack('/song.mp3'));
      player.duration.set(200);
    });
    await flush();

    expect(service.hasLyrics()).toBe(true);
    expect(service.isPlainOnly()).toBe(false);
    expect(service.lines().length).toBe(2);
    expect(service.lines()[0]).toEqual({ time: 1, text: 'Hello' });
    expect(service.lines()[1]).toEqual({ time: 3, text: 'World' });
  });

  it('should fall back to plain lyrics when syncedLyrics is empty string', async () => {
    setupFetch([{ syncedLyrics: '', plainLyrics: PLAIN }]);
    player.currentTrack.set(mockTrack('/song2.mp3'));
    player.duration.set(200);
    await flush();

    expect(service.hasLyrics()).toBe(true);
    expect(service.isPlainOnly()).toBe(true);
    expect(service.lines().every((l) => l.time === -1)).toBe(true);
  });

  it('should fall back to plain lyrics when syncedLyrics is null', async () => {
    setupFetch([{ syncedLyrics: null, plainLyrics: PLAIN }]);
    player.currentTrack.set(mockTrack('/song3.mp3'));
    player.duration.set(200);
    await flush();

    expect(service.isPlainOnly()).toBe(true);
    expect(service.hasLyrics()).toBe(true);
  });

  it('should set hasLyrics=false when API returns empty array', async () => {
    setupFetch([]);
    player.currentTrack.set(mockTrack('/song4.mp3'));
    player.duration.set(200);
    await flush();

    expect(service.hasLyrics()).toBe(false);
  });

  it('should set hasLyrics=false when API response is not ok', async () => {
    setupFetch(null, false);
    player.currentTrack.set(mockTrack('/song5.mp3'));
    player.duration.set(200);
    await flush();

    expect(service.hasLyrics()).toBe(false);
  });

  it('should not fetch when duration is 0', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    player.currentTrack.set(mockTrack('/song6.mp3'));
    player.duration.set(0);
    TestBed.flushEffects();
    await vi.advanceTimersByTimeAsync(0);

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('should not re-fetch when same track url is already fetched', async () => {
    setupFetch([{ syncedLyrics: SYNCED, plainLyrics: PLAIN }]);
    const track = mockTrack('/unique-no-refetch.mp3');
    player.currentTrack.set(track);
    player.duration.set(200);
    await flush();

    vi.restoreAllMocks();
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);

    player.duration.set(201);
    TestBed.flushEffects();
    await vi.advanceTimersByTimeAsync(0);

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('should reset on track set to null', async () => {
    setupFetch([{ syncedLyrics: SYNCED, plainLyrics: PLAIN }]);
    player.currentTrack.set(mockTrack('/song8.mp3'));
    player.duration.set(200);
    await flush();

    player.currentTrack.set(null);
    TestBed.flushEffects();

    expect(service.hasLyrics()).toBe(false);
    expect(service.lines()).toEqual([]);
  });

  it('activeLine should return -1 when no lines', () => {
    expect(service.activeLine()).toBe(-1);
  });

  it('activeLine should return correct index via binary search', async () => {
    setupFetch([{ syncedLyrics: SYNCED, plainLyrics: PLAIN }]);
    player.currentTrack.set(mockTrack('/song9.mp3'));
    player.duration.set(200);
    await flush();

    player.currentTime.set(0.5);
    expect(service.activeLine()).toBe(-1);

    player.currentTime.set(2);
    expect(service.activeLine()).toBe(0);

    player.currentTime.set(4);
    expect(service.activeLine()).toBe(1);
  });

  it('should filter empty lines from plain lyrics', async () => {
    setupFetch([{ syncedLyrics: null, plainLyrics: 'Line 1\n\nLine 2\n' }]);
    player.currentTrack.set(mockTrack('/song10.mp3'));
    player.duration.set(200);
    await flush();

    expect(service.lines().length).toBe(2);
    expect(service.lines().every((l) => l.text.length > 0)).toBe(true);
  });
});
