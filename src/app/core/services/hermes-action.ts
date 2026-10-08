import { Injectable, inject } from '@angular/core';
import { NotificationService } from './notification';
import { LanguageService } from './language';
import { HermesAppActionsService } from './hermes-app-actions';
import { HermesSystemActionsService } from './hermes-system-actions';
import {
  HermesAction,
  HermesActionType,
  ShowNotificationPayload,
  SetLanguagePayload,
  ParseActionResult,
} from '../models/hermes-action';

const ACTION_REGEX = /<!--\s*caios:action\s*([\s\S]*?)\s*-->/g;

@Injectable({ providedIn: 'root' })
export class HermesActionService {
  private readonly notifications = inject(NotificationService);
  private readonly lang = inject(LanguageService);
  private readonly appActions = inject(HermesAppActionsService);
  private readonly systemActions = inject(HermesSystemActionsService);

  parseActions(text: string): ParseActionResult {
    const actions: HermesAction[] = [];
    const cleanText = text
      .replace(ACTION_REGEX, (_, jsonStr) => {
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
      this.notifications.show({
        title: this.lang.t().errors.systemError,
        message: this.lang.t().errors.actionExecutionFailed,
        icon: 'fas fa-circle-exclamation',
      });
    }
  }

  private dispatchAction(action: HermesAction): void {
    const appTypes: HermesActionType[] = ['open_app', 'close_app', 'open_file'];
    const systemTypes: HermesActionType[] = [
      'set_theme',
      'toggle_theme',
      'set_wallpaper',
      'set_dock_size',
      'set_desktop_size',
      'toggle_sounds',
      'play_sound',
      'toggle_auto_hide_dock',
      'toggle_tips',
    ];

    if (appTypes.includes(action.type)) {
      this.appActions.execute(action);
      return;
    }
    if (systemTypes.includes(action.type)) {
      this.systemActions.execute(action);
      return;
    }

    this.dispatchMiscAction(action);
  }

  private dispatchMiscAction(action: HermesAction): void {
    if (action.type === 'show_notification') {
      this.showNotificationAction(action);
      return;
    }
    if (action.type === 'toggle_notification_panel') {
      this.notifications.togglePanel();
      return;
    }
    if (action.type === 'set_language') {
      this.setLanguageAction(action);
      return;
    }
    throw new Error(`Unknown action type: ${action.type}`);
  }

  private showNotificationAction(action: HermesAction): void {
    const payload = action.payload as ShowNotificationPayload | undefined;
    if (!payload?.title || !payload?.message) throw new Error('Missing notification content');
    this.notifications.show({
      title: payload.title as string,
      message: payload.message as string,
      icon: (payload.icon as string | undefined) || 'fas fa-info-circle',
    });
  }

  private setLanguageAction(action: HermesAction): void {
    const payload = action.payload as SetLanguagePayload | undefined;
    if (payload?.lang !== 'pt' && payload?.lang !== 'en') throw new Error('Invalid language');
    this.lang.setLanguage(payload.lang);
  }
}
