import zh from './translations/zh.json' with { type: 'json' };
import en from './translations/en.json' with { type: 'json' };
import zhTW from './translations/zh-tw.json' with { type: 'json' };
import de from './translations/de.json' with { type: 'json' };
import ru from './translations/ru.json' with { type: 'json' };
import ja from './translations/ja.json' with { type: 'json' };
import fr from './translations/fr.json' with { type: 'json' };
import ko from './translations/ko.json' with { type: 'json' };
import type { Locale } from './locales';

export type { Locale } from './locales';
export type TranslationKey = keyof typeof zh;
export type Dictionary = Record<TranslationKey, string>;
const dictionaries: Record<Locale, Dictionary> = { zh, en, 'zh-tw': zhTW, de, ru, ja, fr, ko };

export function dictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
