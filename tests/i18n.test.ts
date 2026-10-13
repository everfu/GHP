import { describe, expect, it } from 'vitest';
import {
  locales,
  localeTags,
  isLocale,
  localeFromPath,
  localizedPath,
  preferredLocale,
} from '../src/lib/i18n/locales';
import { dictionary } from '../src/lib/i18n/dictionary';
import { docsDictionary } from '../src/lib/i18n/docs';

describe('language URLs', () => {
  it('replaces the locale without losing the page, query or fragment', () => {
    expect(localizedPath('/zh/u/octocat?ref=zh#main', 'ja')).toBe('/ja/u/octocat?ref=zh#main');
    expect(localizedPath('/en/docs', 'zh-tw')).toBe('/zh-tw/docs');
    expect(localizedPath('/en', 'de')).toBe('/de');
    expect(localizedPath('/', 'fr')).toBe('/fr');
    expect(localizedPath('/?ref=home#main', 'ko')).toBe('/ko?ref=home#main');
    expect(localizedPath('/u/english', 'en')).toBe('/u/english');
    expect(localizedPath('/enough', 'en')).toBe('/enough');
    expect(localizedPath('/zh', 'en')).toBe('/');
    expect(localizedPath('/en', 'en')).toBe('/');
    expect(localizedPath('/zh/?ref=home#main', 'en')).toBe('/?ref=home#main');
    expect(localizedPath('/zh/docs', 'en')).toBe('/docs');
    expect(localizedPath('/zh/u/octocat?ref=share#main', 'en')).toBe('/u/octocat?ref=share#main');
  });

  it('accepts only supported language segments', () => {
    expect(localeFromPath('/zh-tw/docs')).toBe('zh-tw');
    expect(localeFromPath('/enough')).toBeNull();
    expect(localeFromPath('/u/en')).toBeNull();
    for (const value of ['es', 'toString', '__proto__', null, undefined, 1])
      expect(isLocale(value)).toBe(false);
  });
});

describe('first-visit browser language detection', () => {
  it.each([
    ['en-US,en;q=0.9', 'en'],
    ['zh-CN,zh;q=0.9,en;q=0.8', 'zh'],
    ['zh-TW,zh;q=0.9', 'zh-tw'],
    ['zh-HK', 'zh-tw'],
    ['zh-MO', 'zh-tw'],
    ['zh-Hant', 'zh-tw'],
    ['zh-Hant-CN', 'zh-tw'],
    ['zh-Hans-TW', 'zh'],
    ['zh-SG', 'zh'],
    ['de-CH', 'de'],
    ['ru-RU', 'ru'],
    ['ja-JP', 'ja'],
    ['fr-CA', 'fr'],
    ['ko-KR', 'ko'],
    ['en;q=0.5,fr;q=1', 'fr'],
    ['es-ES,ja;q=0.8,en;q=0.5', 'ja'],
    ['ja;q=0,en;q=0.5', 'en'],
    ['fr;q=bad,de;q=2,ko;q=0.8', 'ko'],
    ['*', 'en'],
    ['es-ES', 'en'],
    ['', 'en'],
    [null, 'en'],
  ])('matches %s to %s', (header, expected) => {
    expect(preferredLocale(header)).toBe(expected);
  });
});

describe('translation completeness', () => {
  for (const locale of locales) {
    it(`${locale} has complete UI and documentation translations and valid formatting`, () => {
      const copy = dictionary(locale);
      const docs = docsDictionary(locale);
      expect(Object.keys(copy).sort()).toEqual(Object.keys(dictionary('en')).sort());
      expect(Object.values(copy).every((value) => typeof value === 'string' && value.trim())).toBe(
        true,
      );
      expect(Object.keys(docs).sort()).toEqual(Object.keys(docsDictionary('en')).sort());
      expect(docs.errorMeanings).toHaveLength(6);
      expect(
        Object.values(docs)
          .flat()
          .every((value) => value.trim()),
      ).toBe(true);
      expect(() => new Intl.DateTimeFormat(localeTags[locale]).format(new Date())).not.toThrow();
    });
  }
});
