export type HermesActionType =
  | 'open_app'
  | 'close_app'
  | 'open_file'
  | 'set_theme'
  | 'toggle_theme'
  | 'set_wallpaper'
  | 'set_dock_size'
  | 'set_desktop_size'
  | 'toggle_sounds'
  | 'play_sound'
  | 'show_notification'
  | 'toggle_notification_panel'
  | 'set_language'
  | 'toggle_auto_hide_dock'
  | 'toggle_tips'
  | 'toggle_agent_mode'
  | 'music_play_pause'
  | 'music_next'
  | 'music_prev'
  | 'music_stop'
  | 'music_play_track'
  | 'photos_open_photo'
  | 'docs_open_document';

export interface OpenAppPayload {
  app: string;
}

export interface CloseAppPayload {
  app: string;
}

export interface OpenFilePayload {
  name: string;
  url: string;
}

export interface SetThemePayload {
  dark: boolean;
}

export interface SetWallpaperPayload {
  path: string;
}

export interface SetSizePayload {
  size: number;
}

export interface PlaySoundPayload {
  sound: string;
}

export interface ShowNotificationPayload {
  title: string;
  message: string;
  icon?: string;
}

export interface SetLanguagePayload {
  lang: 'pt' | 'en';
}

export interface MusicPlayTrackPayload {
  query: string;
}

export interface MediaSearchPayload {
  query: string;
}

export type HermesPayload =
  | OpenAppPayload
  | CloseAppPayload
  | OpenFilePayload
  | SetThemePayload
  | SetWallpaperPayload
  | SetSizePayload
  | PlaySoundPayload
  | ShowNotificationPayload
  | SetLanguagePayload
  | MusicPlayTrackPayload
  | MediaSearchPayload
  | Record<string, never>;

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonPrimitive[] | Record<string, JsonPrimitive>;

export interface HermesAction {
  type: HermesActionType;
  payload?: Record<string, JsonValue>;
}

export interface ParseActionResult {
  cleanText: string;
  actions: HermesAction[];
}
