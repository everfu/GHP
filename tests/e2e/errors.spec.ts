import { expect, test } from '@playwright/test';
import { user, repository } from '../fixtures';
import { envelope, events, mockGitHub } from './helpers/github';

test('code copy failure explains manual recovery without overflowing', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error('Clipboard unavailable')) },
    });
  });
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/zh/docs');
  await page
    .getByRole('button', { name: '复制代码: /api/users/[username] · 请求示例', exact: true })
    .click();
  await expect(
    page.getByRole('status').filter({ hasText: '复制失败，请手动选择代码复制。' }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('partial repositories suppress overall totals and charts', async ({ page }) => {
  await mockGitHub(page, { partial: true });
  await page.goto('/zh/u/octocat');
  await expect(page.getByRole('heading', { name: '数据未完整加载' })).toBeVisible();
  await expect(page.locator('.metrics dd')).toHaveText(['27', '—', '—', '—']);
  await expect(page.locator('.ranking-chart')).toHaveCount(0);
  await expect(page.locator('.language-chart')).toHaveCount(0);
  await expect(page.locator('.repository-row')).toHaveCount(20);
});

test('independent activity failure and retry retain repository results', async ({ page }) => {
  await mockGitHub(page, { eventsFail: true });
  await page.goto('/zh/u/octocat');
  await expect(page.getByRole('main').getByRole('alert')).toContainText('查询额度暂时耗尽');
  await expect(page.locator('.repository-row')).toHaveCount(20);
  await page.route('**/api/users/*/events', (route) => route.fulfill({ json: envelope(events) }));
  await page.getByRole('button', { name: '重试' }).click();
  await expect(page.locator('.activity-row')).toHaveCount(10);
  await expect(page.locator('.repository-row')).toHaveCount(20);
});

test('zero repositories, missing profile fields and organization handling', async ({ page }) => {
  await mockGitHub(page, {
    repos: [],
    profile: {
      ...user,
      name: null,
      bio: null,
      company: null,
      location: null,
      blog: 'javascript:alert(1)',
      public_repos: 0,
    },
  });
  await page.goto('/zh/u/octocat');
  await expect(page.getByRole('heading', { name: 'octocat', exact: true })).toBeVisible();
  await expect(page.locator('.metrics dd')).toHaveText(['0', '0', '0', '0']);
  await expect(page.getByText('暂无公开仓库。')).toBeVisible();
  await expect(page.getByRole('link', { name: /个人主页/ })).toHaveCount(0);
  await page.route('**/api/users/github', (route) =>
    route.fulfill({ json: envelope({ ...user, login: 'github', type: 'Organization' }) }),
  );
  await page.goto('/zh/u/github');
  await expect(page.getByRole('heading', { name: '这是一个组织账户' })).toBeVisible();
  await expect(page.locator('.metrics')).toHaveCount(0);
});

test('profile errors are actionable and do not start repository requests', async ({ page }) => {
  let extras = 0;
  await page.route('**/api/users/**', (route) => {
    if (/\/(repos|events)$/.test(new URL(route.request().url()).pathname)) extras++;
    return route.fulfill({ status: 404, json: { error: { code: 'NOT_FOUND' } } });
  });
  await page.goto('/zh/u/missing-user');
  await expect(page.getByRole('main').getByRole('alert')).toContainText('未找到该用户');
  expect(extras).toBe(0);
  await page.getByRole('button', { name: '重试' }).click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText('未找到该用户');
});

test('long content, large numbers, reduced motion and responsive layout do not overflow', async ({
  page,
}) => {
  const long = '很长的项目描述与名称 '.repeat(30);
  await mockGitHub(page, {
    profile: { ...user, name: long, bio: long, location: long, followers: 1234567890 },
    repos: [
      repository(1, {
        name: 'unbroken-name'.repeat(12),
        description: long,
        language: 'Jupyter Notebook',
        stargazers_count: 1234567890,
        forks_count: 9876543210,
      }),
    ],
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/zh/u/octocat');
  await expect(page.locator('.repository-row')).toHaveCount(1);
  await expect(page.locator('.metrics dd').nth(2)).toHaveText('1,234,567,890');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.getByRole('textbox', { name: 'GitHub 用户名或个人主页链接' }).focus();
  await expect(page.getByRole('textbox', { name: 'GitHub 用户名或个人主页链接' })).toBeFocused();
});

test('fast user switching cannot show a late response for the previous user', async ({ page }) => {
  await mockGitHub(page);
  await page.route('**/api/users/slow-user', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    await route
      .fulfill({ json: envelope({ ...user, login: 'slow-user', name: 'Slow User' }) })
      .catch(() => {});
  });
  await page.goto('/zh/u/slow-user');
  await page.getByRole('textbox', { name: 'GitHub 用户名或个人主页链接' }).fill('fast-user');
  await page.getByRole('button', { name: '查询', exact: true }).click();
  await expect(page.locator('.username')).toHaveText('@fast-user');
  await page.waitForTimeout(1500);
  await expect(page.locator('.username')).toHaveText('@fast-user');
  await expect(page.getByRole('heading', { name: 'Slow User' })).toHaveCount(0);
});
