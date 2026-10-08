import { Component, inject, signal, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { AudioPlayer } from '../../features/musics/player/audio-player';
import { LanguageService } from '../../core/services/language';
import { Apps } from '../../core/services/apps';
import { NotificationService } from '../../core/services/notification';

@Component({
  selector: 'app-music-widget',
  imports: [],
  templateUrl: './music-widget.html',
  styleUrl: './music-widget.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MusicWidget {
  readonly player = inject(AudioPlayer);
  readonly lang = inject(LanguageService);
  private readonly apps = inject(Apps);
  private readonly notifService = inject(NotificationService);

  readonly widgetThumbError = signal(false);

  constructor() {
    effect(() => {
      this.player.currentTrack();
      this.widgetThumbError.set(false);
    });
  }
  readonly isSeeking = signal(false);
  readonly seekPreview = signal(0);
  readonly displayTime = computed(() =>
    this.isSeeking() ? this.seekPreview() : this.player.currentTime()
  );

  openPlayer() {
    const app = this.apps.appsDefinition().find((a) => a.id === 'musics');
    if (app) {
      this.apps.openApp(app);
      this.notifService.closePanel();
    }
  }

  onSeekStart(e: Event) {
    this.isSeeking.set(true);
    this.seekPreview.set((e.target as HTMLInputElement).valueAsNumber);
  }

  onSeekMove(e: Event) {
    const val = (e.target as HTMLInputElement).valueAsNumber;
    this.seekPreview.set(val);
    this.player.updateSeekDirection(val);
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
}
