export const locales = ['en', 'zh', 'zh-tw', 'de', 'ru', 'ja', 'fr', 'ko'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
export const localeCookie = 'ghp:locale';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '简体中文',
  'zh-tw': '繁體中文',
  de: 'Deutsch',
  ru: 'Русский',
  ja: '日本語',
  fr: 'Français',
  ko: '한국어',
};
export const localeTags: Record<Locale, string> = {
  en: 'en',
  zh: 'zh-CN',
  'zh-tw': 'zh-TW',
  de: 'de',
  ru: 'ru',
  ja: 'ja',
  fr: 'fr',
  ko: 'ko',
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && locales.some((locale) => locale === value);
}

export function localeFromPath(pathname: string): Locale | null {
  const segment = pathname.split('/')[1];
  return isLocale(segment) ? segment : null;
}

/** Match browser language preferences, including Chinese scripts and regions. */
export function preferredLocale(acceptLanguage: string | null): Locale {
  const preferences = (acceptLanguage ?? '')
    .split(',')
    .map((entry) => {
      const [tag, ...parameters] = entry.trim().toLowerCase().split(';');
      const quality = parameters.find((parameter) => parameter.trim().startsWith('q='));
      const weight = quality === undefined ? 1 : Number(quality.trim().slice(2));
      return { tag, weight };
    })
    .filter(({ tag, weight }) => tag && Number.isFinite(weight) && weight > 0 && weight <= 1)
    .sort((a, b) => b.weight - a.weight);

  for (const { tag } of preferences) {
    if (tag === '*') return defaultLocale;
    const [language, ...subtags] = tag.split('-');
    if (language === 'zh') {
      if (subtags.includes('hant')) return 'zh-tw';
      if (subtags.includes('hans')) return 'zh';
      return subtags.some((subtag) => ['tw', 'hk', 'mo'].includes(subtag)) ? 'zh-tw' : 'zh';
    }
    if (isLocale(language)) return language;
  }
  return defaultLocale;
}

/** Replace only the language segment, preserving the rest of the URL. */
export function localizedPath(path: string, locale: Locale): string {
  const boundary = path.search(/[?#]/);
  const pathname = boundary === -1 ? path : path.slice(0, boundary);
  const suffix = boundary === -1 ? '' : path.slice(boundary);
  const current = localeFromPath(pathname);
  const barePath = current ? pathname.slice(current.length + 1) : pathname;
  const prefix = locale === defaultLocale ? '' : `/${locale}`;
  const localized = `${prefix}${barePath === '/' ? '' : barePath}`;
  return `${localized || '/'}${suffix}`;
}
