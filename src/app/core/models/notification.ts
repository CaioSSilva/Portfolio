export interface Notification {
  id: string;
  title: string;
  message: string;
  icon?: string;
  color?: string;
  appId?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  duration?: number;
  action?: () => void;
}
