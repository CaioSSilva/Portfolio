import { FileItem } from './file';

export type DiscSpinState = 'playing' | 'seeking-forward' | 'seeking-backward' | 'paused';

export interface LrcLine {
  time: number;
  text: string;
}

export interface LrclibResponse {
  syncedLyrics?: string;
  plainLyrics?: string;
}

export interface MusicPlayerState {
  currentTrack: FileItem | null;
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  discSpinState: DiscSpinState;
}
