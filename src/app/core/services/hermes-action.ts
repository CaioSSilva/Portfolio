import { Injectable, inject } from '@angular/core';
import { AppRegistry } from './app-registry';
import { ProcessManager } from './process-manager';
import { Theme } from './theme';
import { Settings } from './settings';
import { NotificationService } from './notification';
import { Sound } from './sound';
import { LanguageService } from './language';
import {
  HermesAction,
  HermesActionType,
  OpenAppPayload,
  CloseAppPayload,
  OpenFilePayload,
  SetThemePayload,
  SetWallpaperPayload,
  SetSizePayload,
  PlaySoundPayload,
  ShowNotificationPayload,
  SetLanguagePayload,
  ParseActionResult,
} from '../models/hermes-action';

const ACTION_REGEX = /<!--\s*caios:action\s*([\s\S]*?)\s*-->/g;

@Injectable({ providedIn: 'root' })
export class HermesActionService {
  private readonly appRegistry = inject(AppRegistry);
  private readonly processManager = inject(ProcessManager);
  private readonly theme = inject(Theme);
  private readonly settings = inject(Settings);
  private readonly notifications = inject(NotificationService);
  private readonly sound = inject(Sound);
  private readonly language = inject(LanguageService);

  public parseActions(text: string): ParseActionResult {
    const actions: HermesAction[] = [];
    const cleanText = text.replace(ACTION_REGEX, (_, jsonStr) => {
      try {
        const parsed = JSON.parse(jsonStr) as HermesAction;
        if (parsed && typeof parsed.type === 'string') {
          actions.push(parsed);
        }
      } catch (err) {
        console.warn('[HermesActionService] Failed to parse action JSON:', err);
      }
      return '';
    }).trim();

    return { cleanText, actions };
  }

  private readonly handlers: Record<HermesActionType, (payload: any) => void> = {
    open_app: (p: OpenAppPayload) => {
      if (!p?.app) throw new Error('Missing app');
      const app = this.appRegistry.getAppById(p.app);
      if (!app) throw new Error(`App not found: ${p.app}`);
      this.processManager.open(app, app.data);
    },
    close_app: (p: CloseAppPayload) => {
      if (!p?.app) throw new Error('Missing app');
      this.processManager.closeAllInstancesById(p.app);
    },
    open_file: (p: OpenFilePayload) => {
      if (!p?.name || !p?.url) throw new Error('Missing file info');
      this.processManager.openFile({
        id: p.name,
        name: p.name,
        type: 'file',
        icon: 'fas fa-file',
        url: p.url,
      });
    },
    set_theme: (p: SetThemePayload) => {
      if (typeof p?.dark !== 'boolean') throw new Error('Invalid theme value');
      this.theme.setDark(p.dark);
    },
    toggle_theme: () => this.theme.toggle(),
    set_wallpaper: (p: SetWallpaperPayload) => {
      if (!p?.path) throw new Error('Missing wallpaper path');
      this.settings.setWallpaper(p.path);
    },
    set_dock_size: (p: SetSizePayload) => {
      if (typeof p?.size !== 'number') throw new Error('Invalid dock size');
      this.settings.setDockSize(p.size);
    },
    set_desktop_size: (p: SetSizePayload) => {
      if (typeof p?.size !== 'number') throw new Error('Invalid desktop size');
      this.settings.setDesktopSize(p.size);
    },
    toggle_sounds: () => this.settings.toggleSystemSounds(),
    play_sound: (p: PlaySoundPayload) => {
      if (!p?.sound) throw new Error('Missing sound name');
      this.sound.play(p.sound);
    },
    show_notification: (p: ShowNotificationPayload) => {
      if (!p?.title || !p?.message) throw new Error('Missing notification content');
      this.notifications.show({
        title: p.title,
        message: p.message,
        icon: p.icon || 'fas fa-info-circle',
      });
    },
    toggle_notification_panel: () => this.notifications.togglePanel(),
    set_language: (p: SetLanguagePayload) => {
      if (p?.lang !== 'pt' && p?.lang !== 'en') throw new Error('Invalid language');
      this.language.setLanguage(p.lang);
    },
    toggle_auto_hide_dock: () => this.settings.toggleAutoHideDock(),
    toggle_tips: () => this.settings.toggleSystemTips(),
  };

  public execute(action: HermesAction): void {
    if (!action?.type) return;

    try {
      const handler = this.handlers[action.type];
      if (!handler) {
        throw new Error(`Unknown action type: ${action.type}`);
      }
      handler(action.payload);
    } catch (error) {
      console.error('[HermesActionService] Error executing action:', error);
      this.notifications.show({
        title: this.language.t().errors.systemError,
        message: this.language.t().errors.actionExecutionFailed,
        icon: 'fas fa-circle-exclamation',
      });
    }
  }
}
