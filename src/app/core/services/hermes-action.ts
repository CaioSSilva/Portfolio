import { Injectable, inject } from '@angular/core';
import { LanguageService } from './language';
import { HermesAppActionsService } from './hermes-app-actions';
import { HermesSystemActionsService } from './hermes-system-actions';
import { HermesMediaActionsService } from './hermes-media-actions';
import { HermesInfoActionsService } from './hermes-info-actions';
import {
  HermesAction,
  HermesActionType,
  SetLanguagePayload,
  ParseActionResult,
} from '../models/hermes-action';

const APP_ACTION_TYPES: HermesActionType[] = [
  'open_app',
  'close_app',
  'open_file',
  'photos_open_photo',
  'docs_open_document',
  'minimize_all',
  'close_all_apps',
  'focus_app',
  'browser_open_url',
  'browser_search',
  'terminal_exec',
  'files_search',
  'read_file_content',
];
const MEDIA_ACTION_TYPES: HermesActionType[] = [
  'music_play_pause',
  'music_next',
  'music_prev',
  'music_stop',
  'music_play_track',
  'music_set_volume',
  'music_toggle_mute',
  'music_seek',
  'music_get_current',
];
const SYSTEM_ACTION_TYPES: HermesActionType[] = [
  'set_theme',
  'toggle_theme',
  'set_wallpaper',
  'set_dock_size',
  'set_desktop_size',
  'toggle_sounds',
  'play_sound',
  'toggle_auto_hide_dock',
  'toggle_tips',
  'toggle_agent_mode',
  'toggle_voice_feedback',
  'show_system_tip',
  'clear_notifications',
  'toggle_notification_panel',
  'show_notification',
];

@Injectable({ providedIn: 'root' })
export class HermesActionService {
  private readonly lang = inject(LanguageService);
  private readonly appActions = inject(HermesAppActionsService);
  private readonly systemActions = inject(HermesSystemActionsService);
  private readonly mediaActions = inject(HermesMediaActionsService);
  private readonly infoActions = inject(HermesInfoActionsService);

  parseActions(text: string): ParseActionResult {
    const actions: HermesAction[] = [];
    const actionRegex = /<!--\s*caios:action\s*([\s\S]*?)\s*-->/g;
    const cleanText = text
      .replace(actionRegex, (fullMatch, jsonStr) => {
        try {
          const parsed = JSON.parse(jsonStr) as HermesAction;
          if (parsed && typeof parsed.type === 'string') {
            actions.push(parsed);
          }
        } catch {}
        return '';
      })
      .trim();

    return { cleanText, actions };
  }

  execute(action: HermesAction): void {
    if (!action?.type) return;

    try {
      this.dispatchAction(action);
    } catch {
      const errors = this.lang.t().errors;
      this.infoActions.showError(errors.systemError, errors.actionExecutionFailed);
    }
  }

  private dispatchAction(action: HermesAction): void {
    if (APP_ACTION_TYPES.includes(action.type)) {
      this.appActions.execute(action);
      return;
    }
    if (MEDIA_ACTION_TYPES.includes(action.type)) {
      this.mediaActions.execute(action);
      return;
    }
    if (SYSTEM_ACTION_TYPES.includes(action.type)) {
      this.systemActions.execute(action);
      return;
    }

    if (action.type === 'get_system_status') {
      this.infoActions.getSystemStatus();
      return;
    }
    if (action.type === 'set_language') {
      this.setLanguageAction(action);
      return;
    }
    throw new Error(`Unknown action type: ${action.type}`);
  }

  private setLanguageAction(action: HermesAction): void {
    const payload = action.payload as SetLanguagePayload | undefined;
    if (payload?.lang !== 'pt' && payload?.lang !== 'en') throw new Error('Invalid language');
    this.lang.setLanguage(payload.lang);
  }
}
