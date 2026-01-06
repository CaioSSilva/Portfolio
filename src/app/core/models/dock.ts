import { AppBase } from './base';

export interface AppDefinition extends AppBase {
  data?: any;
  handle?: string[];
}

export interface DockItem extends AppDefinition {
  pinned: boolean;
  isOpen: boolean;
  isActive: boolean;
  count: number;
  pids: string[];
}
