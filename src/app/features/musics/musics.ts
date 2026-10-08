import { Component, ElementRef, OnDestroy, inject, signal, computed, effect, ChangeDetectionStrategy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Base, ProcessData } from '../../core/models/base';
import { AUDIO_EXTENSIONS, FileItem } from '../../core/models/file';
import { Apps } from '../../core/services/apps';
import { LanguageService } from '../../core/services/language';
import { FileSystem } from '../../core/services/file-system';
import { AudioPlayer } from './player/audio-player';
import { ScreenService } from '../../core/services/screen';

@Component({
  selector: 'app-musics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './musics.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './musics.scss',
})
export class Musics extends Base implements OnDestroy {
  lang = inject(LanguageService);
  apps = inject(Apps);
  player = inject(AudioPlayer);
  private fs = inject(FileSystem);
  private ngZone = inject(NgZone);
  private hostEl = inject(ElementRef<HTMLElement>);
  private screen = inject(ScreenService);

  readonly isNarrow = signal(false);
  private resizeObserver: ResizeObserver | null = null;

  readonly isSidebarOpen = signal(true);
  readonly musicLibrary = signal<FileItem[]>([]);
  readonly isLibraryLoaded = signal(false);
  readonly fileName = computed(() => this.player.currentTrack()?.name || '---');

  readonly isSeeking = signal(false);
  readonly seekPreview = signal(0);
  readonly displayTime = computed(() =>
    this.isSeeking() ? this.seekPreview() : this.player.currentTime()
  );

  constructor() {
    super();
    this.initResizeObserver();

    effect(() => {
      if (!this.fs.isLoaded()) {
        this.fs.ensureLoaded();
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
  }

  private initResizeObserver(): void {
    if (typeof ResizeObserver === 'undefined') return;

    this.resizeObserver = new ResizeObserver((entries) => {
      this.handleResize(entries);
    });
    this.resizeObserver.observe(this.hostEl.nativeElement);
  }

  private handleResize(entries: ResizeObserverEntry[]): void {
    const w = entries[0]?.contentRect.width ?? 0;
    const narrow = w > 0 && w < 680;
    this.ngZone.run(() => {
      this.isNarrow.set(narrow);
      if (narrow && !this.screen.isMobile()) {
        this.isSidebarOpen.set(false);
      }
    });
  }

  private playExternalTrack(external: ProcessData | string): void {
    const url = (typeof external === 'string' ? external : external.url) ?? '';
    if (!url) return;

    let track = this.musicLibrary().find((m) => m.url === url);
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
  }

  loadLibrary() {
    const files = this.fs.getFilesByExtensions(AUDIO_EXTENSIONS);
    this.musicLibrary.set(files);

    if (files.length > 0) {
      this.player.trackList.set(files);
    }

    this.isLibraryLoaded.set(true);
  }

  goToFiles() {
    const filesApp = this.apps.appsDefinition().find((a) => a.id === 'files');
    if (filesApp) this.apps.openApp(filesApp);
  }

  handleVolume(e: Event) {
    const val = (e.target as HTMLInputElement).valueAsNumber ?? parseFloat((e.target as HTMLInputElement).value);
    this.player.setVolume(val);
  }

  onSeekStart(e: Event) {
    this.isSeeking.set(true);
    this.seekPreview.set((e.target as HTMLInputElement).valueAsNumber);
  }

  onSeekMove(e: Event) {
    this.seekPreview.set((e.target as HTMLInputElement).valueAsNumber);
    this.player.updateSeekDirection(this.seekPreview());
  }

  onSeekEnd(e: Event) {
    const val = (e.target as HTMLInputElement).valueAsNumber;
    this.isSeeking.set(false);
    this.player.seek(val);
  }

  formatTime(time: number): string {
    if (isNaN(time) || !isFinite(time)) return '0:00';
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.player.stop();
  }
}
