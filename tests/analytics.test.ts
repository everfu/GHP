import { describe, it, expect } from 'vitest';
import {
  analyzeRepositories,
  defaultFilters,
  filterRepositories,
  languageOptions,
} from '../src/lib/analytics';
import { repository } from './fixtures';

describe('repository analytics', () => {
  const data = [
    repository(1, { language: 'TypeScript', stargazers_count: 3, forks_count: 2 }),
    repository(2, { language: 'TypeScript', stargazers_count: 5, forks_count: 3, archived: true }),
    repository(3, { language: 'Python', stargazers_count: 9, forks_count: 1 }),
    repository(4, { language: null, stargazers_count: 0, forks_count: 0 }),
    repository(5, { fork: true, stargazers_count: 100000, forks_count: 100000 }),
  ];
  it('excludes forked repos from totals, but includes archived owned repos', () => {
    const stats = analyzeRepositories(data);
    expect(stats.sourceCount).toBe(4);
    expect(stats.stars).toBe(17);
    expect(stats.forks).toBe(6);
    expect(stats.ranking.map((repo) => repo.id)).toEqual([3, 2, 1, 4]);
  });
  it('keeps missing language in the denominator with an explicit category', () => {
    const stats = analyzeRepositories(data);
    expect(stats.languages.find((entry) => entry.name === 'TypeScript')?.percentage).toBe(50);
    expect(stats.languages.find((entry) => entry.name === '__unknown')?.percentage).toBe(25);
    expect(stats.languages.reduce((sum, entry) => sum + entry.percentage, 0)).toBe(100);
  });
  it('handles zero repos and large numbers without NaN or truncation', () => {
    expect(analyzeRepositories([])).toEqual({
      sourceCount: 0,
      stars: 0,
      forks: 0,
      languages: [],
      ranking: [],
    });
    expect(analyzeRepositories([repository(10, { stargazers_count: 1234567890 })]).stars).toBe(
      1234567890,
    );
  });
  it('sorts and combines language, fork, archive, name and description filters', () => {
    expect(filterRepositories(data, defaultFilters).map((repo) => repo.id)).toEqual([3, 2, 1, 4]);
    expect(
      filterRepositories(data, {
        ...defaultFilters,
        language: 'TypeScript',
        archived: 'active',
      }).map((repo) => repo.id),
    ).toEqual([1]);
    expect(
      filterRepositories(data, { ...defaultFilters, fork: 'forks' }).map((repo) => repo.id),
    ).toEqual([5]);
    expect(
      filterRepositories(data, { ...defaultFilters, search: 'THOUGHTFULLY', sort: 'forks' }).map(
        (repo) => repo.id,
      ),
    ).toEqual([2, 1, 3, 4]);
    expect(
      filterRepositories(data, { ...defaultFilters, language: '__unknown' }).map((repo) => repo.id),
    ).toEqual([4]);
    expect(
      filterRepositories(data, { ...defaultFilters, search: 'project-3' }).map((repo) => repo.id),
    ).toEqual([3]);
    expect(data.map((repo) => repo.id)).toEqual([1, 2, 3, 4, 5]);
  });
  it('sorts by pushed time with missing dates last and limits ranking to five', () => {
    const repos = [
      repository(1, { pushed_at: null }),
      repository(2, { pushed_at: '2025-10-01' }),
      repository(3, { pushed_at: '2026-10-01' }),
    ];
    expect(
      filterRepositories(repos, { ...defaultFilters, sort: 'pushed' }).map((repo) => repo.id),
    ).toEqual([3, 2, 1]);
    expect(
      analyzeRepositories(
        Array.from({ length: 30 }, (_, i) => repository(i, { stargazers_count: i })),
      ).ranking.map((repo) => repo.id),
    ).toEqual([29, 28, 27, 26, 25]);
  });
});

describe('repository language options', () => {
  it('deduplicates and sorts languages while retaining an unknown category', () => {
    const data = [
      repository(1, { language: 'TypeScript' }),
      repository(2, { language: 'Python', fork: true }),
      repository(3, { language: null }),
      repository(4, { language: 'TypeScript', archived: true }),
      repository(5, { language: '' }),
    ];
    expect(languageOptions(data)).toEqual(['__unknown', 'Python', 'TypeScript']);
    expect(data.map((repo) => repo.id)).toEqual([1, 2, 3, 4, 5]);
  });
  it('returns no options for an empty repository list', () => {
    expect(languageOptions([])).toEqual([]);
  });
});
