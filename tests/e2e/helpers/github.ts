import { type Page } from '@playwright/test';
import { user, repositories } from '../../fixtures';
import type { GitHubUser, PublicEvent, Repository } from '../../../src/types/github';

export const envelope = <T>(data: T, complete = true) => ({
  data,
  complete,
  fetchedAt: '2026-10-13T06:00:00Z',
});
export const events: PublicEvent[] = Array.from({ length: 15 }, (_, i) => ({
  id: String(i),
  type: i % 2 ? 'StarMadeUpEvent' : 'PushEvent',
  repo: { name: 'octocat/hello-world' },
  created_at: '2026-10-12T09:00:00Z',
  payload: {},
}));
interface MockOptions {
  profile?: GitHubUser;
  repos?: Repository[];
  partial?: boolean;
  eventsFail?: boolean;
}
export async function mockGitHub(page: Page, options: MockOptions = {}) {
  await page.route('**/api/users/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/repos')) {
      const body = {
        ...envelope(options.repos || repositories, !options.partial),
        ...(options.partial
          ? { error: { code: 'RATE_LIMIT', retryAt: '2026-10-13T07:00:00Z' } }
          : {}),
      };
      return route.fulfill({ json: body });
    }
    if (path.endsWith('/events'))
      return options.eventsFail
        ? route.fulfill({ status: 429, json: { error: { code: 'RATE_LIMIT' } } })
        : route.fulfill({ json: envelope(events) });
    const login = path.split('/').at(-1)!;
    return route.fulfill({ json: envelope(options.profile || { ...user, login }) });
  });
}

export async function selectFilter(page: Page, label: string, option: string) {
  await page.getByRole('combobox', { name: label, exact: true }).click();
  await page
    .getByRole('listbox', { name: label, exact: true })
    .getByRole('option', { name: option, exact: true })
    .click();
}
