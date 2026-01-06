import { en } from './en';
import { pt } from './pt';

export const TRANSLATIONS = {
  pt: pt,
  en: en,
};

export type Language = 'pt' | 'en';
export type TranslationKeys = typeof TRANSLATIONS.pt;
