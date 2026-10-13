import { describe, expect, it, vi } from 'vitest';
import { createGitHubService } from '../src/server/github/service';
import { user, repository } from './fixtures';

const respond = (data: unknown, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(data), { status, headers });
describe('GitHub server data', () => {
  it('fetches every page and strips private data, duplicate IDs and unneeded fields', async () => {
    const firstPage = Array.from({ length: 100 }, (_, i) => repository(i));
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        respond(firstPage, 200, { link: '<https://api.github.com/next>; rel="next"' }),
      )
      .mockResolvedValueOnce(
        respond([repository(99), repository(100), { ...repository(101), private: true }]),
      );
    const result = await createGitHubService(fetcher).repositories('Octocat');
    expect(result.complete).toBe(true);
    expect(result.data).toHaveLength(101);
    expect(fetcher.mock.calls[0][0]).toContain('per_page=100&page=1');
    expect(fetcher.mock.calls[1][0]).toContain('page=2');
  });
  it('marks partial pagination failures and does not cache them', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        respond([repository(1)], 200, { link: '<https://api.github.com/next>; rel="next"' }),
      )
      .mockResolvedValueOnce(
        respond({ message: 'API rate limit exceeded' }, 403, {
          'x-ratelimit-remaining': '0',
          'x-ratelimit-reset': '2000000000',
        }),
      )
      .mockResolvedValueOnce(respond([repository(1), repository(2)]));
    const service = createGitHubService(fetcher);
    const partial = await service.repositories('octocat');
    expect(partial.complete).toBe(false);
    expect(partial.error?.code).toBe('RATE_LIMIT');
    expect(partial.data).toHaveLength(1);
    const retried = await service.repositories('octocat');
    expect(retried.complete).toBe(true);
    expect(retried.data).toHaveLength(2);
  });
  it('deduplicates concurrent lookups and reuses results for ten minutes', async () => {
    let now = 1_000_000;
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async () => respond(user));
    const service = createGitHubService(fetcher, { now: () => now });
    const [a, b] = await Promise.all([service.user('Octocat'), service.user('octocat')]);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(a).toEqual(b);
    now += 599_999;
    expect((await service.user('octocat')).fetchedAt).toBe(a.fetchedAt);
    expect(fetcher).toHaveBeenCalledTimes(1);
    now += 1;
    await service.user('octocat');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it('bounds the cache with LRU eviction', async () => {
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async () => respond(user));
    const service = createGitHubService(fetcher, { cacheEntries: 2 });
    await service.user('one');
    await service.user('two');
    await service.user('one');
    await service.user('three');
    await service.user('two');
    expect(fetcher).toHaveBeenCalledTimes(4);
  });
  it.each([
    [404, {}, {}, 'NOT_FOUND'],
    [401, {}, {}, 'CONFIGURATION'],
    [500, {}, {}, 'UNAVAILABLE'],
    [429, {}, { 'retry-after': '60' }, 'RATE_LIMIT'],
    [403, { message: 'You have exceeded a secondary rate limit.' }, {}, 'RATE_LIMIT'],
  ])('classifies HTTP %s', async (status, body, headers, code) => {
    const service = createGitHubService(
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(respond(body, status as number, headers as HeadersInit)),
    );
    await expect(service.user('octocat')).rejects.toMatchObject({ code });
  });
  it('classifies timeouts and rejects invalid inputs without upstream calls', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new DOMException('timeout', 'TimeoutError'));
    const service = createGitHubService(fetcher);
    await expect(service.user('bad name')).rejects.toMatchObject({ code: 'INVALID_INPUT' });
    expect(fetcher).not.toHaveBeenCalled();
    await expect(service.user('octocat')).rejects.toMatchObject({ code: 'TIMEOUT' });
  });
  it('sends optional credentials upstream without returning them or private profile fields', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(respond({ ...user, private_repos: 2, email: 'private@example.com' }));
    const result = await createGitHubService(fetcher, { token: 'test-only-secret' }).user(
      'octocat',
    );
    expect(fetcher.mock.calls[0][1]?.headers).toHaveProperty(
      'Authorization',
      'Bearer test-only-secret',
    );
    expect(result.data).not.toHaveProperty('private_repos');
    expect(result.data).not.toHaveProperty('email');
    expect(JSON.stringify(result)).not.toContain('test-only-secret');
  });
  it('keeps public events only and excludes raw payload content', async () => {
    const event = {
      id: '1',
      type: 'PushEvent',
      public: true,
      repo: { name: 'octocat/hello-world', id: 1 },
      created_at: '2026-10-01',
      payload: { commits: [{ message: 'not needed' }] },
    };
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(respond([event, { ...event, id: '2', public: false }]));
    const result = await createGitHubService(fetcher).events('octocat');
    expect(result.data).toHaveLength(1);
    expect(result.data[0].payload).not.toHaveProperty('commits');
    expect(fetcher.mock.calls[0][0]).toContain('/events/public?per_page=30');
  });
  it('returns a partial result when the overall pagination budget is exhausted', async () => {
    let now = 0;
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async () => {
      now += 46_000;
      return respond([repository(1)], 200, { link: '<https://api.github.com/next>; rel="next"' });
    });
    const result = await createGitHubService(fetcher, { now: () => now }).repositories('octocat');
    expect(result.complete).toBe(false);
    expect(result.error?.code).toBe('TIMEOUT');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
