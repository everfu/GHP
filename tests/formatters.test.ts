import { describe, expect, it } from 'vitest';
import { getLocaleFormatters } from '../src/lib/i18n/formatters';
import { locales } from '../src/lib/i18n/locales';

describe('locale formatters', () => {
  it('reuses formatters per language without mixing language output', () => {
    for (const locale of locales) {
      expect(getLocaleFormatters(locale)).toBe(getLocaleFormatters(locale));
    }
    const english = getLocaleFormatters('en');
    const german = getLocaleFormatters('de');
    expect(english).not.toBe(german);
    expect(english.number(1234567890)).toBe('1,234,567,890');
    expect(german.number(1234567890)).toBe('1.234.567.890');
    expect(getLocaleFormatters('en').number(0)).toBe('0');
  });

  it('rounds chart percentages to one decimal without scaling them', () => {
    expect(getLocaleFormatters('en').percentage(33.3333)).toBe('33.3');
    expect(getLocaleFormatters('de').percentage(33.3333)).toBe('33,3');
    expect(getLocaleFormatters('en').percentage(99.99)).toBe('100');
    expect(getLocaleFormatters('en').percentage(0)).toBe('0');
  });

  it('localizes calendar dates and optionally includes local time', () => {
    // Use local noon so the calendar date is stable in any developer time zone.
    const date = new Date(2026, 9, 13, 12).toISOString();
    expect(getLocaleFormatters('en').date(date)).toBe('Oct 13, 2026');
    expect(getLocaleFormatters('de').date(date)).toBe('13. Okt. 2026');
    expect(getLocaleFormatters('ja').date(date)).toBe('2026年10月13日');
    for (const locale of locales) {
      expect(getLocaleFormatters(locale).date(date, true)).not.toBe(
        getLocaleFormatters(locale).date(date),
      );
      expect(getLocaleFormatters(locale).date('invalid', true)).toBe('—');
      expect(getLocaleFormatters(locale).date('')).toBe('—');
    }
  });
});
