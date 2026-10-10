import { Injectable, inject } from '@angular/core';
import { Theme } from './theme';
import { Settings } from './settings';
import { Sound } from './sound';
import { SystemTips } from './system-tips';
import { NotificationService } from './notification';
import {
  HermesAction,
  SetThemePayload,
  SetWallpaperPayload,
  SetSizePayload,
  PlaySoundPayload,
  ShowNotificationPayload,
} from '../models/hermes-action';

@Injectable({ providedIn: 'root' })
export class HermesSystemActionsService {
  private readonly theme = inject(Theme);
  private readonly settings = inject(Settings);
  private readonly sound = inject(Sound);
  private readonly systemTips = inject(SystemTips);
  private readonly notifications = inject(NotificationService);

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
      case 'show_notification':
        this.showNotification(action);
        break;
      default:
        this.dispatchToggleOrTipAction(action);
    }
  }

  private dispatchToggleOrTipAction(action: HermesAction): void {
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
      case 'toggle_voice_feedback':
        this.settings.toggleAgentSpeakReplies();
        break;
      case 'show_system_tip':
        this.systemTips.showRandomTip();
        break;
      case 'clear_notifications':
        this.notifications.clearHistory();
        break;
      case 'toggle_notification_panel':
        this.notifications.togglePanel();
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

  private showNotification(action: HermesAction): void {
    const payload = action.payload as ShowNotificationPayload | undefined;
    if (!payload?.title || !payload?.message) throw new Error('Missing notification content');
    this.notifications.show({
      title: payload.title,
      message: payload.message,
      icon: payload.icon || 'fas fa-info-circle',
    });
  }
}
