import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { AudioPlayer } from '../../core/services/audio-player';
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
  private readonly apps = inject(Apps);
  readonly player = inject(AudioPlayer);
  readonly lang = inject(LanguageService);

  openPlayer(): void {
    const app = this.apps.appsDefinition().find((appDef) => appDef.id === 'musics');
    if (app) this.apps.openApp(app);
  }
}
