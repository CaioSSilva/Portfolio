import {
  Component,
  inject,
  signal,
  computed,
  effect,
  ChangeDetectionStrategy,
} from '@angular/core';
import { AudioPlayer } from '../../core/services/audio-player';
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
  private readonly apps = inject(Apps);
  private readonly notifications = inject(NotificationService);
  readonly player = inject(AudioPlayer);
  readonly lang = inject(LanguageService);

  readonly widgetThumbError = signal(false);
  readonly isSeeking = signal(false);
  readonly seekPreview = signal(0);
  readonly displayTime = computed(() =>
    this.isSeeking() ? this.seekPreview() : this.player.currentTime(),
  );

  constructor() {
    effect(() => {
      this.player.currentTrack();
      this.widgetThumbError.set(false);
    });
  }

  openPlayer(): void {
    const app = this.apps.appsDefinition().find((appDef) => appDef.id === 'musics');
    if (app) {
      this.apps.openApp(app);
      this.notifications.closePanel();
    }
  }

  onSeekStart(event: Event): void {
    this.isSeeking.set(true);
    this.seekPreview.set((event.target as HTMLInputElement).valueAsNumber);
  }

  onSeekMove(event: Event): void {
    const seekTime = (event.target as HTMLInputElement).valueAsNumber;
    this.seekPreview.set(seekTime);
    this.player.updateSeekDirection(seekTime);
  }

  onSeekEnd(event: Event): void {
    const seekTime = (event.target as HTMLInputElement).valueAsNumber;
    this.isSeeking.set(false);
    this.player.seek(seekTime);
  }

  formatTime(time: number): string {
    if (isNaN(time) || !isFinite(time)) return '0:00';
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }
}
