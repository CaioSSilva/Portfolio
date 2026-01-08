import { Component, OnDestroy, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Base } from '../../core/models/base';
import { AUDIO_EXTENSIONS, FileItem } from '../../core/models/file';
import { Apps } from '../../core/services/apps';
import { LanguageService } from '../../core/services/language';
import { FileSystem } from '../../core/services/file-system';
import { AudioPlayer } from './player/audio-player';

@Component({
  selector: 'app-musics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './musics.html',
  styleUrl: './musics.scss',
})
export class Musics extends Base implements OnDestroy {
  lang = inject(LanguageService);
  apps = inject(Apps);
  player = inject(AudioPlayer);
  private fs = inject(FileSystem);

  readonly isSidebarOpen = signal(true);
  readonly musicLibrary = signal<FileItem[]>([]);
  readonly isLibraryLoaded = signal(false);
  readonly fileName = computed(() => this.player.currentTrack()?.name || '---');

  constructor() {
    super();

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
      if (!external) return;

      const url = (typeof external === 'string' ? external : external.url) ?? '';
      if (!url) return;

      let track = this.musicLibrary().find((m) => m.url === url);
      if (!track) {
        track = {
          name: decodeURIComponent(url.split('/').pop() || 'Unknown'),
          url,
          id: `ext-${Date.now()}`,
        } as FileItem;
        this.musicLibrary.update((prev) => [...prev, track!]);
      }

      queueMicrotask(() => this.player.play(track!, this.musicLibrary()));
    });
  }

  async loadLibrary() {
    const files = await this.fs.getFilesByExtensions(AUDIO_EXTENSIONS);
    this.musicLibrary.set(files);

    if (files.length > 0) {
      this.player.trackList.set(files);
    }

    this.isLibraryLoaded.set(true);
  }

  formatTime(time: number): string {
    if (isNaN(time) || !isFinite(time)) return '0:00';
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }

  handleSeek(e: Event) {
    this.player.seek((e.target as HTMLInputElement).valueAsNumber);
  }

  handleVolume(e: Event) {
    this.player.setVolume((e.target as HTMLInputElement).valueAsNumber);
  }

  goToFiles() {
    const app = this.apps.myApps().files;
    if (app) this.apps.openApp(app);
  }

  ngOnDestroy() {
    this.player.stop();
  }
}
