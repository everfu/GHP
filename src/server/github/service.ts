import { normalizeUsername } from '../../lib/username';
import type {
  ApiError,
  ApiResult,
  ErrorCode,
  GitHubUser,
  PublicEvent,
  Repository,
} from '../../types/github';

export class GitHubError extends Error {
  constructor(
    public code: ErrorCode,
    public status: number,
    public retryAt?: string,
  ) {
    super(code);
  }
  toJSON(): ApiError {
    return { code: this.code, ...(this.retryAt ? { retryAt: this.retryAt } : {}) };
  }
}

export function asGitHubError(error: unknown): GitHubError {
  return error instanceof GitHubError ? error : new GitHubError('UNAVAILABLE', 502);
}

interface ServiceOptions {
  token?: string;
  now?: () => number;
  timeoutMs?: number;
  repositoryBudgetMs?: number;
  cacheEntries?: number;
}

// The production entry point is server-only. This dependency-injected core also
// lets tests exercise pagination, rate limits and cache behavior without GitHub.
export function createGitHubService(fetcher: typeof fetch = fetch, options: ServiceOptions = {}) {
  const now = options.now || Date.now;
  const cache = new Map<string, { expiresAt: number; value: ApiResult<unknown> }>();
  const inFlight = new Map<string, Promise<ApiResult<unknown>>>();
  const cacheEntries = options.cacheEntries ?? 100;
  const timeoutMs = options.timeoutMs ?? 12_000;
  const repositoryBudgetMs = options.repositoryBudgetMs ?? 45_000;

  async function cached<T>(key: string, load: () => Promise<ApiResult<T>>): Promise<ApiResult<T>> {
    const entry = cache.get(key);
    if (entry && entry.expiresAt > now()) {
      cache.delete(key);
      cache.set(key, entry);
      return entry.value as ApiResult<T>;
    }
    cache.delete(key);
    const pending = inFlight.get(key);
    if (pending) return pending as Promise<ApiResult<T>>;
    if (inFlight.size >= 100) throw new GitHubError('UNAVAILABLE', 503);
    const promise = load()
      .then((value) => {
        if (value.complete) {
          cache.set(key, { expiresAt: now() + 600_000, value });
          if (cache.size > cacheEntries) cache.delete(cache.keys().next().value!);
        }
        return value;
      })
      .finally(() => inFlight.delete(key));
    inFlight.set(key, promise);
    return promise;
  }

  function checked(input: string) {
    const name = normalizeUsername(input);
    if (!name) throw new GitHubError('INVALID_INPUT', 400);
    return name;
  }

  async function request<T>(
    path: string,
    budget = timeoutMs,
  ): Promise<{ data: T; headers: Headers }> {
    try {
      const response = await fetcher(`https://api.github.com${path}`, {
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2026-03-10',
          'User-Agent': 'ghpinfo',
          ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        },
        signal: AbortSignal.timeout(Math.max(1, Math.min(timeoutMs, budget))),
        cache: 'no-store',
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const rateLimited =
          response.status === 429 ||
          (response.status === 403 &&
            (response.headers.get('x-ratelimit-remaining') === '0' ||
              response.headers.has('retry-after') ||
              /rate limit/i.test(body.message || '')));
        if (rateLimited) {
          const retry = Number(response.headers.get('retry-after'));
          const reset = Number(response.headers.get('x-ratelimit-reset'));
          const retryMs = retry > 0 ? now() + retry * 1000 : reset > 0 ? reset * 1000 : null;
          throw new GitHubError(
            'RATE_LIMIT',
            429,
            retryMs && Number.isFinite(retryMs) ? new Date(retryMs).toISOString() : undefined,
          );
        }
        if (response.status === 404) throw new GitHubError('NOT_FOUND', 404);
        if (response.status === 401) throw new GitHubError('CONFIGURATION', 503);
        throw new GitHubError('UNAVAILABLE', 502);
      }
      return { data: (await response.json()) as T, headers: response.headers };
    } catch (error) {
      if (error instanceof Error && ['TimeoutError', 'AbortError'].includes(error.name))
        throw new GitHubError('TIMEOUT', 504);
      throw asGitHubError(error);
    }
  }

  const stamp = () => new Date(now()).toISOString();
  return {
    async user(input: string): Promise<ApiResult<GitHubUser>> {
      const name = checked(input);
      return cached(`user:${name}`, async () => {
        const { data: raw } = await request<GitHubUser>(`/users/${name}`);
        if (!raw.login || !raw.type) throw new GitHubError('UNAVAILABLE', 502);
        const {
          login,
          id,
          name: displayName,
          avatar_url,
          html_url,
          bio,
          company,
          location,
          blog,
          created_at,
          followers,
          following,
          public_repos,
          type,
        } = raw;
        return {
          data: {
            login,
            id,
            name: displayName,
            avatar_url,
            html_url,
            bio,
            company,
            location,
            blog,
            created_at,
            followers,
            following,
            public_repos,
            type,
          },
          complete: true,
          fetchedAt: stamp(),
        };
      });
    },

    async repositories(input: string): Promise<ApiResult<Repository[]>> {
      const name = checked(input);
      return cached(`repos:${name}`, async () => {
        const data: Repository[] = [];
        const seen = new Set<number>();
        const deadline = now() + repositoryBudgetMs;
        let page = 1;
        try {
          while (true) {
            if (now() >= deadline) throw new GitHubError('TIMEOUT', 504);
            const response = await request<(Repository & { private?: boolean })[]>(
              `/users/${name}/repos?type=owner&sort=full_name&direction=asc&per_page=100&page=${page}`,
              deadline - now(),
            );
            if (!Array.isArray(response.data)) throw new GitHubError('UNAVAILABLE', 502);
            for (const repo of response.data) {
              if (repo.private || seen.has(repo.id)) continue;
              seen.add(repo.id);
              const {
                id,
                name,
                full_name,
                html_url,
                description,
                language,
                stargazers_count,
                forks_count,
                fork,
                archived,
                pushed_at,
              } = repo;
              data.push({
                id,
                name,
                full_name,
                html_url,
                description,
                language,
                stargazers_count,
                forks_count,
                fork,
                archived,
                pushed_at,
              });
            }
            if (!/rel="next"/.test(response.headers.get('link') || '')) break;
            page++;
          }
          return { data, complete: true, fetchedAt: stamp() };
        } catch (error) {
          if (!data.length) throw asGitHubError(error);
          return {
            data,
            complete: false,
            fetchedAt: stamp(),
            error: asGitHubError(error).toJSON(),
          };
        }
      });
    },

    async events(input: string): Promise<ApiResult<PublicEvent[]>> {
      const name = checked(input);
      return cached(`events:${name}`, async () => {
        const response = await request<(PublicEvent & { public: boolean })[]>(
          `/users/${name}/events/public?per_page=30`,
        );
        if (!Array.isArray(response.data)) throw new GitHubError('UNAVAILABLE', 502);
        const data = response.data
          .filter((event) => event.public)
          .map((event) => {
            const { action, ref_type, pull_request, issue, release } = event.payload;
            return {
              id: event.id,
              type: event.type,
              repo: { name: event.repo.name },
              created_at: event.created_at,
              payload: {
                action,
                ref_type,
                ...(pull_request
                  ? {
                      pull_request: {
                        number: pull_request.number,
                        html_url: pull_request.html_url,
                      },
                    }
                  : {}),
                ...(issue ? { issue: { number: issue.number, html_url: issue.html_url } } : {}),
                ...(release ? { release: { html_url: release.html_url } } : {}),
              },
            };
          });
        return { data, complete: true, fetchedAt: stamp() };
      });
    },
  };
}
