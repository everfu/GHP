import { localeTags, type Locale } from './locales';

export interface LocaleFormatters {
  number: (value: number) => string;
  percentage: (value: number) => string;
  date: (value: string, withTime?: boolean) => string;
}

// The cache has at most one entry per supported locale. Reuse also spans theme
// changes and rows within a repository list; dates retain the local time zone.
const cache = new Map<Locale, LocaleFormatters>();

export function getLocaleFormatters(locale: Locale): LocaleFormatters {
  const cached = cache.get(locale);
  if (cached) return cached;

  const tag = localeTags[locale];
  const number = new Intl.NumberFormat(tag);
  const percentage = new Intl.NumberFormat(tag, { maximumFractionDigits: 1 });
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  const date = new Intl.DateTimeFormat(tag, options);
  const dateTime = new Intl.DateTimeFormat(tag, {
    ...options,
    hour: '2-digit',
    minute: '2-digit',
  });
  const formatters: LocaleFormatters = {
    number: number.format,
    percentage: percentage.format,
    date: (value, withTime = false) => {
      const time = new Date(value);
      return Number.isFinite(time.getTime()) ? (withTime ? dateTime : date).format(time) : '—';
    },
  };
  cache.set(locale, formatters);
  return formatters;
}
