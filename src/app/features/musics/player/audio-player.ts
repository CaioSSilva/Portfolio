import { Injectable, signal } from '@angular/core';
import { FileItem } from '../../../core/models/file';

@Injectable({ providedIn: 'root' })
export class AudioPlayer {
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

  constructor() {
    this.audio.crossOrigin = 'anonymous';
    this.setupListeners();
  }

  private setupListeners() {
    const a = this.audio;

    a.ontimeupdate = () => this.currentTime.set(a.currentTime);
    a.onloadedmetadata = () => this.duration.set(a.duration);
    a.onplay = () => this.isPlaying.set(true);
    a.onpause = () => this.isPlaying.set(false);
    a.onended = () => this.nextTrack();

    a.onloadstart = () => {
      this.isLoading.set(true);
      this.hasError.set(false);
    };
    a.oncanplay = () => this.isLoading.set(false);
    a.onwaiting = () => this.isLoading.set(true);

    a.onerror = () => {
      if (a.src) {
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    };
  }

  async play(track: FileItem, playlist?: FileItem[]) {
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

  togglePlay() {
    if (!this.audio.src) return;
    this.isPlaying() ? this.audio.pause() : this.audio.play().catch(() => {});
  }

  stop() {
    this.stopPlayback();
    this.currentTrack.set(null);
  }

  private stopPlayback() {
    this.audio.pause();
    this.audio.src = '';
    this.isPlaying.set(false);
    this.isLoading.set(false);
  }

  nextTrack() {
    const list = this.trackList();
    const idx = list.findIndex((t) => t.url === this.currentTrack()?.url);
    if (idx !== -1 && idx < list.length - 1) this.play(list[idx + 1]);
  }

  prevTrack() {
    const list = this.trackList();
    const idx = list.findIndex((t) => t.url === this.currentTrack()?.url);
    idx > 0 ? this.play(list[idx - 1]) : (this.audio.currentTime = 0);
  }

  seek(time: number) {
    if (!isNaN(time) && isFinite(time)) {
      this.audio.currentTime = time;
    }
  }

  setVolume(val: number) {
    const clamped = Math.min(Math.max(val, 0), 1);
    this.volume.set(clamped);
    this.audio.volume = clamped;
    this.isMuted.set(clamped === 0);
  }

  toggleMute() {
    if (this.isMuted()) {
      this.setVolume(this.lastVolume || 1);
    } else {
      this.lastVolume = this.volume();
      this.setVolume(0);
    }
  }
}
