'use client';

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from 'react';
import { getLocaleFormatters } from '@/lib/i18n/formatters';
import {
  parsePreferences,
  preferencesSnapshot,
  subscribePreferences,
  updatePreferences,
} from '@/lib/browser/preferences';
import { MotionConfig } from 'motion/react';
import { usePathname, useRouter } from 'next/navigation';
import { dictionary, type Locale, type TranslationKey } from '@/lib/i18n/dictionary';
import {
  defaultLocale,
  localeCookie,
  localeFromPath,
  localeTags,
  localizedPath,
} from '@/lib/i18n/locales';

function subscribeMedia(onChange: () => void) {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}
const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
interface ContextValue {
  locale: Locale;
  dark: boolean;
  t: (key: TranslationKey) => string;
  setLocale: (locale: Locale) => void;
  toggleTheme: () => void;
  number: (value: number) => string;
  percentage: (value: number) => string;
  date: (value: string, withTime?: boolean) => string;
  href: (path: string) => string;
}
const Context = createContext<ContextValue | null>(null);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const raw = useSyncExternalStore(subscribePreferences, preferencesSnapshot, () => '');
  const osDark = useSyncExternalStore(subscribeMedia, systemDark, () => false);
  const { theme } = parsePreferences(raw);
  const locale = localeFromPath(pathname) ?? defaultLocale;
  const dark = theme === 'system' ? osDark : theme === 'dark';
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.lang = localeTags[locale];
  }, [dark, locale]);
  const value = useMemo<ContextValue>(() => {
    const copy = dictionary(locale);
    const formatters = getLocaleFormatters(locale);
    return {
      locale,
      dark,
      t: (key) => copy[key],
      setLocale: (nextLocale) => {
        if (nextLocale === locale) return;
        updatePreferences({ locale: nextLocale });
        document.cookie = `${localeCookie}=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
        const { pathname, search, hash } = window.location;
        router.push(localizedPath(`${pathname}${search}${hash}`, nextLocale), { scroll: false });
      },
      href: (path) => localizedPath(path, locale),
      toggleTheme: () => updatePreferences({ theme: dark ? 'light' : 'dark' }),
      ...formatters,
    };
  }, [locale, dark, router]);
  return (
    <Context.Provider value={value}>
      <MotionConfig reducedMotion="user">
        <div className="locale-content" data-locale={locale}>
          {children}
        </div>
      </MotionConfig>
    </Context.Provider>
  );
}

export function usePreferences() {
  const value = useContext(Context);
  if (!value) throw new Error('PreferencesProvider is missing');
  return value;
}
