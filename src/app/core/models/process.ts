import { AppBase } from './base';

export interface Process extends AppBase {
  id: string;
  appId: string;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  data?: any;
}
