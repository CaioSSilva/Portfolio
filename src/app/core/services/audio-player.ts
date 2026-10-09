import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { FileItem } from '../models/file';
import { DiscSpinState } from '../models/music';

@Injectable({ providedIn: 'root' })
export class AudioPlayer {
  private readonly destroyRef = inject(DestroyRef);
  private readonly audio = new Audio();
  private lastVolume = 1;

  readonly currentTrack = signal<FileItem | null>(null);
  readonly trackList = signal<FileItem[]>([]);
  readonly isPlaying = signal(false);
  readonly isLoading = signal(false);
  readonly hasError = signal(false);

  readonly currentTime = signal(0);
  readonly duration = signal(0);
  readonly volume = signal(1);
  readonly isMuted = signal(false);
  readonly discSpinState = signal<DiscSpinState>('paused');

  private lastSeekTime = 0;
  private seekResetTimer: ReturnType<typeof setTimeout> | null = null;
  private seekDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private isSeeking = false;

  constructor() {
    this.setupListeners();
    this.destroyRef.onDestroy(() => this.stop());
  }

  private setupListeners(): void {
    this.audio.crossOrigin = 'anonymous';
    this.setupPlaybackListeners();
    this.setupLoadListeners();
  }

  private setupPlaybackListeners(): void {
    this.audio.ontimeupdate = () => {
      if (!this.isSeeking) this.currentTime.set(this.audio.currentTime);
    };
    this.audio.onseeked = () => {
      this.currentTime.set(this.audio.currentTime);
      this.isSeeking = false;
    };
    this.audio.onloadedmetadata = () => this.duration.set(this.audio.duration);
    this.audio.onplay = () => {
      this.isPlaying.set(true);
      if (!this.seekResetTimer) this.discSpinState.set('playing');
    };
    this.audio.onpause = () => {
      this.isPlaying.set(false);
      if (!this.seekResetTimer) this.discSpinState.set('paused');
    };
    this.audio.onended = () => this.nextTrack();
  }

  private setupLoadListeners(): void {
    this.audio.onloadstart = () => {
      this.isLoading.set(true);
      this.hasError.set(false);
    };
    this.audio.oncanplay = () => this.isLoading.set(false);
    this.audio.onwaiting = () => this.isLoading.set(true);
    this.audio.onerror = () => {
      if (this.audio.src) {
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    };
  }

  async play(track: FileItem, playlist?: FileItem[]): Promise<void> {
    if (!track?.url) return;
    if (playlist) this.trackList.set(playlist);
    if (this.currentTrack()?.url === track.url && this.audio.src) {
      return this.togglePlay();
    }
    this.stopPlayback();
    this.currentTrack.set(track);
    const sanitizedUrl = encodeURI(track.url).replace(/#/g, '%23');
    this.audio.src = sanitizedUrl;
    this.audio.load();
    try {
      await this.audio.play();
    } catch {
      this.isPlaying.set(false);
      this.isLoading.set(false);
    }
  }

  togglePlay(): void {
    if (!this.audio.src) return;
    if (this.isPlaying()) {
      this.audio.pause();
    } else {
      this.audio.play().catch(() => {});
    }
  }

  stop(): void {
    this.stopPlayback();
    this.currentTrack.set(null);
  }

  private stopPlayback(): void {
    if (this.seekResetTimer) {
      clearTimeout(this.seekResetTimer);
      this.seekResetTimer = null;
    }
    if (this.seekDebounceTimer) {
      clearTimeout(this.seekDebounceTimer);
      this.seekDebounceTimer = null;
    }
    this.audio.pause();
    this.audio.src = '';
    this.isPlaying.set(false);
    this.isLoading.set(false);
    this.duration.set(0);
    this.currentTime.set(0);
  }

  nextTrack(): void {
    const list = this.trackList();
    const currentUrl = this.currentTrack()?.url;
    const trackIndex = list.findIndex((track) => track.url === currentUrl);
    if (trackIndex !== -1 && trackIndex < list.length - 1) this.play(list[trackIndex + 1]);
  }

  prevTrack(): void {
    const list = this.trackList();
    const currentUrl = this.currentTrack()?.url;
    const trackIndex = list.findIndex((track) => track.url === currentUrl);
    trackIndex > 0 ? this.play(list[trackIndex - 1]) : (this.audio.currentTime = 0);
  }

  updateSeekDirection(time: number): void {
    if (!isNaN(time) && isFinite(time)) {
      const direction: DiscSpinState =
        time >= this.lastSeekTime ? 'seeking-forward' : 'seeking-backward';
      this.lastSeekTime = time;
      this.discSpinState.set(direction);
    }
  }

  seek(time: number, immediate = false): void {
    if (isNaN(time) || !isFinite(time)) return;
    this.isSeeking = true;
    this.currentTime.set(time);
    this.updateSeekDirection(time);
    this.resetSeekState();
    this.applySeek(time, immediate);
  }

  private resetSeekState(): void {
    if (this.seekResetTimer) clearTimeout(this.seekResetTimer);
    this.seekResetTimer = setTimeout(() => {
      this.seekResetTimer = null;
      this.discSpinState.set(this.isPlaying() ? 'playing' : 'paused');
    }, 600);
  }

  private applySeek(time: number, immediate: boolean): void {
    if (this.seekDebounceTimer) clearTimeout(this.seekDebounceTimer);
    if (immediate) {
      this.audio.currentTime = time;
      return;
    }
    this.seekDebounceTimer = setTimeout(() => {
      this.seekDebounceTimer = null;
      this.audio.currentTime = time;
    }, 80);
  }

  setVolume(volume: number): void {
    const clamped = Math.min(Math.max(volume, 0), 1);
    this.volume.set(clamped);
    this.audio.volume = clamped;
    this.isMuted.set(clamped === 0);
  }

  toggleMute(): void {
    if (this.isMuted()) {
      this.setVolume(this.lastVolume || 1);
    } else {
      this.lastVolume = this.volume();
      this.setVolume(0);
    }
  }
}
