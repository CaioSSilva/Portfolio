import { TestBed } from '@angular/core/testing';
import { AudioPlayer } from './audio-player';
import { FileItem } from '../../../core/models/file';

const mockTrack = (id: string, url: string): FileItem => ({
  id,
  name: `${id}.mp3`,
  type: 'file',
  icon: 'fas fa-music',
  url,
});

describe('AudioPlayer', () => {
  let service: AudioPlayer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioPlayer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have default signal values on creation', () => {
    expect(service.currentTrack()).toBeNull();
    expect(service.isPlaying()).toBe(false);
    expect(service.isLoading()).toBe(false);
    expect(service.hasError()).toBe(false);
    expect(service.volume()).toBe(1);
    expect(service.isMuted()).toBe(false);
    expect(service.currentTime()).toBe(0);
    expect(service.duration()).toBe(0);
  });

  it('should set currentTrack and trackList when play() is called with a playlist', async () => {
    const track = mockTrack('t1', '/audio/t1.mp3');
    const playlist = [track, mockTrack('t2', '/audio/t2.mp3')];
    await service.play(track, playlist);
    expect(service.currentTrack()?.id).toBe('t1');
    expect(service.trackList().length).toBe(2);
  });

  it('should do nothing when play() called with a track with no url', async () => {
    const noUrl: FileItem = { id: 'x', name: 'x', type: 'file', icon: 'file' };
    await service.play(noUrl);
    expect(service.currentTrack()).toBeNull();
  });

  it('should stop playback and clear track on stop()', async () => {
    const track = mockTrack('t1', '/audio/t1.mp3');
    await service.play(track);
    service.stop();
    expect(service.currentTrack()).toBeNull();
    expect(service.isPlaying()).toBe(false);
  });

  it('should advance to next track on nextTrack()', async () => {
    const t1 = mockTrack('t1', '/audio/t1.mp3');
    const t2 = mockTrack('t2', '/audio/t2.mp3');
    await service.play(t1, [t1, t2]);
    service.nextTrack();
    expect(service.currentTrack()?.id).toBe('t2');
  });

  it('should not advance nextTrack if already last track', async () => {
    const t1 = mockTrack('t1', '/audio/t1.mp3');
    const t2 = mockTrack('t2', '/audio/t2.mp3');
    await service.play(t2, [t1, t2]);
    service.nextTrack();
    expect(service.currentTrack()?.id).toBe('t2');
  });

  it('should go to prev track on prevTrack()', async () => {
    const t1 = mockTrack('t1', '/audio/t1.mp3');
    const t2 = mockTrack('t2', '/audio/t2.mp3');
    await service.play(t2, [t1, t2]);
    service.prevTrack();
    expect(service.currentTrack()?.id).toBe('t1');
  });

  it('should set volume and update isMuted when volume is 0', () => {
    service.setVolume(0);
    expect(service.volume()).toBe(0);
    expect(service.isMuted()).toBe(true);
  });

  it('should clamp volume between 0 and 1', () => {
    service.setVolume(5);
    expect(service.volume()).toBe(1);
    service.setVolume(-1);
    expect(service.volume()).toBe(0);
  });

  it('should toggle mute and restore previous volume', () => {
    service.setVolume(0.8);
    service.toggleMute();
    expect(service.isMuted()).toBe(true);
    expect(service.volume()).toBe(0);

    service.toggleMute();
    expect(service.isMuted()).toBe(false);
    expect(service.volume()).toBeCloseTo(0.8);
  });

  it('should set seek position on seek()', async () => {
    const track = mockTrack('t1', '/audio/t1.mp3');
    await service.play(track);
    service.seek(30);
    expect(() => service.seek(30)).not.toThrow();
  });

  it('should ignore invalid seek values', () => {
    expect(() => service.seek(NaN)).not.toThrow();
    expect(() => service.seek(Infinity)).not.toThrow();
  });

  it('should call togglePlay without throwing when no src', () => {
    expect(() => service.togglePlay()).not.toThrow();
  });

  it('seek(immediate=true) should not throw', async () => {
    const track = mockTrack('t1', '/audio/t1.mp3');
    await service.play(track);
    expect(() => service.seek(10, true)).not.toThrow();
    expect(service.currentTime()).toBe(10);
  });

  it('seek(immediate=false) should update currentTime signal immediately', async () => {
    const track = mockTrack('t1', '/audio/t1.mp3');
    await service.play(track);
    service.seek(25);
    expect(service.currentTime()).toBe(25);
  });

  it('stopPlayback via stop() should reset duration and currentTime to 0', async () => {
    const track = mockTrack('t1', '/audio/t1.mp3');
    await service.play(track);
    service['duration'].set(180);
    service['currentTime'].set(60);
    service.stop();
    expect(service.duration()).toBe(0);
    expect(service.currentTime()).toBe(0);
  });
});
