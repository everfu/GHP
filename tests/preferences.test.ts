import { describe, expect, it } from 'vitest';
import { parsePreferences } from '../src/lib/browser/preferences';

describe('saved preferences', () => {
  it('preserves valid version-one preferences', () => {
    expect(parsePreferences('{"locale":"zh-tw","theme":"dark"}')).toEqual({
      locale: 'zh-tw',
      theme: 'dark',
    });
  });

  it('uses English and system theme for corrupt or unsupported settings', () => {
    for (const raw of ['', 'null', '[]', 'invalid', '{"locale":"es","theme":"auto"}']) {
      expect(parsePreferences(raw)).toEqual({ locale: 'en', theme: 'system' });
    }
  });
});
