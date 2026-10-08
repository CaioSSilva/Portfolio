import { Injectable, signal, computed, effect, untracked } from '@angular/core';
import { FileItem } from '../../../core/models/file';
import { LrcLine, LrclibResponse } from '../../../core/models/music';
import { AudioPlayer } from './audio-player';

const LRCLIB_BASE = 'https://lrclib.net/api/get';

@Injectable({ providedIn: 'root' })
export class LyricsService {
  readonly lines = signal<LrcLine[]>([]);
  readonly isLoading = signal(false);
  readonly hasLyrics = signal(false);
  readonly isPlainOnly = signal(false);

  readonly activeLine = computed(() => {
    const lns = this.lines();
    if (!lns.length) return -1;
    const t = this._player.currentTime();
    let lo = 0;
    let hi = lns.length - 1;
    let idx = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1;
      if (lns[mid].time <= t) {
        idx = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return idx;
  });

  private _lastFetchedUrl: string | undefined = undefined;
  private _player: AudioPlayer;

  constructor(player: AudioPlayer) {
    this._player = player;

    effect(() => {
      const track = player.currentTrack();
      const duration = player.duration();
      untracked(() => {
        if (!track) {
          this._reset();
          return;
        }
        if (track.url !== this._lastFetchedUrl && duration > 0 && isFinite(duration)) {
          this._fetchForTrack(track, duration);
        }
      });
    });
  }

  private _reset(): void {
    this.lines.set([]);
    this.hasLyrics.set(false);
    this.isPlainOnly.set(false);
    this._lastFetchedUrl = undefined;
  }

  private async _fetchForTrack(track: FileItem, duration: number): Promise<void> {
    this._lastFetchedUrl = track.url;
    this.lines.set([]);
    this.hasLyrics.set(false);
    this.isPlainOnly.set(false);
    this.isLoading.set(true);

    try {
      const data = await this._fetchWithFallback(track.name, duration);

      if (data?.syncedLyrics) {
        this.lines.set(this._parseLRC(data.syncedLyrics));
        this.isPlainOnly.set(false);
        this.hasLyrics.set(true);
      } else if (data?.plainLyrics) {
        this.lines.set(
          data.plainLyrics
            .split('\n')
            .map((text: string) => ({ time: -1, text: text.trim() }))
            .filter((l: LrcLine) => l.text.length > 0)
        );
        this.isPlainOnly.set(true);
        this.hasLyrics.set(true);
      }
    } catch {
    } finally {
      this.isLoading.set(false);
    }
  }

  private async _fetchWithFallback(name: string, duration?: number): Promise<LrclibResponse | null> {
    const clean = name.replace(/\.[^.]+$/, '').trim();
    const query = clean.replace(' - ', ' ');
    const params = new URLSearchParams({ q: query });
    if (duration && isFinite(duration) && duration > 0) {
      params.set('duration', Math.round(duration).toString());
    }
    const res = await fetch(`${LRCLIB_BASE.replace('/get', '/search')}?${params}`);
    if (!res.ok) return null;
    const results: LrclibResponse[] = await res.json();
    return results.find(r => r.syncedLyrics != null && r.syncedLyrics.trim().length > 0)
      ?? results.find(r => r.plainLyrics != null && r.plainLyrics.trim().length > 0)
      ?? null;
  }

  private _parseLRC(lrc: string): LrcLine[] {
    const re = /\[(\d+):(\d+(?:\.\d+)?)\](.*)/;
    return lrc
      .split('\n')
      .map((line) => re.exec(line))
      .filter((m): m is RegExpExecArray => m !== null)
      .map((m) => ({
        time: parseInt(m[1], 10) * 60 + parseFloat(m[2]),
        text: m[3].trim(),
      }));
  }
}
