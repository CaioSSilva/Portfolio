import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { Subscription, take, timer } from 'rxjs';
import { FileItem } from '../models/file';
import { DiscSpinState } from '../models/music';

@Injectable({ providedIn: 'root' })
export class AudioPlayer {
  private readonly destroyRef = inject(DestroyRef);

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

  private readonly audio = this.createAudioElement();
  private lastVolume = 1;
  private lastSeekTime = 0;
  private seekResetTimer = Subscription.EMPTY;
  private seekDebounceTimer = Subscription.EMPTY;
  private isSeeking = false;

  constructor() {
    this.destroyRef.onDestroy(() => this.stop());
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

  private createAudioElement(): HTMLAudioElement {
    const audioElement = new Audio();
    audioElement.crossOrigin = 'anonymous';
    this.setupPlaybackListeners(audioElement);
    this.setupLoadListeners(audioElement);
    return audioElement;
  }

  private setupPlaybackListeners(audioElement: HTMLAudioElement): void {
    audioElement.ontimeupdate = () => {
      if (!this.isSeeking) this.currentTime.set(audioElement.currentTime);
    };
    audioElement.onseeked = () => {
      this.currentTime.set(audioElement.currentTime);
      this.isSeeking = false;
    };
    audioElement.onloadedmetadata = () => this.duration.set(audioElement.duration);
    audioElement.onplay = () => {
      this.isPlaying.set(true);
      if (this.seekResetTimer.closed) this.discSpinState.set('playing');
    };
    audioElement.onpause = () => {
      this.isPlaying.set(false);
      if (this.seekResetTimer.closed) this.discSpinState.set('paused');
    };
    audioElement.onended = () => this.nextTrack();
  }

  private setupLoadListeners(audioElement: HTMLAudioElement): void {
    audioElement.onloadstart = () => {
      this.isLoading.set(true);
      this.hasError.set(false);
    };
    audioElement.oncanplay = () => this.isLoading.set(false);
    audioElement.onwaiting = () => this.isLoading.set(true);
    audioElement.onerror = () => {
      if (audioElement.src) {
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    };
  }

  private stopPlayback(): void {
    this.seekResetTimer.unsubscribe();
    this.seekDebounceTimer.unsubscribe();
    this.audio.pause();
    this.audio.src = '';
    this.isPlaying.set(false);
    this.isLoading.set(false);
    this.duration.set(0);
    this.currentTime.set(0);
  }

  private resetSeekState(): void {
    this.seekResetTimer.unsubscribe();
    this.seekResetTimer = timer(600)
      .pipe(take(1))
      .subscribe(() => this.discSpinState.set(this.isPlaying() ? 'playing' : 'paused'));
  }

  private applySeek(time: number, immediate: boolean): void {
    this.seekDebounceTimer.unsubscribe();
    if (immediate) {
      this.audio.currentTime = time;
      return;
    }
    this.seekDebounceTimer = timer(80)
      .pipe(take(1))
      .subscribe(() => {
        this.audio.currentTime = time;
      });
  }
}
