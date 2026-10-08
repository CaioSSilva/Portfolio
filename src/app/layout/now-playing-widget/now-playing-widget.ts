import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { AudioPlayer } from '../../features/musics/player/audio-player';
import { LanguageService } from '../../core/services/language';
import { Apps } from '../../core/services/apps';

@Component({
  selector: 'app-now-playing-widget',
  standalone: true,
  imports: [],
  templateUrl: './now-playing-widget.html',
  styleUrl: './now-playing-widget.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NowPlayingWidget {
  readonly player = inject(AudioPlayer);
  readonly lang = inject(LanguageService);
  private readonly apps = inject(Apps);

  openPlayer() {
    const app = this.apps.appsDefinition().find((a) => a.id === 'musics');
    if (app) this.apps.openApp(app);
  }
}
