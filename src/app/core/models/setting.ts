export interface SystemInfo {
  os: string;
  kernel: string;
  arch: string;
  cpu: number | string;
  ram: string;
  resolution: string;
  language: string;
  browser: string;
}

export type SettingSection = 'appearance' | 'desktop' | 'sound' | 'about' | 'language' | 'system';

export interface SettingConfiguration {
  section: SettingSection;
  title: string;
  icon: string;
}
