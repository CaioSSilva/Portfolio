import {
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  computed,
  effect,
  untracked,
  ChangeDetectionStrategy,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { Base, ProcessData } from '../../core/models/base';
import { AUDIO_EXTENSIONS, FileItem } from '../../core/models/file';
import { LanguageService } from '../../core/services/language';
import { FileSystem } from '../../core/services/file-system';
import { AudioPlayer } from '../../core/services/audio-player';
import { LyricsService } from '../../core/services/lyrics.service';
import { ScreenService } from '../../core/services/screen';

@Component({
  selector: 'app-musics',
  standalone: true,
  imports: [NgClass],
  templateUrl: './musics.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './musics.scss',
})
export class Musics extends Base {
  private readonly fileSystem = inject(FileSystem);
  private readonly hostEl = inject(ElementRef<HTMLElement>);
  private readonly screen = inject(ScreenService);
  private readonly destroyRef = inject(DestroyRef);
  readonly lang = inject(LanguageService);
  readonly player = inject(AudioPlayer);
  readonly lyrics = inject(LyricsService);

  private isUserScrolling = false;
  private scrollResumeTimer: ReturnType<typeof setTimeout> | null = null;

  readonly isNarrow = signal(false);
  readonly isSidebarOpen = signal(!this.screen.isMobile());
  readonly showLyrics = signal(false);
  readonly musicLibrary = signal<FileItem[]>([]);
  readonly isLibraryLoaded = signal(false);
  readonly thumbError = signal(false);
  readonly isSeeking = signal(false);
  readonly seekPreview = signal(0);

  readonly fileName = computed(() => this.player.currentTrack()?.name || '---');
  readonly displayTime = computed(() =>
    this.isSeeking() ? this.seekPreview() : this.player.currentTime(),
  );

  constructor() {
    super();
    this.initResizeObserver();
    this.destroyRef.onDestroy(() => this.stopOnDestroy());

    effect(() => {
      if (!this.fileSystem.isLoaded()) {
        this.fileSystem.ensureLoaded();
        return;
      }
      if (!this.isLibraryLoaded()) {
        this.loadLibrary();
        return;
      }

      const external = this.data();
      if (external) {
        this.playExternalTrack(external);
      }
    });

    effect(() => {
      this.player.currentTrack();
      this.thumbError.set(false);
    });

    effect(() => {
      const activeLineIndex = this.lyrics.activeLine();
      if (activeLineIndex < 0 || !this.showLyrics() || this.isUserScrolling) return;
      const lineElement = document.getElementById(`lyric-line-${activeLineIndex}`);
      lineElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  seekToLine(time: number, lineIndex: number): void {
    if (time < 0) return;
    this.isUserScrolling = true;
    if (this.scrollResumeTimer) clearTimeout(this.scrollResumeTimer);
    this.scrollResumeTimer = setTimeout(() => {
      this.isUserScrolling = false;
      this.scrollResumeTimer = null;
    }, 1500);
    this.player.seek(time);
    const lineElement = document.getElementById(`lyric-line-${lineIndex}`);
    lineElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  onLyricsScroll(): void {
    this.isUserScrolling = true;
    if (this.scrollResumeTimer) clearTimeout(this.scrollResumeTimer);
    this.scrollResumeTimer = setTimeout(() => {
      this.isUserScrolling = false;
      this.scrollResumeTimer = null;
    }, 1500);
  }

  private initResizeObserver(): void {
    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => this.handleResize(entries));
    observer.observe(this.hostEl.nativeElement);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  private handleResize(entries: ResizeObserverEntry[]): void {
    const width = entries[0]?.contentRect.width ?? 0;
    const narrow = width > 0 && width < 680;
    this.isNarrow.set(narrow);
    if (narrow && !this.screen.isMobile()) {
      this.isSidebarOpen.set(false);
    }
  }

  private playExternalTrack(external: ProcessData | string): void {
    const url = (typeof external === 'string' ? external : external.url) ?? '';
    if (!url) return;

    untracked(() => {
      let track = this.musicLibrary().find((track) => track.url === url);
      if (!track) {
        track = {
          id: `ext-${Date.now()}`,
          name: decodeURIComponent(url.split('/').pop() || 'Unknown'),
          type: 'file',
          icon: 'fas fa-music',
          url,
        };
        this.musicLibrary.update((prev) => [...prev, track!]);
      }
      queueMicrotask(() => this.player.play(track!, this.musicLibrary()));
    });
  }

  loadLibrary(): void {
    const files = this.fileSystem.getFilesByExtensions(AUDIO_EXTENSIONS);
    this.musicLibrary.set(files);

    if (files.length > 0) {
      this.player.trackList.set(files);
    }

    this.isLibraryLoaded.set(true);
  }

  handleVolume(event: Event): void {
    const volume =
      (event.target as HTMLInputElement).valueAsNumber ??
      parseFloat((event.target as HTMLInputElement).value);
    this.player.setVolume(volume);
  }

  onSeekStart(event: Event): void {
    this.isSeeking.set(true);
    this.seekPreview.set((event.target as HTMLInputElement).valueAsNumber);
  }

  onSeekMove(event: Event): void {
    this.seekPreview.set((event.target as HTMLInputElement).valueAsNumber);
    this.player.updateSeekDirection(this.seekPreview());
  }

  onSeekEnd(event: Event): void {
    const seekTime = (event.target as HTMLInputElement).valueAsNumber;
    this.isSeeking.set(false);
    this.player.seek(seekTime, true);
  }

  formatTime(time: number): string {
    if (isNaN(time) || !isFinite(time)) return '0:00';
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }

  private stopOnDestroy(): void {
    if (this.scrollResumeTimer) clearTimeout(this.scrollResumeTimer);
    this.player.stop();
  }
}
