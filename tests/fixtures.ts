import type { GitHubUser, Repository } from '../src/types/github';

export const user: GitHubUser = {
  id: 1,
  login: 'octocat',
  name: 'The Octocat',
  avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
  html_url: 'https://github.com/octocat',
  bio: 'A test account for GitHub and its related projects.',
  company: '@github',
  location: 'San Francisco',
  blog: 'https://github.blog',
  created_at: '2011-01-25T18:44:36Z',
  followers: 21340,
  following: 9,
  public_repos: 27,
  type: 'User',
};
export function repository(id: number, overrides: Partial<Repository> = {}): Repository {
  return {
    id,
    name: `project-${id}`,
    full_name: `octocat/project-${id}`,
    html_url: `https://github.com/octocat/project-${id}`,
    description: 'A thoughtfully built open source project.',
    language: 'TypeScript',
    stargazers_count: 10,
    forks_count: 2,
    fork: false,
    archived: false,
    pushed_at: '2026-10-01T08:00:00Z',
    ...overrides,
  };
}
export const repositories = [
  repository(1, {
    name: 'hello-world',
    language: 'JavaScript',
    stargazers_count: 9284,
    forks_count: 1721,
  }),
  repository(2, {
    name: 'git-consortium',
    language: 'Python',
    stargazers_count: 1928,
    forks_count: 230,
  }),
  repository(3, {
    name: 'octocat.github.io',
    language: 'HTML',
    stargazers_count: 861,
    forks_count: 80,
  }),
  repository(4, {
    name: 'spoon-knife',
    language: 'HTML',
    fork: true,
    stargazers_count: 20000,
    forks_count: 500,
  }),
  repository(5, { name: 'notes', language: null, archived: true }),
  ...Array.from({ length: 22 }, (_, i) => repository(i + 6)),
];
