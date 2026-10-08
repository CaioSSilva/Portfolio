import { Injectable, signal, computed, effect, inject, untracked } from '@angular/core';
import { FileItem } from '../models/file';
import { LrcLine, LrclibResponse } from '../models/music';
import { AudioPlayer } from './audio-player';

const LRCLIB_BASE = 'https://lrclib.net/api/get';

@Injectable({ providedIn: 'root' })
export class LyricsService {
  private readonly player = inject(AudioPlayer);

  readonly lines = signal<LrcLine[]>([]);
  readonly isLoading = signal(false);
  readonly hasLyrics = signal(false);
  readonly isPlainOnly = signal(false);

  readonly activeLine = computed(() => {
    const lines = this.lines();
    if (!lines.length) return -1;
    const currentTime = this.player.currentTime();
    let low = 0;
    let high = lines.length - 1;
    let activeIndex = -1;
    while (low <= high) {
      const mid = (low + high) >>> 1;
      if (lines[mid].time <= currentTime) {
        activeIndex = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    return activeIndex;
  });

  private abortController: AbortController | null = null;
  private lastFetchedUrl: string | undefined = undefined;

  constructor() {
    effect(() => {
      const track = this.player.currentTrack();
      const duration = this.player.duration();
      untracked(() => {
        if (!track) {
          this.cancelPendingFetch();
          this.reset();
          return;
        }
        if (track.url !== this.lastFetchedUrl && duration > 0 && isFinite(duration)) {
          this.fetchForTrack(track, duration);
        }
      });
    });
  }

  private cancelPendingFetch(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  private reset(): void {
    this.lines.set([]);
    this.hasLyrics.set(false);
    this.isPlainOnly.set(false);
    this.lastFetchedUrl = undefined;
  }

  private async fetchForTrack(track: FileItem, duration: number): Promise<void> {
    this.cancelPendingFetch();
    this.lastFetchedUrl = track.url;
    const controller = new AbortController();
    this.abortController = controller;
    this.resetLyrics();
    try {
      const data = await this.fetchWithFallback(track.name, duration, controller.signal);
      if (!controller.signal.aborted) this.applyLyricsData(data);
    } catch (error) {
      if ((error as Error)?.name === 'AbortError') return;
    } finally {
      this.isLoading.set(false);
      if (!controller.signal.aborted) this.abortController = null;
    }
  }

  private resetLyrics(): void {
    this.lines.set([]);
    this.hasLyrics.set(false);
    this.isPlainOnly.set(false);
    this.isLoading.set(true);
  }

  private applyLyricsData(data: LrclibResponse | null): void {
    if (data?.syncedLyrics) {
      this.lines.set(this.parseLRC(data.syncedLyrics));
      this.isPlainOnly.set(false);
      this.hasLyrics.set(true);
    } else if (data?.plainLyrics) {
      this.lines.set(
        data.plainLyrics
          .split('\n')
          .map((text: string) => ({ time: -1, text: text.trim() }))
          .filter((line: LrcLine) => line.text.length > 0),
      );
      this.isPlainOnly.set(true);
      this.hasLyrics.set(true);
    }
  }

  private async fetchWithFallback(
    name: string,
    duration?: number,
    signal?: AbortSignal,
  ): Promise<LrclibResponse | null> {
    const clean = name.replace(/\.[^.]+$/, '').trim();
    const query = clean.replace(' - ', ' ');
    const params = new URLSearchParams({ q: query });
    if (duration && isFinite(duration) && duration > 0) {
      params.set('duration', Math.round(duration).toString());
    }
    const response = await fetch(`${LRCLIB_BASE.replace('/get', '/search')}?${params}`, { signal });
    if (!response.ok) return null;
    const results: LrclibResponse[] = await response.json();
    return (
      results.find((entry) => entry.syncedLyrics != null && entry.syncedLyrics.trim().length > 0) ??
      results.find((entry) => entry.plainLyrics != null && entry.plainLyrics.trim().length > 0) ??
      null
    );
  }

  private parseLRC(lrc: string): LrcLine[] {
    const re = /\[(\d+):(\d+(?:\.\d+)?)\](.*)/;
    return lrc
      .split('\n')
      .map((line) => re.exec(line))
      .filter((match): match is RegExpExecArray => match !== null)
      .map((match) => ({
        time: parseInt(match[1], 10) * 60 + parseFloat(match[2]),
        text: match[3].trim(),
      }));
  }
}
