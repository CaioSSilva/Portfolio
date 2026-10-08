import { AppBase, ProcessData, Base } from './base';
import { Type } from '@angular/core';

export interface AppDefinition extends AppBase {
  data?: ProcessData;
  handle?: string[];
  loadComponent?: () => Promise<Type<Base>>;
}

export interface DockItem extends AppDefinition {
  pinned: boolean;
  isOpen: boolean;
  isActive: boolean;
  count: number;
  pids: string[];
}
