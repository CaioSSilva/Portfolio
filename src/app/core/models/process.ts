import { AppBase, ProcessData } from './base';

export interface Process extends AppBase {
  id: string;
  appId: string;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  cascadeIndex: number;
  data?: ProcessData;
}
