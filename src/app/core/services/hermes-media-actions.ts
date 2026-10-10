import { Injectable, inject } from '@angular/core';
import { AudioPlayer } from './audio-player';
import { FileSystem } from './file-system';
import { ProcessManager } from './process-manager';
import { NotificationService } from './notification';
import { LanguageService } from './language';
import {
  HermesAction,
  MusicPlayTrackPayload,
  MusicSetVolumePayload,
  MusicSeekPayload,
} from '../models/hermes-action';
import { AUDIO_EXTENSIONS } from '../models/file';

@Injectable({ providedIn: 'root' })
export class HermesMediaActionsService {
  private readonly audioPlayer = inject(AudioPlayer);
  private readonly fileSystem = inject(FileSystem);
  private readonly processManager = inject(ProcessManager);
  private readonly notifications = inject(NotificationService);
  private readonly lang = inject(LanguageService);

  execute(action: HermesAction): void {
    switch (action.type) {
      case 'music_play_pause':
        this.audioPlayer.togglePlay();
        break;
      case 'music_next':
        this.audioPlayer.nextTrack();
        break;
      case 'music_prev':
        this.audioPlayer.prevTrack();
        break;
      case 'music_stop':
        this.audioPlayer.stop();
        break;
      case 'music_play_track':
        this.playTrack(action);
        break;
      case 'music_set_volume':
        this.setVolume(action);
        break;
      case 'music_toggle_mute':
        this.audioPlayer.toggleMute();
        break;
      case 'music_seek':
        this.seek(action);
        break;
      case 'music_get_current':
        this.getCurrentTrack();
        break;
    }
  }

  private setVolume(action: HermesAction): void {
    const payload = action.payload as MusicSetVolumePayload | undefined;
    if (typeof payload?.volume !== 'number') throw new Error('Invalid volume');
    this.audioPlayer.setVolume(payload.volume / 100);
  }

  private seek(action: HermesAction): void {
    const payload = action.payload as MusicSeekPayload | undefined;
    if (typeof payload?.time !== 'number') throw new Error('Invalid seek time');
    this.audioPlayer.seek(payload.time);
  }

  private getCurrentTrack(): void {
    const track = this.audioPlayer.currentTrack();
    const isPt = this.lang.currentLang() === 'pt';
    if (!track) {
      this.notifications.show({
        title: this.lang.t().audioPlayer.title,
        message: isPt ? 'Nenhuma música tocando no momento.' : 'No track is currently playing.',
        icon: 'fas fa-music',
      });
      return;
    }
    const label = isPt ? 'Tocando agora' : 'Now playing';
    this.notifications.show({
      title: label,
      message: track.name,
      icon: 'fas fa-music',
    });
  }

  private playTrack(action: HermesAction): void {
    const payload = action.payload as MusicPlayTrackPayload | undefined;
    if (!payload?.query) throw new Error('Missing music query');
    this.fileSystem.ensureLoaded().then(() => {
      const results = this.fileSystem.searchFiles(payload.query);
      const track = results.find((fileItem) =>
        AUDIO_EXTENSIONS.includes(this.fileSystem.getFileExtension(fileItem.name)),
      );
      if (!track) throw new Error(`No track found for: ${payload.query}`);
      this.processManager.openFile(track);
    });
  }
}
