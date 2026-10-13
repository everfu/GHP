import translations from './translations/docs.json' with { type: 'json' };
import type { Locale } from './locales';

type DocsDictionary = typeof translations.en;
const dictionaries: Record<Locale, DocsDictionary> = translations;

export function docsDictionary(locale: Locale): DocsDictionary {
  return dictionaries[locale];
}
