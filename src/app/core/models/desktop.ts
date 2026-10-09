export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface pinnedDesktopItem {
  id: string;
  name: string;
  color: string;
  icon: string;
  action: () => void;
}
