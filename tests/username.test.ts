import { describe, expect, it } from 'vitest';
import { normalizeUsername, safeWebsite } from '../src/lib/username';
import { parseHistory } from '../src/lib/browser/history';

describe('lookup input', () => {
  it.each([
    'Octocat',
    ' @Octocat ',
    'https://github.com/Octocat/',
    'github.com/Octocat',
    'https://www.github.com/Octocat?tab=repositories',
    'https://github.com/%6fctocat',
  ])('normalizes %s', (input) => expect(normalizeUsername(input)).toBe('octocat'));
  it.each([
    '',
    '@@user',
    '-user',
    'user-',
    'a--b',
    'a_b',
    'https://evil.com/octocat',
    'https://github.com/one/repo',
    'https://github.com/',
    'https://user:password@github.com/octocat',
    'https://github.com:8080/octocat',
    'https://github.com/%2f',
    'a'.repeat(40),
  ])('rejects %s', (input) => expect(normalizeUsername(input)).toBeNull());
  it('accepts names at either length boundary', () => {
    expect(normalizeUsername('a')).toBe('a');
    expect(normalizeUsername('a'.repeat(39))).toBe('a'.repeat(39));
  });
  it('restricts profile links to http(s)', () => {
    expect(safeWebsite('example.com')).toBe('https://example.com/');
    expect(safeWebsite('javascript:alert(1)')).toBeNull();
    expect(safeWebsite('data:text/html,test')).toBeNull();
    expect(safeWebsite('https://user:secret@example.com')).toBeNull();
  });
  it('recovers from invalid local history, deduplicates and limits to ten names', () => {
    expect(parseHistory('not json')).toEqual([]);
    expect(parseHistory('{}')).toEqual([]);
    expect(parseHistory('["Octocat","octocat",null,"invalid name","everfu"]')).toEqual([
      'octocat',
      'everfu',
    ]);
    expect(
      parseHistory(JSON.stringify(Array.from({ length: 20 }, (_, i) => `user-${i}`))),
    ).toHaveLength(10);
  });
});
