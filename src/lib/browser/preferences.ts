import { defaultLocale, isLocale, type Locale } from '../i18n/locales';

const KEY = 'ghp:preferences:v1';
const EVENT = 'ghp:preferences';
type Preferences = { locale: Locale; theme: 'system' | 'light' | 'dark' };
const defaults: Preferences = { locale: defaultLocale, theme: 'system' };

export function parsePreferences(raw: string): Preferences {
  try {
    const saved = JSON.parse(raw);
    return {
      locale: isLocale(saved?.locale) ? saved.locale : defaultLocale,
      theme: ['light', 'dark'].includes(saved?.theme) ? saved.theme : 'system',
    };
  } catch {
    return defaults;
  }
}

let memory = '';
export function preferencesSnapshot() {
  try {
    return localStorage.getItem(KEY) ?? memory;
  } catch {
    return memory;
  }
}

export function subscribePreferences(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

export function updatePreferences(patch: Partial<Preferences>) {
  memory = JSON.stringify({ ...parsePreferences(preferencesSnapshot()), ...patch });
  try {
    localStorage.setItem(KEY, memory);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}
