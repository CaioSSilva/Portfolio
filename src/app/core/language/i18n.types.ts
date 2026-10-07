import { en } from './en';
import { pt } from './pt';

export const TRANSLATIONS: Record<Language, TranslationSchema> = {
  pt: pt,
  en: en,
};

export type Language = 'pt' | 'en';

type BaseTranslation = typeof pt;

export interface TranslationSchema extends BaseTranslation {
  apps: typeof pt.apps & Record<string, string | undefined>;
  files: typeof pt.files & Record<string, string | undefined>;
}

export type TranslationKeys = TranslationSchema;
