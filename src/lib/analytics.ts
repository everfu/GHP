import type { Repository } from '../types/github';

export function analyzeRepositories(repositories: Repository[]) {
  const sources = repositories.filter((repo) => !repo.fork);
  const counts = new Map<string, number>();
  let stars = 0;
  let forks = 0;
  for (const repo of sources) {
    stars += repo.stargazers_count;
    forks += repo.forks_count;
    const language = repo.language || '__unknown';
    counts.set(language, (counts.get(language) || 0) + 1);
  }
  const languages = [...counts.entries()]
    .map(([name, count]) => ({ name, count, percentage: (count / sources.length) * 100 }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  const ranking = sources
    .toSorted((a, b) => b.stargazers_count - a.stargazers_count || a.name.localeCompare(b.name))
    .slice(0, 5);
  return { sourceCount: sources.length, stars, forks, languages, ranking };
}

export interface RepositoryFilters {
  search: string;
  language: string;
  fork: 'sources' | 'all' | 'forks';
  archived: 'all' | 'active' | 'archived';
  sort: 'stars' | 'forks' | 'pushed';
}
export const defaultFilters: RepositoryFilters = {
  search: '',
  language: 'all',
  fork: 'sources',
  archived: 'all',
  sort: 'stars',
};

export function filterRepositories(repos: Repository[], filters: RepositoryFilters) {
  const query = filters.search.trim().toLowerCase();
  return repos
    .filter((repo) => {
      if (query && !`${repo.name} ${repo.description || ''}`.toLowerCase().includes(query))
        return false;
      if (filters.language !== 'all' && (repo.language || '__unknown') !== filters.language)
        return false;
      if ((filters.fork === 'sources' && repo.fork) || (filters.fork === 'forks' && !repo.fork))
        return false;
      if (
        (filters.archived === 'active' && repo.archived) ||
        (filters.archived === 'archived' && !repo.archived)
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      const difference =
        filters.sort === 'stars'
          ? b.stargazers_count - a.stargazers_count
          : filters.sort === 'forks'
            ? b.forks_count - a.forks_count
            : (Date.parse(b.pushed_at || '') || 0) - (Date.parse(a.pushed_at || '') || 0);
      return difference || a.name.localeCompare(b.name);
    });
}

export function languageOptions(repos: Repository[]) {
  return [...new Set(repos.map((repo) => repo.language || '__unknown'))].sort((a, b) =>
    a.localeCompare(b),
  );
}
