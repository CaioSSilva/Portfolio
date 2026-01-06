export type SettingSection = 'appearance' | 'desktop' | 'sound' | 'about' | 'language' | 'system';

export interface SettingConfiguration {
  section: SettingSection;
  title: string;
  icon: string;
}
