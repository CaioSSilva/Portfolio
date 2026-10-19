export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type WindowSnapLayout =
  | 'maximize'
  | 'left-half'
  | 'right-half'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'bottom-half'
  | 'left-third'
  | 'center-third'
  | 'right-third';

export type WindowSnapMode = 'classic' | 'halves' | 'thirds';

export interface WindowSnapTarget {
  layout: WindowSnapLayout;
  rect: Rect;
}

export interface WindowSnapEdges {
  top: boolean;
  bottom: boolean;
  left: boolean;
  right: boolean;
  center: boolean;
}

export type WindowSnapShortcut =
  | { type: 'layout'; layout: WindowSnapLayout }
  | { type: 'restore' };

export interface pinnedDesktopItem {
  id: string;
  name: string;
  color: string;
  icon: string;
  action: () => void;
}
