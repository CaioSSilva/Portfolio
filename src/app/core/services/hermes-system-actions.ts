import { Injectable, inject } from '@angular/core';
import { Theme } from './theme';
import { Settings } from './settings';
import { Sound } from './sound';
import { AudioPlayer } from './audio-player';
import { FileSystem } from './file-system';
import {
  HermesAction,
  SetThemePayload,
  SetWallpaperPayload,
  SetSizePayload,
  PlaySoundPayload,
  MusicPlayTrackPayload,
} from '../models/hermes-action';
import { AUDIO_EXTENSIONS } from '../models/file';

@Injectable({ providedIn: 'root' })
export class HermesSystemActionsService {
  private readonly theme = inject(Theme);
  private readonly settings = inject(Settings);
  private readonly sound = inject(Sound);
  private readonly audioPlayer = inject(AudioPlayer);
  private readonly fileSystem = inject(FileSystem);

  execute(action: HermesAction): void {
    switch (action.type) {
      case 'set_theme':
        this.setTheme(action);
        break;
      case 'toggle_theme':
        this.theme.toggle();
        break;
      case 'set_wallpaper':
        this.setWallpaper(action);
        break;
      case 'set_dock_size':
        this.setDockSize(action);
        break;
      case 'set_desktop_size':
        this.setDesktopSize(action);
        break;
      default:
        this.dispatchToggleOrMusicAction(action);
    }
  }

  private dispatchToggleOrMusicAction(action: HermesAction): void {
    switch (action.type) {
      case 'toggle_sounds':
        this.settings.toggleSystemSounds();
        break;
      case 'play_sound':
        this.playSound(action);
        break;
      case 'toggle_auto_hide_dock':
        this.settings.toggleAutoHideDock();
        break;
      case 'toggle_tips':
        this.settings.toggleSystemTips();
        break;
      case 'toggle_agent_mode':
        this.settings.toggleAgentMode();
        break;
      default:
        this.dispatchMusicAction(action);
    }
  }

  private dispatchMusicAction(action: HermesAction): void {
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
    }
  }

  private setTheme(action: HermesAction): void {
    const payload = action.payload as SetThemePayload | undefined;
    if (typeof payload?.dark !== 'boolean') throw new Error('Invalid theme value');
    this.theme.setDark(payload.dark);
  }

  private setWallpaper(action: HermesAction): void {
    const payload = action.payload as SetWallpaperPayload | undefined;
    if (!payload?.path) throw new Error('Missing wallpaper path');
    this.settings.setWallpaper(payload.path);
  }

  private setDockSize(action: HermesAction): void {
    const payload = action.payload as SetSizePayload | undefined;
    if (typeof payload?.size !== 'number') throw new Error('Invalid dock size');
    this.settings.setDockSize(payload.size);
  }

  private setDesktopSize(action: HermesAction): void {
    const payload = action.payload as SetSizePayload | undefined;
    if (typeof payload?.size !== 'number') throw new Error('Invalid desktop size');
    this.settings.setDesktopSize(payload.size);
  }

  private playSound(action: HermesAction): void {
    const payload = action.payload as PlaySoundPayload | undefined;
    if (!payload?.sound) throw new Error('Missing sound name');
    this.sound.play(payload.sound);
  }

  private playTrack(action: HermesAction): void {
    const payload = action.payload as MusicPlayTrackPayload | undefined;
    if (!payload?.query) throw new Error('Missing music query');
    this.fileSystem.ensureLoaded().then(() => {
      const results = this.fileSystem.searchFiles(payload.query);
      const track = results.find((f) => AUDIO_EXTENSIONS.includes(
        this.fileSystem.getFileExtension(f.name),
      ));
      if (!track) throw new Error(`No track found for: ${payload.query}`);
      const playlist = this.fileSystem.getFilesByExtensions(AUDIO_EXTENSIONS);
      this.audioPlayer.play(track, playlist);
    });
  }
}
